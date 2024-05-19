<template>
   <div class="update-launcher">
      <div class="update-launcher__content">
        <h2>Une mise à jour de Wisp Launcher est disponible !</h2>
        <p>Veuillez la télécharger via le lien ci-dessous avant de l'installer pour pouvoir continuer à utiliser le launcher</p>
        <button class="btn-secondary" @click="downloadLauncher">Télécharger la version {{ props.remoteLauncherVersion }}</button>
      </div>
   </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  remoteLauncherVersion: string
}>()

const downloadLauncher = () => {
  const shell = require('electron').shell;
  shell.openExternal(import.meta.env.VITE_API_URL + 'free/v_launcher/download_last_version')
}

</script>

<style lang="scss">
.update-launcher {
  position: absolute;
  bottom: 0;
  top: 0;
  right: 0;
  left: 0;
  width: 100%;
  background-color: #000000bf;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: center;
  &__content {
    padding: 1em;
    width: 45em;
    height: 16em;
    background-color: #1d1b31;
    text-align: center;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    & h2 {
      color: white;
      font-size: 1.2em;
      margin-bottom: 1em;
    }
    & p {
      color: white;
      font-size: 0.8em;
      margin-bottom: 2em;
    }
  }
}
</style>