import { defineStore } from 'pinia'
import { ipcRenderer } from 'electron'
import { toast } from 'vue3-toastify'

export const useAppStore = defineStore('app', {
  state: () => ({
    // Variables du launcher
    appVersion: 'v0.0.0', // Version du launcher actuelle
    steamPath: '', // Chemin du dossier de steam
    firstConnection: true, // Indique si c'est la première connexion au launcher todo en vue d'un guide d'installation
  }),

  getters: {
    getAppVersion: (state) => () => {
      return state.appVersion
    },
    getSteamFolderPath: (state) => () => {
      return state.steamPath
    },
    getIsFirstConnection: (state) => () => {
      return state.firstConnection
    }
  },

  actions: {
    setSteamFolderPath (folderPath) {
      this.steamPath = folderPath
    },
    setLauncherVersion (appVersion) {
      this.appVersion = appVersion
    },

    // Contact le support sur discord et envoie les logs
    contactSupport (supportWebhook, user, textRequest) {
      ipcRenderer.send('contact-support', supportWebhook, user, textRequest)
      ipcRenderer.once('contact-support', (_event, result) => {
        if (result.success) {
          toast.success('Votre demande a bien été envoyée à notre support, vous allez être contacté via Discord dans les plus brefs délais.')
        } else {
          toast.error(result.message)
        }
      })
    },
  },

  // Persist permet de sauvegarder seulement certaines valeurs. Si on veux tout sauvegarder on supprime le champ persist
  persist: {
    paths: ['steamPath'],
  },
})