<template>
  <div class="disconnect">
    <button class="disconnect__btn" @click="disconnectUser()" title="Se déconnecter">
      <i class='bx bx-log-out bx-sm'></i>
    </button>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

async function disconnectUser() {
  await authStore.disconnectUser()
  router.push('/home')
}

</script>

<style lang="scss">
.disconnect {
  &__btn {
    background-color: white;
    border: none;
    color: #1d1b31;
    height: 2em;
    width: 2em;
    padding: 0.5em;
    cursor: pointer;
    transition: 0.5s;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background-color: #5865F2;
      color: white;
    }
  }
}
</style>