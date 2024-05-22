import { ipcMain, shell, app } from 'electron'
import fs from 'fs'
import path from 'path'


export function openConfFolder () {
  // On ouvre le dossier de configuration du profile
  ipcMain.on('open-conf-folder', async (event, profile) => {
    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', profile, '/BepInEx/config')
    // On vérifie si le dossier existe
    if (!fs.existsSync(profileFolderPath)) {
      event.reply('open-conf-folder', { success: false, message: 'Le dossier du modpack n\'existe pas.' })
    } else {
      event.reply('open-conf-folder', { success: true, message: 'Le dossier du modpack a bien été ouvert.' })
      shell.openPath(profileFolderPath)

    }
  })
}

export function deleteProfileFolder () {
  // L'utilisateur supprime les dossier du modpack TODO à modifier cest maintenant le dossier steam
  ipcMain.on('delete-game-folder', async (event, steamPath) => {
    // Liste des chemins vers les éléments à supprimer
    const pathsToDelete = [
      path.join(steamPath, 'BepInEx'),
      path.join(steamPath, 'doorstop_libs'),
      path.join(steamPath, 'changelog.txt'),
      path.join(steamPath, 'doorstop_config.ini'),
      path.join(steamPath, 'start_game_bepinex.sh'),
      path.join(steamPath, 'start_server_bepinex.sh'),
      path.join(steamPath, 'winhttp.dll'),
      path.join(steamPath, 'wisp-launcher-modpack.json'),
      path.join(steamPath, 'version.json'),
    ]

    // On vérifie si les fichiers et dossiers existent et on les supprime
    let fileExists = false // Vérifier si au moins un fichier existe

    pathsToDelete.forEach((pathToDelete) => {
      if (fs.existsSync(pathToDelete)) {
        fileExists = true

        if (fs.statSync(pathToDelete).isDirectory()) {
          fs.rmdirSync(pathToDelete, { recursive: true })
        } else {
          fs.unlinkSync(pathToDelete)
        }
      }
    })

    if (fileExists) {
      event.reply('delete-game-folder', { success: true, message: 'Les fichiers et dossiers du modpack ont bien été supprimés.' })
    } else {
      event.reply('delete-game-folder', { success: false, message: 'Aucun fichier ou dossier du modpack n\'a été trouvé dans ce dossier de jeu.' })
    }
  })
}