<template>
  <LoginView v-if="!authStore.isLoggedIn" />
  <ArticleView v-else />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import LoginView from './LoginView.vue'
import ArticleView from './ArticleView.vue'

const authStore = useAuthStore()
</script>
