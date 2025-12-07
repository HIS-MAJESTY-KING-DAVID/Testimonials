import { useEffect, useMemo, useRef, useState } from 'react'
import { Testimony } from '../types'

export default function AutoPlay({ items, onClose }: { items: Testimony[]; onClose: () => void }) {
  const order = useMemo(() => {
    const idx = Array.from({ length: items.length }, (_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    return idx
  }, [items])
  const [pos, setPos] = useState(0)
  const [paused, setPaused] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const current = items[order[pos]]
  const duration = useMemo(() => {
    if (current?.text) return 6000
    if (current?.audio_url) return 10000
    if (current?.video_url) return 10000
    return 6000
  }, [current])

  useEffect(() => {
    if (!current) return
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [current])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setPos(p => (p + 1) % order.length), duration)
    return () => clearTimeout(t)
  }, [paused, duration, order.length, pos])

  if (!current) return null

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: 720 }}>
        <div className="header">
          <img className="avatar" src={current.photo_url || '/avatar.svg'} alt={current.name} />
          <div>
            <div className="name">{current.name}</div>
            <div className="meta">{new Date(current.created_at).toLocaleString()}</div>
          </div>
          <div style={{ marginLeft: 'auto' }} className="chip">
            {current.video_url ? 'Video' : current.audio_url ? 'Audio' : 'Text'}
          </div>
        </div>
        {current.text && <div className="text" style={{ marginTop: 8 }}>{current.text}</div>}
        {current.video_url && (
          <video ref={videoRef} className="media" src={current.video_url} controls playsInline />
        )}
        {current.audio_url && (
          <audio ref={audioRef} className="media" src={current.audio_url} controls />
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
          <button className="btn outline" onClick={() => setPaused(p => !p)}>{paused ? 'Play' : 'Pause'}</button>
          <button className="btn outline" onClick={() => setPos(p => (p + 1) % order.length)}>Next</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
