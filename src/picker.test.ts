import { describe, expect, it } from 'vitest'
import { emptyPicker, hasInput, pickerFromEntry, pickerToEntry, pressKey, toggleIn } from './picker'
import { bustEntry, cardsEntry, manualEntry } from './scoring'

describe('pickerToEntry / pickerFromEntry', () => {
  it('Karten: rechnet und erkennt Flip 7', () => {
    const e = pickerToEntry({ ...emptyPicker(), numbers: [1, 2, 3, 4, 5, 6, 7], modifiers: [2], x2: true })
    expect(e).toMatchObject({ points: 28 * 2 + 2 + 15, flip7: true, bust: false, manual: false })
  })
  it('Verzockt überstimmt die Karten', () => {
    expect(pickerToEntry({ ...emptyPicker(), numbers: [12, 11], bust: true })).toMatchObject({ points: 0, bust: true })
  })
  it('Manuell: Zahl und Flip-7-Haken', () => {
    expect(pickerToEntry({ ...emptyPicker(), mode: 'manual', manualText: '47', manualFlip7: true })).toMatchObject({ points: 47, flip7: true, manual: true })
    expect(pickerToEntry({ ...emptyPicker(), mode: 'manual', manualText: '' }).points).toBe(0)
  })
  it('Rundreise: Eintrag → Zustand → Eintrag bleibt gleich', () => {
    for (const e of [
      cardsEntry({ numbers: [3, 9], modifiers: [4], x2: true }),
      bustEntry(),
      manualEntry(55, true),
      manualEntry(0, false, true),
    ]) {
      expect(pickerToEntry(pickerFromEntry(e))).toEqual(e)
    }
  })
})

describe('Tastatur', () => {
  it('hängt Ziffern an, begrenzt auf 3 Stellen und 171', () => {
    expect(pressKey(pressKey('', '4'), '7')).toBe('47')
    expect(pressKey('171', '5')).toBe('171')
    expect(pressKey('17', '9')).toBe('171')
    expect(pressKey('99', '9')).toBe('171')
  })
  it('keine führende Null, Löschen und Zurück', () => {
    expect(pressKey('0', '5')).toBe('5')
    expect(pressKey('47', 'back')).toBe('4')
    expect(pressKey('47', 'clear')).toBe('')
  })
})

it('toggleIn schaltet um', () => {
  expect(toggleIn([1, 2], 3)).toEqual([1, 2, 3])
  expect(toggleIn([1, 2, 3], 2)).toEqual([1, 3])
})

describe('hasInput', () => {
  it('leerer Zustand hat keine Eingabe', () => {
    expect(hasInput(emptyPicker())).toBe(false)
    expect(hasInput({ ...emptyPicker(), mode: 'manual' })).toBe(false)
  })
  it('Karten, Bonuskarten, ×2 und die Karte 0 zählen als Eingabe', () => {
    expect(hasInput({ ...emptyPicker(), numbers: [0] })).toBe(true)
    expect(hasInput({ ...emptyPicker(), modifiers: [4] })).toBe(true)
    expect(hasInput({ ...emptyPicker(), x2: true })).toBe(true)
  })
  it('manuell zählt jede eingetippte Zahl, auch 0', () => {
    expect(hasInput({ ...emptyPicker(), mode: 'manual', manualText: '0' })).toBe(true)
  })
  it('Verzockt zählt immer als Eingabe', () => {
    expect(hasInput({ ...emptyPicker(), bust: true })).toBe(true)
    expect(hasInput({ ...emptyPicker(), mode: 'manual', bust: true })).toBe(true)
  })
  it('es zählt nur die aktive Eingabeart', () => {
    expect(hasInput({ ...emptyPicker(), mode: 'manual', numbers: [5] })).toBe(false)
    expect(hasInput({ ...emptyPicker(), manualText: '12' })).toBe(false)
  })
  it('ein vorhandener Eintrag zum Korrigieren ist schon eine Eingabe', () => {
    expect(hasInput(pickerFromEntry(cardsEntry({ numbers: [3], modifiers: [], x2: false })))).toBe(true)
    expect(hasInput(pickerFromEntry(manualEntry(0, false)))).toBe(true)
  })
})
