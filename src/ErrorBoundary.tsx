import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Die App bleibt nutzbar, ohne interne Details anzuzeigen.
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main style={{ maxWidth: 520, margin: '12vh auto', padding: 24, fontFamily: 'system-ui', color: '#2b2350', textAlign: 'center' }}>
        <p style={{ fontSize: 56, margin: 0 }}>🙈</p>
        <h1>Hoppla, die App konnte nicht geladen werden.</h1>
        <p>Lade die Seite einfach neu. Dein laufendes Spiel bleibt gespeichert.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ minHeight: 64, padding: '0 28px', border: 0, borderRadius: 16, background: '#6c4cf1', color: '#fff', fontSize: 20, fontWeight: 700 }}
        >
          Seite neu laden
        </button>
      </main>
    )
  }
}
