import { ipcMain, app } from 'electron';

// Obtiens la version du launcher à partir du fichier package.json
export function getLauncherVersion() {
  ipcMain.on('get-launcher-version', async (event) => {
    try {
      const appVersion = app.getVersion();
      event.reply('get-launcher-version', { success: true, version: appVersion });
    } catch (error) {
      event.reply('get-launcher-version', { success: false, message: 'Une erreur s\'est produite lors de la récupération de la version du launcher' });
    }
  });
}