<template>
  <div class="delete-folder">
    <!--<button 
      v-if="appStore.getSteamFolderPath()"
      type="button"
      @click="deleteGameFolder"
      title="Supprimer toute trace des mods installés sur Valheim"
      class="toolbar-buttons btn-secondary"
    >
      <span>Supprimer</span>
    </button>-->
    En cours de développement
  </div>
</template>

<script setup lang="ts">
//import { toast } from 'vue3-toastify'
//import { ipcRenderer } from 'electron';
// @ts-ignore
//import { useModpackStore } from '@/stores/modpackStore.js'

//const modpackStore = useModpackStore()

// TODO a refaire pour cibler le bon profil à supprimer
//const deleteGameFolder = () => {
//  ipcRenderer.send('delete-game-folder', appStore.getSteamFolderPath())
//  ipcRenderer.once('delete-game-folder', (_event, result) => {
//    if (result && result.message) {
//      // On supprime la version locale du modpack
//      modpackStore.checkLocalAndRemoteModpack();
//      toast[result.success ? "success" : "warn"](result.message)
//    }
//  });
//}
</script>

<style lang="scss">
.delete-folder {
  width: 100%;
  display: flex;
  align-items: center;
  & button {
    border-radius: 8px 8px 8px 8px;
    font-size:0.8em;
    color: red;
    font-weight: bold;
  }
  & button:hover {
    background-color: red;
    color: white;
  }
}
  
</style>