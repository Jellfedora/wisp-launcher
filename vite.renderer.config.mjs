import { defineConfig } from 'vite'
import { pluginExposeRenderer } from './vite.base.config.mjs'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import renderer from 'vite-plugin-electron-renderer'

// https://vitejs.dev/config
export default defineConfig((env) => {
  /** @type {import('vite').ConfigEnv<'renderer'>} */
  const forgeEnv = env
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  /** @type {import('vite').UserConfig} */
  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer(name), vue(), renderer()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@': fileURLToPath(new URL('./src/renderer', import.meta.url))
      }
    },
    clearScreen: false,
  }
})