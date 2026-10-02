import { useEffect, useState } from 'react'

const COLORS = ['#ffd166', '#ff9f80', '#f78fb3', '#c3b1ff', '#7fd8c8', '#8fd3ff', '#b5e06b']

type Piece = { left: number; delay: number; duration: number; color: string; size: number; spin: number }

const makePieces = (count: number): Piece[] =>
  Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2 + Math.random() * 1.6,
    color: COLORS[i % COLORS.length],
    size: 8 + Math.random() * 8,
    spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 360),
  }))

// Kurzes Konfetti nur mit CSS. Verschwindet von selbst; bei "weniger Bewegung" blendet das CSS es komplett aus.
export default function Celebrate({ count = 36 }: { count?: number }) {
  const [pieces] = useState(() => makePieces(count))
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 4200)
    return () => window.clearTimeout(t)
  }, [])
  if (done) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--spin' as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  )
}
