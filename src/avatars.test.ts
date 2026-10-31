import { describe, expect, it } from 'vitest'
import { COLORS, COLOR_NAMES, EMOJIS, EMOJI_NAMES, nextUnused } from './avatars'

describe('avatars', () => {
  it('jedes Tier und jede Farbe hat einen Namen für Screenreader', () => {
    expect(EMOJIS.every((e) => EMOJI_NAMES[e])).toBe(true)
    expect(COLORS.every((c) => COLOR_NAMES[c])).toBe(true)
  })
  it('keine doppelten Tiere oder Farben in den Listen', () => {
    expect(new Set(EMOJIS).size).toBe(EMOJIS.length)
    expect(new Set(COLORS).size).toBe(COLORS.length)
  })
  it('nextUnused überspringt vergebene Werte', () => {
    expect(nextUnused(['a', 'b', 'c'], undefined, ['a'])).toBe('b')
    expect(nextUnused(['a', 'b', 'c'], 'b', ['c'])).toBe('a')
  })
})
