import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/ArticleView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/articles/:id',
      name: 'editor',
      component: () => import('@/views/ArticleView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.authReady
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login' }
  }
  if (to.name === 'login' && authStore.isLoggedIn) {
    return { name: 'articles' }
  }
})

export default router
