type Props = { text: string; actionLabel?: string; onAction?: () => void; onDismiss: () => void }

export default function NoticeToast({ text, actionLabel, onAction, onDismiss }: Props) {
  return (
    <div className="toast" role="status">
      <span className="toast-body">{text}</span>
      {actionLabel && onAction && <button className="btn btn-toast" onClick={onAction}>{actionLabel}</button>}
      <button className="btn btn-toast btn-toast-quiet" onClick={onDismiss}>Okay</button>
    </div>
  )
}
