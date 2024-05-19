<template>
  <div class="parameters">
    <h2>Administration de {{ authStore.selectedDiscordGuild.guild_name }}</h2>
    <div class="parameters__item">
      <h3>Administrer modpack</h3>
      <ServeurAdminModsListBtn class="parameters__item__component"/>
    </div>
    <div class="parameters__item">
      <h3>Administrer vos joueurs</h3>
      <p style="font-size:0.8em;">En cours de développement</p>
    </div>
    <div class="parameters__item">
      <h3>Afficher la liste des mods aux joueurs</h3>
      <p style="font-size:0.8em;">En cours de développement</p>
    </div>
    <div class="parameters__item">
      <h3>Webhook discord debug</h3>
      <ServeurDiscordDebugWebhook class="parameters__item__component"/>
    </div>
    <div class="parameters__item">
      <h3>Supprimer la guilde de Wisp Launcher</h3>
      <p style="font-size:0.8em;">En cours de développement</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import ServeurAdminModsListBtn from '@/views/serveur-admin/modslist/ServeurAdminModsListBtn.vue'
// @ts-ignore
import ServeurDiscordDebugWebhook from '@/views/serveur-admin/ServeurDiscordDebugWebhook.vue'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

// Si authStore.getIsAdmin() est faux, on redirige vers la page d'accueil
if (!authStore.getIsAdmin() && !authStore.getIsModerator()) {
  router.push('/')
}
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
    // &__component {
      // width: 80%;
    // }
  }
}
</style>