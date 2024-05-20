<template>
  <div class="mod" :style="{background: (props.mod.is_deprecated ? 'linear-gradient(0deg, rgba(40,44,52,1) 0%, rgba(250, 3, 3, 0.705) 100%)' : '')}">
    <img v-if="props.mod.icon":src="props.mod.icon" alt="mod.name" />
    <div class="mod__img-placeholder" v-else />
    <div class="mod__deprecated" v-if="props.mod.is_deprecated">Mod déprécié !</div>
    <h3>{{ props.mod.name }}</h3>
    <small> Par {{ props.mod.owner }}</small>
    <!-- <ul v-for="categories in mod.categories">
      <span>{{ categories }}</span>
    </ul> -->
    <small>Ajouté le {{dayjs(props.mod.date_created).format('DD/MM/YYYY')}}</small>
    <!-- <p>{{ mod.description }}</p> -->
    <div class="mod__footer">
      <button class="btn-primary" @click="shell.openExternal(props.mod.package_url)">Voir sur Thunderstore</button>
      <button class="btn-primary">TODO - Version {{ props.mod.version_number }}</button>
      <button class="btn-primary" @click="addOrRemoveToModspack(props.mod)">
        <span v-if="!loading">{{props.mod.isAdded || props.mod.id ? 'Supprimer' : 'Ajouter'}}</span>
        <div v-else>
          <SpinnerLoader size="small" />
        </div>
      </button>
    </div>
  </div>
  <Modal :show="showAddMod">
    <h3>Ajout du mod {{ props.mod.name }} en cours</h3>
    <SpinnerLoader size="normal" />
  </Modal>
  <!-- Modal pour la suppression d'un mod -->
  <Modal :show="showRemoveModal">
    <h3 style="margin-bottom: 1em;">Les mods suivants dépendent de ce mod :</h3>
    <ul style="display:flex; flex-direction: column;">
      <li v-for="mod in listDependanciesToDelete" :key="mod.uuid4">
        <p>{{ mod.name }}</p>
      </li>
    </ul>
    <div style="margin-top: 1em; width:40em; display: flex; justify-content: space-around;">
      <button class="btn-secondary" @click="confirmDeleteAllMods(mod)">Tout supprimer</button>
      <button class="btn-secondary" @click="confirmDeleteMod(mod)">Supprimer seulement le mod</button>
      <button class="btn-secondary" @click="showRemoveModal = false">Annuler</button>
    </div>
  </Modal>
</template>
<script setup>
import dayjs from 'dayjs'
import SpinnerLoader from '@/components/SpinnerLoader.vue'
import Modal from '@/components/Modal.vue'
import { defineProps, ref } from 'vue'
import { postToVApi, deleteToVApi } from '@/services/axiosService';
import { toast } from 'vue3-toastify'
import { shell } from 'electron'

