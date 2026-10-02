import { bustEntry, cardsEntry, manualEntry } from './scoring'
import type { Entry } from './types'

export type PickerState = {
  mode: 'cards' | 'manual'
  numbers: number[]
  modifiers: number[]
  x2: boolean
  bust: boolean
  manualText: string // Ziffern der Tastatur, höchstens 3
  manualFlip7: boolean
}

export const emptyPicker = (): PickerState => ({
  mode: 'cards', numbers: [], modifiers: [], x2: false, bust: false, manualText: '', manualFlip7: false,
})

export function pickerFromEntry(entry?: Entry): PickerState {
  if (!entry) return emptyPicker()
  if (entry.manual) {
    return { ...emptyPicker(), mode: 'manual', bust: entry.bust, manualText: entry.bust ? '' : String(entry.points), manualFlip7: entry.flip7 }
  }
  return {
    ...emptyPicker(),
    bust: entry.bust,
    numbers: entry.cards?.numbers ?? [],
    modifiers: entry.cards?.modifiers ?? [],
    x2: entry.cards?.x2 ?? false,
  }
}

export function pickerToEntry(s: PickerState): Entry {
  if (s.mode === 'manual') return manualEntry(Number.parseInt(s.manualText || '0', 10), s.manualFlip7, s.bust)
  if (s.bust) return bustEntry()
  return cardsEntry({ numbers: s.numbers, modifiers: s.modifiers, x2: s.x2 })
}

export const toggleIn = (list: number[], value: number): number[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

// Tastatur: höchstens 3 Ziffern, keine führende Null, Obergrenze 171 (höchste mögliche Rundenpunktzahl).
export function pressKey(text: string, key: string): string {
  if (key === 'back') return text.slice(0, -1)
  if (key === 'clear') return ''
  const next = text === '0' ? key : text + key
  if (next.length > 3) return text
  return Number.parseInt(next, 10) > 171 ? '171' : next
}
