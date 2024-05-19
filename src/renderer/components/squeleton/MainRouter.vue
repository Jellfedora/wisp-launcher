<template>
  <router-view v-slot="{ Component }">
    <transition @enter="enter" @leave="leave" :css="false" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import gsap from 'gsap';

const enter = (el: any, done: () => void) => {
  gsap.fromTo(el, {
    opacity: 0,
    //translateY: '100%',
    scale: 0.95
  }, {
    opacity: 1,
    //translateY: '0%',
    scale: 1,
    duration: 0.5,
    onComplete: done
  });
}

const leave = (el: any, done: () => void) => {
  gsap.to(el, {
    opacity: 0,
    //translateY: '-100%',
    scale: 0.95,
    duration: 0.5,
    onComplete: done
  });
}
</script>
