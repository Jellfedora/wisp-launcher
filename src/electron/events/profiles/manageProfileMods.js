import { ipcMain, app } from 'electron'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { extractZipArchive, copyDirectoryRecursive } from '../../utils/extract'
const log = require('electron-log')

/** Télécharge la version demandée aprés avoir nettoyé les anciens fichiers Bepinex et le fichier de version du modpack
 * @param {string} userBearerToken - Token d'authentification de l'utilisateur
 * @param {object} jsonFile - Fichier json contenant: guild_id, mods et version
 * @param {string} valheimFolderPath - Chemin du dossier du jeu Valheim
 **/
export function updateModsPack () {
  ipcMain.on('update-version', async (event, userBearerToken, jsonFile, jsonFileAdmin) => {
    try {
      // Si le dossier du profile n'existe pas on le crée
      const profileFolderPath = path.join(app.getPath('userData'), '/profiles', jsonFile.guild_id)

      if (!fs.existsSync(profileFolderPath)) {
        fs.mkdirSync(profileFolderPath, { recursive: true })
      }

      // Liste des chemins vers les éléments à supprimer
      const pathsToDelete = [
        path.join(profileFolderPath, 'BepInEx'),
        path.join(profileFolderPath, 'BepInEx.zip'),
        path.join(profileFolderPath, 'BepInExPack_Valheim'),
        path.join(profileFolderPath, 'README.md'),
        path.join(profileFolderPath, 'icon.png'),
        path.join(profileFolderPath, 'manifest.json'),
        path.join(profileFolderPath, 'CHANGELOG.md'),
        path.join(profileFolderPath, 'doorstop_libs'),
        path.join(profileFolderPath, 'changelog.txt'),
        path.join(profileFolderPath, 'doorstop_config.ini'),
        path.join(profileFolderPath, 'start_game_bepinex.sh'),
        path.join(profileFolderPath, 'start_server_bepinex.sh'),
        path.join(profileFolderPath, 'winhttp.dll'),
        path.join(profileFolderPath, 'wisp-launcher-modpack.json'),
        path.join(profileFolderPath, 'wisp-launcher-modpack-admin.json'),
        path.join(profileFolderPath, 'mods-admin'),
      ]

      // Suppression des fichiers et dossiers de manière asynchrone
      event.reply('update-version-progress', { message: 'Suppression des anciens fichiers et dossiers Bepinex' })
      async function deleteFilesAndFolders () {
        for (const pathToDelete of pathsToDelete) {
          try {
            if (fs.existsSync(pathToDelete)) {
              if (fs.statSync(pathToDelete).isDirectory()) {
                await fs.promises.rm(pathToDelete, { recursive: true })
              } else {
                await fs.promises.unlink(pathToDelete)
              }
            }
          } catch (error) {
            log.error(`Erreur lors de la suppression de ${pathToDelete} : ${error.message}`)
          }
        }
      }

      // On attend que la suppression des fichiers et dossiers soit terminée
      await deleteFilesAndFolders()

      // On écrit le contenu jsonFile dans le fichier wish-launcher-modpack.json
      const newVersionFilePath = path.join(profileFolderPath, 'wisp-launcher-modpack.json')
      const newVersionAdminFilePath = path.join(profileFolderPath, 'wisp-launcher-modpack-admin.json')

      fs.writeFileSync(newVersionFilePath, JSON.stringify(jsonFile, null, 2))
      fs.writeFileSync(newVersionAdminFilePath, JSON.stringify(jsonFileAdmin, null, 2))

      // On va télécharger le fichier zip du bepinex et l'extraire dans le dossier du jeu
      // On recherche dans jsonFile.mods le mod ayant le nom BepInExPack_Valheim
      const bepinexMod = jsonFile.mods.find((mod) => mod.name === 'BepInExPack_Valheim')
      if (!bepinexMod) {
        event.reply('update-version-error', { message: 'Le mod BepInExPack_Valheim n\'a pas été trouvé dans la nouvelle version du modpack, veuillez vérifier qu\'il a bien été ajouté.' })
        return
      }

      // On récupére le full_name du mod BepInExPack_Valheim
      const bepinexModFullName = bepinexMod.full_name
      const getBepinexArchive = await axios({
        method: 'get',
        url: (import.meta.env.VITE_API_URL + 'v_guilds_modpack/download_archive/' + bepinexModFullName + '.zip'),
        headers: {
          'Authorization': `Bearer ${userBearerToken}`
        },
        responseType: 'arraybuffer'
      })

      // Écriture du fichier téléchargé
      event.reply('update-version-progress', { message: 'Ecriture de l\'archive BepInEx' })
      const tempBepinexArchivePath = path.join(profileFolderPath, 'BepInEx.zip')
      await fs.promises.writeFile(tempBepinexArchivePath, Buffer.from(getBepinexArchive.data), 'binary')

      // Extraction de l'archive BepInEx.zip
      event.reply('update-version-progress', { message: 'Extraction de l\'archive BepInEx' })
      const extractBep = await extractZipArchive(tempBepinexArchivePath, profileFolderPath)
      if (extractBep.success) {
        // Suppression de l'archive BepInEx.zip
        fs.unlinkSync(tempBepinexArchivePath)

        // Dans le dossier obtenu qui se nomme BepInEx, on a un dossier nommé BepInExPack_Valheim
        const bepinexPackValheimPath = path.join(profileFolderPath, 'BepInExPack_Valheim')
        // On déplace tous le contenu de BepInExPack_Valheim dans le dossier du jeu
        fs.readdirSync(bepinexPackValheimPath).forEach((file) => {
          fs.renameSync(path.join(bepinexPackValheimPath, file), path.join(profileFolderPath, file))
        })
        // On supprime juste le dossier wish-download-temp et le dossier BepInExPack_Valheim
        fs.rmdirSync(bepinexPackValheimPath, { recursive: true })

        // Téléchargement et extraction des autres mods
        const otherMods = jsonFile.mods.filter((mod) => mod.name !== 'BepInExPack_Valheim')
        for (const mod of otherMods) {
          const downMod = await downloadAndExtractArchive(mod, userBearerToken, path.join(profileFolderPath, 'BepInEx/plugins'), event)
          if (downMod && !downMod.success) {
            log.error('Erreur lors du téléchargement et de l\'extraction de l\'archive ' + mod.name)
            event.reply('update-version-error', { message: 'Une erreur est survenue lors du téléchargement et de l\'extraction de l\'archive ' + mod.name })
            return
          }

        }
      }

      // Si le jsonAdmin posséde des mods on crée le dossier admin et on y télécharge les mods
      if (jsonFileAdmin.mods.length > 0) {
        console.log('jsonFileAdmin', jsonFileAdmin)
        const profileFolderPathAdmin = path.join(app.getPath('userData'), '/profiles', jsonFile.guild_id, 'mods-admin')

        if (!fs.existsSync(profileFolderPathAdmin)) {
          fs.mkdirSync(profileFolderPathAdmin, { recursive: true })
        }

        // On y télécharge les mods
        for (const mod of jsonFileAdmin.mods) {
          const downModAdmin = await downloadAndExtractArchive(mod, userBearerToken, profileFolderPathAdmin, event)
          if (downModAdmin && !downModAdmin.success) {
            log.error('Erreur lors du téléchargement et de l\'extraction de l\'archive ' + mod.name)
            event.reply('update-version-error', { message: 'Une erreur est survenue lors du téléchargement et de l\'extraction de l\'archive ' + mod.name })
            return
          }
        }
      }


      // Envoyer un message pour indiquer que le téléchargement est terminé
      event.reply('update-version', { success: true })

    } catch (error) {
      log.error('Erreur lors de la mise à jour de la version :', error)
      // Envoyer un message à la fenêtre principale pour signaler une erreur
      event.reply('update-version-error', { message: 'Une erreur est survenue lors de la mise à jour de la version.' })
    }
  })
}

