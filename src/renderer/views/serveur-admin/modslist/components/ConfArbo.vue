<template>
  <div class="confArbo">
    <VTooltip placement="right">
      <button class="sidebar-action__buttons btn-secondary" @click="getAndShowArboConf()">
        <i class="bx bx-memory-card bx-sm"></i>
      </button>
      <template #popper>
        Définir les fichiers de configuration à inclure dans le modpack
      </template>
    </VTooltip>

    <Modal :show="showArboConfPlayers" class="confArbo__modal">
      <div class="confArbo__modal__content">
        <h3>Quels dossiers et fichiers de configuration souhaitez-vous inclure dans le modpack des joueurs?</h3>
        <div class="confArbo__modal__content__arbo">
          <Tree 
            :filter="true" 
            filterMode="lenient" 
            v-model:selectionKeys="selectedKey" 
            :value="playersConfFiles" 
            selectionMode="checkbox" 
            class="w-full md:w-30rem"
            @nodeSelect="onNodeSelect"
            :metaKeySelection="checked"
          />
        </div>
        <div class="confArbo__modal__content__footer">
          <button class="btn-secondary" @click="showNotifSaveModpack()">Fermer</button>
          <button class="btn-primary" @click="createZip()">Créer le ZIP</button>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify'
import Tree from 'primevue/tree';
import { ipcRenderer } from 'electron';
import { useAuthStore } from '@/stores/authStore.js'

import Modal from '@/components/Modal.vue'

const showArboConfPlayers = ref(false);
const playersConfFiles = ref([]);
const checked = ref(false);
const selectedKey = ref(null);


// Récupérer et afficher l'arborescence des fichiers de configuration
function getAndShowArboConf() {
  // On va récupérer toute l'arborescence des fichiers de configuration
  ipcRenderer.send('get-conf-arbo', useAuthStore().getGuildId() + '-test')
  ipcRenderer.once('get-conf-arbo', (_event, result) => {
    if (result && result.data) {
      playersConfFiles.value = result.data
      showArboConfPlayers.value = true
    } else {
      toast.error('Aucun fichier de configuration trouvé, veuillez d\'abord lancer Valheim')
    }
  });
  
}

// Fermer la notification de sauvegarde du modpack
function showNotifSaveModpack() {
  toast.info('N\'oubliez pas de créer votre modpack pour prendre en compte les modifications')
  showArboConfPlayers.value = false
}


function onNodeSelect(event) {
  // TODO: Vérifier le type de fichier pour ne pas ajouter des malwares dans le modpack
  //event = {children, data,icon,key,label}
  console.log(selectedKey.value)
}

// function onNodeUnselect(event) {
//   toast.warn('Fichier de configuration retiré')
//   // On retire le dossier ou fichier sélectionné
//   selectedFoldersAndFiles.value = selectedFoldersAndFiles.value.filter(el => el.key !== event.node.key)
//   console.log(playersConfFiles.value)
// }

// Créer le fichier ZIP à partir des éléments sélectionnés
async function createZip() {
  console.log(selectedKey.value)
  const selection = JSON.stringify(selectedKey.value);
  ipcRenderer.send('create-conf-zip', selection, useAuthStore().getGuildId() + '-test');
  ipcRenderer.once('create-conf-zip', (_event, result) => {
    if (result && result.success) {
      toast.success('Le fichier ZIP a été créé avec succès : ' + result.filePath);
    } else {
      toast.error('Erreur lors de la création du fichier ZIP : ' + result.message);
    }
  });
}

</script>
<style lang="scss">
.confArbo {
  &__modal {
    &__content {
      max-height: 38em;
      height: 38em;
      width: 60em;
      display: flex;
      flex-wrap: wrap;
      overflow: hidden;
      justify-content: center;
      align-content: space-between;
      & h3 {
        margin-bottom: 1em;
        width: 100%;
      }
      &__arbo {
        width: 100%;
        max-height: 30em;
        overflow: auto;
      }
      &__footer {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 1em;
      }
    }
  }
}

// Bidouilles sur le Tree de primevue, à remplacer car vraiment pas propre
.p-tree {
  background-color: #1d1b31;
  color: white;
  & span {
    color: white;
  }
}

.p-tree-toggler {
  // color: white !important;
  padding: 0 !important;
}

.p-tree-toggler:hover {
  // color: white !important;
  border: none !important;
  background-color: transparent !important;
}

.p-tree .p-treenode-children {
    padding: 0 0 0 1rem !important;
}

.p-treenode-content:hover, .p-treenode-selectable:hover {
  background-color: rgb(168, 168, 168) !important;
}

// Champ de recherche
.p-tree-filter-container {
  width: 20em;
  margin-bottom: 0.5em;
  padding: 0.5rem 0.75rem;
}

.p-tree .p-tree-filter-container .p-tree-filter-icon {
  top: 0.9rem;
  right: 1rem;
}
</style>