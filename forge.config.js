const { FusesPlugin } = require('@electron-forge/plugin-fuses')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')
require('dotenv').config()

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './favicon.ico'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: "./favicon.ico",
        iconUrl: 'https://wisp-forge.hopto.org/launcher-favicon.ico',
        loadingGif: "./install-gif.gif",
        authors: 'Wisp Forge',
        description: 'Wisp launcher for Valheim mods',
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          // maintainer: 'Wisp Forge',
          // description: 'Wisp launcher for Valheim mods',
          // icon: "./favicon.ico"
        }
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    //{
    //  name: '@electron-forge/maker-rpm',
    //  config: {},
    //},
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/electron/main.js',
            config: 'vite.main.config.mjs',
          },
          {
            entry: 'src/electron/preload.js',
            config: 'vite.preload.config.mjs',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}
