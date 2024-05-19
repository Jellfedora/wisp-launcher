import { ipcMain, dialog } from 'electron'
import { exec } from 'child_process'
import { app } from 'electron'
import path from 'path'
const { getSteamPath } = require('steam-game-path') // Permet de récupérer le chemin d'installation d'un jeu Steam

export function startGame () {
  // Fonction pour démarrer le jeu avec BepInEx depuis un dossier spécifié
  ipcMain.on('start-steam-game', async (event, pathExeSteamFolder, guildId) => {
    const steamAppID = '892970' // AppId de Valheim

    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', guildId)
    const bepinexPreloaderPath = path.join(profileFolderPath, 'BepInEx/core/BepInEx.Preloader.dll')

    const steamExePath = path.join(pathExeSteamFolder, 'steam.exe')

    // Commande Steam pour démarrer le jeu avec BepInEx
    const steamCommand = `"${steamExePath}" -applaunch ${steamAppID} --doorstop-enable true --doorstop-target "${bepinexPreloaderPath}"`

    // Exécute la commande Steam
    exec(`${steamCommand}`, (error, _stdout, stderr) => {
      if (error) {
        console.error(`Erreur : ${error.message}`)
        event.reply('start-steam-game', { success: false, error: error.message })
        return
      }
      if (stderr) {
        console.error(`Erreur : ${stderr}`)
        event.reply('start-steam-game', { success: false, error: stderr })
        return
      }
      event.reply('start-steam-game', { success: true })
    })
  })
}

export function getSteamExePath () {
  // Obtiens le chemin d'installation de steam
  ipcMain.on('get-steam-path', async (event) => {
    try {
      //const steamPath = getGamePath(892970);
      const steamPath = getSteamPath()
      if (steamPath) {
        event.reply('get-steam-path', { success: true, steamPath: steamPath })
      } else {
        event.reply('get-steam-path', { success: false })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du chemin d\'installation de Steam :', error)
      event.reply('get-steam-path', { success: false })
    }
  })
}

export function setSteamPath () {
  // L'utilisateur renseigne lui même le chemin du jeu
  ipcMain.on('get-valheim-path', async (event) => {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled) {
        const selectedFolderPath = result.filePaths[0]
        event.reply('get-valheim-path', { path: selectedFolderPath })
      }
    }).catch(err => {
      event.reply('get-valheim-path', { error: err })
    })
  })
}

export function detectGameStatus () {
  // Détecte si le jeu est en cours d'exécution
  ipcMain.on('detect-game-status', (event) => {
    exec('tasklist', (error, stdout, _stderr) => {
      if (error) {
        console.error(`Erreur : ${error.message}`)
        event.reply('detect-game-status', { success: false, error: error.message })
        return
      }
      if (stdout.includes('valheim.exe')) {
        event.reply('detect-game-status', { success: true, running: true })
      } else {
        event.reply('detect-game-status', { success: true, running: false })
      }
    })
  })
}