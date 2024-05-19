<template>
  <div class="admin-modslist-btn-container">
    <button class="admin-modslist-btn-container__btn btn-secondary" @click="router.push('/serveur-admin/modslist')" :title="'Configurer les mods du modpack'" v-if="authStore.getIsAdmin() || authStore.getIsModerator()">
      Configurer les mods du modpack
    </button>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

// Si non admin ou modo, on redirige vers la page d'accueil
if (!authStore.getIsAdmin() && !authStore.getIsModerator()) {
  router.push('/')
}
</script>

<style scoped lang="scss">
.admin-modslist-btn-container {
  &__btn {
    font-size:0.8em;
    width: 20em;
  }
}
</style>