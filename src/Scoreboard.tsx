import { Crown, Undo2 } from 'lucide-react'
import { currentDealer, ranking, status, totals } from './game'
import type { Game } from './types'

type Props = {
  game: Game
  finished: boolean // Spiel ist beendet, wir schauen nur auf die Übersicht
  onEnterRound: () => void
  onUndo: () => void
  onEditEntry: (roundId: string, playerId: string) => void
  onShowResult: () => void
}

const label = (e: { bust: boolean; flip7: boolean; points: number }) => (e.bust ? '💥' : e.flip7 ? `⭐${e.points}` : String(e.points))

export default function Scoreboard({ game, finished, onEnterRound, onUndo, onEditEntry, onShowResult }: Props) {
  const sums = totals(game)
  const st = status(game)
  const best = Math.max(...Object.values(sums))
  const dealer = currentDealer(game)
  const rankOf = new Map(ranking(game).map((r) => [r.player.id, r.rank]))
  const tied = st.kind === 'tie'

  return (
    <div className="stack">
      <div className="round-head">
        <h2 className="screen-title">{finished ? 'Spiel beendet' : `Runde ${game.rounds.length + 1}`}</h2>
        <span className="muted">Ziel: {game.target} Punkte</span>
      </div>

      {tied && (
        <p className="banner" role="status">
          🤝 Gleichstand an der Spitze! Spielt noch eine Runde mit allen, bis es einen Sieger gibt.
        </p>
      )}

      <ul className="board">
        {game.players.map((p) => {
          const total = sums[p.id]
          const left = game.target - total
          const isDealer = !finished && dealer.id === p.id
          const leading = game.rounds.length > 0 && total === best && best > 0
          return (
            <li key={p.id} className={`board-row ${leading ? 'is-leading' : ''}`} style={{ ['--player' as string]: p.color }}>
              <span className="avatar" aria-hidden>{p.emoji}</span>
              <div className="board-main">
                <div className="board-name">
                  <strong>{p.name}</strong>
                  {leading && <Crown size={20} aria-label="Führt" />}
                  {isDealer && <span className="badge">🃏 Gibt</span>}
                </div>
                <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={game.target} aria-valuenow={Math.min(total, game.target)}>
                  <span style={{ width: `${Math.max(0, Math.min(100, (total / game.target) * 100))}%` }} />
                </div>
                <span className="muted">{left > 0 ? `Noch ${left} bis zum Ziel` : `Ziel erreicht! Platz ${rankOf.get(p.id)}`}</span>
              </div>
              <strong className="board-total">{total}</strong>
            </li>
          )
        })}
      </ul>

      {finished ? (
        <button type="button" className="btn btn-primary btn-wide btn-xl" onClick={onShowResult}>🏆 Zum Spielende</button>
      ) : (
        <button type="button" className="btn btn-primary btn-wide btn-xl" onClick={onEnterRound}>
          Runde {game.rounds.length + 1} eintragen
        </button>
      )}

      {game.rounds.length > 0 && (
        <section className="panel">
          <div className="panel-head">
            <h3>Alle Runden</h3>
            <button type="button" className="btn btn-secondary btn-small" onClick={onUndo}>
              <Undo2 size={20} aria-hidden /> Letzte Runde zurück
            </button>
          </div>
          <p className="note">Tippe auf eine Zahl, um sie zu ändern.</p>
          <ol className="rounds" reversed start={game.rounds.length}>
            {[...game.rounds].reverse().map((round, idx) => (
              <li key={round.id} className="round-card">
                <strong>Runde {game.rounds.length - idx}</strong>
                <div className="round-cells">
                  {game.players.map((p) => {
                    const e = round.entries[p.id]
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className="cell"
                        style={{ ['--player' as string]: p.color }}
                        aria-label={`${p.name}, Runde ${game.rounds.length - idx}: ${e.bust ? 'verzockt' : `${e.points} Punkte`}. Ändern`}
                        onClick={() => onEditEntry(round.id, p.id)}
                      >
                        <span aria-hidden>{p.emoji}</span>
                        <strong>{label(e)}</strong>
                      </button>
                    )
                  })}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
