import { compareLocalAndRemoteModpack } from './profiles/getLocalCurrentVersion'
import { openConfFolder, deleteProfileFolder } from './profiles/manageProfileFolder'
import { startGame, getSteamExePath, setSteamPath, detectGameStatus } from './manageGame'
import { sendAppLogs, contactSupport } from './logs'
import { authDiscordOauth } from './discordApi'
import { updateModsPack, launchGameWithGuildMods } from './profiles/manageProfileMods'
import { getLauncherVersion } from './manageLauncher'

// Mes fonctions
export function loadEvents () {
  // Comparaison de la version locale et distante du modpack d'un profil
  compareLocalAndRemoteModpack()

  // Gestion et démarrage du jeu via Steam
  setSteamPath()
  getSteamExePath()
  startGame()
  detectGameStatus()

  // Gestion des profils
  openConfFolder()
  deleteProfileFolder()

  // Gestion des logs
  sendAppLogs()
  contactSupport()

  // Authentification Discord
  authDiscordOauth()

  // Mise à jour du modpack d'un profil
  updateModsPack()
  launchGameWithGuildMods()

  // Gestion du launcher
  getLauncherVersion()
}