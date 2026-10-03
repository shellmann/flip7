import { Crown, Undo2 } from 'lucide-react'
import { currentDealer, draftCount, isDraftComplete, ranking, status, totals } from './game'
import type { Entry, Game } from './types'

type Props = {
  game: Game
  finished: boolean // Spiel ist beendet, wir schauen nur auf die Übersicht
  onEnterRound: () => void
  onPlayerOut: (playerId: string) => void // Spieler ist schon fertig (Stopp, Freeze, verzockt) → sofort eintragen
  onUndo: () => void
  onEditEntry: (roundId: string, playerId: string) => void
  onShowResult: () => void
}

const label = (e: { bust: boolean; flip7: boolean; points: number }) => (e.bust ? '💥' : e.flip7 ? `⭐${e.points}` : String(e.points))

const roundStatus = (e: Entry) => (e.bust ? 'Diese Runde: 💥 verzockt' : e.flip7 ? `Diese Runde: ⭐ +${e.points} (Flip 7)` : `Diese Runde: +${e.points} ✓`)

export default function Scoreboard({ game, finished, onEnterRound, onPlayerOut, onUndo, onEditEntry, onShowResult }: Props) {
  const sums = totals(game)
  const st = status(game)
  const best = Math.max(...Object.values(sums))
  const dealer = currentDealer(game)
  const rankOf = new Map(ranking(game).map((r) => [r.player.id, r.rank]))
  const tied = st.kind === 'tie'
  const entered = draftCount(game)
  const open = !finished && entered > 0
  const roundNo = game.rounds.length + 1
  const mainLabel = isDraftComplete(game)
    ? `Runde ${roundNo} abschließen ✓`
    : entered > 0
      ? `Runde ${roundNo}: Rest eintragen (${entered} von ${game.players.length} fertig)`
      : `Runde ${roundNo} eintragen`

  return (
    <div className="stack">
      <div className="round-head">
        <h2 className="screen-title">{finished ? 'Spiel beendet' : `Runde ${game.rounds.length + 1}`}</h2>
        <span className="muted">Ziel: {game.target} Punkte</span>
      </div>
      {!finished && <p className="note">Ist jemand fertig? Tippe auf den Namen und trag die Punkte gleich ein.</p>}

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
          const draftEntry = game.draft?.[p.id]
          const content = (
            <>
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
                {open && (
                  <span className={`round-status ${draftEntry ? 'is-done' : ''}`}>{draftEntry ? roundStatus(draftEntry) : '⏳ spielt noch'}</span>
                )}
              </div>
              <strong className="board-total">{total}</strong>
            </>
          )
          const rowClass = `board-row ${leading ? 'is-leading' : ''}`
          const style = { ['--player' as string]: p.color }
          return (
            <li key={p.id}>
              {finished ? (
                <div className={rowClass} style={style}>{content}</div>
              ) : (
                <button
                  type="button"
                  className={`${rowClass} board-row-btn`}
                  style={style}
                  aria-label={`${p.name}, ${total} Punkte${draftEntry ? `, ${roundStatus(draftEntry)}` : ''}. Ergebnis dieser Runde eintragen`}
                  onClick={() => onPlayerOut(p.id)}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {finished ? (
        <button type="button" className="btn btn-primary btn-wide btn-xl" onClick={onShowResult}>🏆 Zum Spielende</button>
      ) : (
        <button type="button" className="btn btn-primary btn-wide btn-xl" onClick={onEnterRound}>
          {mainLabel}
        </button>
      )}

      {game.rounds.length > 0 && (
        <section className="panel">
          <div className="panel-head">
            <h3>Alle Runden</h3>
            <button type="button" className="btn btn-secondary btn-small" disabled={entered > 0} onClick={onUndo}>
              <Undo2 size={20} aria-hidden /> Letzte Runde zurück
            </button>
          </div>
          {entered > 0 && <p className="note">„Letzte Runde zurück“ geht erst, wenn die laufende Runde abgeschlossen oder verworfen ist.</p>}
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
