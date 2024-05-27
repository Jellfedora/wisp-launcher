<template>
  <div class="modspack-modslist">
    <TransitionGroup 
      tag="ul"
      class="modspack-modslist__mods"
      v-if="!loading"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <li v-if="modslistToDisplay.length > 0" class="modspack-modslist__mods" v-for="mod in modslistToDisplay" :key="mod.id">
        <ModsCard :mod="mod" />
      </li>
    </TransitionGroup>
    <div v-else class="modspack-modslist__spinner-container">
      <SpinnerLoader size="large" />
    </div>
    <div class="modspack-modslist__search">
      <button 
        class="btn-primary" 
        title="Envoyer le fichier de log sur le Discord" 
        @click="modpackStore.sendLogFile(webhookUrl)" 
        v-if="appStore.getSteamFolderPath() && webhookUrl !== ''"
        style="width: 15em;display: flex;justify-content: center;align-items: center;"
      >
        <span style="margin-right: 1em;">Envoyer fichier log</span>
        <i class="bx bx-send bx-sm"></i>
      </button>
      <div style="width: 35em;">
        <vue-awesome-paginate
          v-if="totalItemsToDisplay >= 1"
          :total-items="totalItemsToDisplay"
          :items-per-page="12"
          :max-pages-shown="4"
          v-model="currentPage"
          :on-click="onClickHandler"
        />
      </div>
      <input class="modspack-modslist__search__input" type="text" name="search-modname" v-model="searchedModsValue" @change="searchModsByName()" placeholder="Rechercher par titre ou auteur" @input="searchModsByName" @focus="isFocused" @blur="isNotFocused" />
      <button class="modspack-modslist__search__clear" v-if="searchedModsValue !== ''" @click="clearInput()"><i class="bx bx-x bx-sm " /></button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
// @ts-ignore
import { gsap } from 'gsap'
import 'boxicons/css/boxicons.min.css';
// @ts-ignore
import Modal from '@/components/Modal.vue'
// @ts-ignore
import ModsCard from './ModsCard.vue';
// @ts-ignore
import SpinnerLoader from '@/components/SpinnerLoader.vue'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
// @ts-ignore
import {router} from '@/router'
// @ts-ignore
import { getToVApi } from '@/services/axiosService';
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'
// @ts-ignore
import { useModpackStore } from '@/stores/modpackStore.js'

const appStore = useAppStore()
const modpackStore = useModpackStore()

const modslist = ref<any[]>([]) // Liste des mods du modpack de la guilde
const modslistToDisplay = ref<any[]>([]) // Liste des mods à afficher
const nbrMods = ref(0)
const currentPage = ref(1);
const totalItems = ref(0); // Nombre total de mods sur le serveur
const totalItemsToDisplay = ref(0); // Nombre total de mods à afficher
const loading = ref(true);
const webhookUrl = ref('')


// Animation sur le nombre de mods
watch(modslist, (newValue, oldValue) => {
  gsap.fromTo(nbrMods, { value: oldValue.length }, { value: newValue.length, duration: 2.5, ease: 'power2.easeIn' });
});

onMounted(async () => {
  // Récupére les mods du modpack de la guilde
  await getGuildModsList()
  // On récupére si il existe le webhook de la guilde pour envoyer le fichier de log
  const webhook = await getToVApi ('v_guilds/webhook_url_debug') 
  if(webhook && webhook.success && webhook.data.webhook_url_debug) {
    webhookUrl.value = webhook.data.webhook_url_debug
  }
})