const props = defineProps({
  mod : {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['modDeleted'])

const showAddMod = ref(false)
const showRemoveModal = ref(false)
const listDependanciesToDelete = ref()
const loading = ref(false)

async function addOrRemoveToModspack(mod) {
  loading.value = true
  if (mod.isAdded || mod.id) {
    await deleteMod(mod)
    loading.value = false
  } else {
    await addMod(mod)
    loading.value = false
  }
}

// Supprime un mod et ses dépendances du modpack si d'autres mods n'en dépendent pas sinon affiche une confirmation
async function deleteMod(mod) {
  // On demande d'abord au serveur si celui-ci est bien ajouté et si il fait partie des dépendances d'un autre mod
  // Si le mod est désactivable et qu'il ne fait pas partie des dépendances d'un autre mod on le supprime
  const deleteIfCan = await deleteToVApi('v_guilds_modslist/remove_mod/' + mod.uuid4)
  // Si l'api nous dit qu'il fait partie des dépendances d'un autre mod on demande à l'utilisateur si il veut vraiment le supprimer ainsi que les mods qui en dépendent
  if(deleteIfCan && deleteIfCan.data && deleteIfCan.data.success) {
    toast.success('Le mod ' + mod.name + ' a bien été supprimé du modpack')
    // On émet un événement pour dire que le mod a été supprimé
    emit('modDeleted', mod)
  } else if(deleteIfCan && deleteIfCan.data && deleteIfCan.data.code === 204) {
    toast.error(deleteIfCan.data.message)
  } else if(deleteIfCan && deleteIfCan.data && deleteIfCan.data.data.length > 0) {
    // On demande à l'utilisateur si il veut vraiment supprimer le mod et les mods qui en dépendent
    showRemoveModal.value = true
    listDependanciesToDelete.value = deleteIfCan.data.data
  } else {
    toast.error('Une erreur est survenue lors de la suppression du mod ' + mod.name + '. Veuillez réessayer')
  }
}

// Ajoute un mod et ses dépendances au modpack
async function addMod(mod) {
    showAddMod.value = true
  const addMod = await postToVApi('v_guilds_modslist/add_mod/' + mod.uuid4 + '/' + mod.version_number)
    if (addMod.data && addMod.data.success) {
      mod.isAdded = true
      toast.success('Le mod ' + mod.name + ' a bien été ajouté au modpack')
      showAddMod.value = false
    } else {
      toast.error(addMod.data.message)
      showAddMod.value = false
    }
}

async function confirmDeleteMod(mod) {
  try {
    // Suppression du mod via l'API et fermeture de la modal
    const { success } = await deleteToVApi('v_guilds_modslist/confirm_remove_mod/' + mod.uuid4);
    
    if (success) {
      toast.success(`Le mod ${mod.name} a bien été supprimé du modpack`);
      mod.isAdded = false;
      mod.id = null;
      // TODO: Supprimer les mods de l'interface de la page online
      emit('modDeleted', mod);
      showRemoveModal.value = false;
    } else {
      toast.error(`Une erreur est survenue lors de la suppression du mod ${mod.name}. Veuillez réessayer`);
    }
  } catch (error) {
    // Gestion des erreurs réseau ou autres exceptions
    console.error(`Une erreur est survenue : ${error.message}`);
  }
}

// Confirme la suppression d'un mod et des mods qui en dépendent
async function confirmDeleteAllMods(mod) {
  console.log(listDependanciesToDelete.value)
  // On fais un tableau de tous les uuid4 des mods à supprimer
  const dependanciesUuid4 = listDependanciesToDelete.value.map((mod) => mod.uuid4)
  // On supprime le mod et les mods qui en dépendent et on ferme la modal
  const deleteAllMods = await deleteToVApi('v_guilds_modslist/confirm_remove_all_mods/' + mod.uuid4, dependanciesUuid4)
  if (deleteAllMods.success) {
    toast.success('Le mod ' + mod.name + ' et les mods dépendant de celui-ci ont bien étés supprimés du modpack')
    console.log(deleteAllMods)
    //TODO gérer les boutons de suppression pour la page online et les mods à supprimer de la liste pour la page modpack
    //listDependanciesToDelete.value[0].isAdded = false
    //listDependanciesToDelete.value[0].id = null
    //emit('modDeleted', listDependanciesToDelete.value[0])
    showRemoveModal.value = false
  } else {
    toast.error('Une erreur est survenue lors de la suppression du mod ' + listDependanciesToDelete.value[0].name + '. Veuillez réessayer')
  }
}

</script>

<style scoped lang="scss">
.mod {
  border-radius: 1em;
  width: 20em;
  height: 25em;
  margin: 1em;
  padding: 0.5em 1em 1em 1em;
  background: linear-gradient(0deg, rgba(40,44,52,1) 0%, rgba(17, 0, 32, 0.705) 100%);
  box-shadow: 0 7px 20px 5px #00000088;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover{
    border: 1px solid #ffffff44;
    box-shadow: 0 7px 50px 10px #000000aa;
    transform: scale(1.015);
  }
  &__details {
    position: relative;
    top: 0;
    left: -8em;
    color: white;
    text-decoration: none;
    &:hover {
      color: #5865F2;
    }
  }
  &__deprecated {
    color: black;
    font-size: 0.8em;
    font-weight: bold;
  }
  & img {
    width: 10em;
    height: 10em;
    object-fit: cover;
    margin: 0 auto;
  }
  &__img-placeholder {
    width: 10em;
    height: 10em;
    background-color: transparent;
    margin: 0 auto;
  }
  & h3 {
    font-size: 1.1em;
    margin: 0.5em;
    white-space: nowrap; /* Empêche le texte de passer à la ligne */
    text-overflow: ellipsis;
    overflow: hidden;
  }
  &__footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1em;
    & button {
      border: none;
      border-radius: 0.5em;
      width: 100%;
      font-size: 0.7em;
      border: 1px solid #ffffff44;
      margin: 0.5em;
      height: 2.5em;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      &:focus {
        outline: none;
      }
    }
  }
}
</style>