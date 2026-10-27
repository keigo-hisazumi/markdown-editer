import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './shared/styles/base.css'

import App from './App'
import { useThemeStore } from './stores/theme'

// React の描画前にテーマを適用し、初期描画時のちらつき（FOUC）を防ぐ
useThemeStore.getState().initTheme()

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