async function getGuildModsList() {
  loading.value = true;
  // On fait un premier appel pour récupérer le nombre total de mods
  const countModsByApi = await getToVApi ('v_guilds_modslist/list_mods/'+ currentPage.value)
    if (countModsByApi && countModsByApi.success && countModsByApi.data.data && countModsByApi.data.data.length === 0) {
      currentPage.value = 1
    }

    const modsByApi = await getToVApi ('v_guilds_modslist/list_mods/'+ currentPage.value)
    if (modsByApi && modsByApi.success && modsByApi.data.data && modsByApi.data.data.length > 0) {
      totalItems.value = modsByApi.data.totalMods
      totalItemsToDisplay.value = modsByApi.data.totalMods
      modslist.value = modsByApi.data.data
      modslistToDisplay.value = modsByApi.data.data
      nbrMods.value = modsByApi.data.data.length
      loading.value = false;
    } else {
      modslist.value = []
      modslistToDisplay.value = []
      nbrMods.value = 0
      totalItems.value = 0
      totalItemsToDisplay.value = 0
      loading.value = false;
    }
}

function onClickHandler(page: number) {
  currentPage.value = page;
  getGuildModsList();
}

// Transitions
function onBeforeEnter(el: any) {
  el.style.opacity = 0
  el.style.height = 0
}

function onEnter(el: any, done: any) {
  gsap.to(el, {
    height: 'auto',
    opacity: 1,
    delay: el.dataset.index * 0.15,
    onComplete: done
  })
}

function onLeave(el: any, done: any) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    delay: el.dataset.index * 0.15,
    onComplete: done
  })
}

const inputIsFocused = ref(false)
const searchedModsValue = ref('')
// Formulaire de recherche
function searchModsByName() {
  console.log(searchedModsValue.value);
  if (searchedModsValue.value) {
    modslistToDisplay.value = modslist.value.filter(mod => {
      const modName = mod.name ? mod.name.toLowerCase() : ''; // Vérifiez si mod.name est défini
      const modAuthor = mod.author ? mod.author.toLowerCase() : ''; // Vérifiez si mod.author est défini
      return modName.includes(searchedModsValue.value.toLowerCase()) ||
             modAuthor.includes(searchedModsValue.value.toLowerCase());
    });
    totalItemsToDisplay.value = modslistToDisplay.value.length;
  } else {
    modslistToDisplay.value = modslist.value;
    totalItemsToDisplay.value = totalItems.value;
  }
}

function clearInput () {
  searchedModsValue.value = ''
  searchModsByName()
}

const isFocused = () => {
  inputIsFocused.value = true
}

const isNotFocused = () => {
  inputIsFocused.value = false
}
</script>

<style lang="scss">
.modspack-modslist {
  width: 100%;
  height: 92%;
  scroll-behavior: smooth;
  overflow-y: scroll;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  padding-bottom: 1em;
  &__spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  &__search {
    position: fixed;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #11101d;
    width: 100%;
    padding: 0.5em 0.5em;
    border-top: white solid 1px;
    z-index: 8000;
    height: 3.5em;
    & h2 {
      font-size: 1.1em;
      width: 6em;
      text-align: left;
      display: flex;
      justify-content: center;
    }
    &__btn {
      width: 13em;
    }
    &__input {
      display: block;
      width: 20em;
      padding: 0.5em;
      text-align: center;
      background: #1d1b31;
      font-size: 1em;
      caret-color: white;
      border-radius: 30px;
      border: 1px solid white;
      transition: width 0.5s ease-in-out;
      color: white;
    }
    &__clear {
      position: fixed;
      z-index: 500;
      height: 2em;
      width: 2em;
      bottom: 0.65em;
      right: 1.1em;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: transparent;
      color: white;
    }
  }
  &__mods {
    display: flex;
    flex-wrap: wrap;
    margin: 0 auto;
    justify-content: flex-start;
    &__mod {
      list-style: none;
    }
  }
}

// Pagination
.pagination-container {
    display: flex;
    column-gap: 10px;
    max-width: 30em;
  }
  .paginate-buttons {
    padding: 0;
    height: 40px;
    width: 40px;
    background-color: rgb(242, 242, 242);
    border: 1px solid rgb(217, 217, 217);
    color: black;
  }
  .paginate-buttons:hover {
    background-color: #d8d8d8;
  }
  .active-page {
    background-color: #11101d;;
    border: 1px solid white;
    color: white;
  }
  .active-page:hover {
    background-color: #1d1b31;
  }
</style>