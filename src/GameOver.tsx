import Celebrate from './Celebrate'
import { ranking, status } from './game'
import type { Game } from './types'

type Props = {
  game: Game
  onSamePlayers: () => void
  onOverview: () => void
  onNewGame: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function GameOver({ game, onSamePlayers, onOverview, onNewGame }: Props) {
  const st = status(game)
  const ranked = ranking(game)
  const winner = st.kind === 'over' ? game.players.find((p) => p.id === st.winnerId) : undefined

  return (
    <div className="stack">
      <Celebrate count={60} />
      <section className="winner" style={{ ['--player' as string]: winner?.color }}>
        <span className="winner-emoji" aria-hidden>{winner?.emoji ?? '🏆'}</span>
        <h2>{winner ? `${winner.name} gewinnt!` : 'Spiel beendet'}</h2>
        <p className="muted">nach {game.rounds.length} {game.rounds.length === 1 ? 'Runde' : 'Runden'}</p>
      </section>

      <ol className="ranking">
        {ranked.map((r) => (
          <li key={r.player.id} className="board-row" style={{ ['--player' as string]: r.player.color }}>
            <span className="rank" aria-label={`Platz ${r.rank}`}>{MEDALS[r.rank - 1] ?? `${r.rank}.`}</span>
            <span className="avatar" aria-hidden>{r.player.emoji}</span>
            <strong className="board-main">{r.player.name}</strong>
            <strong className="board-total">{r.total}</strong>
          </li>
        ))}
      </ol>

      <button type="button" className="btn btn-primary btn-wide btn-xl" onClick={onSamePlayers}>Noch ein Spiel – gleiche Spieler</button>
      <button type="button" className="btn btn-secondary btn-wide" onClick={onOverview}>Punkte & Runden ansehen</button>
      <div className="spacer-lg" />
      <button type="button" className="btn btn-secondary btn-wide" onClick={onNewGame}>Neue Spieler</button>
    </div>
  )
}
