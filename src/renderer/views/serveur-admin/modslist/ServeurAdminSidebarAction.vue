<template>
  <div class="sidebar-action">
    <VTooltip placement="right">
      <button class="btn-primary">
        <i class="bx bx-cloud-upload bx-sm"></i>
      </button>
      <template #popper>
        Créer modpack
      </template>
    </VTooltip>

    <VTooltip placement="right">
      <button class="btn-primary">
        <i class="bx bx-send bx-sm"></i>
      </button>
      <template #popper>
        Lancer Valheim
      </template>
    </VTooltip>

    <VTooltip placement="right">
      <button class="btn-primary">
        <i class="bx bx-folder-open bx-sm"></i>
      </button>
      <template #popper>
        Ouvrir le dossier des configurations de mods
      </template>
    </VTooltip>
  </div>
</template>



<style lang="scss">
.sidebar-action {
  width: 5em;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & button {
    margin: 0.5em 0;
  }
}
</style>