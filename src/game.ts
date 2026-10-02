import type { Entry, Game, Player, Round } from './types'

export const TARGETS = [100, 150, 200, 300] as const
export const DEFAULT_TARGET = 200
export const MAX_PLAYERS = 18
export const MIN_PLAYERS = 2

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function totals(game: Game): Record<string, number> {
  const sums: Record<string, number> = Object.fromEntries(game.players.map((p) => [p.id, 0]))
  for (const round of game.rounds) {
    for (const p of game.players) sums[p.id] += round.entries[p.id]?.points ?? 0
  }
  return sums
}

// Die Karten wandern nach links: die gebende Person rückt jede Runde einen Platz weiter.
export function dealerIndex(game: Game, roundIndex: number): number {
  return (game.firstDealer + roundIndex) % game.players.length
}

export const currentDealer = (game: Game): Player => game.players[dealerIndex(game, game.rounds.length)]

export type Status =
  | { kind: 'running' }
  | { kind: 'tie'; leaderIds: string[] } // Ziel erreicht, aber Gleichstand an der Spitze → noch eine Runde mit allen
  | { kind: 'over'; winnerId: string }

// Das Spielende wird nur am Rundenende geprüft: mindestens ein Ergebnis >= Ziel, dann gewinnt die höchste Summe.
export function status(game: Game): Status {
  if (game.rounds.length === 0) return { kind: 'running' }
  const sums = totals(game)
  const max = Math.max(...Object.values(sums))
  if (max < game.target) return { kind: 'running' }
  const leaderIds = game.players.filter((p) => sums[p.id] === max).map((p) => p.id)
  return leaderIds.length === 1 ? { kind: 'over', winnerId: leaderIds[0] } : { kind: 'tie', leaderIds }
}

export const isOver = (game: Game) => status(game).kind === 'over'

export type RankedPlayer = { player: Player; total: number; rank: number }

export function ranking(game: Game): RankedPlayer[] {
  const sums = totals(game)
  const sorted = game.players
    .map((player) => ({ player, total: sums[player.id] }))
    .sort((a, b) => b.total - a.total) // stabil: bei Gleichstand bleibt die Sitzreihenfolge
  return sorted.map((r) => ({ ...r, rank: sorted.findIndex((s) => s.total === r.total) + 1 }))
}

export function newGame(players: Player[], target: number, firstDealer: number, now = Date.now()): Game {
  return { id: newId(), startedAt: now, target, players, firstDealer, rounds: [] }
}

// endedAt immer aus dem Ergebnis ableiten, damit Rückgängig/Bearbeiten das Spielende korrekt neu bewerten.
function settle(game: Game, now: number): Game {
  const over = isOver(game)
  if (over && game.endedAt === undefined) return { ...game, endedAt: now }
  if (!over && game.endedAt !== undefined) {
    const { endedAt: _drop, ...rest } = game
    return rest
  }
  return game
}

export function addRound(game: Game, entries: Record<string, Entry>, now = Date.now()): Game {
  const round: Round = { id: newId(), entries }
  return settle({ ...game, rounds: [...game.rounds, round] }, now)
}

export function updateEntry(game: Game, roundId: string, playerId: string, entry: Entry, now = Date.now()): Game {
  const rounds = game.rounds.map((r) => (r.id === roundId ? { ...r, entries: { ...r.entries, [playerId]: entry } } : r))
  return settle({ ...game, rounds }, now)
}

export function undoLastRound(game: Game, now = Date.now()): Game {
  return settle({ ...game, rounds: game.rounds.slice(0, -1) }, now)
}

export type PlayerStats = {
  name: string
  emoji: string
  games: number
  wins: number
  rounds: number
  totalPoints: number
  bestRound: number
  flip7s: number
  busts: number
}

// Statistik pro Spielername über alle abgeschlossenen Spiele (Spieler-IDs sind pro Spiel neu).
export function playerStats(history: Game[]): PlayerStats[] {
  const byName = new Map<string, PlayerStats>()
  for (const game of history) {
    const st = status(game)
    for (const p of game.players) {
      const s =
        byName.get(p.name) ??
        { name: p.name, emoji: p.emoji, games: 0, wins: 0, rounds: 0, totalPoints: 0, bestRound: 0, flip7s: 0, busts: 0 }
      s.emoji = p.emoji
      s.games += 1
      if (st.kind === 'over' && st.winnerId === p.id) s.wins += 1
      for (const r of game.rounds) {
        const e = r.entries[p.id]
        if (!e) continue
        s.rounds += 1
        s.totalPoints += e.points
        s.bestRound = Math.max(s.bestRound, e.points)
        if (e.flip7) s.flip7s += 1
        if (e.bust) s.busts += 1
      }
      byName.set(p.name, s)
    }
  }
  return [...byName.values()].sort((a, b) => b.wins - a.wins || b.games - a.games || a.name.localeCompare(b.name, 'de'))
}

export const averagePerRound = (s: PlayerStats) => (s.rounds === 0 ? 0 : Math.round(s.totalPoints / s.rounds))
