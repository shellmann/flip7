import type { ReleaseNote } from './releaseNotes'

type Props = { notes: ReleaseNote[]; onDismiss: () => void }

// Bewusst kein Vollbild-Modal: ein Update soll nicht wie eine Unterbrechung wirken.
// Kein Auto-Dismiss, damit niemand die Info verpasst; schließt mit einem großen "Okay".
export default function UpdateToast({ notes, onDismiss }: Props) {
  if (notes.length === 0) return null
  const highlights = notes.flatMap((n) => n.highlights).slice(0, 4)

  return (
    <div className="toast" role="status">
      <div className="toast-body">
        <strong>Neu in Version {notes[0].version}</strong>
        <ul>
          {highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </div>
      <button className="btn btn-toast" onClick={onDismiss}>Okay</button>
    </div>
  )
}
