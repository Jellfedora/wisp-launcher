import { ipcMain, app } from 'electron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
const FormData = require('form-data'); // Permet de créer des objets FormData pour envoyer des fichiers via axios

export function sendAppLogs() {
  // Envoie le fichier de log au serveur discord
  // TODO à déplacer dans l'api
  // Ou bien url à récupérer de l'api
  ipcMain.on('send-log-file', async (event, logFilePath, webhookUrl) => {
    try {
      const logPath = path.join(logFilePath, 'BepInEx/LogOutput.log');

      // On récupére les informations système: Os, version, architecture, mémoire, processeur
      const os = require('os');
      const totalMemoryGb = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const osInfo = `OS: ${os.type()} ${os.release()} | Architecture: ${os.arch()} | Capacite Memoire: ${totalMemoryGb}Gb | Cpu: ${os.cpus()[0].model}`;

      // On vérifie si le fichier existe et si le fichier n'est pas vide
      if (!fs.existsSync(logPath) || fs.statSync(logPath).size === 0) {
        event.reply('send-log-file', { success: false, message: 'Le fichier de log du jeu Valheim n\'a pas été trouvé ou bien celui-ci est vide, veuillez d\'abord lancer le jeu' });
        return;
      }
      const formData = new FormData();
      formData.append('file', fs.createReadStream(logPath), 'LogOutput.log');
      formData.append('content', `Fichier de log de l'utilisateur\n\nOS: ${osInfo}`);

      axios.post(webhookUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })
        .then(function (_response) {
          event.reply('send-log-file', { success: true, message: 'Le fichier de log a bien été envoyé sur le discord de votre guilde' });
        })
        .catch(function (_error) {
          event.reply('send-log-file', { success: false, message: 'Une erreur s\'est produite lors de l\'envoi du fichier de log sur le discord de votre guilde' });
        });
    }
    catch (error) {
      event.reply('send-log-file', { success: false, message: 'Une erreur s\'est produite lors de l\'envoi du fichier de log sur le discord de votre guilde' });
    }
  });
}

// Envoie une demande d'aide au support sur le discord de Wisp Launcher
export function contactSupport() {
  ipcMain.on('contact-support', async (event, supportWebhook, user, textRequest) => {

    // On récupére les informations système: Os, version, architecture, mémoire, processeur
    const os = require('os');
    const totalMemoryGb = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const osInfo = `OS: ${os.type()} ${os.release()} | Architecture: ${os.arch()} | Capacite Memoire: ${totalMemoryGb}Gb | Cpu: ${os.cpus()[0].model}`;

    const launcherVersion = app.getVersion();

    // On récupére le fichier de log du launcher si il existe path.join(app.getPath('userData'),'/logs/main.log');
    const logPath = path.join(app.getPath('userData'), '/logs/main.log');

    // On prépare le formulaire à envoyer
    const formData = new FormData();
    formData.append('content', `
    Nouvelle demande de support de ${user.user_discord_name} via le launcher:\n
    Discord Id: ${user.user_discord_id}\n
    Actuellement connecté à la guilde: ${user.discord_name}\n
    Guilde id: ${user.selected_guild_id}\n
    Informations matérielle: ${osInfo}\n
    Version du launcher: ${launcherVersion}\n
    Demande de l'utilisateur: ${textRequest}\n
    Fichier de log du launcher:\n
    `);

    // On vérifie si le fichier de log existe et s'il n'est pas vide
    if (fs.existsSync(logPath) && fs.statSync(logPath).size && fs.statSync(logPath).size > 0) {
      formData.append('file', fs.createReadStream(logPath), 'main.log');
    }

    axios.post(supportWebhook, formData, {
      headers: {
        ...formData.getHeaders(),
      }
    })
      .then(function (_response) {
        event.reply('contact-support', { success: true, message: 'Votre demande de support a bien été envoyée sur le discord de Wisp Launcher' });
      })
      .catch(function (_error) {
        event.reply('contact-support', { success: false, message: 'Une erreur s\'est produite lors de l\'envoi de votre demande de support sur le discord de Wisp Launcher, contactez un administrateur sur le discord de Wisp Launcher' });
      });
      
  });
}