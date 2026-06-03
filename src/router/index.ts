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

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  // Firebase Auth の初期化完了（localStorage 復元含む）を待ってからガード判定する
  await authStore.authReady
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login' }
  }
  // ログイン済みでログインページにアクセスした場合は記事一覧にリダイレクト
  // （PWA の start_url が "/" のため、起動時に毎回ここを通る）
  if (to.name === 'login' && authStore.isLoggedIn) {
    return { name: 'articles' }
  }
})

export default router
