<template>
    <div class="modal" v-if="props.show">
        <div class="modal__content">
            <slot></slot>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({
    show: {
        type: Boolean,
        required: true
    }    
})
</script>
<style lang="scss">
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.87);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  &__content {
    background-color: #1d1b31;
    border-radius: 1em;
    padding: 1em;
    box-shadow: 0 7px 20px 5px #00000088;
    padding:2em;
    margin: 2em;
    overflow-y: auto;
    max-height: 90%;
  }
}
</style>