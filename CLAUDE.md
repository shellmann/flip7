# Flip 7 Zähler — Projektkontext

Mobile-first PWA (React + TypeScript + Vite) zum Punktezählen bei Flip 7 mit echten Karten. Kein Backend, alles im `localStorage`. UI ausschließlich Deutsch, Anrede „du“.

## Öffentlich vs. privat

Dieses Repo ist **öffentlich**. Nie committen: Hostnamen, IPs, SSH-Ziele, Serverpfade, Zugangsdaten, DNS-Details. Diese Angaben gehören in die lokale, per `.gitignore` ausgeschlossene `.env` (Vorlage: `.env.example`) bzw. in die private Dokumentation außerhalb des Repos. `CLAUDE.local.md` (ebenfalls ignoriert) kann lokale Hinweise enthalten.

## Architektur

- `src/scoring.ts` — reine Punkteberechnung: ×2 verdoppelt **nur** die Zahlensumme, danach +-Karten, zuletzt +15 für Flip 7 (nie verdoppelt); Verzockt = 0; Maximum 171. Einzige Quelle der Wahrheit für die Regeln, getestet in `scoring.test.ts` (Beispiele aus der Spielanleitung).
- `src/game.ts` — reine Spiellogik: Summen, Geber-Rotation, Spielende (Ziel erreicht und eindeutige Spitze; Gleichstand → weitere Runde mit allen), Rückgängig/Bearbeiten, Statistik. `endedAt` wird immer aus dem Ergebnis abgeleitet.
- `src/storage.ts` — `localStorage` (Schlüssel `flip7-data-v1`, Einstellungen separat in `SETTINGS`). `withGame` hält Verlauf und aktuelles Spiel konsistent (ein beendetes Spiel steht im Verlauf, Rückgängig nimmt es wieder heraus).
- `src/picker.ts` — Zustand der Kartenwahl und der Zifferntastatur (rein, getestet).
- UI: `App.tsx` (Shell), `Setup`, `Scoreboard`, `RoundEntry` + `CardPicker` + `Keypad`, `GameOver`, `Menu`, `Rules`, `History`, `Celebrate` (CSS-Konfetti), `Confirm`.
- `src/update.ts` — `busy`-Zähler + Sichtbarkeits-Gate: ein Service-Worker-Update lädt nie mitten in einer Eingabe neu (`RoundEntry` und `Setup` halten es auf „busy“).
- `src/theme.ts`, `src/wakeLock.ts`, `src/releaseNotes.ts`, `src/UpdateToast.tsx`, `src/NoticeToast.tsx`.

## Kinderfreundliches Design (verbindlich)

- Jedes tippbare Element ≥ 56 × 56 px (`3.5rem`), Karten/Haupt-Aktionen ≥ 72 px, ≥ 12 px Abstand.
- Nur einfache Taps — keine Swipe-, Long-Press-, Drag- oder Doppeltipp-Gesten. Kein Hover-only-UI.
- Alles ist korrigierbar; destruktive Aktionen fragen nach und stehen nie neben „Weiter/Speichern“. Eigene Zifferntastatur statt System-Tastatur.
- Icons immer mit kurzem Text. Konfetti nur mit CSS und abschaltbar über `prefers-reduced-motion`.
- Einspaltige Grids brauchen `grid-template-columns: minmax(0, 1fr)`, sonst weiten Eingabefelder die Seite über den Bildschirm.

## Release-Workflow

Bei jedem Release gemeinsam aktualisieren: `package.json`-Version, `CHANGELOG.md` (ausführlich) und `src/releaseNotes.ts` (1–3 kurze Highlights fürs Update-Popup; bewusst nicht aus dem Changelog geparst).

## Deployment

Docker (nginx) hinter Traefik v2, siehe `docker-compose.yml` (Hostname aus `.env`, Request-Limit pro IP: 30/min, Burst 60). `npm run deploy` führt Tests und Build aus, sichert die Container-Logs, überträgt per rsync, baut auf dem Server und prüft die ausgelieferte Version. **Nur nach ausdrücklicher Freigabe deployen**, nicht automatisch nach einer Umsetzung.

## Tests

`npm test` (Vitest). Bei Änderungen an Regeln oder Spiellogik zuerst die Tests anpassen. Neue UI-Elemente im Handy-Viewport (375 × 812) auf Tippflächen ≥ 56 px und horizontales Scrollen prüfen.
