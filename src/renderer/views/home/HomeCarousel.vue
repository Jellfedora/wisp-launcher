<template>
  <div class="cpn-carousel">
    <Carousel :autoplay="5000" class="cpn-carousel__content" v-if="articles.length > 0">
      <Slide v-for="article in articles" :key="article.id">
       <div class="carousel__item" @click="openLink(article.link)" :style="{backgroundImage: 'url('+article.banner_link+')'}">
          <div class="carousel__item__text">
            <h3>{{article.title}}</h3>
            <span>{{dayjs(article.date).format('DD/MM/YYYY')}}</span>
          </div>
          
        </div>
      </Slide>

      <template #addons>
         <Navigation />
      </template>
    </Carousel>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Navigation, Slide } from 'vue3-carousel'
import { ref, onMounted } from 'vue'
import 'vue3-carousel/dist/carousel.css'
// @ts-ignore
import { getToVApi } from '@/services/axiosService';
// @ts-ignore
import dayjs from 'dayjs'

import { shell } from 'electron';
const openLink = (link: string) => {
  shell.openExternal(link)
}

const articles = ref<any[]>([])

onMounted(async() => {
  const articlesByApi = await getToVApi ('free/v_articles/last_ten');
  if (articlesByApi && articlesByApi.success) {
    articles.value = articlesByApi.data
  }
})
</script>

<style lang="scss">

.carousel__viewport,
.carousel__track,
.carousel__slide,
.carousel__item {
  height: 100%;
}

.cpn-carousel {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  &__content {
    width: 100%;
    height: 100%;
  }
}
.carousel {
  height: 100%;
  &__item {
    height: 100%;
    width: 100%;
    background-size: cover;
    background-position: center;
    border: none;
    &__text {
      position: absolute;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      background-color: #0000007d;
      padding: 0 0.5em;
      & h3 {
        font-family: 'NorseBold';
        margin: 0;
      }
    }
    
  }
  &__prev,
  &__next{
    background-color: #11101d !important;
    border-radius: 5em;
    transition: background-color 0.2s ease;
    border: 1px solid transparent;
    height: 1em;
    width: 1em;
    
  }
  &__prev:focus,
  &__prev:focus-visible,
  &__next:focus,
  &__next:focus-visible {
    outline: none;
  }
  &__prev:hover,
  &__next:hover {
    border-color: #25d3e4;
    animation: filterAnimation 2s alternate;
  }
  &__icon {
    fill: white;
  }
}

@keyframes filterAnimation {
  0% {
    filter: drop-shadow(0 0 0 #646cff00);
  }

  50% {
    filter: drop-shadow(0 0 4em #25d3e4);
  }

  100% {
    filter: drop-shadow(0 0 0 #646cff00);
  }
}

</style>