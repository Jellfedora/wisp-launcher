import { defineStore } from 'pinia'
import { ipcRenderer } from 'electron'
import { toast } from 'vue3-toastify'
import { useAppStore } from '@/stores/appStore.js'
import { useAuthStore } from '@/stores/authStore.js'

export const useModpackStore = defineStore('modpack', {
  state: () => ({
    profileGuildPath: '', // Chemin du dossier de profil de la guilde

    // Variables du modpack de la guilde actuelle
    localGuildModpackVersion: '', // Version du modpack actuelle
    remoteGuildModpackVersion: '', // Version du modpack la plus récente sur le serveur
    newVersionContentMods: [], // Mods du modpack le plus récent
    newVersionAdminMods: [], // Mods de l'administrateur de la guilde
    bepinexFolderExist: false, // Indique si le dossier bepinex existe

    // Variables de chargement
    spinnerLoadingRemoteVersion: false,
    progressDownloadPercent: null,
    spinnerLoadingDownloadVersion: false,
    spinnerLoadingSendLog: false,

    // Variables de lancement du jeu
    spinnerLoadingLaunchAdminMods: false
  }),

  getters: {
    getSpinnerLoadingRemoteVersion: (state) => () => {
      return state.spinnerLoadingRemoteVersion
    },
    getCurrentVersion: (state) => () => {
      return state.localGuildModpackVersion
    },
    getNewVersion: (state) => () => {
      return state.remoteGuildModpackVersion
    },
    getSpinnerLoadingDownloadVersion: (state) => () => {
      return state.spinnerLoadingDownloadVersion
    },
    getProgressDownloadPercent: (state) => () => {
      return state.progressDownloadPercent
    },
    getSpinnerLoadingSendLog: (state) => () => {
      return state.spinnerLoadingSendLog
    },
    getSpinnerLoadingLaunchAdminMods: (state) => () => {
      return state.spinnerLoadingLaunchAdminMods
    },
  },

  actions: {
    // On compare la version du modpack local avec la version du modpack distant pour voir si une mise à jour est disponible et si tout est à jour
    async checkLocalAndRemoteModpack () {
      // Affiche un spinner dans la section guilde
      this.spinnerLoadingRemoteVersion = true

      // On récupère la version du modpack de la guilde sur le serveur
      const { getToVApi } = await import('@/services/axiosService')
      const remoteGuildModspackVersion = await getToVApi('v_guilds_modpack/latest_version')

      if (remoteGuildModspackVersion && remoteGuildModspackVersion.success && remoteGuildModspackVersion.data) {
        this.remoteGuildModpackVersion = remoteGuildModspackVersion.data.data.version
        // On stocke les mods de la nouvelle version si il y en a
        if (remoteGuildModspackVersion.data.data.mods) {
          this.newVersionContentMods = remoteGuildModspackVersion.data.data.mods
          if (remoteGuildModspackVersion.data.admin) {
            this.newVersionAdminMods = remoteGuildModspackVersion.data.admin.mods
          } else {
            this.newVersionAdminMods = []
          }
        } else {
          this.newVersionContentMods = []
        }

        //------------------------------------------------------------------------------------------

        // On compare les versions et on vérifie si le profile contient bien tous les fichiers du modpack
        const authStore = useAuthStore()
        const guildInfos = await authStore.getSelectedDiscordGuild()
        const guildId = guildInfos.guild_id

        ipcRenderer.send('compare-local-remote-modpack', guildId, this.remoteGuildModpackVersion)
        ipcRenderer.once('compare-local-remote-modpack', (_event, result) => {
          this.bepinexFolderExist = result.bepinex
          if (result && result.success) {
            this.localGuildModpackVersion = result.version
            toast.success("Votre modpack est à jour")
          } else {
            this.localGuildModpackVersion = ''
            toast.warn(result.message)
          }
        })

      } else {
        this.remoteGuildModpackVersion = ''
        toast.warn('Cette guilde n\'a pas encore publié de modpack')
      }

      // On arrête le spinner
      this.spinnerLoadingRemoteVersion = false
    },

    // Télécharge la nouvelle version du modpack de la guilde sur laquelle l'utilisateur est connecté
    async ImportUpdate () {
      this.spinnerLoadingDownloadVersion = true
      const authStore = useAuthStore()
      const userToken = await authStore.getUserToken()

      // On récupére les mods joueur à télécharger qui sont dans un proxy
      const mods = []
      this.newVersionContentMods.forEach(mod => {
        mods.push({ name: mod.name, full_name: mod.full_name, version: mod.version_number })
      })
      const jsonFile = {
        mods: mods,
        version: this.remoteGuildModpackVersion,
        guild_id: await authStore.getGuildId()
      }

      // On récupère les mods de l'administrateur
      const adminMods = []
      this.newVersionAdminMods.forEach(mod => {
        adminMods.push({ name: mod.name, full_name: mod.full_name, version: mod.version_number })
      })
      const jsonFileAdmin = {
        mods: adminMods,
        version: this.remoteGuildModpackVersion,
        guild_id: await authStore.getGuildId()
      }

      // On passe ces informations à l'ipcMain pour qu'il télécharge les mods
      ipcRenderer.send('update-version', userToken, jsonFile, jsonFileAdmin)

      ipcRenderer.on('update-version-progress', (_event, result) => {
        this.progressDownloadPercent = result.message
      })

      ipcRenderer.once('update-version', (_event, result) => {
        if (result.success) {
          this.localGuildModpackVersion = this.remoteGuildModpackVersion
          toast.success("Votre modpack est maintenant à jour")
        } else {
          console.error('Erreur lors de la récupération de l\'archive: ', result.message)
          toast.error("Une erreur est arrivée lors de la récupération du modpack, veuillez reesayez, si le problème persiste contactez le support")
        }
        this.spinnerLoadingDownloadVersion = false
      })
      this.progressDownloadPercent = null
    },

    // Met à jour les mods de l'administrateur et lance le jeu avec les mods de la guilde
    async launchGameWithGuildMods (modsList) {
      this.spinnerLoadingLaunchAdminMods = true
      const authStore = useAuthStore()
      const userToken = await authStore.getUserToken()

      const jsonFile = {
        mods: modsList,
        guild_id: await authStore.getGuildId()
      }
      const guildIdWithTest = jsonFile.guild_id + '-admin'
      const appStore = useAppStore()
      const steamFolderPath = await appStore.getSteamFolderPath()
      ipcRenderer.send('launch-game-with-guild-mods', userToken, jsonFile)

      ipcRenderer.once('launch-game-with-guild-mods', (_event, result) => {
        if (result.success) {
          this.localGuildModpackVersion = this.remoteGuildModpackVersion
          ipcRenderer.send('start-steam-game', steamFolderPath, guildIdWithTest)
          ipcRenderer.once('start-steam-game', (_event, result) => {
            if (result.success) {
              toast.success('Jeu lancé avec succès')
            } else {
              console.error('Erreur lors du lancement du jeu: ', result.message)
              toast.error("Une erreur est arrivée lors du lancement du jeu, veuillez réessayer ou contacter le support")
            }
          })
        } else {
          console.error('Erreur lors de la récupération de l\'archive: ', result.message)
          toast.error("Une erreur est arrivée lors de la récupération du modpack, veuillez reesayez de mettre à jour")
        }
        this.spinnerLoadingLaunchAdminMods = false
      })
    },

    // Envoi les logs du jeu sur le discord de la guilde TODO à refaire
    async sendLogFile (webhookUrl) {
      const authStore = useAuthStore()
      const guildId = await authStore.getGuildId()
      this.spinnerLoadingSendLog = true
      ipcRenderer.send('send-log-file', guildId, webhookUrl)
      ipcRenderer.once('send-log-file', (_event, result) => {
        if (result.success) {
          toast.success('Fichier de log envoyé avec succès')
        } else {
          toast.error(result.message)
        }
        this.spinnerLoadingSendLog = false
      })
    },
  },

  // Persist permet de sauvegarder seulement certaines valeurs. Si on veux tout sauvegarder on supprime le champ persist
  persist: {
    paths: [],
  },
})
