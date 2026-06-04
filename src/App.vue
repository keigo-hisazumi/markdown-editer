<template>
  <RouterView v-slot="{ Component }">
    <Transition :name="transitionName">
      <component :is="Component" :key="$route.fullPath" />
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const transitionName = ref('none')

const router = useRouter()
let appReady = false
router.isReady().then(() => {
  appReady = true
})

router.afterEach((to, from) => {
  if (!appReady) {
    transitionName.value = 'none'
    return
  }
  const toDepth = (to.meta.depth as number) ?? 0
  const fromDepth = (from.meta.depth as number) ?? 0
  transitionName.value = toDepth > fromDepth ? 'slide-forward' : 'slide-backward'
})
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 前進（一覧→編集）: 編集画面が右からスライドイン */
.slide-forward-enter-active,
.slide-forward-leave-active,
.slide-backward-enter-active,
.slide-backward-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  backface-visibility: hidden;
}

.slide-forward-enter-active {
  position: fixed;
  inset: 0;
  z-index: 10;
}
.slide-forward-leave-active {
  position: fixed;
  inset: 0;
  z-index: 9;
}

.slide-forward-enter-from {
  transform: translateX(100%);
}
.slide-forward-leave-to {
  transform: translateX(-20%);
}

/* 後退（編集→一覧）: 編集画面が右にスライドアウト */
.slide-backward-leave-active {
  position: fixed;
  inset: 0;
  z-index: 10;
}
.slide-backward-enter-active {
  position: fixed;
  inset: 0;
  z-index: 9;
}

.slide-backward-leave-to {
  transform: translateX(100%);
}
.slide-backward-enter-from {
  transform: translateX(-20%);
}
</style>
