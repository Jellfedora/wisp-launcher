<template>
  <div class="confArbo">
    <VTooltip placement="right">
      <button class="sidebar-action__buttons btn-secondary" @click="getAndShowArboConf()">
        <i class="bx bx-memory-card bx-sm"></i>
      </button>
      <template #popper>
        Définir les fichiers de configuration à inclure dans le modpack
      </template>
    </VTooltip>

    <Modal :show="showArboConf" class="confArbo__modal">
      <div class="confArbo__modal__content">
        <h3>Quels dossiers et fichiers de configuration souhaitez-vous inclure dans les modpacks?</h3>
        <div class="confArbo__modal__content__arbo">
          <div class="confArbo__modal__content__arbo__type">
            <h4>Joueurs</h4>
            <Tree 
              :filter="true" 
              filterMode="lenient" 
              v-model:selectionKeys="selectedKeyPlayers" 
              :value="confFilesPlayers" 
              selectionMode="checkbox" 
              class="w-full md:w-30rem"
              :metaKeySelection="checked"
            />
          </div>
          <div class="confArbo__modal__content__arbo__type">
            <h4>Administrateur</h4>
            <Tree 
              :filter="true" 
              filterMode="lenient" 
              v-model:selectionKeys="selectedKeyAdmins" 
              :value="confFilesAdmins" 
              selectionMode="checkbox" 
              class="w-full md:w-30rem"
              :metaKeySelection="checked"
            />
          </div>
        </div>
        <div class="confArbo__modal__content__footer">
          <button class="btn-secondary" @click="showNotifSaveModpack()">Fermer</button>
          <button class="btn-secondary" @click="createZip()">Sauvegarder et fermer</button>
        </div>
        <small>(Les dossiers vides ne sont pas sauvegardés)</small>
      </div>
    </Modal>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { toast } from 'vue3-toastify'
import Tree from 'primevue/tree';
import { ipcRenderer } from 'electron';
import { useAuthStore } from '@/stores/authStore.js'

import Modal from '@/components/Modal.vue'

const showArboConf = ref(false);
const checked = ref(false);

const confFilesPlayers = ref([]);
const selectedKeyPlayers = ref([])

const confFilesAdmins = ref([]);
const selectedKeyAdmins = ref([])


// Récupérer et afficher l'arborescence des fichiers de configuration
function getAndShowArboConf() {
  // On va récupérer toute l'arborescence des fichiers de configuration
  ipcRenderer.send('get-conf-arbo', useAuthStore().getGuildId(), 'admin')
  ipcRenderer.once('get-conf-arbo', (_event, result) => {
    if (result && result.dataPlayers && result.dataAdmins) {
      confFilesPlayers.value = result.dataPlayers
      confFilesAdmins.value = result.dataAdmins

      selectedKeyPlayers.value = {} // Initialiser le tableau comme un objet
      selectedKeyAdmins.value = {} // Initialiser le tableau comme un objet

      // Fonction récursive pour parcourir l'arborescence et ajouter les états checked et partialChecked
      function traverseTree(node, type, parentKey = '') {
        node.forEach((childNode, index) => { // Utiliser forEach pour obtenir l'index
          const nodeKey = parentKey ? `${parentKey}-${index}` : `${index}` // Générer la clé du nœud

          // Ajouter l'état du nœud actuel à selectedKey.value avec la clé appropriée
          if (type === 'players') selectedKeyPlayers.value[nodeKey] = { checked: childNode.checked, partialChecked: childNode.partialChecked }
          if (type === 'admins') selectedKeyAdmins.value[nodeKey] = { checked: childNode.checked, partialChecked: childNode.partialChecked }

          // Si le nœud a des enfants, parcourir récursivement chaque enfant
          if (childNode.children && childNode.children.length > 0) {
            traverseTree(childNode.children, type, nodeKey) // Appel récursif avec les enfants et la clé du parent
          }
        })
      }

      // Parcours initial de l'arborescence pour ajouter les états des nœuds
      traverseTree(confFilesPlayers.value, 'players') // Passer le tableau racine pour commencer le parcours
      traverseTree(confFilesAdmins.value, 'admins') // Passer le tableau racine pour commencer le parcours

      showArboConf.value = true
    } else {
      toast.error('Aucun fichier de configuration trouvé, veuillez d\'abord lancer Valheim')
    }
  })
}

// Fermer la notification de sauvegarde du modpack
function showNotifSaveModpack() {
  showArboConf.value = false
}

// Créer le fichier ZIP à partir des éléments sélectionnés
async function createZip() {
  const selectionPlayers = JSON.stringify(selectedKeyPlayers.value);
  const selectionAdmins = JSON.stringify(selectedKeyAdmins.value);
  ipcRenderer.send('create-conf-zip', selectionAdmins, selectionPlayers, useAuthStore().getGuildId(), 'admin');
  ipcRenderer.once('create-conf-zip', (_event, result) => {
    if (result && result.success) {
      toast.success('Les fichiers de configuration ont été sauvegardés, attention ils ne seront ajoutés dans la nouvelle version du modpack que lorsque vous aurez créé celle-ci');
      showArboConf.value = false;
    } else {
      toast.error('Erreur lors de la création du fichier ZIP : ' + result.message);
    }
  });
}

</script>
<style lang="scss">
.confArbo {
  &__modal {
    &__content {
      height: 42em;
      display: flex;
      flex-wrap: wrap;
      overflow: hidden;
      justify-content: center;
      align-content: space-between;
      & h3 {
        margin-bottom: 1em;
        width: 100%;
      }
      &__arbo {
        width: 100%;
        max-height: 30em;
        overflow: auto;
        display: flex;
        justify-content: space-between;
        &__type {
          width: 50%;
          & h4 {
            margin-bottom: 0.5em;
            text-align: center;
          }
        }
      }
      &__footer {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 1em;
        & button {
          margin: 0 0.5em;
          width: 15em;
        }
      }
    }
  }
}

// Bidouilles sur le Tree de primevue, à remplacer car vraiment pas propre
.p-tree {
  background-color: #1d1b31;
  color: white;
  & span {
    color: white;
  }
}

.p-tree-toggler {
  // color: white !important;
  padding: 0 !important;
}

.p-tree-toggler:hover {
  // color: white !important;
  border: none !important;
  background-color: transparent !important;
}

.p-tree .p-treenode-children {
    padding: 0 0 0 1rem !important;
}

.p-treenode-content:hover, .p-treenode-selectable:hover {
  background-color: rgb(168, 168, 168) !important;
}

// Champ de recherche
.p-tree-filter-container {
  width: 20em;
  margin: 0.5em auto;
  padding: 0.5rem 0.75rem;
}
// ajouter un placeholder


.p-tree .p-tree-filter-container .p-tree-filter-icon {
  top: 0.9rem;
  right: 1rem;
}
</style>