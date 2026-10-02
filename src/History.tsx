import { useState } from 'react'
import { averagePerRound, playerStats, ranking, status, totals } from './game'
import type { Game } from './types'

type Props = { history: Game[]; onClose: () => void }

const date = (ts: number) => new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function History({ history, onClose }: Props) {
  const [tab, setTab] = useState<'games' | 'stats'>('games')
  const stats = playerStats(history)

  return (
    <div className="sheet">
      <div className="sheet-inner">
        <h2 className="sheet-title">Verlauf & Statistik</h2>

        <div className="segmented" role="group" aria-label="Ansicht">
          <button type="button" className={`seg ${tab === 'games' ? 'is-on' : ''}`} aria-pressed={tab === 'games'} onClick={() => setTab('games')}>Spiele</button>
          <button type="button" className={`seg ${tab === 'stats' ? 'is-on' : ''}`} aria-pressed={tab === 'stats'} onClick={() => setTab('stats')}>Statistik</button>
        </div>

        {history.length === 0 ? (
          <p className="note">Noch keine beendeten Spiele. Sobald ein Spiel zu Ende ist, taucht es hier auf.</p>
        ) : tab === 'games' ? (
          <ul className="history">
            {history.map((g) => {
              const st = status(g)
              const winner = st.kind === 'over' ? g.players.find((p) => p.id === st.winnerId) : undefined
              const sums = totals(g)
              return (
                <li key={g.id} className="panel">
                  <div className="panel-head">
                    <strong>{winner ? `${winner.emoji} ${winner.name} gewann` : 'Spiel beendet'}</strong>
                    <span className="muted">{date(g.endedAt ?? g.startedAt)}</span>
                  </div>
                  <p className="muted">{g.rounds.length} Runden · Ziel {g.target}</p>
                  <div className="chips">
                    {ranking(g).map((r) => (
                      <span key={r.player.id} className="chip chip-static" style={{ ['--player' as string]: r.player.color }}>
                        {r.player.emoji} {r.player.name} <strong>{sums[r.player.id]}</strong>
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="history">
            {stats.map((s) => (
              <li key={s.name} className="panel">
                <strong className="stat-name">{s.emoji} {s.name}</strong>
                <p>{s.games} {s.games === 1 ? 'Spiel' : 'Spiele'} · 🏆 {s.wins} {s.wins === 1 ? 'Sieg' : 'Siege'}</p>
                <p className="muted">
                  Ø {averagePerRound(s)} pro Runde · beste Runde {s.bestRound} · ⭐ {s.flip7s}× Flip 7 · 💥 {s.busts}× verzockt
                </p>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="btn btn-primary btn-wide btn-xl" onClick={onClose}>Fertig</button>
      </div>
    </div>
  )
}
