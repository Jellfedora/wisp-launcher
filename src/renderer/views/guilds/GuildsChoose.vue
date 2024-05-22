<template>
  <div class="guild-choice">
    <div class="guild-choice__text">
      <h2>Choix du serveur Discord</h2>
      <p>Veuillez sélectionner le serveur Discord sur lequel vous souhaitez jouer à Valheim</p>
    </div>
    <Carousel :autoplay="0" :wrap-around="false" :itemsToShow="serveurs.length < 4 ? serveurs.length : 4"  class="guild-choice__carousel">
        <Slide v-for="serveur in serveurs" :key="serveur.id">
          <div class="guild-choice__carousel__item">
            <img v-if="serveur.icon" :src="'https://cdn.discordapp.com/icons/'+ serveur.id +'/'+ serveur.icon" alt="Serveur Icone" />
            <img v-else src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Serveur Icone" />
            <h3>{{serveur.name}}</h3>
            <button class="btn-secondary" @click="selectGuild(serveur)">Sélectionner</button>
          </div>
        </Slide>
    </Carousel>
    <small style="text-align: center;padding: 0 4em;">Seuls les serveurs auxquels vous êtes connectés avec Discord et qui sont actifs et enregistrés chez nous sont disponibles. <br/> Si vous ne voyez pas votre serveur et que vous en possédez un chez nous, veuillez nous contacter via le formulaire de contact</small>
    <button class="btn-secondary" @click="redirectToAddGuild">Vous voulez ajouter votre propre serveur sur notre launcher ?</button>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Slide } from 'vue3-carousel'
import { ref, onMounted, computed } from 'vue'
import 'vue3-carousel/dist/carousel.css'
import { toast } from 'vue3-toastify'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
// @ts-ignore
import { useModpackStore } from '@/stores/modpackStore.js'
// @ts-ignore
import { getToVApi, postToVApi } from '@/services/axiosService';
import { router } from '../../router'

const modpackStore = useModpackStore()
const authStore = useAuthStore()

const token = computed(() => {
  return authStore.getUserToken()
})

function redirectToAddGuild() {
  router.push('/guilds/add')
}

const serveurs = ref<any[]>([])

onMounted(async() => {
  const guilds = await getToVApi ('discord_auth/guilds');
  if (guilds && guilds.success && guilds.data && guilds.data.data.length > 0) {
    serveurs.value = guilds.data.data
  }
})

async function selectGuild(serveur: any) {
  // @ts-ignore
  const chooseGuild = await postToVApi('v_guilds/choose', {guild_id: serveur.id});
  // Note: Le rôle est déjà récupéré et enregistré via axiosService
  if (chooseGuild && chooseGuild.data && chooseGuild.data.success) {
    // On réinteroge la version distante du modpack
    modpackStore.checkLocalAndRemoteModpack(token.value)
    toast.success("Serveur " + chooseGuild.data.data.guild_name + " sélectionné avec succès")
  } else {
    toast.error("Une erreur est arrivée lors de la sélection du serveur Discord, veuillez réessayer")
  }
}
</script>

<style lang="scss">
.guild-choice {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  color: white;
  padding: 8em 0;
  &__text {
    text-align: center;
    width: 100%;
    height: 4em;
  }
  &__carousel {
    height: 25em;
    width: 100%;
    &__item {
      height: 20em;
      width: 15em;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      & h3 {
        font-size: 1em;
        font-family: 'NorseBold';
      }
      & button {
        margin-top: 1em;
      }
      & img {
        width: 8em;
        height: 8em;
      }
    }
  }
}
</style>