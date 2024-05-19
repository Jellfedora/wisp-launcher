<template>
  <div class="discord-auth bg-primary" v-if="!authStore.getIsConnected()" @click="OpenDiscordAuth">
    <div class="discord-auth__link cursable" v-if="!loader">
      <div class="discord-auth__link__content">
        <img :src="DiscordIcon" alt="Discord Icon" />
        <h3>Connecte toi avec Discord</h3>
      </div>
    </div>
    <div class="discord-auth__link" v-else >
      <div class="discord-auth__link__content">
        <DiscordSpinner />
        <h3>Connexion en cours</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ipcRenderer } from 'electron';
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
import DiscordIcon from '@/assets/images/discord-icon.png'
// @ts-ignore
import DiscordSpinner from '@/components/DiscordSpinner.vue'

const authStore = useAuthStore()
const loader = ref(false)

async function OpenDiscordAuth() {
  loader.value = true
  ipcRenderer.send('login-discord')
  ipcRenderer.once('login-discord', (_event, result) => {
    if (result.success && result.responseData.success) {
      loader.value = false
      authStore.setUserInfo(result.responseData.data.user)
      toast.success("Bonjour " + result.responseData.data.user.user_discord_name + ' !')
    } else {
      loader.value = false
      toast.error("Vous n'avez pas pu vous connecter avec Discord, veuillez réessayer.")
    }
  })
}
</script>

<style lang="scss">
.discord-auth {
  position: fixed;
  top: 5em;
  left: 0.4em;
  z-index: 1000;
  width: 15em;
  height: 17em;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 1px solid #5865F2;
  border-radius: 1em;
  transition: 1s;
  
  & h3 {
    font-size: 1em;
  }
  &__link {
    padding: 1.5em 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    border-radius: 1em;
    transition: 0.5s;
    
    & h3 {
      font-size: 1em;
      width: 100%;
    }
    & img {
      width: 2.5em;
      height: 2em;
      color: white;
    }
  }
}
.discord-auth__link:hover {
  background-color: #11101d;
  color: #5865F2;
}

</style>