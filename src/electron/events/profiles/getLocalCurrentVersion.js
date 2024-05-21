import { ipcMain, app } from 'electron'
import path from 'node:path'
import fs from 'fs'
import log from 'electron-log'

export function compareLocalAndRemoteModpack () {
  // Récupére la version locale du modpack
  ipcMain.on('compare-local-remote-modpack', (event, guildId, remoteGuildModpackVersion) => {
    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', guildId)

    const filePath = path.join(profileFolderPath, 'wisp-launcher-modpack.json')

    const bepinexPath = path.join(profileFolderPath, 'Bepinex')

    const bepinexFound = fs.existsSync(bepinexPath)

    // TODO il faut vérifier qu'on est bien sur la version de bepinex spécifiée dans le fichier de version
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        log.error('Erreur lors de la lecture du fichier de version :', err)
        event.reply('compare-local-remote-modpack', { success: false, message: 'Une nouvelle version du modpack est disponible, veuillez mettre votre version à jour !' })
        return
      } else {
        try {
          const jsonFile = JSON.parse(data)

          // On vérifie que le modpack correspond bien à la guilde_id
          if (jsonFile.guild_id !== guildId) {
            event.reply('compare-local-remote-modpack', { success: false, message: 'Une nouvelle version du modpack est disponible, veuillez mettre votre version à jour !' })
            return
          }

          // On vérifie que la version du modpack correspond bien à la version de la guilde
          if (jsonFile.version !== remoteGuildModpackVersion) {
            event.reply('compare-local-remote-modpack', { success: false, message: 'Une nouvelle version du modpack est disponible, veuillez mettre votre version à jour !' })
            return
          }

          // On vérifie que le dossier BepInEx existe, si oui on vérifie que dans son dossier plugins que tous les dossier des mods sont bien présents
          if (bepinexFound) {
            const pluginsPath = path.join(bepinexPath, 'plugins')
            const mods = jsonFile.mods
            let modsNotInstalled = []
            mods.forEach((mod) => {
              // On vérifie que tous les dossiers des mods sont bien présents sauf BepInExPack_Valheim
              if (mod.name !== 'BepInExPack_Valheim' && !fs.existsSync(path.join(pluginsPath, mod.full_name))) {
                modsNotInstalled.push(mod.name)
              }
            })

            if (modsNotInstalled.length > 0) {
              log.error('Certains mods ne sont pas installés :', modsNotInstalled)
              event.reply('compare-local-remote-modpack', { success: false, message: 'Certains mods sont manquants, veuillez mettre votre version à jour !' })
              return
            }
          } else {
            log.error('Le dossier BepInEx n\'a pas été trouvé')
            event.reply('compare-local-remote-modpack', { success: false, message: 'Le dossier BepInEx n\'a pas été trouvé, veuillez mettre votre version à jour !' })
            return
          }

          event.reply('compare-local-remote-modpack', { success: true, version: remoteGuildModpackVersion })
        } catch (error) {
          log.error('Erreur lors de l\'analyse des données du modpack :', error)
          event.reply('compare-local-remote-modpack', { success: false, message: 'Oups une erreur s\'est produite lors de l\'analyse des données du modpack, veuillez contacter un administrateur' })
        }
      }
    })
  })
}