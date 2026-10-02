import { Delete } from 'lucide-react'

type Props = { onKey: (key: string) => void }

// Eigene große Zifferntastatur (72 px) statt der kleinen System-Tastatur — auch für ungenaue Finger.
export default function Keypad({ onKey }: Props) {
  const digit = (d: string) => (
    <button key={d} type="button" className="key" onClick={() => onKey(d)}>{d}</button>
  )
  return (
    <div className="keypad" role="group" aria-label="Zifferntastatur">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit)}
      <button type="button" className="key key-quiet" onClick={() => onKey('clear')} aria-label="Alles löschen">C</button>
      {digit('0')}
      <button type="button" className="key key-quiet" onClick={() => onKey('back')} aria-label="Letzte Ziffer löschen"><Delete size={28} aria-hidden /></button>
    </div>
  )
}
