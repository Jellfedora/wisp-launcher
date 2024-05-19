const AdmZip = require('adm-zip')  // Permet de décompresser des fichiers zip
import fs from 'fs'
import unzipper from 'unzipper'
import log from 'electron-log'

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