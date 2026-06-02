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
      component: () => import('@/views/ArticleListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/articles/:id',
      name: 'editor',
      component: () => import('@/views/EditorView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
