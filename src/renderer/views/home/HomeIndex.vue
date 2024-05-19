<template>
  <div class="home">
    <HomeCarousel class="home__carousel" />
    <!-- <ConnectedPlayers /> -->
    <div class="home__text">
      <h2>Bienvenue sur Wisp Launcher</h2>
      <p>Entrez dans l'univers envoûtant de Valheim grâce à notre Launcher, actuellement en phase de développement.</p>
      <p>Simplifiez votre expérience de jeu en téléchargeant automatiquement les mods de vos différentes communautés Discord dédiées à Valheim.</p>
      <p>Explorez les créations de la communauté, restez informé des dernières actualités et mises à jour du jeu, tout en prenant le contrôle total de votre expérience de jeu et de celles de vos joueurs grâce à une gestion simple des mods de votre serveur. Tous les mods ainsi que votre configuration est précieusement sauvegardée et synchronisée sur le cloud.</p>
      <p>Notre Launcher est en constante évolution, avec des mods personnalisés en développement pour enrichir votre aventure.</p>
      <p>Découvrez une nouvelle façon de vivre Valheim avec notre Launcher, conçu pour rendre chaque moment de jeu encore plus captivant.</p>
    </div>
  </div>
</template>
<script setup lang="ts">
// @ts-ignore
// import ConnectedPlayers from '@/views/home/HomeConnectedPlayers.vue'
// @ts-ignore
import HomeCarousel from '@/views/home/HomeCarousel.vue'
</script>
<style scoped lang="scss">
.home {
  width: 100%;
  height: calc(100% - 1px);
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: center;
  &__carousel {
    width: 100%;
    height: 50%;
  }
  &__text {
    height: 50%;
    width: 100%;
    padding: 2em;
    text-align: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    & h2 {
      width: 100%;
      font-size: 1.7em;
      font-family: NorseBold;
    }
    & p {
      font-size: 0.9em;
      line-height: 1.5em;
    }
  }
}
</style>