<template>
  <div class="footer">
    <button class="footer__buy" @click="openLink('buymeacoffee')"><small><i class="bx bx-coffee bx-s" /> Offrez-moi un café</small></button>
    <div class="footer__version">
      <span>{{ env === 'prod' ? '' : env }} {{ appStore.getAppVersion()}}</span>
      <h2>By WispForge</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MurlocSound from '@/assets/mp3/Murloc.mp3';
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'
import { shell } from 'electron';

const env = ref(import.meta.env.VITE_ENV)

const appStore = useAppStore()
const openLink = (link: string) => {
  switch (link) {
    case 'buymeacoffee':
      let audio;
      audio = new Audio(MurlocSound);
      audio.volume = 1.0;
      audio.play();
      shell.openExternal('https://www.buymeacoffee.com/jellfedora')
      break;
    default:
      break;
  }
}

</script>

<style scoped lang="scss">
.footer {
  position: fixed;
  left: 0em;
  bottom: 0;
  width: 15.6em;
  z-index: 100;
  padding-left: 0.5em;
  padding-bottom: 0.5em;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  & button {
    margin: 0.5em 0;
    background-color: yellow;
    color: black;
    font-weight: bold;
  }
  
  &__version {
    display: flex;
    justify-content: center;
    align-items: center;
    & h2,
    & span {
      color: #fff;
      margin-right: 0.5em;
    }
    & h2 {
      font-size: 1em;
      font-family: NorseBold;
    }
    & span {
      font-size: 12px;
    }

  }
}
@media (prefers-color-scheme: light) {
  button {
    background-color: yellow !important;
  }
}
</style>