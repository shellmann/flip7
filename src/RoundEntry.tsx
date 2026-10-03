import { useEffect, useState } from 'react'
import CardPicker from './CardPicker'
import Confirm from './Confirm'
import { isDraftComplete } from './game'
import { beginBusy, endBusy } from './update'
import { emptyPicker, pickerFromEntry, pickerToEntry, type PickerState } from './picker'
import type { Entry, Game } from './types'

export type EntryMode =
  | { mode: 'player'; playerId: string } // einzelner Spieler ist schon fertig (z. B. Freeze) — aus der Spielerzeile
  | { mode: 'round' } // alle, die noch fehlen, nacheinander; danach Übersicht zum Speichern
  | { mode: 'edit'; roundId: string; playerId: string } // Eintrag einer gespeicherten Runde korrigieren

type Props = {
  game: Game
  entry: EntryMode
  onSaveDraft: (playerId: string, entry: Entry) => void
  onRemoveDraft: (playerId: string) => void
  onSaveRound: () => void
  onDiscardRound: () => void
  onSaveEdit: (roundId: string, playerId: string, entry: Entry) => void
  onClose: () => void
}

const summary = (e: Entry) => (e.bust ? '💥 Verzockt' : e.flip7 ? `⭐ ${e.points} (Flip 7)` : `${e.points}`)

