import { ipcMain, dialog } from 'electron'
import { exec } from 'child_process'
import { app } from 'electron'
import path from 'path'
const { getSteamPath } = require('steam-game-path') // Permet de récupérer le chemin d'installation d'un jeu Steam
import log from 'electron-log'
import fs from 'fs'
import { extractZipArchive } from '../utils/extract'

export function startGame () {
  // Fonction pour démarrer le jeu avec BepInEx depuis un dossier spécifié
  ipcMain.on('start-steam-game', async (event, pathExeSteamFolder, profile, role) => {
    try {
      log.info('Demarrage du jeu Valheim avec BepInEx depuis le dossier :', pathExeSteamFolder, 'pour le profil :', profile + ', avec le role :', role)
      const steamAppID = '892970' // AppId de Valheim

      const profileFolderPath = path.join(app.getPath('userData'), '/profiles', profile)

      // Si non admin on supprime le dossier mods-admin de BepInEx/Plugins
      if (role !== 'admin') {
        log.info('Profil joueur: Suppression du dossier mods-admin dans BepInEx/Plugins')
        const modsAdminFolderPath = path.join(profileFolderPath, 'BepInEx/plugins/mods-admin')
        // On vérifie si le dossier mods-admin existe
        if (fs.existsSync(modsAdminFolderPath)) {
          try {
            // On supprime le dossier mods-admin
            await execPromise(`rmdir /s /q "${modsAdminFolderPath}"`)
          } catch (error) {
            log.error(`Erreur lors de la suppression du dossier mods-admin : ${error.message}`)
            event.reply('start-steam-game', { success: false, error: error.message })
            return
          }
        }
      } else {
        // On vérifie d'abord si le dossier mods-admin existe
        if (fs.existsSync(path.join(profileFolderPath, 'mods-admin'))) {
          // Si admin on copie le dossier entier de profiles/mods-admin vers BepInEx/Plugins/mods-admin
          log.info('Profil Admin: Copie du dossier mods-admin dans BepInEx/Plugins/mods-admin')
          const modsAdminFolderPath = path.join(profileFolderPath, 'mods-admin')
          const adminPluginsFolderPath = path.join(profileFolderPath, 'BepInEx/plugins/mods-admin')
          // On crée le dossier mods-admin dans BepInEx/Plugins
          if (!fs.existsSync(adminPluginsFolderPath)) {
            fs.mkdirSync(adminPluginsFolderPath, { recursive: true })
          }
          try {
            await execPromise(`xcopy "${modsAdminFolderPath}" "${adminPluginsFolderPath}" /E /Y`)
          } catch (error) {
            log.error(`Erreur lors de la copie du dossier mods-admin : ${error.message}`)
            event.reply('start-steam-game', { success: false, error: error.message })
            return
          }
        }
      }

      // On extrait les archives des fichiers de configuration dans BepInEx/config
      const configFolderPath = path.join(profileFolderPath, 'BepInEx/config')
      const configArchivePathPlayers = path.join(profileFolderPath, 'players-config.zip')
      const configArchivePathAdmin = path.join(profileFolderPath, 'admin-config.zip')
      console.log(configArchivePathPlayers)

      try {
        if (fs.existsSync(configArchivePathPlayers)) {
          const stats = fs.statSync(configArchivePathPlayers)
          if (stats.size > 0) {
            await extractZipArchive(configArchivePathPlayers, configFolderPath)
          } else {
            console.log('L\'archive players-config.zip est vide.')
          }
        }

        if (fs.existsSync(configArchivePathAdmin)) {
          const stats = fs.statSync(configArchivePathAdmin)
          if (stats.size > 0) {
            await extractZipArchive(configArchivePathAdmin, configFolderPath)
          } else {
            console.log('L\'archive admin-config.zip est vide.')
          }
        }
      } catch (error) {
        log.error(`Erreur lors de l'extraction des fichiers de configuration : ${error.message}`)
        event.reply('start-steam-game', { success: false, error: error.message })
        return
      }

      // On lance le jeu avec BepInEx

      const bepinexPreloaderPath = path.join(profileFolderPath, 'BepInEx/core/BepInEx.Preloader.dll')

      const steamExePath = path.join(pathExeSteamFolder, 'steam.exe')

      // Commande Steam pour démarrer le jeu avec BepInEx
      const steamCommand = `"${steamExePath}" -applaunch ${steamAppID} --doorstop-enable true --doorstop-target "${bepinexPreloaderPath}"`

      // Exécute la commande Steam
      exec(`${steamCommand}`, (error, _stdout, stderr) => {
        if (error) {
          log.error(`Erreur : ${error.message}`)
          event.reply('start-steam-game', { success: false, error: error.message })
          return
        }
        if (stderr) {
          log.error(`Erreur : ${stderr}`)
          event.reply('start-steam-game', { success: false, error: stderr })
          return
        }
        event.reply('start-steam-game', { success: true })
      })
    } catch (error) {
      log.error(`Erreur inattendue lors du lancement du jeu : ${error.message}`)
      event.reply('start-steam-game', { success: false, error: error.message })
    }
  })
}

// Utilitaire promisify pour exec
function execPromise (command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(new Error(stderr))
      } else {
        resolve(stdout)
      }
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