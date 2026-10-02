import { describe as suite, expect, it } from 'vitest'
import { bustEntry, cardsEntry, describe, emptyCards, manualEntry, scoreCards, validateCards } from './scoring'

const c = (numbers: number[], modifiers: number[] = [], x2 = false) => ({ numbers, modifiers, x2 })

suite('scoreCards (Beispiele aus den Spielregeln)', () => {
  it('11+5+12 mit +4 = 32', () => expect(scoreCards(c([11, 5, 12], [4])).total).toBe(32))
  it('36 ×2 = 72', () => expect(scoreCards(c([12, 11, 10, 3], [], true)).total).toBe(72))
  it('36 +10 = 46', () => expect(scoreCards(c([12, 11, 10, 3], [10])).total).toBe(46))
  it('36 ×2 +10 = 82 (×2 gilt nur für Zahlen)', () => expect(scoreCards(c([12, 11, 10, 3], [10], true)).total).toBe(82))
  it('Flip 7 mit 3,11,5,7,10,9,4 = 49 + 15 = 64', () => expect(scoreCards(c([3, 11, 5, 7, 10, 9, 4])).total).toBe(64))
  it('Flip 7 mit 3,11,5,7,10,9,6 = 51 + 15 = 66', () => expect(scoreCards(c([3, 11, 5, 7, 10, 9, 6])).total).toBe(66))
  it('Flip 7 zählt die 0 mit', () => {
    const b = scoreCards(c([0, 1, 2, 3, 4, 5, 6]))
    expect(b.flip7Bonus).toBe(15)
    expect(b.total).toBe(21 + 15)
  })
  it('die +15 werden nie verdoppelt', () => expect(scoreCards(c([0, 1, 2, 3, 4, 5, 6], [], true)).total).toBe(42 + 15))
  it('Maximum ist 171', () => expect(scoreCards(c([12, 11, 10, 9, 8, 7, 6], [2, 4, 6, 8, 10], true)).total).toBe(171))
  it('×2 ohne Zahlen bringt 0', () => expect(scoreCards(c([], [], true)).total).toBe(0))
  it('+-Karten zählen auch ohne Zahlen', () => expect(scoreCards(c([], [6, 8])).total).toBe(14))
  it('leere Runde = 0', () => expect(scoreCards(emptyCards()).total).toBe(0))
})

suite('validateCards', () => {
  it('akzeptiert gültige Karten', () => expect(validateCards(c([1, 2, 3], [2, 10], true))).toBeNull())
  it('lehnt doppelte Zahlen ab', () => expect(validateCards(c([5, 5]))).not.toBeNull())
  it('lehnt Zahlen außerhalb 0–12 ab', () => {
    expect(validateCards(c([13]))).not.toBeNull()
    expect(validateCards(c([-1]))).not.toBeNull()
  })
  it('lehnt mehr als 7 Zahlen ab', () => expect(validateCards(c([0, 1, 2, 3, 4, 5, 6, 7]))).not.toBeNull())
  it('lehnt unbekannte oder doppelte Bonuskarten ab', () => {
    expect(validateCards(c([], [3]))).not.toBeNull()
    expect(validateCards(c([], [4, 4]))).not.toBeNull()
  })
})

suite('Einträge', () => {
  it('verzockt = 0 Punkte', () => expect(bustEntry()).toMatchObject({ points: 0, bust: true, flip7: false }))
  it('cardsEntry erkennt Flip 7 und sortiert', () => {
    const e = cardsEntry(c([7, 1, 2, 3, 4, 5, 6], [4], false))
    expect(e.flip7).toBe(true)
    expect(e.points).toBe(28 + 4 + 15)
    expect(e.cards?.numbers).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
  it('manualEntry begrenzt auf 0–171 und rundet', () => {
    expect(manualEntry(500, false).points).toBe(171)
    expect(manualEntry(-4, false).points).toBe(0)
    expect(manualEntry(Number.NaN, false).points).toBe(0)
    expect(manualEntry(33.6, true)).toMatchObject({ points: 34, flip7: true, manual: true })
  })
  it('manuell verzockt = 0 und kein Flip 7', () => expect(manualEntry(40, true, true)).toMatchObject({ points: 0, bust: true, flip7: false }))
})

suite('describe', () => {
  it('zeigt eine lesbare Formel', () => {
    expect(describe(scoreCards(c([12, 11, 10, 3], [10], true)))).toBe('36 ×2 = 72 + 10 = 82')
    expect(describe(scoreCards(c([5, 6])))).toBe('11')
  })
})
