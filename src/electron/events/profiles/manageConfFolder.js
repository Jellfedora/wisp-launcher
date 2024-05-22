import { ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import archiver from 'archiver'
import unzipper from 'unzipper'

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
      children: isDirectory ? readDirectory(itemPath, key) : null,
      checked: false,
      partialChecked: false
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
          archive.directory(fullPath, itemPath)
        } else if (nodeSelection.partialChecked) {
          // Traite les enfants individuellement
          if (node.children) {
            node.children.forEach(childNode => addFilesToArchive(childNode, itemPath))
          }
        }
      } else if (nodeSelection.checked) {
        // Ajoute le fichier
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
  ipcMain.on('get-conf-arbo', async (event, guildId, type) => {
    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', guildId + '-' + type, '/BepInEx/config')

    if (!fs.existsSync(profileFolderPath)) {
      event.reply('get-conf-arbo', { success: false, message: 'Le dossier de configuration n\'existe pas.' })
    } else {
      try {
        // Vérifie si le fichier ZIP existe
        const zipFilePathAdmin = path.join(app.getPath('userData'), '/profiles', guildId + '-' + type, `${guildId}-admins-config.zip`)
        console.log(zipFilePathAdmin)
        const zipFilePathPlayers = path.join(app.getPath('userData'), '/profiles', guildId + '-' + type, `${guildId}-players-config.zip`)
        let archiveFilesAdmins = []
        let archiveFilesPlayers = []

        if (fs.existsSync(zipFilePathAdmin)) {
          // Extrait les chemins des fichiers dans l'archive
          archiveFilesAdmins = await getArchiveFiles(zipFilePathAdmin)
        }

        if (fs.existsSync(zipFilePathPlayers)) {
          // Extrait les chemins des fichiers dans l'archive
          archiveFilesPlayers = await getArchiveFiles(zipFilePathPlayers)
        }

        // Lire l'arborescence des fichiers de configuration
        const directoryTreeAdmins = readDirectory(profileFolderPath)

        const directoryTreePlayers = readDirectory(profileFolderPath)

        // Comparer avec les fichiers dans l'archive
        markFilesInTree(directoryTreeAdmins, archiveFilesAdmins, '')
        markFilesInTree(directoryTreePlayers, archiveFilesPlayers, '')

        console.log(directoryTreeAdmins)
        console.log(directoryTreePlayers)
        event.reply('get-conf-arbo', { success: true, dataAdmins: directoryTreeAdmins, dataPlayers: directoryTreePlayers })
      } catch (error) {
        log.error(error)
        event.reply('get-conf-arbo', { success: false, message: error.message })
      }
    }
  })

  // Création du fichier ZIP de la conf sélectionnée
  ipcMain.on('create-conf-zip', (event, serializedSelectionAdmins, serializedSelectionPlayers, guildId, type) => {

    const profileFolderPath = path.join(app.getPath('userData'), '/profiles', guildId + '-' + type, '/BepInEx/config')

    const selectionAdmins = JSON.parse(serializedSelectionAdmins)
    const zipFilePathAdmins = path.join(app.getPath('userData'), '/profiles', guildId + '-' + type, `${guildId}-admins-config.zip`)

    const selectionPlayers = JSON.parse(serializedSelectionPlayers)
    const zipFilePathPlayers = path.join(app.getPath('userData'), '/profiles', guildId + '-' + type, `${guildId}-players-config.zip`)

    try {
      const playersConfFiles = readDirectory(profileFolderPath)
      createZipFromSelection(selectionAdmins, profileFolderPath, zipFilePathAdmins, playersConfFiles)
      createZipFromSelection(selectionPlayers, profileFolderPath, zipFilePathPlayers, playersConfFiles)
      event.reply('create-conf-zip', { success: true })
    } catch (error) {
      log.error(error)
      event.reply('create-conf-zip', { success: false, message: error.message })
    }
  })
}

// Fonction pour obtenir la liste des fichiers dans l'archive
async function getArchiveFiles (zipFilePath) {
  const directory = await unzipper.Open.file(zipFilePath)
  const files = directory.files.map(file => file.path)
  return files
}

// Fonction pour marquer les fichiers dans l'arborescence en fonction de leur présence dans l'archive
function markFilesInTree (tree, archiveFiles, parentPath) {
  tree.forEach(node => {
    const currentPath = parentPath ? path.join(parentPath, node.label) : node.label

    if (node.children) {
      markFilesInTree(node.children, archiveFiles, currentPath)
      const allChildrenChecked = node.children.every(child => child.checked)
      const someChildrenChecked = node.children.some(child => child.checked || child.partialChecked)

      node.checked = allChildrenChecked && node.children.length > 0
      node.partialChecked = someChildrenChecked && !allChildrenChecked
    } else {
      const fileName = currentPath.replace(/\\/g, '/')
      node.checked = archiveFiles.includes(fileName)
      node.partialChecked = false
    }
  })
}
