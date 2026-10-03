// Manuell gepflegte Kurzfassung der Release-Notes fürs Update-Popup (UpdateToast.tsx).
// Bewusst NICHT aus CHANGELOG.md geparst: Markdown-Parsing zur Build-Zeit bricht bei kleinen
// Formatabweichungen leise. Pflicht bei jedem Release: package.json-Version, CHANGELOG.md
// (ausführlich) UND diese Datei (1–3 kurze Highlights) gemeinsam aktualisieren — siehe CLAUDE.md.

export type ReleaseNote = { version: string; highlights: string[] }

// Neueste Version zuerst.
export const RELEASE_NOTES: ReleaseNote[] = [
  { version: '0.2.0', highlights: ['Ergebnisse schon während der Runde eintragen – einfach auf den Spieler tippen', 'Rückgängig behält jetzt die Punkte der Runde'] },
  { version: '0.1.0', highlights: ['Erste Version'] },
]

function parseVersion(v: string): number[] {
  return v.split('.').map((part) => Number.parseInt(part, 10) || 0)
}

function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export function collectHighlightsSince(lastSeenVersion: string | null): ReleaseNote[] {
  if (lastSeenVersion === null) return RELEASE_NOTES
  return RELEASE_NOTES.filter((note) => compareVersions(note.version, lastSeenVersion) > 0)
}
