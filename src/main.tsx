import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import './styles.css'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import { requestReload, notifyVisible } from './update'
import { applyTheme, loadTheme } from './theme'

applyTheme(loadTheme())

let refreshing = false
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (refreshing) return
  refreshing = true
  requestReload(() => window.location.reload())
})

const updateSW = registerSW({ immediate: true })

// Installierte PWAs (vor allem iOS) prüfen selten von sich aus auf ein neues Deploy.
// Zusätzlich zum Standard-Intervall von vite-plugin-pwa stoßen wir stündlich und bei
// jeder Rückkehr in den Vordergrund eine Prüfung an.
setInterval(() => { updateSW() }, 60 * 60 * 1000)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateSW()
    notifyVisible() // löst einen zuvor vorgemerkten Reload aus, falls einer ansteht
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
