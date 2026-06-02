<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="app-title">📝 Markdown Editor</h1>
      <p class="app-subtitle">記事を書こう</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="demo@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">パスワード</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="password"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary">ログイン</button>
      </form>

      <p class="demo-hint">デモ: demo@example.com / password</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')

function handleLogin() {
  errorMsg.value = ''
  const ok = authStore.login(email.value, password.value)
  if (ok) {
    router.push('/articles')
  } else {
    errorMsg.value = 'メールアドレスまたはパスワードが正しくありません'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.25rem;
  color: #1a1a2e;
}

.app-subtitle {
  text-align: center;
  color: #666;
  margin: 0 0 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: #667eea;
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0;
}

.btn-primary {
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.demo-hint {
  text-align: center;
  color: #9ca3af;
  font-size: 0.8rem;
  margin: 1rem 0 0;
}
</style>
