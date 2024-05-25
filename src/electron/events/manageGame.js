import { ipcMain, dialog } from 'electron'
import { exec } from 'child_process'
import { app } from 'electron'
import path from 'path'
const { getSteamPath } = require('steam-game-path') // Permet de récupérer le chemin d'installation d'un jeu Steam
import log from 'electron-log'
import fs from 'fs'

export function startGame () {
  // Fonction pour démarrer le jeu avec BepInEx depuis un dossier spécifié
  ipcMain.on('start-steam-game', async (event, pathExeSteamFolder, profile, role) => {
    console.log('Demarrage du jeu avec BepInEx depuis le dossier :', pathExeSteamFolder, 'pour le profil :', profile + ', avec le role :', role)
    const steamAppID = '892970' // AppId de Valheim

    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', profile)

    // Si non admin on supprime le dossier mods-admin de BepInEx/Plugins
    if (role !== 'admin') {
      const modsAdminFolderPath = path.join(profileFolderPath, 'BepInEx/plugins/mods-admin')
      // On vérifie si le dossier mods-admin existe
      if (fs.existsSync(modsAdminFolderPath)) {
        // On supprime le dossier mods-admin
        exec(`rmdir /s /q "${modsAdminFolderPath}"`, (error, _stdout, stderr) => {
          if (error) {
            log.error(`Erreur lors de la suppression du dossier mods-admin : ${error.message}`)
            event.reply('start-steam-game', { success: false, error: error.message })
            return
          }
          if (stderr) {
            log.error(`Erreur lors de la suppression du dossier mods-admin : ${stderr}`)
            event.reply('start-steam-game', { success: false, error: stderr })
            return
          }
        }
        )
      }
    } else {
      // On vérifie d'abord si le dossier mods-admin existe
      if (fs.existsSync(path.join(profileFolderPath, 'mods-admin'))) {
        // Si admin on copie le dossier entier de profiles/mods-admin vers BepInEx/Plugins/mods-admin
        const modsAdminFolderPath = path.join(profileFolderPath, 'mods-admin')
        const adminPluginsFolderPath = path.join(profileFolderPath, 'BepInEx/plugins/mods-admin')
        // On crée le dossier mods-admin dans BepInEx/Plugins
        if (!fs.existsSync(adminPluginsFolderPath)) {
          fs.mkdirSync(adminPluginsFolderPath, { recursive: true })
        }
        exec(`xcopy "${modsAdminFolderPath}" "${adminPluginsFolderPath}" /E /Y`, (error, _stdout, stderr) => {
          if (error) {
            log.error(`Erreur lors de la copie du dossier mods-admin : ${error.message}`)
            event.reply('start-steam-game', { success: false, error: error.message })
            return
          }
          if (stderr) {
            log.error(`Erreur lors de la copie du dossier mods-admin : ${stderr}`)
            event.reply('start-steam-game', { success: false, error: stderr })
            return
          }
        })
      }
    }

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