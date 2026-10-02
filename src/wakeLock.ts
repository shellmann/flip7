import { useEffect } from 'react'

export const wakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator

// Hält den Bildschirm wach, solange die App sichtbar ist (z. B. wenn das Handy auf dem Tisch liegt).
// Der Browser gibt die Sperre beim Verlassen der App selbst frei — deshalb beim Zurückkehren neu anfordern.
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !wakeLockSupported) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) void lock.release()
        else sentinel = lock
      } catch {
        // z. B. Energiesparmodus — dann bleibt es beim normalen Bildschirm-Timeout.
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void sentinel?.release()
    }
  }, [enabled])
}
