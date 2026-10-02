type Props = {
  title: string
  text?: string
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Große, klar getrennte Knöpfe: "Doch nicht" ist der ruhige Standardweg, die gefährliche Aktion steht darunter.
export default function Confirm({ title, text, confirmLabel, cancelLabel = 'Doch nicht', danger, onConfirm, onCancel }: Props) {
  return (
    <div className="backdrop" role="presentation">
      <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        {text && <p>{text}</p>}
        <button className="btn btn-primary btn-wide" onClick={onCancel} autoFocus>{cancelLabel}</button>
        <button className={`btn btn-wide ${danger ? 'btn-danger' : 'btn-secondary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </section>
    </div>
  )
}
