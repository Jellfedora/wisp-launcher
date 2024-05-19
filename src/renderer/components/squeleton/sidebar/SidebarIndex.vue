<template>
  <div>
    <div class="wisp-title-logo">
        <div class="wisp-title-logo__item"></div>
        <div class="wisp-title-logo__item"></div>
      </div>
    <SidebarUserIndex v-if="authStore.getIsConnected()"/>
    <VueSidebarMenuAkahon
      class="sidebar"
      menuTitle="Wisp Launcher"
      :isSearch="false"
      :isExitButton="true"
      :menuItems="menuItems"
      :isUsedVueRouter="true"
    />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
// @ts-ignore
import Footer from '@/components/squeleton/sidebar/SidebarFooter.vue'
// @ts-ignore
import SidebarUserIndex from './user/SidebarUserIndex.vue';

// @ts-ignore
import VueSidebarMenuAkahon from "vue-sidebar-menu-akahon";
// DOC: https://github.com/akahon/vue-sidebar-menu-akahon
// @ts-ignore
import { useAuthStore } from '@/stores/authStore.js'

const authStore = useAuthStore()

const menuItems =ref([
  {
    name: "Accueil",
    icon: "bx-grid-alt",
    link: "/home"
  },
  // {
  //   name: "Alarmes",
  //   icon: "bx-alarm",
  //   link: "/alarms",
  // },
  // {
  //   name: "Mods du serveur",
  //   icon: "bx-list-ul",
  //   link: "/mods-list"
  // },
  {
    name: "Paramétres",
    icon: "bx-cog",
    link: "/parameters"
  },
]);

watchEffect(() => {
  if (authStore.getIsConnected()) {
    // Vérifier si la route "/guilds" n'existe pas déjà dans le tableau menuItems
    const guildsIndex = menuItems.value.findIndex(item => item.link === "/guilds/choose");
    if (guildsIndex === -1) {
      // Si elle n'existe pas, ajoutez-la avant la route "/parameters"
      const parametersIndex = menuItems.value.findIndex(item => item.link === "/parameters");
      if (parametersIndex !== -1) {
        menuItems.value.splice(parametersIndex, 0, 
        {
          name: "Choix serveur Discord",
          icon: "bxl-discord",
          link: "/guilds/choose"
        });
      }
    }

    // Déplacer la déclaration de parametersIndex à un niveau supérieur pour qu'elle soit accessible dans toute la fonction watchEffect
    let parametersIndex = -1; // Initialiser parametersIndex en dehors du bloc if
    if (guildsIndex === -1) {
      parametersIndex = menuItems.value.findIndex(item => item.link === "/parameters");
    }

    // Vérifier si la route "Contact" n'existe pas déjà dans le tableau menuItems
    const contactIndex = menuItems.value.findIndex(item => item.link === "/contact");
    if (contactIndex === -1) {
      // Ajouter la route "Contact" après la route "/guilds" ou "/parameters" si "/guilds" n'est pas présente
      const insertIndex = guildsIndex !== -1 ? guildsIndex + 1 : parametersIndex + 1;
      menuItems.value.splice(insertIndex, 0, 
      {
        name: "Support",
        icon: "bx-mail-send",
        link: "/support"
      });
    }
  } else {
    // Si l'utilisateur n'est pas connecté, également supprimer la route "/guilds" et "/contact" du menu
    const guildsIndex = menuItems.value.findIndex(item => item.link === "/guilds/choose");
    if (guildsIndex !== -1) {
      menuItems.value.splice(guildsIndex, 1);
    }

    const contactIndex = menuItems.value.findIndex(item => item.link === "/support");
    if (contactIndex !== -1) {
      menuItems.value.splice(contactIndex, 1);
    }
  }
});


  
</script>

<style lang="scss">
.sidebar {
  max-height: 100vh;
  & i,
  & li a .links_name {
    color: inherit;
    font-family: NorseBold;
    font-size: 1.2em;
  }
  & li a {
    border: 1px solid #11101d;
  }
}

.sidebar li a:hover {
  background-color: #1d1b31;
  color: white;
}

.sidebar a:hover i::before,
.sidebar li a:hover .links_name {
  color: white;
}

// Déplace les liens du menu vers le bas
.sidebar .nav-list {
  margin-top: 25em;
}

.logo_name {
  font-size: 1.9em !important;
  font-family: NorseBold;
  margin-left: 1.7em;
}

// Cache le bouton pour refermer la sidebar
.logo-details i {
  display: none;
}
.profile {
  width: 251px !important;
  height: 5em !important;
  border-top: 1px solid white !important;
  display: none;
//   height: 0;
//   margin: 0;
//   padding: 0;
  &-details {
    height: 4em !important;
  }
}

/* Element ajouté par la sidebar */
.tooltip {
  top: -20px;
}

.router-link-exact-active {
  border: 1px solid #25d3e4 !important;
  color: white;
  opacity: 1 !important;
}

// Animation du logo
.wisp-title-logo {
  top: 2em;
  left: 2.5em;
  position:fixed;
  z-index: 100;
  --r: 1px;
  height: var(--r);
  width: var(--r);
  .wisp-title-logo__item {
    position: absolute;
    border-radius: 50%;
    animation: Loading 2s linear infinite;

    &::after {
      content: "";
      position: absolute;
      top: -10px;
      left: 50%;
      width: 5px;
      height: 5px;
      color: #25d3e4;
      background: #25d3e4;
      border-radius: 50%;
      box-shadow: 0 0 10px, 0 0 20px, 0 0 30px;
    }

    &:nth-child(2) {
      animation-delay: -1s;
    }
  }
}

@keyframes Loading {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>