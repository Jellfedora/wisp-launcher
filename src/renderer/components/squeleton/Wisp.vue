<template>
  <div class="wisp" ref="wisp" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { gsap } from 'gsap';

const wispRef = ref<HTMLElement | null>(null);
const cursorX = ref(0);
const cursorY = ref(0);

const moveWisp = () => {
  // Ajoutez une variation aléatoire aux valeurs d'offset
  const offsetX = Math.cos(angle) * radius * (1 + Math.random() * 0.2);
  const offsetY = Math.sin(angle) * radius * (1 + Math.random() * 0.2);

  gsap.to(wispRef.value, {
    x: cursorX.value + offsetX,
    y: cursorY.value + offsetY,
    duration: 1, // Durée de l'animation
    ease: 'power4.out', // Ease pour une animation douce
  });

  // Ajoutez plus de variation dans le calcul de l'angle et du rayon
  angle += angleSpeed * (1 + Math.random() * 0.5);
  radius = 100 + Math.sin(angle) * (10 + Math.random() * 5); // Variation du rayon pour un mouvement ondulatoire

  // Limiter la vitesse angulaire
  angleSpeed = Math.min(Math.max(angleSpeed + (Math.random() - 0.5) * 0.02, -0.1), 0.1);

  // Lorsque la boule atteint le bord de l'écran elle revient sur le curseur
  if (cursorX.value + offsetX < 0 || cursorX.value + offsetX > window.innerWidth || cursorY.value + offsetY < 0 || cursorY.value + offsetY > window.innerHeight) {
    cursorX.value = 0
    cursorY.value = 0
  }
  
  // Aléatoirement la boule se déplace vers une nouvelle position
  if (Math.random() < 0.01) {
    generateRandomPosition();
  }
};

const generateRandomPosition = () => {
  cursorX.value = Math.random() * window.innerWidth;
  cursorY.value = Math.random() * window.innerHeight;
};

let angle = 0;
let radius = 50;
let angleSpeed = 0.05; // Vitesse initiale de rotation autour du curseur
// let radiusSpeed = 0.2; // Vitesse de variation du rayon

onMounted(() => {
  generateRandomPosition();
  setInterval(moveWisp, 100);

  document.addEventListener('mousemove', (e) => {
    cursorX.value = e.pageX;
    cursorY.value = e.pageY;
  });

  // Assigner wispRef après le rendu initial du composant
  wispRef.value = document.querySelector('.wisp');
});


watch(
  [() => window.innerWidth, () => window.innerHeight],
  () => {
    generateRandomPosition();
  }
);
</script>

<style scoped>
.wisp {
  position: fixed;
  width: 1.2em;
  height: 1.2em;
  background-color: #25d3e4;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2000;
  transition: transform 0.2s ease-out; /* Transition douce pour le mouvement */
  box-shadow: 0 0 20px 10px #25d3e4;
}
</style>