/** Met à jour les mods de l'administrateur et lance le jeu avec les mods de la guilde
 * @param {string} userBearerToken - Token d'authentification de l'utilisateur
 * @param {object} jsonFile - Fichier json contenant: guild_id et mods
 * @param {string} valheimFolderPath - Chemin du dossier du jeu Valheim
 **/
export function launchGameWithGuildMods () {
  ipcMain.on('launch-game-with-guild-mods', async (event, userBearerToken, jsonFile) => {
    try {
      // Si le dossier du profile n'existe pas on le crée
      const profileFolderPath = path.join(app.getPath('userData'), '/profiles', jsonFile.guild_id + '-admin')

      if (!fs.existsSync(profileFolderPath)) {
        fs.mkdirSync(profileFolderPath, { recursive: true })
      }

      // Si le dossier BepInEx/config existe on en fait une copie dans le dossier du jeu nommée save-config
      const configFolderPath = path.join(profileFolderPath, 'BepInEx/config')
      if (fs.existsSync(configFolderPath)) {
        const saveConfigFolderPath = path.join(profileFolderPath, 'save-config')
        await copyDirectoryRecursive(configFolderPath, saveConfigFolderPath)
      }

      // TODO D'abord on vérifie si le bepinex a changé en lisant 'wisp-launcher-modpack.json', 
      // si il n'a pas changé et que le dossier et sous dossier BepInEx existent on ne fait rien
      // Liste des chemins vers les éléments à supprimer
      const pathsToDelete = [
        path.join(profileFolderPath, 'BepInEx'),
        path.join(profileFolderPath, 'BepInEx.zip'),
        path.join(profileFolderPath, 'BepInExPack_Valheim'),
        path.join(profileFolderPath, 'README.md'),
        path.join(profileFolderPath, 'icon.png'),
        path.join(profileFolderPath, 'manifest.json'),
        path.join(profileFolderPath, 'CHANGELOG.md'),
        path.join(profileFolderPath, 'doorstop_libs'),
        path.join(profileFolderPath, 'changelog.txt'),
        path.join(profileFolderPath, 'doorstop_config.ini'),
        path.join(profileFolderPath, 'start_game_bepinex.sh'),
        path.join(profileFolderPath, 'start_server_bepinex.sh'),
        path.join(profileFolderPath, 'winhttp.dll'),
        path.join(profileFolderPath, 'wisp-launcher-modpack.json'),
        path.join(profileFolderPath, 'version.json'),
      ]

      // Suppression des fichiers et dossiers de manière asynchrone
      // TODO On ne supprime que si le bepinex a changé 
      event.reply('launch-game-with-guild-mods-progress', { message: 'Suppression des anciens fichiers et dossiers Bepinex' })
      async function deleteFilesAndFolders () {
        for (const pathToDelete of pathsToDelete) {
          try {
            if (fs.existsSync(pathToDelete)) {
              if (fs.statSync(pathToDelete).isDirectory()) {
                await fs.promises.rm(pathToDelete, { recursive: true })
              } else {
                await fs.promises.unlink(pathToDelete)
              }
            }
          } catch (error) {
            log.error(`Erreur lors de la suppression de ${pathToDelete} : ${error.message}`)
          }
        }
      }

      // On attend que la suppression des fichiers et dossiers soit terminée
      await deleteFilesAndFolders()

      event.reply('launch-game-with-guild-mods-progress', { message: 'Ecriture de la nouvelle version du modpack' })
      // On écrit le contenu jsonFile dans le fichier wish-launcher-modpack.json
      const newVersionFilePath = path.join(profileFolderPath, 'wisp-launcher-modpack.json')

      fs.writeFileSync(newVersionFilePath, JSON.stringify(jsonFile, null, 2))

      // TODO seulement si bepinex supprimé
      // On va télécharger le fichier zip du bepinex et l'extraire dans le dossier du jeu
      // On recherche dans jsonFile.mods le mod ayant le nom BepInExPack_Valheim
      const bepinexMod = jsonFile.mods.find((mod) => mod.name === 'BepInExPack_Valheim')
      if (!bepinexMod) {
        event.reply('launch-game-with-guild-mods-error', { message: 'Le mod BepInExPack_Valheim n\'a pas été trouvé dans la nouvelle version du modpack, veuillez vérifier qu\'il a bien été ajouté.' })
        return
      }

      // On récupére le full_name du mod BepInExPack_Valheim
      const bepinexModFullName = bepinexMod.full_name
      const getBepinexArchive = await axios({
        method: 'get',
        url: (import.meta.env.VITE_API_URL + 'v_guilds_modpack/download_archive/' + bepinexModFullName + '.zip'),
        headers: {
          'Authorization': `Bearer ${userBearerToken}`
        },
        responseType: 'arraybuffer'
      })

      // Écriture du fichier téléchargé
      event.reply('launch-game-with-guild-mods-progress', { message: 'Ecriture de l\'archive BepInEx' })
      const tempBepinexArchivePath = path.join(profileFolderPath, 'BepInEx.zip')
      await fs.promises.writeFile(tempBepinexArchivePath, Buffer.from(getBepinexArchive.data), 'binary')

      // Extraction de l'archive BepInEx.zip
      event.reply('launch-game-with-guild-mods-progress', { message: 'Extraction de l\'archive BepInEx' })
      const extractBep = await extractZipArchive(tempBepinexArchivePath, profileFolderPath)
      if (extractBep.success) {
        // Suppression de l'archive BepInEx.zip
        fs.unlinkSync(tempBepinexArchivePath)

        // Dans le dossier obtenu qui se nomme BepInEx, on a un dossier nommé BepInExPack_Valheim
        const bepinexPackValheimPath = path.join(profileFolderPath, 'BepInExPack_Valheim')
        // On déplace tous le contenu de BepInExPack_Valheim dans le dossier du jeu
        fs.readdirSync(bepinexPackValheimPath).forEach((file) => {
          fs.renameSync(path.join(bepinexPackValheimPath, file), path.join(profileFolderPath, file))
        })
        // On supprime juste le dossier wish-download-temp et le dossier BepInExPack_Valheim
        fs.rmdirSync(bepinexPackValheimPath, { recursive: true })

        // TODO On ne télécharge que si le mod est manquant
        // Téléchargement et extraction des autres mods
        const otherMods = jsonFile.mods.filter((mod) => mod.name !== 'BepInExPack_Valheim')
        for (const mod of otherMods) {
          const downMod = await downloadAndExtractArchive(mod, userBearerToken, path.join(profileFolderPath, 'BepInEx/plugins'), event)
          if (downMod && !downMod.success) {
            log.error('Erreur lors du téléchargement et de l\'extraction de l\'archive ' + mod.name)
            event.reply('launch-game-with-guild-mods-error', { message: 'Une erreur est survenue lors du téléchargement et de l\'extraction de l\'archive ' + mod.name })
            return
          }

        }
        // TODO on supprime si le mod ne fait pas partie de la liste

        // On copie le contenu du dossier save-config dans le dossier BepInEx/config
        const saveConfigFolderPath = path.join(profileFolderPath, 'save-config')
        if (fs.existsSync(saveConfigFolderPath)) {
          const configFolderPath = path.join(profileFolderPath, 'BepInEx/config')
          const copyConf = await copyDirectoryRecursive(saveConfigFolderPath, configFolderPath)
          if (copyConf && !copyConf.success) {
            // On supprime le dossier save-config
            fs.rmdirSync(saveConfigFolderPath, { recursive: true })
          }
        }
        // TODO faire pareil pour les profiles classiques
      }
      // Envoyer un message pour indiquer que le téléchargement est terminé
      event.reply('launch-game-with-guild-mods', { success: true })

    } catch (error) {
      log.error('Erreur lors de la mise à jour de la version d\'un profil test admin :', error)
      // Envoyer un message à la fenêtre principale pour signaler une erreur
      event.reply('launch-game-with-guild-mods-error', { message: 'Une erreur est survenue lors de la mise à jour de la version.' })
    }
  })
}


