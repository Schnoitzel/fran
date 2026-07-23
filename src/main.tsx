import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

const UPDATE_CHECK_INTERVAL_MS = 60 * 1000

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Ein-Personen-App: kein "Update verfuegbar?"-Prompt, einfach sofort
    // aktivieren und neu laden.
    updateSW(true)
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    // iOS-Safari prueft bei installierten Home-Screen-PWAs Service-Worker-
    // Updates oft nicht zuverlaessig automatisch -> aktiv nachfragen,
    // solange die App offen ist.
    setInterval(() => {
      registration.update()
    }, UPDATE_CHECK_INTERVAL_MS)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
