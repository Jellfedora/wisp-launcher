<template>
  <div class="open-folder">
    <!--<button 
      v-if="appStore.getSteamFolderPath()"
      type="button"
      @click="openGameFolder"
      title="Ouvrir le dossier Valheim"
      class="toolbar-buttons btn-secondary"
    >
      <span>Ouvrir</span>
    </button>-->
    En cours de développement
  </div>
</template>

<script setup lang="ts">
//import { ipcRenderer } from 'electron';
// @ts-ignore
//import { useAppStore } from '@/stores/appStore.js'

//const appStore = useAppStore()

//const openGameFolder = () => {
//  ipcRenderer.send('open-game-folder', appStore.getSteamFolderPath())
//}
</script>

<style lang="scss">
.open-folder {
  width: 100%;
  display: flex;
  align-items: center;
  & button {
    border-radius: 8px 8px 8px 8px;
    font-size:0.8em;
    font-weight: bold;
  }
}
</style>