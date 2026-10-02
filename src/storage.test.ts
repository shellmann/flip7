import { describe, expect, it } from 'vitest'
import { addRound, newGame, undoLastRound } from './game'
import { emptyData, rememberPlayers, withGame } from './storage'
import type { Entry, Player } from './types'

const players: Player[] = ['Anna', 'Ben'].map((name, i) => ({ id: `p${i}`, name, emoji: '🦊', color: '#fff' }))
const raw = (points: number): Entry => ({ points, bust: false, flip7: false, manual: true })

describe('withGame', () => {
  it('nimmt ein beendetes Spiel in den Verlauf auf und bei Rückgängig wieder heraus', () => {
    const running = newGame(players, 200, 0)
    const done = addRound(running, { p0: raw(210), p1: raw(5) })
    const a = withGame(emptyData(), done)
    expect(a.history.map((g) => g.id)).toEqual([done.id])
    const b = withGame(a, undoLastRound(done))
    expect(b.history).toHaveLength(0)
    expect(b.current?.id).toBe(done.id)
  })
  it('legt ein beendetes Spiel nie doppelt ab', () => {
    const done = addRound(newGame(players, 200, 0), { p0: raw(210), p1: raw(5) })
    expect(withGame(withGame(emptyData(), done), done).history).toHaveLength(1)
  })
  it('Spiel verlassen (null) lässt den Verlauf unberührt', () => {
    const done = addRound(newGame(players, 200, 0), { p0: raw(210), p1: raw(5) })
    const out = withGame(withGame(emptyData(), done), null)
    expect(out.current).toBeNull()
    expect(out.history).toHaveLength(1)
  })
})

describe('rememberPlayers', () => {
  it('stellt zuletzt gespielte nach vorn, ohne Duplikate (Groß/Klein egal)', () => {
    const d = rememberPlayers(emptyData(), [{ name: 'Ben', emoji: '🐼', color: '#fff' }, { name: 'anna', emoji: '🦊', color: '#fff' }])
    const d2 = rememberPlayers(d, [{ name: 'Anna', emoji: '🐸', color: '#000' }])
    expect(d2.recentPlayers.map((p) => p.name)).toEqual(['Anna', 'Ben'])
    expect(d2.recentPlayers[0].emoji).toBe('🐸')
  })
})
