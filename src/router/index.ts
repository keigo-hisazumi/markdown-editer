import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app',
      component: () => import('@/views/AppView.vue'),
    },
  ],
})

router.beforeEach(async () => {
  const authStore = useAuthStore()
  await authStore.authReady
})

export default router
