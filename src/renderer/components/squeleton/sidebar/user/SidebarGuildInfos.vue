<template>
  <div class="sidebar-guild-infos">
    <!--HEADER-->
    <div class="sidebar-guild-infos__header">
      <img v-if="selectedGuild.guild_name" :src="selectedGuild.guild_icon_link" alt="Icone du serveur discord">
      <div v-if="selectedGuild.guild_name" class="sidebar-guild-infos__header__text">
        <p>{{ authStore.getUserRole() }} sur le</p>
        <h4>Serveur {{ selectedGuild.guild_name }}</h4>
        <small v-if="modpackStore.getNewVersion()">(v{{ modpackStore.getNewVersion() }})</small>
      </div>
    </div>
    <!--MESSAGES D'INFORMATIONS-->
    <TransitionGroup 
      tag="div"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      class="sidebar-guild-infos__server-infos"
      >
      <p v-if="modpackStore.getCurrentVersion() && selectedGuild.guild_name">Version du modpack: {{ modpackStore.getCurrentVersion() }}</p>
      <p v-if="!appStore.getSteamFolderPath()">Votre dossier de jeu valheim n'est pas renseigné</p>
      <p v-if="!modpackStore.getSpinnerLoadingDownloadVersion() && appStore.getSteamFolderPath() && modpackStore.getNewVersion() && modpackStore.getCurrentVersion() !== modpackStore.getNewVersion()">Une nouvelle version du modpack est disponible: v{{ modpackStore.getNewVersion() }}</p>
      <p v-if="!modpackStore.getNewVersion() && selectedGuild.guild_name">Aucun modpack publié</p>
      <!-- Progression du téléchargement -->
      <p v-if="modpackStore.getSpinnerLoadingDownloadVersion()">{{ modpackStore.getProgressDownloadPercent() }}</p>
    </TransitionGroup>
    <!--ACTIONS-->
    <div class="sidebar-guild-infos__server-actions" v-if="selectedGuild.guild_name">
      <button @click="router.push('/connected-serveur')" :title="'Voir ' + selectedGuild.guild_name">
        Infos serveur
      </button>

      <!-- Dossier du jeu renseigné et modpack pas à jour -->
      <button v-if="!modpackStore.getSpinnerLoadingDownloadVersion() && modpackStore.getCurrentVersion()" class="btn-primary" type="button" @click="modpackStore.checkLocalAndRemoteModpack()" title="Vérifier si une nouvelle version du modpack est disponible">
        <div v-if="!modpackStore.getSpinnerLoadingRemoteVersion()">Vérifier version</div>
        <i v-else class="bx bx-loader bx-spin bx-xs " />
      </button>
      <!-- Dossier du jeu renseigné et modpack pas à jour -->
      <button 
        v-if="modpackStore.getCurrentVersion() !== modpackStore.getNewVersion() && modpackStore.getNewVersion() && appStore.getSteamFolderPath()"
        @click="ImportUpdate"
      >
        <div v-if="!modpackStore.getSpinnerLoadingDownloadVersion()">
          Mettre à jour
        </div>
        <div v-if="modpackStore.getSpinnerLoadingDownloadVersion()" class="spinner"/>
      </button>
      
      <!-- Dossier du jeu non renseigné -->
      <button 
        v-if="!appStore.getSteamFolderPath()"
        @click="router.push('/parameters')"
        title="Sélectionner votre dossier de jeu Valheim"
        class="btn-secondary"
      >
        Renseigner dossier jeu
      </button>
      <!-- Dossier du jeu renseigné et modpack à jour -->
      <button 
        v-if="appStore.getSteamFolderPath() && modpackStore.getCurrentVersion() === modpackStore.getNewVersion() && modpackStore.getCurrentVersion() !==''"
        type="button"
        class="start-game-cursor"
        @click="startGame('player')"
      >
        Jouer
      </button>
      <!-- Dossier du jeu renseigné et modpack à jour -->
      <button 
        v-if="appStore.getSteamFolderPath() && modpackStore.getCurrentVersion() === modpackStore.getNewVersion() && modpackStore.getCurrentVersion() !=='' && authStore.getIsAdmin()"
        type="button"
        class="start-game-cursor"
        @click="startGame('admin')"
      >
        Jouer (admin)
      </button>
      <!-- Si modérateur ou administrateur du serveur -->
      <button @click="router.push('/serveur-admin/index')" :title="'Voir ' + selectedGuild.guild_name" v-if="authStore.getIsAdmin() || authStore.getIsModerator()">
        Administrer
      </button>
    </div>
    <button v-else class="sidebar-guild-infos__select-guild" @click="router.push('/guilds/choose')" title="Sélectionner un serveur">
      <i class='bx bx-server'></i> <span> Rejoins un serveur !</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ipcRenderer } from 'electron';
