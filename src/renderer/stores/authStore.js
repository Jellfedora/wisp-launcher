import { defineStore } from 'pinia'
import { toast } from 'vue3-toastify'
import router from '@/router'


export const useAuthStore = defineStore('auth', {
  id: 'auth',
  state: () => ({
    token: '',
    refreshToken: '',
    name: '',
    avatar: '',
    selectedDiscordGuild: {
      guild_id: '',
      guild_name: '',
      guild_icon_link: '',
      guild_role: ''
    },
    language: 'en'
  }),
  actions: {
    getUserInfo () {
      return {
        name: this.name,
        avatar: this.avatar
      }
    },
    getIsConnected () {
      return this.token ? true : false
    },
    getUserToken () {
      return this.token
    },
    getUserRefreshToken () {
      return this.refreshToken
    },
    getUserName () {
      return this.name
    },
    getUserAvatar () {
      return this.avatar
    },
    getUserRole () {
      if (this.selectedDiscordGuild.guild_role === 'admin') {
        return 'Administrateur'
      } else if (this.selectedDiscordGuild.guild_role === 'moderator') {
        return 'Modérateur'
      } else {
        return 'Joueur'
      }
    },
    getIsAdmin () {
      return this.selectedDiscordGuild.guild_role === 'admin' ? true : false
    },
    getIsModerator () {
      return this.selectedDiscordGuild.guild_role === 'moderator' ? true : false
    },
    getSelectedDiscordGuild () {
      return this.selectedDiscordGuild
    },
    setUserInfo (userInfo) {
      this.name = userInfo.user_discord_name
      this.avatar = userInfo.discord_avatar_link
      this.token = userInfo.discord_token
      this.refreshToken = userInfo.discord_refresh_token
      this.selectedDiscordGuild = {
        guild_id: userInfo.guild_id || userInfo.selected_guild_id,
        guild_name: userInfo.discord_name,
        guild_icon_link: userInfo.discord_icon_link,
        guild_role: userInfo.role
      }
    },
    setUserToken (token) {
      this.token = token
    },
    setUserRefreshToken (refreshToken) {
      this.refreshToken = refreshToken
    },
    disconnectUser () {
      this.token = ''
      this.refreshToken = ''
      this.name = ''
      this.avatar = ''
      this.role = 0
      this.selectedDiscordGuild = {
        guild_id: '',
        guild_name: '',
        guild_icon_link: '',
        guild_role: ''
      }
      toast.success('Vous avez été déconnecté avec succès')
    },
    forceDisconnectUser (message = 'Vous avez été déconnecté') {
      this.token = ''
      this.refreshToken = ''
      this.name = ''
      this.avatar = ''
      this.role = 0
      this.selectedDiscordGuild = {
        guild_id: '',
        guild_name: '',
        guild_icon_link: '',
        guild_role: ''
      }
      // On redirige l'utilisateur vers la page d'accueil
      router.push('/home')
      setTimeout(() => {
        toast.error(message)
      }, 1500)
    },
    getGuildId () {
      return this.selectedDiscordGuild.guild_id
    },
  },
  persist: true
})
