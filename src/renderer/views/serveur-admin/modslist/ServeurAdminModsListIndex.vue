<template>
  <div class="admin-modslist">
    <div class="admin-modslist__switch">
      <button style="border-bottom-left-radius: 1em;" @click="listType = 'Modspack'" :class="listType === 'Modspack' ? 'btn-focus' : 'btn-not-focus'">Mods de votre serveur</button>
      <button style="border-bottom-right-radius: 1em;" @click="listType = 'Online'" :class="listType === 'Online' ? 'btn-focus' : 'btn-not-focus'">Mods en ligne</button>
    </div>
    <ServeurAdminModsListOnline v-if="listType === 'Online'" />
    <ServeurAdminModsListModspack v-else="listType === 'Modspack'" />
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import {router} from '@/router'

import { useAuthStore } from '@/stores/authStore.js'

import ServeurAdminModsListOnline from './ServeurAdminModsListOnline.vue';
import ServeurAdminModsListModspack from './ServeurAdminModsListModspack.vue';

const authStore = useAuthStore()
const listType = ref('Modspack')

onMounted(() => {
  // Si l'utilisateur ne fait pas partie d'une guilde, on le redirige vers la home
  if (!authStore.getSelectedDiscordGuild().guild_name) {
    toast.error("Vous devez être connecté à un serveur Discord pour accéder à cette page")
    router.push('/home')
  }
})
</script>

<style scoped lang="scss">

.admin-modslist {
  width: 100%;
  height: 100vh;
  &__switch {
    display: flex;
    justify-content: space-between;
    width: 100%;
    & button {
      flex: 1;
      font-size: 12px;
      padding: 0.5em 1em;
      line-height: 1;
      border-bottom: 1px solid #d8d8d8;
      background-color: #d8d8d8;
      color: black;
      border-radius: 0;
      transition: all 0.4s;
    }
  }
}
.btn-focus {
  flex: 4 !important;
  background-color: transparent !important;
  color: white !important;
  border-bottom: 1px solid #25d3e4 !important;
}

.btn-not-focus:hover {
  background-color: white !important;
}

.admin-modslist__switch button:focus {
  outline: none;
}
</style>