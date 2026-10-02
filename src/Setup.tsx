import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Palette, Plus, Shuffle, Trash2 } from 'lucide-react'
import { COLORS, EMOJIS, nextUnused } from './avatars'
import { DEFAULT_TARGET, MAX_PLAYERS, MIN_PLAYERS, TARGETS } from './game'
import { beginBusy, endBusy } from './update'
import type { RecentPlayer } from './types'

type Row = RecentPlayer & { key: string }
type Props = {
  recent: RecentPlayer[]
  onStart: (players: RecentPlayer[], target: number, firstDealer: number) => void
}

let keySeed = 0
const newRow = (rows: Row[], seed?: Partial<RecentPlayer>): Row => ({
  key: `row-${keySeed++}`,
  name: seed?.name ?? '',
  emoji: seed?.emoji && !rows.some((r) => r.emoji === seed.emoji) ? seed.emoji : nextUnused(EMOJIS, undefined, rows.map((r) => r.emoji)),
  color: seed?.color ?? nextUnused(COLORS, undefined, rows.map((r) => r.color)),
})

export default function Setup({ recent, onStart }: Props) {
  const [rows, setRows] = useState<Row[]>(() => {
    const first = newRow([])
    return [first, newRow([first])]
  })
  const [target, setTarget] = useState<number>(DEFAULT_TARGET)
  const [customTarget, setCustomTarget] = useState('')
  const [dealer, setDealer] = useState(0)

  const edited = rows.some((r) => r.name.trim() !== '')
  useEffect(() => {
    if (!edited) return
    beginBusy()
    return () => endBusy()
  }, [edited])

  const update = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const move = (i: number, by: number) => {
    const j = i + by
    if (j < 0 || j >= rows.length) return
    const next = [...rows]
    ;[next[i], next[j]] = [next[j], next[i]]
    setRows(next)
    setDealer((d) => (d === i ? j : d === j ? i : d))
  }
  const remove = (i: number) => {
    setRows((rs) => rs.filter((_, idx) => idx !== i))
    setDealer((d) => (d > i ? d - 1 : d >= rows.length - 1 ? 0 : d))
  }
  const addRow = (seed?: Partial<RecentPlayer>) => {
    if (rows.length >= MAX_PLAYERS) return
    const emptyIdx = seed ? rows.findIndex((r) => r.name.trim() === '') : -1
    if (emptyIdx >= 0) {
      const fresh = newRow(rows.filter((_, i) => i !== emptyIdx), seed)
      setRows((rs) => rs.map((r, i) => (i === emptyIdx ? { ...fresh, key: r.key } : r)))
    } else {
      setRows((rs) => [...rs, newRow(rs, seed)])
    }
  }

  const customValue = Number.parseInt(customTarget, 10)
  const usingCustom = customTarget !== ''
  const effectiveTarget = usingCustom ? customValue : target

  const names = rows.map((r) => r.name.trim())
  const problem = useMemo(() => {
    if (rows.length < MIN_PLAYERS) return 'Ihr braucht mindestens 2 Spieler.'
    if (names.some((n) => n === '')) return 'Gib allen Spielern einen Namen.'
    if (new Set(names.map((n) => n.toLowerCase())).size !== names.length) return 'Zwei Spieler heißen gleich – gib ihnen verschiedene Namen.'
    if (!Number.isInteger(effectiveTarget) || effectiveTarget < 10 || effectiveTarget > 9999) return 'Das Ziel muss zwischen 10 und 9999 Punkten liegen.'
    return null
  }, [rows.length, names, effectiveTarget])

  const availableRecent = recent.filter((r) => !names.some((n) => n.toLowerCase() === r.name.toLowerCase()))

  return (
    <div className="stack">
      <h2 className="screen-title">Neues Spiel</h2>

      <section className="panel">
        <h3>Wer spielt mit?</h3>
        <p className="note">Schreibe die Namen in der Reihenfolge auf, in der ihr am Tisch sitzt.</p>
        <ul className="player-list">
          {rows.map((r, i) => (
            <li key={r.key} className="player-row" style={{ ['--player' as string]: r.color }}>
              <div className="player-row-top">
                <button
                  type="button"
                  className="avatar avatar-btn"
                  aria-label={`Tier ändern (${r.emoji})`}
                  onClick={() => update(r.key, { emoji: nextUnused(EMOJIS, r.emoji, rows.map((x) => x.emoji)) })}
                >
                  {r.emoji}
                </button>
                <input
                  className="name-input"
                  value={r.name}
                  maxLength={16}
                  placeholder={`Spieler ${i + 1}`}
                  aria-label={`Name von Spieler ${i + 1}`}
                  autoComplete="off"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  onChange={(e) => update(r.key, { name: e.target.value })}
                />
              </div>
              <div className="player-row-actions">
                <button type="button" className="mini" onClick={() => update(r.key, { color: nextUnused(COLORS, r.color, rows.map((x) => x.color)) })}>
                  <Palette size={22} aria-hidden /><span>Farbe</span>
                </button>
                <button type="button" className="mini" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp size={22} aria-hidden /><span>Hoch</span>
                </button>
                <button type="button" className="mini" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown size={22} aria-hidden /><span>Runter</span>
                </button>
                <button type="button" className="mini mini-danger" disabled={rows.length <= MIN_PLAYERS} onClick={() => remove(i)}>
                  <Trash2 size={22} aria-hidden /><span>Weg</span>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {rows.length < MAX_PLAYERS && (
          <button type="button" className="btn btn-secondary btn-wide" onClick={() => addRow()}>
            <Plus size={24} aria-hidden /> Spieler hinzufügen
          </button>
        )}

        {availableRecent.length > 0 && rows.length < MAX_PLAYERS && (
          <>
            <h4 className="chips-title">Zuletzt dabei</h4>
            <div className="chips">
              {availableRecent.map((r) => (
                <button key={r.name} type="button" className="chip" style={{ ['--player' as string]: r.color }} onClick={() => addRow(r)}>
                  <span aria-hidden>{r.emoji}</span> {r.name}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="panel">
        <h3>Wie viele Punkte zum Sieg?</h3>
        <div className="chips">
          {TARGETS.map((t) => (
            <button key={t} type="button" className={`chip chip-big ${!usingCustom && target === t ? 'is-on' : ''}`} aria-pressed={!usingCustom && target === t} onClick={() => { setTarget(t); setCustomTarget('') }}>
              {t}{t === DEFAULT_TARGET ? ' ★' : ''}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Oder eigene Zahl</span>
          <input
            className="name-input"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customTarget}
            maxLength={4}
            placeholder="z. B. 250"
            onChange={(e) => setCustomTarget(e.target.value.replace(/\D/g, ''))}
          />
        </label>
      </section>

      <section className="panel">
        <h3>Wer gibt zuerst?</h3>
        <div className="chips">
          {rows.map((r, i) => (
            <button key={r.key} type="button" className={`chip chip-big ${dealer === i ? 'is-on' : ''}`} style={{ ['--player' as string]: r.color }} aria-pressed={dealer === i} onClick={() => setDealer(i)}>
              <span aria-hidden>{r.emoji}</span> {r.name.trim() || `Spieler ${i + 1}`}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-secondary btn-wide" onClick={() => setDealer(Math.floor(Math.random() * rows.length))}>
          <Shuffle size={22} aria-hidden /> Zufällig auswählen
        </button>
      </section>

      {problem && <p className="note note-bad" role="status">{problem}</p>}
      <button
        type="button"
        className="btn btn-primary btn-wide btn-xl"
        disabled={problem !== null}
        onClick={() => onStart(rows.map(({ name, emoji, color }) => ({ name: name.trim(), emoji, color })), effectiveTarget, dealer)}
      >
        Spiel starten 🎉
      </button>
    </div>
  )
}
