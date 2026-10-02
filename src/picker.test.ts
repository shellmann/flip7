import { describe, expect, it } from 'vitest'
import { emptyPicker, pickerFromEntry, pickerToEntry, pressKey, toggleIn } from './picker'
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
