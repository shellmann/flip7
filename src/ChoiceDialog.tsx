import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Check } from 'lucide-react'

export type Choice = {
  value: string
  label: string // Name für Screenreader, z. B. „Fuchs“ oder „Gelb“
  content: ReactNode
  style?: CSSProperties
  taken?: string // z. B. „schon bei Anna“ — dann nicht wählbar
}

type Props = {
  title: string
  choices: Choice[]
  selected: string
  onPick: (value: string) => void
  onClose: () => void
}

// Auswahlfenster mit großen Feldern: ein Tipp wählt und schließt. Zugänglich: Dialog mit Überschrift,
// Optionen als Knöpfe mit Namen und aria-pressed, Fokus startet auf der gewählten Option, bleibt im
// Fenster (Tab), Escape schließt, danach kehrt der Fokus zum auslösenden Knopf zurück.
export default function ChoiceDialog({ title, choices, selected, onPick, onClose }: Props) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    dialogRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
    return () => opener?.focus()
  }, [])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])]
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <section
        ref={dialogRef}
        className="dialog choice-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="choice-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <h2 id="choice-title">{title}</h2>
        <div className="choice-grid">
          {choices.map((c) => {
            const on = c.value === selected
            return (
              <button
                key={c.value}
                type="button"
                className={`choice ${on ? 'is-on' : ''}`}
                style={c.style}
                aria-pressed={on}
                aria-label={c.taken ? `${c.label}, ${c.taken}` : c.label}
                title={c.taken ? `${c.label} – ${c.taken}` : c.label}
                disabled={!!c.taken}
                onClick={() => onPick(c.value)}
              >
                {c.content}
                {on && <Check className="choice-check" size={20} aria-hidden />}
              </button>
            )
          })}
        </div>
        <button type="button" className="btn btn-secondary btn-wide" onClick={onClose}>Zurück</button>
      </section>
    </div>
  )
}
