<template>
   <div v-if="showLoader" class="loader-screen">
      <div class="wisp-launcher-logo">
        <div class="wisp-logo__item"></div>
        <div class="wisp-logo__item"></div>
      </div>
      <h1>Wisp Launcher</h1>
      <h2>By WispForge</h2>
   </div>
   <CheckLauncherVersion v-if="showUpdateLauncher" :remoteLauncherVersion="remoteLauncherVersion"/>
</template>

<script lang="ts" setup >
import { ref, onMounted} from 'vue'
import { ipcRenderer } from 'electron';
// @ts-ignore
const { getToVApi } = await import('@/services/axiosService')
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
// @ts-ignore
import { useModpackStore } from '@/stores/modpackStore.js'
// @ts-ignore
import CheckLauncherVersion from '@/components/CheckLauncherVersion.vue'
import { toast } from 'vue3-toastify';

const appStore = useAppStore()
const authStore = useAuthStore()
const modpackStore = useModpackStore()
const showLoader = ref(true)
const showUpdateLauncher = ref(false)
const remoteLauncherVersion = ref('')

const emit = defineEmits(['loaderFinished'])

// Affiche un écran de chargement le temps que l'application se charge
onMounted(async() => {
  // On vérifie si une nouvelle version du launcher est disponible
  const latestLauncherVersion = await getToVApi('free/v_launcher/get_last_version_info')
  // On récupére la version actuelle du launcher
  ipcRenderer.send('get-launcher-version')
  ipcRenderer.once('get-launcher-version', (_event, result) => {
    if (result && result.success) {
      // On enregistre la version du launcher pour l'afficher dans la sidebar
      appStore.setLauncherVersion(result.version)
      if(latestLauncherVersion && latestLauncherVersion.data && (latestLauncherVersion.data.version !== 'v' + result.version)) {
        remoteLauncherVersion.value = latestLauncherVersion.data.version
        showUpdateLauncher.value = true
      } else {
        // On passe à l'étape suivante
        checkIfFirstConnection()
      }
    } else {
      // On n'arrive pas à récupérer la version du launcher on demande à l'utilisateur de retélécharger le launcher
      showUpdateLauncher.value = true
    }
  });
})

// Si c'est la premiére connexion on guide l'utilisateur pour qu'il configure le launcher
async function checkIfFirstConnection() {
  
  // Todo On affiche un écran pour que l'utilisateur se connecte, renseigne le chemin de steam si besoin
  //if (appStore.getIsFirstConnection()) {
  


  //  On vérifie si l'utilisateur est connecté et si le token est valide et on récupére les informations sur sa guilde
  if (authStore.getIsConnected()) {
    // AxiosService s'occupe du reste ;)
    await getToVApi('v_users/auth')
    // Un bonjour fait toujours plaisir
    if (authStore.getUserName()) {
      toast.success(`Bonjour ${authStore.getUserName()}`)
    }

    // On récupére les informations de la guilde si l'utilisateur en a une
    if(authStore.getGuildId()) {
      // On compare la version du modpack local avec la version du modpack distant pour voir si une mise à jour est disponible et si tout est à jour
      modpackStore.checkLocalAndRemoteModpack();
    }
  }

  // On ferme le loader au bout de 3 secondes
  setTimeout(() => {
    showLoader.value = false
    emit('loaderFinished')
  }, 3000)
}

</script>

<style lang="scss" scoped>
.loader-screen {
  height: 100vh;
  width: 100vw;
  background-color: #1d1b31;
  position: absolute;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  & h1 {
    color: white;
    font-size: 2.8em;
    font-family: NorseBold;
  }
  & h2 {
    color: white;
    font-size: 1.4em;
    font-family: NorseBold;
  }
}

.wisp-launcher-logo {
  position:fixed;
  --r: 270px;
  height: var(--r);
  width: var(--r);
  .wisp-logo__item {
    width: inherit;
    height: inherit;
    position: absolute;
    border-radius: 50%;
    animation: Loading 2s linear infinite;

    &::before {
      content: "";
      position: absolute;
      width: inherit;
      height: inherit;
      border-radius: 50%;
      background: linear-gradient(to top, transparent, #25d3e4);
      background-size: calc(var(--r) / 2) var(--r);
      background-repeat: no-repeat;
      mask: radial-gradient(circle, transparent 130px, #000 130px);
    }

    &::after {
      content: "";
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 24px;
      color: #25d3e4;
      background: #25d3e4;
      border-radius: 50%;
      box-shadow: 0 0 10px, 0 0 20px, 0 0 30px, 0 0 40px, 0 0 50px, 0 0 60px,
        0 0 70px, 0 0 80px, 0 0 90px, 0 0 100px;
      z-index: 10;
    }

    &:nth-child(2) {
      animation-delay: -1s;
    }
  }
}

@keyframes Loading {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

</style>