import fs from 'fs'
import unzipper from 'unzipper'
import log from 'electron-log'
import path from 'path'

/**
 * Extrait les fichiers d'une archive zip
 * @param archivePath Chemin de l'archive zip
 * @param outputPath Chemin de destination de l'extraction
 * @param event Objet event pour envoyer des messages à la fenêtre principale
 * @returns Promise
 * @throws Error
 * @async
 * @function extractZipArchive
 **/
export async function extractZipArchive (archivePath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(archivePath)
      .pipe(unzipper.Extract({ path: outputPath }))
      .on('close', () => {
        resolve({ success: true })
      })
      .on('error', (error) => {
        log.error(`Erreur lors de l'extraction de l'archive ${archivePath} dans le dossier ${outputPath} :`, error)
        reject(error)
      })
  })
}

export async function copyDirectoryRecursive (source, destination) {
  return new Promise((resolve, reject) => {
    fs.mkdir(destination, { recursive: true }, (error) => {
      if (error) {
        log.error(`Erreur lors de la création du dossier ${destination} :`, error)
        return reject(error)
      }

      fs.readdir(source, { withFileTypes: true }, async (error, files) => {
        if (error) {
          log.error(`Erreur lors de la lecture du dossier ${source} :`, error)
          return reject(error)
        }

        try {
          await Promise.all(files.map(async (file) => {
            const sourcePath = path.join(source, file.name)
            const destinationPath = path.join(destination, file.name)

            if (file.isDirectory()) {
              await copyDirectoryRecursive(sourcePath, destinationPath)
            } else {
              return new Promise((resolve, reject) => {
                fs.copyFile(sourcePath, destinationPath, (error) => {
                  if (error) {
                    log.error(`Erreur lors de la copie du fichier ${sourcePath} vers ${destinationPath} :`, error)
                    return reject(error)
                  }
                  resolve()
                })
              })
            }
          }))

          resolve({ success: true })
        } catch (error) {
          reject(error)
        }
      })
    })
  })
}