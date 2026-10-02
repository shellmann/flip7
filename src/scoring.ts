import type { Cards, Entry } from './types'

export const NUMBER_CARDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
export const PLUS_CARDS = [2, 4, 6, 8, 10] as const
export const FLIP7_COUNT = 7
export const FLIP7_BONUS = 15
export const MAX_ROUND_POINTS = 171 // 12+11+10+9+8+7+6 = 63, x2 = 126, +30 Bonuskarten, +15 Flip 7

export type Breakdown = {
  numberSum: number
  doubled: boolean
  numberTotal: number // Zahlensumme nach ×2
  modifierSum: number
  flip7Bonus: number
  total: number
}

export const emptyCards = (): Cards => ({ numbers: [], modifiers: [], x2: false })

export function validateCards(cards: Cards): string | null {
  const { numbers, modifiers } = cards
  if (numbers.some((n) => !Number.isInteger(n) || n < 0 || n > 12)) return 'Zahlenkarten gehen von 0 bis 12.'
  if (new Set(numbers).size !== numbers.length) return 'Jede Zahl gibt es nur einmal pro Runde (sonst verzockt).'
  if (numbers.length > FLIP7_COUNT) return 'Mehr als 7 verschiedene Zahlen gibt es nicht.'
  if (modifiers.some((m) => !(PLUS_CARDS as readonly number[]).includes(m))) return 'Unbekannte Bonuskarte.'
  if (new Set(modifiers).size !== modifiers.length) return 'Jede Bonuskarte gibt es nur einmal.'
  return null
}

export const isFlip7 = (cards: Cards) => new Set(cards.numbers).size === FLIP7_COUNT

// ×2 verdoppelt nur die Zahlensumme, danach kommen die +-Karten, zuletzt die +15 (nie verdoppelt).
export function scoreCards(cards: Cards): Breakdown {
  const numberSum = cards.numbers.reduce((a, b) => a + b, 0)
  const numberTotal = cards.x2 ? numberSum * 2 : numberSum
  const modifierSum = cards.modifiers.reduce((a, b) => a + b, 0)
  const flip7Bonus = isFlip7(cards) ? FLIP7_BONUS : 0
  return {
    numberSum,
    doubled: cards.x2,
    numberTotal,
    modifierSum,
    flip7Bonus,
    total: numberTotal + modifierSum + flip7Bonus,
  }
}

export const bustEntry = (): Entry => ({ points: 0, bust: true, flip7: false, manual: false })

export function cardsEntry(cards: Cards): Entry {
  return {
    points: scoreCards(cards).total,
    bust: false,
    flip7: isFlip7(cards),
    manual: false,
    cards: { numbers: [...cards.numbers].sort((a, b) => a - b), modifiers: [...cards.modifiers].sort((a, b) => a - b), x2: cards.x2 },
  }
}

export function manualEntry(points: number, flip7: boolean, bust = false): Entry {
  if (bust) return { points: 0, bust: true, flip7: false, manual: true }
  const clamped = Math.max(0, Math.min(MAX_ROUND_POINTS, Math.round(points) || 0))
  return { points: clamped, bust: false, flip7, manual: true }
}

// Lesbare Formel für die Live-Vorschau, z. B. "36 ×2 = 72 + 10 + 15 = 97".
export function describe(b: Breakdown): string {
  const parts = [b.doubled ? `${b.numberSum} ×2 = ${b.numberTotal}` : `${b.numberSum}`]
  if (b.modifierSum > 0) parts.push(`+ ${b.modifierSum}`)
  if (b.flip7Bonus > 0) parts.push(`+ ${b.flip7Bonus}`)
  return parts.length === 1 && !b.doubled ? `${b.total}` : `${parts.join(' ')} = ${b.total}`
}
