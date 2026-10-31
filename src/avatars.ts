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

// Namen für Screenreader und Tooltips (Emojis und Farben allein sind nicht zugänglich).
export const EMOJI_NAMES: Record<string, string> = {
  '🦊': 'Fuchs', '🐼': 'Panda', '🐸': 'Frosch', '🦁': 'Löwe', '🐙': 'Krake', '🦄': 'Einhorn',
  '🐯': 'Tiger', '🐵': 'Affe', '🐧': 'Pinguin', '🐰': 'Hase', '🐻': 'Bär', '🦉': 'Eule',
  '🐢': 'Schildkröte', '🐞': 'Marienkäfer', '🦖': 'Dino', '🐬': 'Delfin', '🦋': 'Schmetterling', '🐨': 'Koala',
}
export const COLOR_NAMES: Record<string, string> = {
  '#ffd166': 'Gelb', '#ff9f80': 'Koralle', '#f78fb3': 'Rosa', '#c3b1ff': 'Lila', '#7fd8c8': 'Türkis',
  '#8fd3ff': 'Hellblau', '#b5e06b': 'Hellgrün', '#ffb85c': 'Orange', '#e8a0ff': 'Violett',
}
export const emojiName = (e: string) => EMOJI_NAMES[e] ?? 'Tier'
export const colorName = (c: string) => COLOR_NAMES[c] ?? 'Farbe'
