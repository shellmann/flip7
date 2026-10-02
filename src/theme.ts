import { SETTINGS, readLocal, writeLocal } from './storage'

export type Theme = 'system' | 'light' | 'dark'

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

export const loadTheme = (): Theme => {
  const t = readLocal<string>(SETTINGS.theme, 'system')
  return t === 'light' || t === 'dark' ? t : 'system'
}

// Nur ein ausdrücklich gewähltes Theme setzt data-theme; "system" überlässt es dem CSS (prefers-color-scheme).
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  const dark = theme === 'dark' || (theme === 'system' && media().matches)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#17142b' : '#fff7e8')
}

export function saveTheme(theme: Theme) {
  writeLocal(SETTINGS.theme, theme)
  applyTheme(theme)
}

export function watchSystemTheme(getTheme: () => Theme): () => void {
  const mq = media()
  const handler = () => applyTheme(getTheme())
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}
