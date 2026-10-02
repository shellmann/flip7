export type Cards = { numbers: number[]; modifiers: number[]; x2: boolean }

export type Entry = {
  points: number
  bust: boolean
  flip7: boolean
  manual: boolean
  cards?: Cards
}

export type Player = { id: string; name: string; emoji: string; color: string }
export type Round = { id: string; entries: Record<string, Entry> }

export type Game = {
  id: string
  startedAt: number
  endedAt?: number
  target: number
  players: Player[]
  firstDealer: number
  rounds: Round[]
}

export type RecentPlayer = Omit<Player, 'id'>

export type AppData = {
  version: 1
  current: Game | null
  history: Game[]
  recentPlayers: RecentPlayer[]
}
