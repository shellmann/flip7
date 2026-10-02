// Verhindert, dass ein Service-Worker-Update mitten in einer laufenden Sitzung reloadet.
// Ein neuer Service Worker wird per registerType:'autoUpdate' weiterhin sofort im Hintergrund
// aktiv (controllerchange feuert also ggf. während die App offen und in Benutzung ist) — der
// tatsächliche reload() wird aber NICHT direkt bei requestReload() ausgeführt, sondern erst
// vorgemerkt. Ausgelöst wird er ausschließlich durch notifyVisible() (Tab wird nach einem
// Fokuswechsel wieder sichtbar) oder durch endBusy() (eine offene Eingabe wird fertig, während
// der Tab bereits sichtbar ist) — nie durch requestReload() selbst. Das sorgt dafür, dass ein
// Reload nie mitten in ruhiger Nutzung passiert, sondern erst beim nächsten "natürlichen Break"
// (App wird neu geöffnet/fokussiert).

let busyCount = 0
let pendingReload: (() => void) | null = null

function canReloadNow(): boolean {
  return busyCount === 0 && document.visibilityState === 'visible'
}

function tryFlush() {
  if (pendingReload && canReloadNow()) {
    const reload = pendingReload
    pendingReload = null
    reload()
  }
}

export function beginBusy() {
  busyCount += 1
}

export function endBusy() {
  busyCount = Math.max(0, busyCount - 1)
  tryFlush()
}

export function isBusy() {
  return busyCount > 0
}

// Merkt den Reload nur vor — löst ihn bewusst NICHT sofort aus, auch wenn der Tab gerade
// sichtbar und nicht busy ist. Der einzige Auslöser ist notifyVisible().
export function requestReload(reload: () => void) {
  pendingReload = reload
}

// Von main.tsx bei visibilitychange -> 'visible' aufgerufen.
export function notifyVisible() {
  tryFlush()
}
