// 18 Tiere (= maximale Spielerzahl) und kräftige, helle Farben (dunkle Schrift bleibt darauf lesbar).
export const EMOJIS = ['🦊', '🐼', '🐸', '🦁', '🐙', '🦄', '🐯', '🐵', '🐧', '🐰', '🐻', '🦉', '🐢', '🐞', '🦖', '🐬', '🦋', '🐨']
export const COLORS = ['#ffd166', '#ff9f80', '#f78fb3', '#c3b1ff', '#7fd8c8', '#8fd3ff', '#b5e06b', '#ffb85c', '#e8a0ff']

// Nächster Wert aus der Liste, der noch nicht benutzt wird (sonst einfach der nächste).
export function nextUnused<T>(list: readonly T[], current: T | undefined, used: T[]): T {
  const start = current === undefined ? -1 : list.indexOf(current)
  for (let i = 1; i <= list.length; i++) {
    const candidate = list[(start + i) % list.length]
    if (!used.includes(candidate)) return candidate
  }
  return list[(start + 1) % list.length]
}
