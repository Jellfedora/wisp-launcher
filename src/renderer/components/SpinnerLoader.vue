<template>
  <div class="spinner-loader" :class="spinnerSize" />  
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
const spinnerProps = defineProps({
  size: {
    type: String,
    required: false,
    default: 'normal',
    validator: (value) => {
      return ['small', 'normal', 'large'].includes(value as string)
    }
  },
  color: {
    type: String,
    required: false,
    default: 'black'
  }
})

const spinnerSize = computed(() => {
  return {
    'spinner-loader-small': spinnerProps.size === 'small',
    'spinner-loader-normal': spinnerProps.size === 'normal',
    'spinner-loader-large': spinnerProps.size === 'large'
  }
})
</script>

<style lang="scss">
.spinner-loader-small {
  width: 1em;
  height: 1em;
}

.spinner-loader-normal {
  width: 2em;
  height: 2em;
}

.spinner-loader-large {
  width: 3em;
  height: 3em;
}

/* Spinner styles */
.spinner-loader {
  border: 4px solid grey;
  border-top: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 1em auto;
  & :focus {
    outline: none;
  }
}

/* Animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>