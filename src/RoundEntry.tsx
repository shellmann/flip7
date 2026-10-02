import { useEffect, useState } from 'react'
import CardPicker from './CardPicker'
import Confirm from './Confirm'
import { beginBusy, endBusy } from './update'
import { emptyPicker, pickerFromEntry, pickerToEntry, type PickerState } from './picker'
import type { Entry, Game, Player } from './types'

type Props = {
  game: Game
  // Ohne `edit`: neue Runde für alle. Mit `edit`: genau einen Eintrag einer früheren Runde korrigieren.
  edit?: { roundId: string; playerId: string }
  onSaveRound: (entries: Record<string, Entry>) => void
  onSaveEdit: (roundId: string, playerId: string, entry: Entry) => void
  onClose: () => void
}

const summary = (e: Entry) => (e.bust ? '💥 Verzockt' : e.flip7 ? `⭐ ${e.points} (Flip 7)` : `${e.points}`)

export default function RoundEntry({ game, edit, onSaveRound, onSaveEdit, onClose }: Props) {
  const players = game.players
  const editRound = edit ? game.rounds.find((r) => r.id === edit.roundId) : undefined

  const [pickers, setPickers] = useState<Record<string, PickerState>>(() => {
    if (!edit || !editRound) return {}
    return { [edit.playerId]: pickerFromEntry(editRound.entries[edit.playerId]) }
  })
  const [done, setDone] = useState<string[]>([])
  const [active, setActive] = useState<number | null>(() => (edit ? players.findIndex((p) => p.id === edit.playerId) : 0))
  const [confirmCancel, setConfirmCancel] = useState(false)

  // Während der Eingabe darf kein Update die Seite neu laden (siehe update.ts).
  useEffect(() => {
    beginBusy()
    return () => endBusy()
  }, [])

  const stateFor = (p: Player) => pickers[p.id] ?? emptyPicker()
  const allDone = players.every((p) => done.includes(p.id))
  const hasInput = Object.keys(pickers).length > 0

  const askClose = () => (edit || !hasInput ? onClose() : setConfirmCancel(true))

  if (active !== null) {
    const player = players[active]

    if (edit) {
      return (
        <div className="sheet">
          <CardPicker
            player={player}
            state={stateFor(player)}
            onChange={(s) => setPickers({ ...pickers, [player.id]: s })}
            step={`Runde ${game.rounds.findIndex((r) => r.id === edit.roundId) + 1} korrigieren`}
            backLabel="Abbrechen"
            nextLabel="Speichern ✓"
            onBack={onClose}
            onNext={() => onSaveEdit(edit.roundId, edit.playerId, pickerToEntry(stateFor(player)))}
          />
        </div>
      )
    }

    const doneAfter = [...done, player.id]
    const next = (() => {
      for (let i = 1; i < players.length; i++) {
        const idx = (active + i) % players.length
        if (!doneAfter.includes(players[idx].id)) return idx
      }
      return null
    })()
    const correcting = allDone // alle waren schon eingetragen → wir kamen aus der Übersicht

    return (
      <div className="sheet">
        <CardPicker
          player={player}
          state={stateFor(player)}
          onChange={(s) => setPickers({ ...pickers, [player.id]: s })}
          step={`Spieler ${active + 1} von ${players.length}`}
          backLabel={correcting ? 'Übersicht' : active === 0 ? 'Abbrechen' : 'Zurück'}
          nextLabel={correcting ? 'Fertig ✓' : next === null ? 'Fertig ✓' : `Weiter zu ${players[next].name}`}
          onBack={() => (correcting ? setActive(null) : active === 0 ? askClose() : setActive(active - 1))}
          onNext={() => {
            setPickers((prev) => (prev[player.id] ? prev : { ...prev, [player.id]: emptyPicker() }))
            setDone(doneAfter)
            setActive(correcting ? null : next)
          }}
        />
        {confirmCancel && (
          <Confirm
            title="Runde verwerfen?"
            text="Die bisher eingetragenen Punkte dieser Runde gehen verloren."
            confirmLabel="Ja, verwerfen"
            danger
            onConfirm={onClose}
            onCancel={() => setConfirmCancel(false)}
          />
        )}
      </div>
    )
  }

  // Übersicht: alle sehen, was eingetragen ist, einzelne Einträge lassen sich antippen und korrigieren.
  const canSave = allDone
  return (
    <div className="sheet">
      <div className="sheet-inner">
        <h2 className="sheet-title">Runde {game.rounds.length + 1}: Alles eingetragen?</h2>
        <p className="note">Tippe auf einen Namen, um die Punkte zu ändern.</p>
        <ul className="overview">
          {players.map((p, i) => {
            const entry = pickers[p.id] ? pickerToEntry(pickers[p.id]) : null
            return (
              <li key={p.id}>
                <button type="button" className="overview-row" style={{ ['--player' as string]: p.color }} onClick={() => setActive(i)}>
                  <span className="avatar" aria-hidden>{p.emoji}</span>
                  <span className="overview-name">{p.name}</span>
                  <span className="overview-points">{entry ? summary(entry) : 'noch offen'}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <button type="button" className="btn btn-primary btn-wide btn-xl" disabled={!canSave} onClick={() => onSaveRound(Object.fromEntries(players.map((p) => [p.id, pickerToEntry(stateFor(p))])))}>
          Runde speichern ✓
        </button>
        <div className="spacer-lg" />
        <button type="button" className="btn btn-secondary btn-wide" onClick={askClose}>Abbrechen</button>
      </div>
      {confirmCancel && (
        <Confirm
          title="Runde verwerfen?"
          text="Die eingetragenen Punkte dieser Runde gehen verloren."
          confirmLabel="Ja, verwerfen"
          danger
          onConfirm={onClose}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
    </div>
  )
}
