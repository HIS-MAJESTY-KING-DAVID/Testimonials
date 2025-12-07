import { useEffect, useRef } from 'react'

export default function Confetti({ active, duration = 1500 }: { active: boolean; duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')!
    let frame = 0
    let running = true
    const start = performance.now()
    const w = (canvas.width = window.innerWidth)
    const h = (canvas.height = window.innerHeight)
    const parts = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 60,
      r: 2 + Math.random() * 4,
      c: `hsl(${Math.random() * 360},80%,60%)`,
      vx: -1 + Math.random() * 2,
      vy: 2 + Math.random() * 3,
      g: 0.02 + Math.random() * 0.04,
      a: 1,
    }))

    const tick = (t: number) => {
      if (!running) return
      const elapsed = t - start
      if (elapsed > duration) running = false
      ctx.clearRect(0, 0, w, h)
      parts.forEach(p => {
        p.vy += p.g
        p.x += p.vx
        p.y += p.vy
        ctx.globalAlpha = p.a
        ctx.fillStyle = p.c
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, duration])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />
}
