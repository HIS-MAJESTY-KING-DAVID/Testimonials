import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Confetti from '../shared/Confetti'
import { getSupabase } from '../shared/supabase'

type Mode = 'text' | 'video' | 'audio'

export default function Submit() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [mode, setMode] = useState<Mode>('text')
  const [text, setText] = useState('')
  const [media, setMedia] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    const nextErrors: Record<string, string> = {}
    const trim = (s: string) => s.trim()
    const PHOTO_MAX_MB = 4
    const MEDIA_MAX_MB = 50
    if (!trim(name)) nextErrors.name = 'Name is required'
    if (mode === 'text') {
      if (!trim(text)) nextErrors.text = 'Testimony text is required'
      else if (trim(text).length < 12) nextErrors.text = 'Please provide at least 12 characters'
    }
    if (photo) {
      const okType = photo.type.startsWith('image/')
      const okSize = photo.size <= PHOTO_MAX_MB * 1024 * 1024
      if (!okType) nextErrors.photo = 'Photo must be an image file'
      else if (!okSize) nextErrors.photo = `Photo must be ≤ ${PHOTO_MAX_MB}MB`
    }
    if (mode !== 'text' && media) {
      const okType = mode === 'video' ? media.type.startsWith('video/') : media.type.startsWith('audio/')
      const okSize = media.size <= MEDIA_MAX_MB * 1024 * 1024
      if (!okType) nextErrors.media = `Upload a valid ${mode} file`
      else if (!okSize) nextErrors.media = `${mode === 'video' ? 'Video' : 'Audio'} must be ≤ ${MEDIA_MAX_MB}MB`
    }
    if (!navigator.onLine) nextErrors.general = 'You appear to be offline'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setLoading(true)

    let photo_url: string | null = null
    let video_url: string | null = null
    let audio_url: string | null = null
    let client
    try { client = getSupabase() } catch { setMsg('Missing Supabase configuration'); setLoading(false); return }

    if (photo) {
      const key = `${Date.now()}-${photo.name}`
      const { data, error } = await client.storage.from('photos').upload(key, photo, { upsert: false })
      if (error) {
        setMsg(humanizeStorageError(error.message))
        setLoading(false)
        return
      }
      photo_url = client.storage.from('photos').getPublicUrl(data.path).data.publicUrl
    }

    if (mode !== 'text' && media) {
      const key = `${Date.now()}-${media.name}`
      const { data, error } = await client.storage.from('media').upload(key, media, { upsert: false })
      if (error) {
        setMsg(humanizeStorageError(error.message))
        setLoading(false)
        return
      }
      const url = client.storage.from('media').getPublicUrl(data.path).data.publicUrl
      if (mode === 'video') video_url = url
      if (mode === 'audio') audio_url = url
    }

    const { error: insertError } = await client.from('testimonies').insert({
      name,
      phone: phone || null,
      email: email || null,
      photo_url,
      video_url,
      audio_url,
      text: mode === 'text' ? text : null,
      is_validated: false,
    })
    if (insertError) {
      setMsg(humanizeDbError(insertError.message))
      setLoading(false)
      return
    }
    setMsg('🎉 Congratulations! Your testimony was submitted. It will be visible after admin validation.')
    setLoading(false)
    setTimeout(()=> navigate('/'), 1800)
  }

  const humanizeStorageError = (m: string) => {
    if (/RLS|row level security|not allowed/i.test(m)) return 'Upload blocked by storage policy'
    if (/Bucket not found/i.test(m)) return 'Storage bucket not found'
    if (/content-length/i.test(m)) return 'File too large for upload'
    return m
  }

  const humanizeDbError = (m: string) => {
    if (/violates|constraint/i.test(m)) return 'Submission violates a database constraint'
    return m
  }

  return (
    <div className="container">
      <Confetti active={msg?.startsWith('🎉') || false} />
      <div className="hero">
        <div>
          <h2 className="title" style={{ fontSize: 28 }}>Share Your Testimony</h2>
          <div className="sub">Encourage others by sharing what God has done</div>
        </div>
        <Link className="btn outline" to="/">Back</Link>
      </div>
      <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: 14 }}>
        <label>
          <div className="sub">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }} />
          {errors.name && <div className="sub" style={{color:'crimson'}}>{errors.name}</div>}
        </label>
        <label>
          <div className="sub">Phone</div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }} />
        </label>
        <label>
          <div className="sub">Email</div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }} />
        </label>
        <label>
          <div className="sub">Photo</div>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          {errors.photo && <div className="sub" style={{color:'crimson'}}>{errors.photo}</div>}
        </label>
        <label style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="sub">Type</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} style={{ padding: 8, borderRadius: 10, border: '1px solid var(--border)' }}>
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </label>
        {mode === 'text' ? (
          <label>
            <div className="sub">Testimony</div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }} />
            {errors.text && <div className="sub" style={{color:'crimson'}}>{errors.text}</div>}
          </label>
        ) : (
          <label>
            <div className="sub">Upload</div>
            <input type="file" accept={mode === 'video' ? 'video/*' : 'audio/*'} onChange={(e) => setMedia(e.target.files?.[0] || null)} />
            {errors.media && <div className="sub" style={{color:'crimson'}}>{errors.media}</div>}
          </label>
        )}
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit'}</button>
        {errors.general && <div className="sub" style={{color:'crimson'}}>{errors.general}</div>}
        {msg && <div className="success">{msg}</div>}
      </form>
    </div>
  )
}
