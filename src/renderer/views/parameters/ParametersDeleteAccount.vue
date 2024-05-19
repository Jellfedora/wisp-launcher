<template>
  <div class="delete-folder">
    <!-- <button 
      v-if="connected"
      type="button"
      @click="deleteAccount"
      title="Supprimer toute trace des mods installés sur Valheim"
      class="toolbar-buttons btn-secondary"
    >
      <span>Supprimer</span>
    </button> -->
    En cours de développement
  </div>
</template>

<script setup lang="ts">
//import { toast } from 'vue3-toastify'
//import { ipcRenderer } from 'electron';
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'

//const appStore = useAppStore()

//const deleteAccount = () => {
  // Penser à déconnecter le joueur et vider le cache
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