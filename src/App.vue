<template>
  <div class="app-wrap">
    <RouterView v-slot="{ Component }">
      <Transition name="fade-page">
        <component :is="Component" :key="$route.fullPath" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
.app-wrap {
  position: relative;
  min-height: 100vh;
}

.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.18s ease;
}

.fade-page-enter-from,
.fade-page-leave-to {
  opacity: 0;
}
</style>
