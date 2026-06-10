import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './assets/base.css'

import App from './App'
import { useThemeStore } from './stores/theme'

useThemeStore.getState().initTheme()

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
