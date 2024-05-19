<template>
  <!-- Attention changer class, ca reprend la modale de mise a jour de modpacks -->
   <div v-if="gameIsReady" class="update-launcher">
      <div class="update-launcher__content">
        <h3>Valheim est en cours d'exécution, veuillez fermer le jeu pour utiliser le launcher</h3>
      </div>
   </div>
</template>

<script setup lang="ts">
// import { ipcRenderer } from 'electron';
import { onMounted, ref } from 'vue';

const gameIsReady = ref(false)

onMounted(() => {
  // Toutes les 5 secondes on vérifie si le jeu est lancé
  // setInterval(() => {
  //   ipcRenderer.send('detect-game-status');
  // }, 5000);
  // ipcRenderer.on('detect-game-status', (_event, result) => {
  //   if (result.success && result.running) {
  //     gameIsReady.value = result.running
  //   } else {
  //     gameIsReady.value = false
  //   }
  // })
})

</script>