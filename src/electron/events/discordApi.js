import { ipcMain, shell } from 'electron'
import axios from 'axios'

export function authDiscordOauth () {
  // login-discord
  ipcMain.on('login-discord', async (event) => {
    try {
      const crypto = require('crypto')
      const uuid = crypto.randomUUID()
      const redirectUri = import.meta.env.VITE_API_URL + 'discord_auth/callback'
      const url = 'https://discord.com/api/oauth2/authorize?client_id=1208221345133891674&response_type=code&redirect_uri=' + redirectUri + '&scope=identify+guilds&state=' + uuid
      shell.openExternal(url)
      // On interroge l'api toutes les 5 secondes pour savoir si l'utilisateur est connecté
      // Si l'api ne répond pas au bout de 2 minutes, on arrête et on renvoie un message d'erreur
      let count = 0
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(import.meta.env.VITE_API_URL + 'discord_auth/auth/' + uuid)
          const responseData = response.data

          if (response.status === 200) {
            clearInterval(interval)
            event.reply('login-discord', { success: true, responseData })
          }
        } catch (error) {
          // Si l'api ne répond pas du tout on coupe la boucle
          if (error.code === 'ECONNREFUSED') {
            clearInterval(interval)
            event.reply('login-discord', { success: false, message: 'Une erreur s\'est produite lors de la connexion avec Discord, veuillez réessayer' })
          } else if (error.code === 'ERR_BAD_REQUEST' && error.response.data.code === 403) {
            clearInterval(interval)
            event.reply('login-discord', { success: false, duration: 20000, message: 'Vous n\'êtes pas autorisé à vous connecter à cette application. Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter le support' })
          }
          // Note: 404 = Le code temporaire n'est pas encore enregistré dans la base de données
        }
        count++
        console.log('Tentative de connexion a Discord numero: ' + count)
        if (count === 24) {
          clearInterval(interval)
          event.reply('login-discord', { success: false, message: 'Vous n\'avez pas été connecté à Discord, veuillez réessayer' })
        }
      }
        , 5000)
    } catch (error) {
      event.reply('login-discord', { success: false, message: 'Une erreur s\'est produite lors de la connexion avec Discord, veuillez réessayer' })
    }
  })
}