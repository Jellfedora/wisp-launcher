<template>
  <div class="sidebar-user">
    <SidebarUserInfos />
    <SidebarGuildInfos />
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import SidebarUserInfos from '@/components/squeleton/sidebar/user/SidebarUserInfos.vue'
// @ts-ignore
import SidebarGuildInfos from '@/components/squeleton/sidebar/user/SidebarGuildInfos.vue'
</script>
<style lang="scss">
.sidebar-user {
  position: fixed;
  top: 5em;
  background-color: #11101d;
  left: 0.9em;
  z-index: 1001;
  width: 222px;
  height: 23em;
  border: 1px solid #5865F2;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
}
</style>