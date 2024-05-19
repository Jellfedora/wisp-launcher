<template>
  <div>
    <img :src="DiscordIcon" alt="Discord Icon" ref="discordSpin" />
  </div>
</template>
<script setup>
// @ts-ignore
import DiscordIcon from '@/assets/images/discord-icon.png'
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const discordSpin = ref(null)

onMounted(() => {
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(discordSpin.value, { rotation: 360, duration: 0.5, ease: 'none' })
    .to(discordSpin.value, { rotation: 360, duration: 0.2, ease: 'none' })
    .to(discordSpin.value, { rotation: 360, duration: 0.5, ease: 'none' });
})

</script>