// @ts-ignore
import Sword from '@/assets/mp3/Sword.wav';
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'
// @ts-ignore
import { useModpackStore } from '@/stores/modpackStore.js'
// @ts-ignore
import { gsap } from 'gsap'
import { toast } from 'vue3-toastify'

const modpackStore = useModpackStore()
const appStore = useAppStore()

const router = useRouter()
const authStore = useAuthStore()

const selectedGuild = computed(() => {
  return authStore.getSelectedDiscordGuild()
})

const startGame = (role) => {
  let audio;
  audio = new Audio(Sword);
  audio.volume = 0.5;
  audio.play();
  ipcRenderer.send('start-steam-game', appStore.getSteamFolderPath(), authStore.getSelectedDiscordGuild().guild_id, role);

  ipcRenderer.once('start-steam-game', (_event, result) => {
    if (result.success) {
      toast.success('Jeu lancé avec succès')
    } else {
      console.error('Erreur lors du lancement du jeu: ', result.message)
      toast.error("Une erreur est arrivée lors du lancement du jeu, veuillez réessayer ou contacter le support")
    }
  })
}

const ImportUpdate = () => {
  modpackStore.ImportUpdate()
}

// Transitions
function onBeforeEnter(el: any) {
  el.style.opacity = 0
   el.style.transform = "translateY(-100%)";
}

function onEnter(el: any, done: any) {
  gsap.to(el, {
    opacity: 1,
    y: 0, // Position d'origine
    duration: 0.5, // Durée de l'animation
    delay: 0.5, // Délai avant l'animation
    onComplete: done
  })
}

function onLeave(el: any, done: any) {
  gsap.to(el, {
    opacity: 0,
    y: "100%", // Déplacer l'élément vers le bas
    duration: 0.5,
    onComplete: done
  })
}
</script>

<style lang="scss">
.sidebar-guild-infos {
  width: 100%;
  height: 20em;
  border-bottom-left-radius: 1em;
  border-bottom-right-radius: 1em;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 20%;
    padding: 0 0.4em;
    & img {
      width: 3em;
      height: 3em;
      border-radius: 50%;
      margin: 0.5em;
    }
    &__text {
      display: flex;
      justify-content: left;
      flex-wrap: wrap;
      align-items: center;
      & h4 {
        font-size: 0.7em;
        margin: 0;
      }
      & p {
        font-size: 0.6em;
        margin: 0;
        width: 100%;
      }
      & small {
        font-size: 0.6em;
        margin-left: 0.5em;
      }
    }
  }
  &__server-infos {
    height: 25%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    padding: 0 1.4em;
    & p {
      font-size: 0.7em;
      margin: 0;
      width: 100%;
      text-align: center;
    }
    & button {
      font-family: NorseBold;
      width: 2em;
      height: 2em;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      color: black;
      margin-left: 0.5em;
    }
  }
  &__server-actions {
    height: 55%;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: flex-start;
    & button {
      font-family: NorseBold;
      width: 11em;
      height: 1.5em;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      color: black;
      margin-bottom: 0.5em;
      & div {
        font-family: NorseBold;
      }
    }
  }
  &__select-guild {
    background-color: #5865F2;
    border: none;
    color: white;
    height: 2em;
    padding: 0.5em;
    cursor: pointer;
    transition: 0.5s;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    &:hover {
      background-color: #3f50b5;
    }
    & span {
      font-size: 0.9em;
      margin-left: 0.5em;
    }
  }
}

/* Spinner styles */
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #767676;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 1s linear infinite;
  margin: 1em auto;
}

/* Animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>