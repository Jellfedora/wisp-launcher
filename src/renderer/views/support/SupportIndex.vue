<template>
  <div class="support">
    <h2>Support</h2>
    <div class="support__item">
      <h3>Vous rencontrez un problème ou vous avez des questions sur Wisp Launcher ?</h3>
      <div class="support__item__discord">
        <h4>Contacter nous via Discord dans la catégorie adéquate</h4>
        <button class="btn-secondary" @click="shell.openExternal('https://discord.gg/4Wmt9keauW')">
          <img style="width:3em" :src="DiscordIcon" alt="Discord Icon" />
          <p>Nous contacter</p>
        </button>
      </div>
      <hr style="width: 100%; margin: 1em 0;" />
      <div class="support__item__form">
        <h4>Ou via le formulaire ci-dessous</h4>
        <textarea 
          placeholder="Expliquez votre problème ici" 
          required 
          rows="4" 
          maxlength="3000" 
          :value="requestText"
          @input="updateRequestText($event)"
        />

        <p>En plus de votre demande, en confirmant l'envoi du formulaire vous allez envoyer à notre support les informations suivantes:</p>
        <div class="support__item__form__list">
          <ul>
            <li>
              <p>Votre pseudo et identifiant Discord pour identifier votre compte sur Wisp Launcher</p>
            </li>
            <li>
              <p>Des informations sur votre configuration matérielle et votre système d'exploitation</p>
            </li>
            <li>
              <p>Le fichier de log de l'application Wisp Launcher</p>
            </li>
          </ul>
        </div>
        <small>Aucune information personnelle ne sera partagée à des tiers et les informations collectées seront utilisées uniquement pour résoudre votre problème</small>
        <button 
          v-if="appStore.getSteamFolderPath()"
          type="button"
          @click="showConfirm = true"
          title="Envoyer le fichier de log de l'application Wisp Launcher au support"
          class="toolbar-buttons btn-secondary"
        >
          <span>Faire une demande de support</span>
        </button>
      </div>
    </div>
    <Modal :show="showConfirm">
      <div class="support__modal">
        <h3>Veuillez ne pas abuser de cette fonctionnalité sous peine de ban de votre compte</h3>
        <button class="btn-secondary" @click="sendForm()">Envoyer ma demande</button>
        <button class="btn-secondary" @click="showConfirm = false">Annuler ma demande</button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { shell } from 'electron';
// @ts-ignore
import Modal from '@/components/Modal.vue'
// @ts-ignore
import { useAppStore } from '@/stores/appStore.js'
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'
import DiscordIcon from '@/assets/images/discord-icon.png'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
// @ts-ignore
import { getToVApi } from '@/services/axiosService';

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const showConfirm = ref(false)
const requestText = ref('')

// Si plus connecté, rediriger vers la home avec un message d'erreur
watchEffect(() => {
  if (!authStore.getIsConnected()) {
    router.push('/home')
  }
})

function updateRequestText(event: any) {
  requestText.value = event.target.value
}

async function sendForm() {
  // Envoie du formulaire
  if (requestText.value.length < 10) {
    toast.warning('La description de votre problème est trop courte')
    showConfirm.value = false
    return
  } else if (requestText.value.length > 3000) {
    toast.warning('La description de votre problème est trop longue, veuillez la raccourcir à moins de 3000 caractères')
    showConfirm.value = false
    return
  } else {
    // On récupére le webhook du support et le steamId de l'utilisateur
    const webhookRqst = await getToVApi ('v_launcher/support_webhook')
    if(webhookRqst && webhookRqst.success && webhookRqst.data.support_webhook) {
      // Envoie du formulaire
      appStore.contactSupport(webhookRqst.data.support_webhook, webhookRqst.data.user, requestText.value)
      // On vide le champ de texte
      requestText.value = ''
    }
    showConfirm.value = false
  }
}
</script>

<style scoped lang="scss">
.support {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 5em 2em 2em 2em;
  & h2 {
    margin-bottom: 2em;
    width: 100%;
  }
  &__item {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    text-align: center;
    margin-bottom: 1em;
    & h3 {
      font-size: 1em;
      margin-bottom: 1em;
      width: 100%;
    }
    &__discord {
      h4, button {
        margin-bottom: 1em;
      }
      h4 {
        font-weight: normal;
      }
    }
    &__form {
      width: 100%;
      h4 {
        margin-bottom: 2em;
      }
      p {
        margin-bottom: 1em;
      }
      &__list {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 1em;
        & ul {
          width: 41em;
          & li {
            margin-bottom: 0.5em;
            text-align: left;
          }
        } 
      }
      & textarea {
        width: 80em;
        margin-bottom: 1em;
        padding: 1em;
        border: none;
        border-radius: 0.5em;
        resize: none;
        background-color: #11101d;
      }
      & small {
        width: 100%;
        display: block;
        margin-bottom: 1em;
        font-size: 0.8em;
      }
    }
  }
  &__modal {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    & h3 {
      margin-bottom: 2em;
      width: 100%;
    }
    & button {
      margin: 0 1em;
    }
  }
}
</style>