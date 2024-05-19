<template>
  <div class="clear-cache">
    <button 
      type="button"
      @click="clearCache"
      title="Vider le cache"
      class="toolbar-buttons btn-secondary"
    >
      <span>Vider</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue3-toastify'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()

const clearCache = () => {
  // Reset les stores alarms et auth
  authStore.disconnectUser()
  toast.success("Le cache a bien été vidé")
}
</script>

<style lang="scss">
.clear-cache {
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