<template>
  <div class="sidebar-action">
    <VTooltip placement="right" v-if="props.nbrMods > 0">
      <button 
        class="sidebar-action__buttons btn-secondary" 
        @click="createModpack()"
        style="background-color: yellow; color: black;border-color: black;"
      >
        <i class="bx bx-cloud-upload bx-sm"></i>
      </button>
      <template #popper>
        Créer modpack
      </template>
    </VTooltip>

    <Modal :show="showModpackModal">
      <h3>Création de l'archive de votre Modpack en cours</h3>
      <SpinnerLoader size="normal" />
      <small>Veuillez ne pas quitter la page pendant la création de l'archive</small>
      <br />
      <small>La création de l'archive peut prendre quelques minutes selon le nombre et la taille des mods</small>
    </Modal>

    <VTooltip placement="right" v-if="props.nbrMods > 0">
      <button 
        class="sidebar-action__buttons btn-secondary"
        @click="LaunchGameWithMods()"
      >
        <i class="bx bx-send bx-sm" v-if="!useModpackStore().getSpinnerLoadingLaunchAdminMods()"></i>
        <SpinnerLoader v-else size="small" />
      </button>
      <template #popper>
        Lancer Valheim pour générer les fichiers de configuration
      </template>
    </VTooltip>

    <VTooltip placement="right">
      <button class="sidebar-action__buttons btn-secondary" @click="openTestConfFolder()">
        <i class="bx bx-folder-open bx-sm"></i>
      </button>
      <template #popper>
        Ouvrir le dossier des configurations de mods
      </template>
    </VTooltip>

    <ConfArbo />
    
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import { getToVApi } from '@/services/axiosService';
import { toast } from 'vue3-toastify'
import { ipcRenderer } from 'electron'

import { useModpackStore } from '@/stores/modpackStore.js'
import { useAuthStore } from '@/stores/authStore.js'

import Modal from '@/components/Modal.vue'
import SpinnerLoader from '@/components/SpinnerLoader.vue'
import ConfArbo from './ConfArbo.vue'

const props = defineProps({
  nbrMods: {
    type: Number,
    required: true
  }
})

const showModpackModal = ref(false);

// Créer un modpack
// Note: Attend 1.5s avant de fermer le modal pour éviter clignotement
async function createModpack() {
  showModpackModal.value = true
  ipcRenderer.send('create-new-modpack', useAuthStore().getGuildId(), useAuthStore().getUserToken())
  ipcRenderer.once('create-new-modpack', (_event, result) => {
    if (result && result.success) {
      setTimeout(() => {
          showModpackModal.value = false
          toast.success('Modpack créé avec succès')
          useModpackStore().checkLocalAndRemoteModpack()
        }, 1500)
      } else {
        setTimeout(() => {
          showModpackModal.value = false
          if(createModpack && createModpack.data && createModpack.data.message) {
            toast.error(createModpack.data.message)
          } else {
            toast.error('Une erreur est survenue lors de la création du modpack')
            // TODO envoyer un message d'erreur au discord V Launcher
          }
        }, 1500);
      }
  });  
}

// Lancer le jeu avec les mods
async function LaunchGameWithMods() {
  // On récupére tous les mods de la guilde
  const mods = await getToVApi ('v_guilds_modslist/all_mods')
  if (mods && mods.success && mods.data.data && mods.data.data.length > 0) {
    useModpackStore().launchGameWithGuildMods(mods.data.data)
  } else {
    toast.error('Une erreur est survenue lors de la récupération des mods de la guilde')
    // TODO envoyer un message d'erreur au discord V Launcher
  }
}

// Ouvrir le dossier de configuration des mods
function openTestConfFolder() {
  ipcRenderer.send('open-conf-folder', useAuthStore().getGuildId() + '-admin')
  ipcRenderer.once('open-conf-folder', (_event, result) => {
    if (result && result.success) {
      toast.success("Votre dossier de configuration a bien été ouvert")
    } else {
      toast.warn("Votre dossier de configuration n'a pas encore été créé, veuillez d'abord lancer le jeu")
    }
  });
}
</script>

<style lang="scss">
.sidebar-action {
  width: 5em;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &__buttons {
    margin: 0.5em 0;
    height: 3em;
    width: 4em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>