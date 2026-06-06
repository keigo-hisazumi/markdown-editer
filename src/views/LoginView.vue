<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="app-title">📝 Markdown Editor</h1>
      <p class="app-subtitle">記事を書こう</p>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="example@example.com"
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
            placeholder="6文字以上"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '処理中...' : isSignup ? 'アカウント作成' : 'ログイン' }}
        </button>
      </form>

      <button class="btn-toggle" @click="isSignup = !isSignup">
        {{ isSignup ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントを新規作成する' }}
      </button>
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
const loading = ref(false)
const isSignup = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    if (isSignup.value) {
      await authStore.signup(email.value, password.value)
    } else {
      await authStore.login(email.value, password.value)
    }
    router.push('/')
  } catch (e: unknown) {
    const code = (e as { code?: string }).code ?? ''
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      errorMsg.value = 'メールアドレスまたはパスワードが正しくありません'
    } else if (code === 'auth/email-already-in-use') {
      errorMsg.value = 'このメールアドレスはすでに使用されています'
    } else if (code === 'auth/weak-password') {
      errorMsg.value = 'パスワードは6文字以上で入力してください'
    } else {
      errorMsg.value = 'エラーが発生しました。もう一度お試しください'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-bg-soft);
  padding: 1rem;
  transition: background 0.3s;
}

.login-card {
  background: var(--app-menu-bg);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px var(--app-menu-shadow);
  border: 1px solid var(--app-border);
  transition: background 0.3s, border-color 0.3s;
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.25rem;
  color: var(--app-text);
  transition: color 0.3s;
}

.app-subtitle {
  text-align: center;
  color: var(--app-text-secondary);
  margin: 0 0 2rem;
  transition: color 0.3s;
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
  color: var(--app-text);
  transition: color 0.3s;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--app-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, background 0.3s, color 0.3s;
  outline: none;
  background: var(--app-input-bg);
  color: var(--app-text);
  font-family: inherit;
}

.form-group input:focus {
  border-color: var(--app-accent);
}

.form-group input::placeholder {
  color: var(--app-text-placeholder);
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0;
}

.btn-primary {
  padding: 0.875rem;
  background: var(--app-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: inherit;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-toggle {
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--app-accent);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  font-family: inherit;
}
</style>
