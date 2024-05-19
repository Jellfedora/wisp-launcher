<template>
  <div class="debug-webhook">
    <input class="input-primary debug-webhook__input" type="text" v-model="url" placeholder="Votre url Webhook de votre chan discord de débug"/>
    <button style="border-radius: 0 8px 8px 0;font-size:0.8em;" @click="removeWebhook" title="Supprimer l'emplacement du jeu" class="btn-secondary">
      X
    </button>
    <button class="btn-secondary debug-webhook__send-btn" @click="sendWebhook">Enregistrer</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
// @ts-ignore
import { getToVApi, postToVApi } from '@/services/axiosService';

const url = ref('')

// Récupère le webhook de débug
onMounted(async() => {
  const guildWebhookUrlDebug = await getToVApi ('v_guilds/webhook_url_debug');
  if (guildWebhookUrlDebug && guildWebhookUrlDebug.success && guildWebhookUrlDebug.data.webhook_url_debug) {
    url.value = guildWebhookUrlDebug.data.webhook_url_debug
  }
})

// Enregistre le webhook de débug
async function sendWebhook() {
  const webhook = await postToVApi('v_guilds/webhook_url_debug', {url: url.value});
  if (webhook && webhook.data && webhook.data.success) {
    toast.success("Webhook de débug enregistré avec succès")
  } else {
    toast.error("Une erreur est arrivée lors de l'enregistrement du webhook de débug, veuillez réessayer")
  }
}

// Supprime le webhook de débug de l'input
const removeWebhook = () => {
  url.value = ''
}


</script>

<style lang="scss">
.debug-webhook {
  display: flex;
  &__input {
    width: 35em;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }
  &__send-btn {
    margin-left: 2em;
    font-size:0.8em;
    width: 10em;
  }
}
  
</style>