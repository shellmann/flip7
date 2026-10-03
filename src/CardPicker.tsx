import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Hash, Layers, Star } from 'lucide-react'
import Celebrate from './Celebrate'
import Keypad from './Keypad'
import { NUMBER_CARDS, PLUS_CARDS, FLIP7_COUNT, describe, scoreCards } from './scoring'
import { pickerToEntry, pressKey, toggleIn, type PickerState } from './picker'
import type { Player } from './types'

type Props = {
  player: Player
  state: PickerState
  onChange: (next: PickerState) => void
  step?: string // z. B. "Spieler 2 von 4"
  backLabel: string
  nextLabel: string
  onBack: () => void
  onNext: () => void
  extra?: ReactNode // z. B. "Doch noch im Spiel" — steht ganz oben im Inhalt, weit weg von "Fertig" in der unteren Leiste
}

const hue = (n: number) => n * 27

export default function CardPicker({ player, state, onChange, step, backLabel, nextLabel, onBack, onNext, extra }: Props) {
  const entry = pickerToEntry(state)
  const set = (patch: Partial<PickerState>) => onChange({ ...state, ...patch })

  // Konfetti, sobald die 7. verschiedene Zahl angetippt wird (nicht beim bloßen Öffnen einer fertigen Runde).
  const [burst, setBurst] = useState(0)
  const prevCount = useRef(state.numbers.length)
  useEffect(() => {
    if (state.mode === 'cards' && !state.bust && state.numbers.length === FLIP7_COUNT && prevCount.current < FLIP7_COUNT) {
      setBurst((k) => k + 1)
    }
    prevCount.current = state.numbers.length
  }, [state.numbers.length, state.mode, state.bust])

  const full = state.numbers.length >= FLIP7_COUNT
  const cardsLocked = state.bust

  return (
    <div className="picker">
      {burst > 0 && <Celebrate key={burst} />}

      <header className="picker-head" style={{ ['--player' as string]: player.color }}>
        <span className="avatar" aria-hidden>{player.emoji}</span>
        <div className="picker-who">
          {step && <span className="muted">{step}</span>}
          <strong>{player.name}</strong>
        </div>
        <div className="picker-total" aria-live="polite">
          <strong>{entry.points}</strong>
          <span>Punkte</span>
        </div>
      </header>

      <div className="picker-body">
        {extra}
        <div className="segmented" role="group" aria-label="Eingabeart">
          <button type="button" className={`seg ${state.mode === 'cards' ? 'is-on' : ''}`} aria-pressed={state.mode === 'cards'} onClick={() => set({ mode: 'cards' })}>
            <Layers size={22} aria-hidden /> Karten
          </button>
          <button type="button" className={`seg ${state.mode === 'manual' ? 'is-on' : ''}`} aria-pressed={state.mode === 'manual'} onClick={() => set({ mode: 'manual' })}>
            <Hash size={22} aria-hidden /> Zahl eingeben
          </button>
        </div>

        <button
          type="button"
          className={`btn btn-wide ${state.bust ? 'btn-secondary' : 'btn-danger'}`}
          aria-pressed={state.bust}
          onClick={() => set({ bust: !state.bust })}
        >
          {state.bust ? '↩ Doch nicht verzockt' : '💥 Verzockt – 0 Punkte'}
        </button>

        {state.bust && <p className="note note-bad">Verzockt: In dieser Runde gibt es 0 Punkte.</p>}

        {state.mode === 'cards' ? (
          <>
            <p className="note" aria-live="polite">
              {state.bust
                ? ' '
                : full
                  ? '⭐ Flip 7! 7 verschiedene Zahlen – das gibt +15 Punkte.'
                  : `Tippe die Zahlenkarten an, die du vor dir hast (${state.numbers.length} von 7).`}
            </p>

            <div className="card-grid" role="group" aria-label="Zahlenkarten">
              {NUMBER_CARDS.map((n) => {
                const on = state.numbers.includes(n)
                return (
                  <button
                    key={n}
                    type="button"
                    className={`card ${on ? 'is-on' : ''}`}
                    style={{ ['--hue' as string]: n === 0 ? 260 : hue(n) }}
                    aria-pressed={on}
                    aria-label={`Zahl ${n}`}
                    disabled={cardsLocked || (full && !on)}
                    onClick={() => set({ numbers: toggleIn(state.numbers, n) })}
                  >
                    <span className="card-num">{n}</span>
                    {on && <Check className="card-check" size={22} aria-hidden />}
                  </button>
                )
              })}
            </div>

            <h3 className="picker-sub">Bonuskarten</h3>
            <div className="card-grid card-grid-bonus" role="group" aria-label="Bonuskarten">
              {PLUS_CARDS.map((m) => {
                const on = state.modifiers.includes(m)
                return (
                  <button
                    key={m}
                    type="button"
                    className={`card card-bonus ${on ? 'is-on' : ''}`}
                    aria-pressed={on}
                    aria-label={`Bonuskarte plus ${m}`}
                    disabled={cardsLocked}
                    onClick={() => set({ modifiers: toggleIn(state.modifiers, m) })}
                  >
                    <span className="card-num">+{m}</span>
                    {on && <Check className="card-check" size={22} aria-hidden />}
                  </button>
                )
              })}
              <button
                type="button"
                className={`card card-bonus card-x2 ${state.x2 ? 'is-on' : ''}`}
                aria-pressed={state.x2}
                aria-label="Bonuskarte mal zwei"
                disabled={cardsLocked}
                onClick={() => set({ x2: !state.x2 })}
              >
                <span className="card-num">×2</span>
                {state.x2 && <Check className="card-check" size={22} aria-hidden />}
              </button>
            </div>

            {!state.bust && <p className="formula">{describe(scoreCards({ numbers: state.numbers, modifiers: state.modifiers, x2: state.x2 }))}</p>}
          </>
        ) : (
          <>
            <p className="note">Tippe die Punkte dieser Runde ein.</p>
            <div className="manual-value" aria-live="polite">{state.bust ? 0 : state.manualText || '0'}</div>
            <Keypad onKey={(k) => set({ manualText: pressKey(state.manualText, k) })} />
            <button
              type="button"
              className={`btn btn-wide ${state.manualFlip7 ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={state.manualFlip7}
              disabled={state.bust}
              onClick={() => set({ manualFlip7: !state.manualFlip7 })}
            >
              <Star size={22} aria-hidden /> {state.manualFlip7 ? 'Flip 7 gelungen ✓' : 'Das war ein Flip 7'}
            </button>
            <p className="note">Die +15 für ein Flip 7 rechnest du in deine Zahl schon mit ein.</p>
          </>
        )}
      </div>

      <footer className="picker-bar">
        <button type="button" className="btn btn-secondary" onClick={onBack}>{backLabel}</button>
        <button type="button" className="btn btn-primary btn-grow" onClick={onNext}>{nextLabel}</button>
      </footer>
    </div>
  )
}
