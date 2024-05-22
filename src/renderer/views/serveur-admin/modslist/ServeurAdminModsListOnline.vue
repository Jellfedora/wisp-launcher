<template>
  <div class="online-modslist">
    <TransitionGroup 
      tag="ul"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      v-if="!loading"
      >
      <li v-if="modslistToDisplay.length > 0" class="online-modslist__mods" v-for="mod in modslistToDisplay" :key="mod.id">
        <ModsCard :mod="mod" />
      </li>
    </TransitionGroup>
    <div v-else class="online-modslist__spinner-container">
      <SpinnerLoader size="large" />
    </div>
    <div class="online-modslist__search">
      <div style="width: 35em;">
        <vue-awesome-paginate
          v-if="totalItemsToDisplay"
          :disablePagination="loading"
          :total-items="totalItemsToDisplay"
          :items-per-page="12"
          :max-pages-shown="4"
          v-model="currentPage"
          :on-click="onClickHandler"
        />
      </div>
      <div style="width: 30em;" class="online-modslist__search__container">
        <input 
          class="online-modslist__search__container__input"
          type="text" name="search-modname"
          v-model="searchedModsValue"
          placeholder="Rechercher par titre ou auteur"
          @focus="isFocused"
          @blur="isNotFocused"
          @keyup.enter="searchOnlineModsListByKey"
        />
        <!-- Search button -->
        <button class="online-modslist__search__container__search-btn btn-primary" @click="searchOnlineModsListByKey"><i class="bx bx-search-alt-2 bx-sm " /></button>
        <!-- Clear button -->
        <button class="online-modslist__search__container__clear" v-if="searchedModsValue !== ''" @click="clearInput()"><i class="bx bx-x bx-md " /></button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { getToVApi } from '@/services/axiosService'
import { toast } from 'vue3-toastify'

import ModsCard from './components/ModsCard.vue';
import SpinnerLoader from '@/components/SpinnerLoader.vue'

const modslist = ref([])
const modslistToDisplay = ref([])
const nbrMods = ref(0)
const currentPage = ref(1);
const totalItems = ref(0); // Nombre total de mods sur le serveur
const totalItemsToDisplay = ref(0); // Nombre total de mods à afficher
const loading = ref(true);

// Animation sur le nombre de mods
watch(modslist, (newValue, oldValue) => {
  if (oldValue.length === 0) return

  gsap.fromTo(nbrMods, { value: oldValue.length }, { value: newValue.length, duration: 2.5, ease: 'power2.easeIn' });
});

onMounted(() => {
  // Récupére les serveurs Discord du joueur connecté
  getOnlineModsList()
})

async function getOnlineModsList() {
    //all_mods si rien
    let searchedMod = 'all_mods'
    if (searchedModsValue.value !== '') {
      searchedMod = searchedModsValue.value
    }
    loading.value = true;
    const modsByApi = await getToVApi ('thunderstore/search_by_name_author/'+ searchedMod + '/' + currentPage.value);
    if (modsByApi && modsByApi.success && modsByApi.data.data &&modsByApi.data.data.length > 0) {
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
      toast.warn('Aucun mod n\'a été trouvé')
    }
}

// Changement de page
function onClickHandler(page) {
  currentPage.value = page;
  getOnlineModsList();
}

// Recherche par touche entrée
function searchOnlineModsListByKey() {
  currentPage.value = 1
  getOnlineModsList()
}

const inputIsFocused = ref(false)
const searchedModsValue = ref('')

function clearInput () {
  searchedModsValue.value = ''
  currentPage.value = 1
  getOnlineModsList()
}

const isFocused = () => {
  inputIsFocused.value = true
}

const isNotFocused = () => {
  inputIsFocused.value = false
}

// Transitions
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.height = 0
}

function onEnter(el, done) {
  gsap.to(el, {
    opacity: 1,
    delay: el.dataset.index * 0.15,
    onComplete: done
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    height: 0,
    delay: el.dataset.index * 0.15,
    onComplete: done
  })
}

</script>

<style scoped lang="scss">
.online-modslist {
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
    width: 100%;
    position: fixed;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #11101d;
    padding: 0.5em 0.5em;
    border-top: white solid 1px;
    z-index: 8000;
    height: 3.5em;
    &__container {
      width: 100%;
      display: flex;
      justify-content: space-around;
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
        bottom: 0.8em;
        right: 9.3em;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        color: white;
      }
      &__search-btn {
        bottom: 0.65em;
        right: 2.5em;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
      }

    }
    
  }
  & ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    & li {
      list-style: none;
    }
  }
}
</style>