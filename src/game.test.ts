import { describe, expect, it } from 'vitest'
import { addRound, currentDealer, dealerIndex, isOver, newGame, playerStats, ranking, status, totals, undoLastRound, updateEntry } from './game'
import { bustEntry, manualEntry } from './scoring'
import type { Entry, Game, Player } from './types'

const players: Player[] = ['Anna', 'Ben', 'Cleo'].map((name, i) => ({ id: `p${i}`, name, emoji: '🦊', color: '#fff' }))
// game.ts prüft keine Eingaben (das macht scoring.ts) — hier direkt Punktwerte, auch über 171, damit wenige Runden reichen.
const raw = (points: number): Entry => ({ points, bust: false, flip7: false, manual: true })
const scores = (a: number, b: number, c: number) => ({ p0: raw(a), p1: raw(b), p2: raw(c) })
const fresh = (target = 200, firstDealer = 0): Game => newGame(players, target, firstDealer, 1000)

describe('Summen und Geber', () => {
  it('summiert Runde für Runde', () => {
    const g = addRound(addRound(fresh(), scores(10, 20, 30)), scores(5, 0, 12))
    expect(totals(g)).toEqual({ p0: 15, p1: 20, p2: 42 })
  })
  it('verzockt zählt 0', () => {
    const g = addRound(fresh(), { p0: bustEntry(), p1: manualEntry(9, false), p2: manualEntry(1, false) })
    expect(totals(g).p0).toBe(0)
  })
  it('Geber rückt jede Runde einen Platz weiter und beginnt beim gewählten Startgeber', () => {
    const g = fresh(200, 1)
    expect([0, 1, 2, 3].map((r) => dealerIndex(g, r))).toEqual([1, 2, 0, 1])
    expect(currentDealer(addRound(g, scores(1, 1, 1))).name).toBe('Cleo')
  })
})

describe('Spielende', () => {
  it('läuft weiter unter dem Ziel', () => expect(status(addRound(fresh(), scores(199, 50, 10))).kind).toBe('running'))
  it('endet bei Ziel erreicht mit eindeutiger Spitze', () => {
    const g = addRound(fresh(), scores(200, 50, 10))
    expect(status(g)).toEqual({ kind: 'over', winnerId: 'p0' })
    expect(g.endedAt).toBeDefined()
  })
  it('gewinnt die höchste Summe, nicht wer zuerst das Ziel erreicht', () => {
    const g = addRound(addRound(fresh(), scores(150, 190, 0)), scores(60, 40, 0))
    expect(status(g)).toEqual({ kind: 'over', winnerId: 'p1' }) // Anna 210, Ben 230 → Ben gewinnt
  })
  it('Gleichstand an der Spitze → weitere Runde mit allen', () => {
    const g = addRound(fresh(), scores(200, 200, 10))
    expect(status(g)).toEqual({ kind: 'tie', leaderIds: ['p0', 'p1'] })
    expect(isOver(g)).toBe(false)
    expect(g.endedAt).toBeUndefined()
  })
  it('Gleichstand wird in der nächsten Runde aufgelöst', () => {
    const g = addRound(addRound(fresh(), scores(200, 200, 10)), scores(5, 12, 0))
    expect(status(g)).toEqual({ kind: 'over', winnerId: 'p1' })
  })
  it('anderes Ziel funktioniert', () => expect(isOver(addRound(fresh(100), scores(100, 3, 4)))).toBe(true))
})

describe('Rückgängig und Bearbeiten', () => {
  it('Rückgängig nimmt das Spielende zurück', () => {
    const over = addRound(fresh(), scores(210, 0, 0))
    const back = undoLastRound(over)
    expect(back.rounds).toHaveLength(0)
    expect(back.endedAt).toBeUndefined()
  })
  it('Bearbeiten kann ein Spiel beenden oder wieder öffnen', () => {
    const g = addRound(fresh(), scores(150, 20, 10))
    const roundId = g.rounds[0].id
    const finished = updateEntry(g, roundId, 'p0', raw(205))
    expect(isOver(finished)).toBe(true)
    const reopened = updateEntry(finished, roundId, 'p0', raw(10))
    expect(isOver(reopened)).toBe(false)
    expect(reopened.endedAt).toBeUndefined()
  })
  it('verändert das Original nicht', () => {
    const g = addRound(fresh(), scores(1, 2, 3))
    updateEntry(g, g.rounds[0].id, 'p0', raw(99))
    expect(totals(g).p0).toBe(1)
  })
})

describe('Ranking', () => {
  it('sortiert nach Punkten, gleiche Punkte teilen den Platz', () => {
    const r = ranking(addRound(fresh(), scores(30, 50, 30)))
    expect(r.map((x) => [x.player.name, x.rank])).toEqual([['Ben', 1], ['Anna', 2], ['Cleo', 2]])
  })
})

describe('Statistik', () => {
  it('zählt Spiele, Siege, Flip 7 und Verzockt pro Name', () => {
    const flip = { ...manualEntry(60, true) }
    const g = addRound(addRound(fresh(), { p0: flip, p1: bustEntry(), p2: manualEntry(5, false) }), scores(150, 10, 10))
    const stats = playerStats([g])
    const anna = stats.find((s) => s.name === 'Anna')!
    expect(anna).toMatchObject({ games: 1, wins: 1, rounds: 2, totalPoints: 210, bestRound: 150, flip7s: 1, busts: 0 })
    expect(stats.find((s) => s.name === 'Ben')).toMatchObject({ wins: 0, busts: 1 })
    expect(stats[0].name).toBe('Anna')
  })
})
