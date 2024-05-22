import { ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import archiver from 'archiver'

// Fonction récursive pour récupérer l'arborescence des fichiers et dossiers
function readDirectory (directoryPath, parentKey = '') {
  const items = fs.readdirSync(directoryPath)
  const result = []
  let keyCounter = 0

  items.forEach(item => {
    const itemPath = path.join(directoryPath, item)
    const isDirectory = fs.statSync(itemPath).isDirectory()
    const key = `${parentKey}${parentKey ? '-' : ''}${keyCounter}`

    const node = {
      key,
      label: item,
      data: `${item}${isDirectory ? ' Folder' : ''}`,
      icon: isDirectory ? 'pi pi-fw pi-folder' : 'pi pi-fw pi-file',
      children: isDirectory ? readDirectory(itemPath, key) : null
    }

    result.push(node)
    keyCounter += 1
  })

  return result
}

// Fonction pour créer le fichier ZIP
function createZipFromSelection (selection, directoryPath, zipFilePath, playersConfFiles) {
  const output = fs.createWriteStream(zipFilePath)
  const archive = archiver('zip', {
    zlib: { level: 9 }
  })

  output.on('close', () => {
    console.log(archive.pointer() + ' total bytes')
    console.log('archiver has been finalized and the output file descriptor has closed.')
  })

  archive.on('error', err => {
    console.error(err)
    throw err
  })

  archive.pipe(output)

  function addFilesToArchive (node, basePath = '') {
    const nodeKey = node.key.toString()
    const nodeSelection = selection[nodeKey]

    if (nodeSelection && (nodeSelection.checked || nodeSelection.partialChecked)) {
      const itemPath = path.join(basePath, node.label)
      const fullPath = path.join(directoryPath, itemPath)

      if (node.icon === 'pi pi-fw pi-folder') {
        if (nodeSelection.checked) {
          // Ajoute tout le dossier et ses enfants
          console.log(`Adding entire directory: ${fullPath}`)
          archive.directory(fullPath, itemPath)
        } else if (nodeSelection.partialChecked) {
          // Traite les enfants individuellement
          if (node.children) {
            node.children.forEach(childNode => addFilesToArchive(childNode, itemPath))
          }
        }
      } else if (nodeSelection.checked) {
        // Ajoute le fichier
        console.log(`Adding file: ${fullPath}`)
        archive.file(fullPath, { name: itemPath })
      }
    }
  }

  if (playersConfFiles && Array.isArray(playersConfFiles)) {
    playersConfFiles.forEach(node => addFilesToArchive(node))
  } else {
    console.error('playersConfFiles is not defined or not an array')
  }

  archive.finalize()
}

export function getProfileConfArbo () {
  // Récupération de l'arborescence des fichiers de configuration
  ipcMain.on('get-conf-arbo', async (event, profile) => {
    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', profile, '/BepInEx/config')

    if (!fs.existsSync(profileFolderPath)) {
      event.reply('get-conf-arbo', { success: false, message: 'Le dossier de configuration n\'existe pas.' })
    } else {
      try {
        const directoryTree = readDirectory(profileFolderPath)
        event.reply('get-conf-arbo', { success: true, data: directoryTree })
      } catch (error) {
        log.error(error)
        event.reply('get-conf-arbo', { success: false, message: error.message })
      }
    }
  })

  // Création du fichier ZIP de la conf sélectionnée
  ipcMain.on('create-conf-zip', (event, serializedSelection, profile) => {
    const selection = JSON.parse(serializedSelection)
    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', profile, '/BepInEx/config')
    const zipFilePath = path.join(app.getPath('userData'), '/profiles', profile, `${profile}-config.zip`)
    console.log(selection)
    console.log(profileFolderPath)
    console.log(zipFilePath)

    try {
      const playersConfFiles = readDirectory(profileFolderPath)
      createZipFromSelection(selection, profileFolderPath, zipFilePath, playersConfFiles)
      event.reply('create-conf-zip', { success: true, filePath: zipFilePath })
    } catch (error) {
      log.error(error)
      event.reply('create-conf-zip', { success: false, message: error.message })
    }
  })
}

