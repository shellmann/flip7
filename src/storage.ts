import { isOver } from './game'
import type { AppData, Game, RecentPlayer } from './types'

export const DATA_KEY = 'flip7-data-v1'
export const SETTINGS = {
  theme: 'flip7-theme',
  largeText: 'flip7-large-text',
  wakeLock: 'flip7-wake-lock',
  lastSeenVersion: 'flip7-last-seen-version',
}

export const MAX_RECENT = 12

export const emptyData = (): AppData => ({ version: 1, current: null, history: [], recentPlayers: [] })

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value !== null ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage kann voll oder gesperrt sein — dann gilt die Einstellung nur für diese Sitzung.
  }
}

export function loadData(): AppData {
  const data = readLocal<AppData | null>(DATA_KEY, null)
  if (!data || typeof data !== 'object' || !Array.isArray(data.history) || !Array.isArray(data.recentPlayers)) return emptyData()
  return { ...emptyData(), ...data, current: data.current ?? null }
}

export function saveData(data: AppData) {
  writeLocal(DATA_KEY, data)
}

// Ein Spiel steht im Verlauf, solange es beendet ist. Rückgängig/Bearbeiten nimmt es wieder heraus,
// ein erneutes Beenden fügt es wieder ein — Verlauf und aktuelles Spiel können so nie auseinanderlaufen.
export function withGame(data: AppData, game: Game | null): AppData {
  if (!game) return { ...data, current: null }
  const history = data.history.filter((g) => g.id !== game.id)
  return { ...data, current: game, history: isOver(game) ? [game, ...history] : history }
}

export function rememberPlayers(data: AppData, used: RecentPlayer[]): AppData {
  const names = new Set(used.map((p) => p.name.toLowerCase()))
  const rest = data.recentPlayers.filter((p) => !names.has(p.name.toLowerCase()))
  return { ...data, recentPlayers: [...used.map(({ name, emoji, color }) => ({ name, emoji, color })), ...rest].slice(0, MAX_RECENT) }
}
