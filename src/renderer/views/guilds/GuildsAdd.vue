<template>
  <div class="guild-add">
    <div class="guild-add__text">
      <h2>Ajout de votre propre serveur Discord</h2>
      <p>Veuillez sélectionner le serveur Discord que vous souhaitez ajouter à notre launcher</p>
    </div>
    <Carousel :autoplay="0" :wrap-around="false" :itemsToShow="serveurs.length < 4 ? serveurs.length : 4"  class="guild-add__carousel">
        <Slide v-for="serveur in serveurs" :key="serveur.id">
          <div class="guild-add__carousel__item">
            <img v-if="serveur.icon" :src="'https://cdn.discordapp.com/icons/'+ serveur.id +'/'+ serveur.icon" alt="Serveur Icone" />
            <img v-else src="https://cdn.discordapp.com/embed/avatars/0.png" alt="Serveur Icone" />
            <h3>{{serveur.name}}</h3>
            <button class="btn-secondary" @click="selectGuild(serveur)">Sélectionner</button>
          </div>
        </Slide>
    </Carousel>
    <small style="text-align: center;padding: 0 4em;">Seuls les serveurs Discord dont vous êtes le propriétaire sont disponibles. <br/> Si vous ne voyez pas votre serveur alors que vous en possédez un, veuillez nous contacter via le formulaire de contact</small>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Slide } from 'vue3-carousel'
import { ref, onMounted } from 'vue'
import 'vue3-carousel/dist/carousel.css'
import { toast } from 'vue3-toastify'
// @ts-ignore
import { useModpackStore } from '@/stores/modpackStore.js'
// @ts-ignore
import { getToVApi, postToVApi } from '@/services/axiosService';

const modpackStore = useModpackStore()
const serveurs = ref<any[]>([])

onMounted(async() => {
  const guilds = await getToVApi ('discord_auth/guilds_owner');
  if (guilds && guilds.success && guilds.data && guilds.data.data.length > 0) {
    serveurs.value = guilds.data.data
  } else {
    toast.warn("Aucun serveur Discord dont vous seriez propriétaire n'a été trouvé")
  }
})

async function selectGuild(serveur: any) {
  // @ts-ignore
  const addGuild = await postToVApi('v_guilds/add', {guild: serveur})
  if (addGuild && addGuild.data && addGuild.data.success) {
    modpackStore.checkLocalAndRemoteModpack()
    toast.success(addGuild.data.message)
  } else if (addGuild && addGuild.data) {
    toast.warn(addGuild.data.message)
  } else {
    toast.error("Une erreur est arrivée lors de l\'ajout du serveur Discord, veuillez réessayer")
  }
}
</script>

<style lang="scss">
.guild-add {
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