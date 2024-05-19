<template>
  <div class="connected-players">
    <h2 class="connected-players__title">Joueurs connectés <i title="Actualisé toute les 10 secondes" class="bx bx-info-circle bx-xs" /></h2>
    <div v-if="playerList.length > 0" class="connected-players__players" v-for="player in playerList" :key="player.steam_id">
      <p>{{ player.player_name }}</p>
      <span :class="{ 'player-cry': player.current_health < player.max_health / 2 }" class="connected-players__players__life">
        <i class="bx bx-heart bx-xs" /> {{ player.current_health }} / {{ player.max_health }}
      </span>
    </div>
    <div v-else class="connected-players__loading">
      <!-- <i class="bx bx-loader-circle bx-xs bx-spin"/> -->
      <small>Aucun joueur n'est actuellement en jeu</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
// @ts-ignore
import { getToVApi } from '@/services/axiosService';

interface Player {
  player_name: string;
  position: number[];
  current_health: number;
  max_health: number;
  steam_id: string;
  creator_id: string;
}

const playerList = ref<Player[]>([])

onMounted(async () => {
  getPlayers()
  // Toutes les 10 secondes on récupére les joueurs
  setInterval(() => {
    getPlayers()
  }, 10000);
});

async function getPlayers() {
    const playersByApi = await getToVApi ('connected_players');
    if (playersByApi && playersByApi.success) {
      formatPlayers(playersByApi.data)
    }
}

function formatPlayers(players: { length: number; value: never[]; }) {
  if (players.length > 0) {
    // @ts-ignore
    playerList.value = players;
  } else {
    playerList.value = [];
  }
}
</script>

<style scoped lang="scss">
.connected-players {
  width: 100%;
  height: 16em;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  padding-top: 0.5em;
  overflow-y: scroll;
  &__title {
    font-size: 1em;
    width: 100%;
    text-align: center;
    margin-bottom: 1em;
  }
  &__loading {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    & i {
      display: block;
    }
  }
  &__players {
    display: flex;
    flex-wrap: wrap;
    background-color: #00000057;
    justify-content: center;
    border: 1px solid white;
    width: 15em;
    font-size: 0.8em;
    margin: 0.5em;
    border-radius: 10px;
    font-weight: bold;
    & p {
      width: 100%;
      text-align: center;
    }
    &__life {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      & i {
        margin-right: 0.2em;
      }
    }
  }
}

.player-cry {
  color: red;
}
</style>