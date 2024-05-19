<template>
  <div class="parameters">
    <h2>Paramètres</h2>
    <div class="parameters__item">
      <h3>Emplacement de Steam</h3>
      <ParametersSelectSteamFolder />
    </div>
    <div class="parameters__item">
      <h3>Vider le cache</h3>
      <ParametersClearCache />
    </div>
    <div class="parameters__item" v-if="appStore.getSteamFolderPath()">
      <h3>Ouvrir le dossier du jeu</h3>
      <ParametersOpenFolder />
    </div>
    <div class="parameters__item" v-if="appStore.getSteamFolderPath()">
      <h3>Désinstaller le modpack</h3>
      <ParametersDeleteModpack />
    </div>
    <div class="parameters__item">
      <h3>Supprimer mon compte</h3>
      <ParametersDeleteAccount />
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import ParametersSelectSteamFolder from '@/views/parameters/ParametersSelectSteamFolder.vue'
// @ts-ignore
import ParametersOpenFolder from '@/views/parameters/ParametersOpenFolder.vue'
// @ts-ignore
import ParametersDeleteModpack from '@/views/parameters/ParametersDeleteModpack.vue'
// @ts-ignore
import ParametersClearCache from '@/views/parameters/ParametersClearCache.vue'
// @ts-ignore
import ParametersDeleteAccount from '@/views/parameters/ParametersDeleteAccount.vue'
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'

const appStore = useAppStore()
</script>

<style scoped lang="scss">
.parameters {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 5em 2em 2em 2em;
  & h2 {
    margin-bottom: 2em;
  }
  &__item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    text-align: left;
    margin-bottom: 1em;
    & h3 {
    font-size: 1em;
    margin-right: 1em;
    width: 21em;
  }
  }
}
</style>