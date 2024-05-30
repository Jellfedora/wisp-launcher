const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const { screen } = require('electron')
require('dotenv').config()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

// process.env.DIST = path.join(__dirname, '../dist')
// process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

const createWindow = () => {
  // Récupérer la taille max de l'écran
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'), // Icône de l'application
    // width: process.env.VITE_ENV === 'local' ? 1800 : 1500, // Largeur de la fenêtre 
    // height: process.env.VITE_ENV === 'local' ? 900 : 900, // Hauteur de la fenêtre

    //Largeur de la fenêtre = Largeur max pour tous les écrans
    width: width,
    // Hauteur de la fenêtre = Hauteur max pour tous les écrans
    height: height,

    resizable: true, // Redimensionnement de la fenêtre
    autoHideMenuBar: false, // Masquer la barre de menu process.env.VITE_ENV === 'local' ? false : true
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // Activer l'intégration de Node.js dans la fenêtre du rendu,
      contextIsolation: false, // Désactiver l'isolation de contexte
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  // Open the DevTools if the environment is local
  if (process.env.VITE_ENV === 'local') {
    mainWindow.webContents.openDevTools()
  }

  const appVersion = app.getVersion()
  console.log('Fedora Launcher v' + appVersion + ' - Environnement: ' + process.env.VITE_ENV)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
// -------------------------------------------------------------------------------------------------------------------------

// Charge les événements personnalisés
import { loadEvents } from './events/index'
loadEvents()

// -------------------------------------------------------------------------------------------------------------------------

// Logs de l'application
const log = require('electron-log')

log.transports.file.level = 'error' // N'enregistrer que les erreurs dans le fichier de log

// Également enregistrer les logs dans la console
log.transports.console.level = true // Désactiver les logs dans la console

// Optionnel : Configurer le format des logs
log.format = '[{h}:{i}:{s}] [{level}] {text}'

// Initialiser le logger
log.initialize()