async function downloadAndExtractArchive (mod, userBearerToken, valheimFolderPath, event) {
  try {
    const response = {
      success: true,
      message: '',
    }

    const modFullName = mod.full_name + '.zip'

    // Téléchargement de l'archive du mod
    const axiosResponse = await axios({
      method: 'get',
      url: (import.meta.env.VITE_API_URL + 'v_guilds_modpack/download_archive/' + modFullName),
      headers: {
        'Authorization': `Bearer ${userBearerToken}`
      },
      responseType: 'arraybuffer'
    })

    // Vérification de la réponse d'Axios
    if (!axiosResponse || !axiosResponse.data) {
      console.error(`Erreur lors du téléchargement de l'archive ${modFullName}.`)
      event.reply('update-version-error', { message: `Erreur lors du téléchargement de l'archive ${modFullName}.` })
      return
    }

    const modArchiveData = axiosResponse.data

    // Écriture du fichier téléchargé
    event.reply('update-version-progress', { message: `Téléchargement de l'archive ${mod.name}` })
    const tempModArchivePath = path.join(valheimFolderPath, `${modFullName}`)
    await fs.promises.writeFile(tempModArchivePath, Buffer.from(modArchiveData), 'binary')

    // Vérification que le fichier est bien écrit sur le disque
    const fileExists = await fs.promises.access(tempModArchivePath)
      .then(() => true)
      .catch(() => false)

    if (!fileExists) {
      event.reply('update-version-error', { message: `Le fichier ${modFullName} n'a pas pu être écrit sur le disque.` })
      return
    } else {
      response.message = `Le fichier ${modFullName} a bien été écrit sur le disque.`
    }

    // Extraction de l'archive du mod dans le dossier BepInEx/plugins/full_name
    event.reply('update-version-progress', { message: `Extraction de l'archive ${mod.name}` })
    const extractMod = await extractZipArchive(tempModArchivePath, path.join(valheimFolderPath, mod.full_name))

    if (extractMod.success) {
      // Suppression de l'archive du mod
      fs.unlinkSync(tempModArchivePath)
      response.message = `Extraction de l'archive ${mod.name} terminée`
    }

    return response
  } catch (error) {
    log.error('Erreur lors de la mise à jour de la version :', error)
    event.reply('update-version-error', { message: 'Une erreur est survenue lors de la mise à jour de la version.' })
  }
}

