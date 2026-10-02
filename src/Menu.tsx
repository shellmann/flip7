import { useState } from 'react'
import { BookOpen, History as HistoryIcon, Smartphone, X } from 'lucide-react'
import Confirm from './Confirm'
import { wakeLockSupported } from './wakeLock'
import type { Theme } from './theme'

type Props = {
  theme: Theme
  onTheme: (t: Theme) => void
  largeText: boolean
  onLargeText: (v: boolean) => void
  wakeLock: boolean
  onWakeLock: (v: boolean) => void
  hasRunningGame: boolean
  hasHistory: boolean
  onAbortGame: () => void
  onClearHistory: () => void
  onResetAll: () => void
  onRules: () => void
  onHistory: () => void
  onClose: () => void
}

type Pending = 'abort' | 'history' | 'all' | null

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Automatisch' },
  { value: 'light', label: '☀️ Hell' },
  { value: 'dark', label: '🌙 Dunkel' },
]

export default function Menu(p: Props) {
  const [pending, setPending] = useState<Pending>(null)

  return (
    <div className="backdrop backdrop-menu" onClick={p.onClose}>
      <aside className="drawer" role="dialog" aria-label="Menü" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Menü</h2>
          <button type="button" className="btn btn-secondary btn-small" onClick={p.onClose}><X size={22} aria-hidden /> Schließen</button>
        </div>

        <button type="button" className="btn btn-primary btn-wide" onClick={p.onRules}><BookOpen size={24} aria-hidden /> Spielregeln</button>
        <button type="button" className="btn btn-secondary btn-wide" onClick={p.onHistory}><HistoryIcon size={24} aria-hidden /> Verlauf & Statistik</button>

        <h3 className="drawer-sub">Darstellung</h3>
        <div className="segmented" role="group" aria-label="Farbschema">
          {THEMES.map((t) => (
            <button key={t.value} type="button" className={`seg ${p.theme === t.value ? 'is-on' : ''}`} aria-pressed={p.theme === t.value} onClick={() => p.onTheme(t.value)}>
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className={`btn btn-wide ${p.largeText ? 'btn-primary' : 'btn-secondary'}`} aria-pressed={p.largeText} onClick={() => p.onLargeText(!p.largeText)}>
          {p.largeText ? 'Große Schrift: an ✓' : 'Große Schrift: aus'}
        </button>
        <button type="button" className={`btn btn-wide ${p.wakeLock ? 'btn-primary' : 'btn-secondary'}`} aria-pressed={p.wakeLock} disabled={!wakeLockSupported} onClick={() => p.onWakeLock(!p.wakeLock)}>
          {p.wakeLock ? 'Bildschirm bleibt an ✓' : 'Bildschirm bleibt an: aus'}
        </button>
        {!wakeLockSupported && <p className="note">Dieser Browser kann den Bildschirm nicht wachhalten.</p>}

        <details className="details">
          <summary><Smartphone size={22} aria-hidden /> App aufs Handy holen</summary>
          <p><strong>Android (Chrome):</strong> Menü ⋮ → „App installieren“ oder „Zum Startbildschirm hinzufügen“.</p>
          <p><strong>iPhone / iPad (Safari):</strong> Teilen-Symbol → „Zum Home-Bildschirm“.</p>
          <p className="note">Danach startet die App wie jede andere und funktioniert auch ohne Internet.</p>
        </details>

        <h3 className="drawer-sub">Daten</h3>
        {p.hasRunningGame && <button type="button" className="btn btn-secondary btn-wide" onClick={() => setPending('abort')}>Laufendes Spiel abbrechen</button>}
        {p.hasHistory && <button type="button" className="btn btn-secondary btn-wide" onClick={() => setPending('history')}>Verlauf löschen</button>}
        <button type="button" className="btn btn-danger btn-wide" onClick={() => setPending('all')}>Alle Daten löschen</button>

        <h3 className="drawer-sub">Datenschutz</h3>
        <p className="note">
          Diese App sammelt nichts über dich: keine Werbung, kein Tracking, keine Konten. Spiele, Namen und Einstellungen bleiben
          nur in diesem Browser auf deinem Gerät (lokaler Speicher). Die Schrift kommt von dieser Seite selbst, nicht von Google.
        </p>

        <p className="footer">
          Inoffizielle Fan-App, nicht verbunden mit The Op Games oder Kosmos. „Flip 7“ ist eine Marke der jeweiligen Rechteinhaber.
          <br />
          Version {__APP_VERSION__} ·{' '}
          <a href="https://github.com/shellmann/flip7" target="_blank" rel="noopener noreferrer">Quellcode auf GitHub</a>
        </p>
      </aside>

      {pending === 'abort' && (
        <Confirm title="Spiel abbrechen?" text="Das laufende Spiel und alle Runden gehen verloren. Es kommt nicht in den Verlauf." confirmLabel="Ja, abbrechen" danger onConfirm={() => { setPending(null); p.onAbortGame() }} onCancel={() => setPending(null)} />
      )}
      {pending === 'history' && (
        <Confirm title="Verlauf löschen?" text="Alle beendeten Spiele und die Statistik werden gelöscht." confirmLabel="Ja, löschen" danger onConfirm={() => { setPending(null); p.onClearHistory() }} onCancel={() => setPending(null)} />
      )}
      {pending === 'all' && (
        <Confirm title="Wirklich alles löschen?" text="Spiele, Verlauf, Statistik, Namen und Einstellungen werden von diesem Gerät entfernt. Das geht nicht rückgängig." confirmLabel="Ja, alles löschen" danger onConfirm={() => { setPending(null); p.onResetAll() }} onCancel={() => setPending(null)} />
      )}
    </div>
  )
}