export default function RoundEntry({ game, entry, onSaveDraft, onRemoveDraft, onSaveRound, onDiscardRound, onSaveEdit, onClose }: Props) {
  const players = game.players
  const draft = game.draft ?? {}
  const roundNo = game.rounds.length + 1
  const indexOf = (id: string) => players.findIndex((p) => p.id === id)
  const firstPending = (exclude: string[] = []) => {
    const idx = players.findIndex((p) => !draft[p.id] && !exclude.includes(p.id))
    return idx === -1 ? null : idx
  }

  // Lokaler Zustand der Kartenwahl; Startwerte aus der offenen Runde bzw. dem zu korrigierenden Eintrag.
  const [pickers, setPickers] = useState<Record<string, PickerState>>(() => {
    if (entry.mode === 'edit') {
      const round = game.rounds.find((r) => r.id === entry.roundId)
      return { [entry.playerId]: pickerFromEntry(round?.entries[entry.playerId]) }
    }
    return Object.fromEntries(Object.entries(draft).map(([id, e]) => [id, pickerFromEntry(e)]))
  })
  const [active, setActive] = useState<number | null>(() => {
    if (entry.mode === 'round') return firstPending()
    return indexOf(entry.playerId)
  })
  const [visited, setVisited] = useState<number[]>([]) // Rückweg im Runden-Modus
  const [fromOverview, setFromOverview] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  // Während der Eingabe darf kein Update die Seite neu laden (siehe update.ts).
  useEffect(() => {
    beginBusy()
    return () => endBusy()
  }, [])

  const stateFor = (id: string) => pickers[id] ?? emptyPicker()
  const setState = (id: string, s: PickerState) => setPickers((prev) => ({ ...prev, [id]: s }))
  const resetToSaved = (id: string) =>
    setPickers((prev) => ({ ...prev, [id]: draft[id] ? pickerFromEntry(draft[id]) : emptyPicker() }))

  if (active !== null) {
    const player = players[active]
    const stateNow = stateFor(player.id)

    if (entry.mode === 'edit') {
      return (
        <div className="sheet">
          <CardPicker
            player={player}
            state={stateNow}
            onChange={(s) => setState(player.id, s)}
            step={`Runde ${game.rounds.findIndex((r) => r.id === entry.roundId) + 1} korrigieren`}
            backLabel="Abbrechen"
            nextLabel="Speichern ✓"
            onBack={onClose}
            onNext={() => onSaveEdit(entry.roundId, entry.playerId, pickerToEntry(stateNow))}
          />
        </div>
      )
    }

    const stayInGame = draft[player.id] ? (
      <button
        type="button"
        className="btn btn-secondary btn-wide"
        onClick={() => {
          onRemoveDraft(player.id)
          setState(player.id, emptyPicker())
          if (entry.mode === 'player') onClose()
          else setActive(null)
        }}
      >
        ↩ Doch noch im Spiel
      </button>
    ) : undefined

    if (entry.mode === 'player' || fromOverview) {
      return (
        <div className="sheet">
          <CardPicker
            player={player}
            state={stateNow}
            onChange={(s) => setState(player.id, s)}
            step={`Runde ${roundNo} · ist fertig`}
            backLabel={entry.mode === 'player' ? 'Zum Spielstand' : 'Übersicht'}
            nextLabel="Fertig ✓"
            onBack={() => {
              if (entry.mode === 'player') return onClose()
              resetToSaved(player.id)
              setActive(null)
            }}
            onNext={() => {
              onSaveDraft(player.id, pickerToEntry(stateNow))
              if (entry.mode === 'player') onClose()
              else setActive(null)
            }}
            extra={stayInGame}
          />
        </div>
      )
    }

    // Runden-Modus: nur die Spieler, die noch fehlen, der Reihe nach.
    const next = firstPending([player.id])
    return (
      <div className="sheet">
        <CardPicker
          player={player}
          state={stateNow}
          onChange={(s) => setState(player.id, s)}
          step={`Runde ${roundNo} · Spieler ${active + 1} von ${players.length}`}
          backLabel={visited.length === 0 ? 'Zum Spielstand' : 'Zurück'}
          nextLabel={next === null ? 'Fertig ✓' : `Weiter zu ${players[next].name}`}
          onBack={() => {
            if (visited.length === 0) return onClose()
            setActive(visited[visited.length - 1])
            setVisited(visited.slice(0, -1))
          }}
          onNext={() => {
            onSaveDraft(player.id, pickerToEntry(stateNow))
            setVisited([...visited, active])
            setActive(next)
          }}
        />
      </div>
    )
  }

  // Übersicht der offenen Runde: korrigieren, speichern, später weitermachen oder verwerfen.
  const complete = isDraftComplete(game)
  const entered = players.filter((p) => draft[p.id]).length
  return (
    <div className="sheet">
      <div className="sheet-inner">
        <h2 className="sheet-title">{complete ? `Runde ${roundNo}: Alles eingetragen?` : `Runde ${roundNo}: Zwischenstand`}</h2>
        <p className="note">
          {complete ? 'Tippe auf einen Namen, um die Punkte zu ändern.' : `${entered} von ${players.length} eingetragen. Tippe auf einen Namen, um Punkte einzutragen oder zu ändern.`}
        </p>
        <ul className="overview">
          {players.map((p, i) => {
            const e = draft[p.id]
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="overview-row"
                  style={{ ['--player' as string]: p.color }}
                  onClick={() => { setFromOverview(true); setActive(i) }}
                >
                  <span className="avatar" aria-hidden>{p.emoji}</span>
                  <span className="overview-name">{p.name}</span>
                  <span className="overview-points">{e ? summary(e) : '⏳ spielt noch'}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <button type="button" className="btn btn-primary btn-wide btn-xl" disabled={!complete} onClick={onSaveRound}>
          Runde speichern ✓
        </button>
        <button type="button" className="btn btn-secondary btn-wide" onClick={onClose}>Später weiter</button>
        <div className="spacer-lg" />
        {entered > 0 && (
          <button type="button" className="btn btn-danger btn-wide" onClick={() => setConfirmDiscard(true)}>Runde verwerfen</button>
        )}
      </div>
      {confirmDiscard && (
        <Confirm
          title="Runde verwerfen?"
          text="Alle Punkte, die in dieser Runde schon eingetragen sind, werden gelöscht."
          confirmLabel="Ja, verwerfen"
          danger
          onConfirm={onDiscardRound}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  )
}
