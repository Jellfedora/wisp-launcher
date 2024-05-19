<template>
  <div class="sidebar-user-infos">
    <img :src="authStore.getUserAvatar()" alt="">
    <div class="sidebar-user-infos__text">
      <h3>{{ authStore.getUserName() }}</h3>
    </div>
    <DisconnectUser />
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import DisconnectUser from '@/components/squeleton/sidebar/user/SidebarDisconnectUser.vue'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()

</script>
<style lang="scss">
.sidebar-user-infos {
  width: 100%;
  height: 5em;
  border-top-left-radius: 1em;
  border-top-right-radius: 1em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.4em;
  border-bottom: 1px solid #5865F2;
  & img {
    width: 3em;
    height: 3em;
    border-radius: 50%;
    margin: 0.5em;
  }
  &__text {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    & h3 {
      font-size: 1em;
      margin: 0;
      width: 100%;
      text-transform: capitalize;
    }
  }
}
</style>