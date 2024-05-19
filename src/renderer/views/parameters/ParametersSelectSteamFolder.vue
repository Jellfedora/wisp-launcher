<template>
  <div class="select-folder">
    <button @click="openFolderDialog" title="Sélectionner le dossier de l'éxécutable steam.exe" class="btn-secondary" style="width: 35em;text-align:left;">
      {{ appStore.getSteamFolderPath() ? truncateFolderPath(appStore.getSteamFolderPath()) : 'Sélectionner le dossier de l\'éxécutable steam.exe' }}
    </button>
    <button style="border-radius: 0 8px 8px 0;font-size:0.8em;" @click="removeFolderPath" title="Supprimer l'emplacement de steam.exe" class="btn-secondary">
      X
    </button>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'

const appStore = useAppStore()

const openFolderDialog= () => {
  ipcRenderer.send('get-valheim-path');

  ipcRenderer.once('get-valheim-path', (_event, result) => {
    if (result && result.path) {
      appStore.setSteamFolderPath(result.path)
    }
  });
}

const removeFolderPath= () => {
  appStore.setSteamFolderPath('');
}

// Tronquer le chemin du dossier de jeu
const truncateFolderPath = (path: string) => {
  if (path.length > 50) {
    return path.substring(0, 47) + '...';
  } else {
    return path;
  }
}
</script>

<style lang="scss">
.select-folder {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  & button {
    border-radius: 8px 0 0 8px;
    font-size:0.8em;
  }
}
  
</style>