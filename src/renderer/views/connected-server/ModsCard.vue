<template>
  <div class="mod" :style="{background: (props.mod.is_deprecated ? 'linear-gradient(0deg, rgba(40,44,52,1) 0%, rgba(250, 3, 3, 0.705) 100%)' : '')}">
    <div class="mod__deprecated" v-if="props.mod.is_deprecated">Mod déprécié !</div>
    <img v-if="props.mod.icon":src="props.mod.icon" alt="mod.name" />
    <div class="mod__img-placeholder" v-else />
    <h3>{{ props.mod.name }}</h3>
    <small> v{{ props.mod.version_number }} par {{ props.mod.owner }}</small>
    <!-- <ul v-for="categories in mod.categories">
      <span>{{ categories }}</span>
    </ul> -->
    <small>Ajouté le {{dayjs(props.mod.added_at).format('DD/MM/YYYY')}}</small>
    <!-- <p>{{ mod.description }}</p> -->
    <div class="mod__footer">
      <button style="width:7em;" @click="openLink(props.mod.package_url)" v-if="props.mod.package_url">Détails</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
// @ts-ignore
import SpinnerLoader from '@/components/SpinnerLoader.vue'
// @ts-ignore
import Modal from '@/components/Modal.vue'
import { defineProps } from 'vue'
import { shell } from 'electron';
// @ts-ignore
import { postToVApi, deleteToVApi } from '@/services/axiosService';

const props = defineProps({
  mod : {
    type: Object,
    required: true
  }
})

const openLink = (link: string) => {
  shell.openExternal(link)
}

</script>

<style scoped lang="scss">
.mod {
  border-radius: 1em;
  width: 20em;
  height: 22em;
  margin: 1em;
  padding: 0.5em 1em 1em 1em;
  background: linear-gradient(0deg, rgba(40,44,52,1) 0%, rgba(17, 0, 32, 0.705) 100%);
  box-shadow: 0 7px 20px 5px #00000088;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover{
    border: 1px solid #ffffff44;
    box-shadow: 0 7px 50px 10px #000000aa;
    transform: scale(1.015);
  }
  &__deprecated {
    color: black;
    font-size: 0.8em;
    font-weight: bold;
  }
  & img {
    width: 10em;
    height: 10em;
    object-fit: cover;
    margin: 0 auto;
  }
  &__img-placeholder {
    width: 10em;
    height: 10em;
    background-color: #ffffff44;
    margin: 0 auto;
  }
  & h3 {
    font-size: 1.1em;
    margin-top: 0.5em;
    white-space: nowrap; /* Empêche le texte de passer à la ligne */
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__footer {
    display: flex;
    justify-content: center;
    margin-top: 1em;
    & button {
      background-color: white;
      color: #1d1b31;
      border: none;
      border-radius: 0.5em;
      width: 7em;
      height: 2.5em;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      &:focus {
        outline: none;
      }
    }
  }
}
</style>