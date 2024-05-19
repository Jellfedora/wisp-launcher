<template>
  <Suspense>
    <LoaderScreen @loaderFinished="showLoader = false"/>
  </Suspense>
  <DiscordAuth />
  <DetectGameStatus />
  
  <Sidebar />
  <Wisp />
  <ParticlesEffects />
  <div class="app" v-if="!showLoader">
    <MainRouter/>
  </div>
</template>

<script setup>
import { ref, Suspense } from 'vue'
import MainRouter from '@/components/squeleton/MainRouter.vue'
import LoaderScreen from '@/components/squeleton/LoaderScreen.vue'
import DiscordAuth from '@/components/DiscordAuth.vue'
import Wisp from './components/squeleton/Wisp.vue'
import ParticlesEffects from '@/components/squeleton/ParticlesEffects.vue'
import DetectGameStatus from './components/DetectGameStatus.vue'
import Sidebar from '@/components/squeleton/sidebar/SidebarIndex.vue'
import { useAppStore } from '@/stores/appStore.js'
import { ipcRenderer } from 'electron'
import { onMounted } from 'vue';
import {router} from '@/router'
import { toast } from 'vue3-toastify';

const appStore = useAppStore()
const showLoader = ref(true)

onMounted(() => {
  router.push('/home')
  // Si le chemin du dossier du jeu n'est pas enregistré on tente de le récupérer automatiquement
  if (!appStore.getSteamFolderPath()) {
   ipcRenderer.send('get-steam-path') 
   ipcRenderer.once('get-steam-path', (_event, result) => {
   if (result && result.success) {
     appStore.setSteamFolderPath(result.steamPath)
   } else {
     toast.warn("Le chemin de l\'éxécutable de Steam n'a pu être trouvé automatiquement veuillez le renseigner")
   }
  });
  }
})
</script>

<style scoped lang="scss">
.app {
  height: 100vh;
  margin-left: 15.7em;
  filter: drop-shadow(0 0 0 #646cff00);
  display: flex;
  align-content: flex-start;
  text-align: center;
  flex-wrap: wrap;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
