import { useEffect, useState } from 'react'
import { getSupabase } from '../shared/supabase'
import { Testimony } from '../types'

const sha256 = async (s: string) => {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

const ADMIN_PASSWORD = 'KDave237'
let ADMIN_HASH: string | null = null

export default function Admin() {
  const [auth, setAuth] = useState<boolean>(false)
  const [pw, setPw] = useState('')
  const [items, setItems] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string| null>(null)
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all'|'text'|'audio'|'video'>('all')
  const [statusFilter, setStatusFilter] = useState<'all'|'validated'|'pending'>('all')
  const [filterSelect, setFilterSelect] = useState<'all'|'text'|'audio'|'video'|'validated'|'pending'>('all')

  useEffect(() => {
    const saved = localStorage.getItem('admin_auth_hash')
    if (saved) {
      ADMIN_HASH = saved
      setAuth(true)
    }
  }, [])

  useEffect(() => {
    if (!auth) return
    const load = async () => {
      const client = getSupabase()
      const { data } = await client.from('testimonies').select('*').order('created_at', { ascending: false })
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [auth])

  const login = async () => {
    if (!ADMIN_HASH) ADMIN_HASH = await sha256(ADMIN_PASSWORD)
    const h = await sha256(pw)
    if (h === ADMIN_HASH) {
      localStorage.setItem('admin_auth_hash', h)
      setAuth(true)
    } else {
      setMsg('Invalid password')
    }
  }

  const approve = async (id: string, v: boolean) => {
    const client = getSupabase()
    const { error } = await client.from('testimonies').update({ is_validated: v }).eq('id', id)
    if (error) setMsg(error.message)
    else setItems((prev)=> prev.map(it=> it.id===id? { ...it, is_validated: v }: it))
  }

  const remove = async (id: string) => {
    const client = getSupabase()
    const { error } = await client.from('testimonies').delete().eq('id', id)
    if (error) setMsg(error.message)
    else setItems((prev)=> prev.filter(it=> it.id!==id))
  }

  const save = async (id: string, patch: Partial<Testimony>) => {
    const client = getSupabase()
    const { error } = await client.from('testimonies').update(patch).eq('id', id)
    if (error) setMsg(error.message)
    else setItems((prev)=> prev.map(it=> it.id===id? { ...it, ...patch }: it))
  }

  if (!auth) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 420, margin: '80px auto', display: 'grid', gap: 12 }}>
          <h3 className="title" style={{ fontSize: 24 }}>Admin Login</h3>
          <input type="password" value={pw} onChange={(e)=> setPw(e.target.value)} placeholder="Password" style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }} />
          <button className="btn" onClick={login}>Enter</button>
          {msg && <div className="sub" style={{ color: 'crimson' }}>{msg}</div>}
        </div>
      </div>
    )
  }

  const filtered = items.filter(t => {
    if (statusFilter === 'validated' && !t.is_validated) return false
    if (statusFilter === 'pending' && t.is_validated) return false
    if (typeFilter === 'text' && (!!t.audio_url || !!t.video_url)) return false
    if (typeFilter === 'audio' && !t.audio_url) return false
    if (typeFilter === 'video' && !t.video_url) return false
    const term = q.trim().toLowerCase()
    if (term) {
      const hay = `${t.name} ${t.text ?? ''} ${t.phone ?? ''} ${t.email ?? ''}`.toLowerCase()
      if (!hay.includes(term)) return false
    }
    return true
  })

  return (
    <div className="container">
      <div className="hero">
        <div>
          <h1 className="title">Admin</h1>
          <div className="sub">Validate and manage testimonies</div>
        </div>
      </div>
      <div className="toolbar">
        <input className="search" placeholder="Search name, text, phone, email" value={q} onChange={(e)=> setQ(e.target.value)} />
        <select value={filterSelect} onChange={(e)=> {
          const v = e.target.value as 'all'|'text'|'audio'|'video'|'validated'|'pending'
          setFilterSelect(v)
          if (v === 'validated' || v === 'pending') {
            setStatusFilter(v)
            setTypeFilter('all')
          } else if (v === 'text' || v === 'audio' || v === 'video') {
            setTypeFilter(v)
            setStatusFilter('all')
          } else {
            setTypeFilter('all')
            setStatusFilter('all')
          }
        }} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
          <option value="all">All</option>
          <option value="text">Text</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="validated">Validated</option>
          <option value="pending">Pending</option>
        </select>
        <button className="btn" onClick={()=> { setQ(''); setFilterSelect('all'); setTypeFilter('all'); setStatusFilter('all') }}>Reset</button>
      </div>
      {loading && <div className="empty">Loading…</div>}
      <div className="grid">
        {filtered.map((t)=> (
          <div key={t.id} className="card">
            <div className="header">
              <img className="avatar" src={t.photo_url || '/avatar.svg'} alt={t.name} />
              <div>
                <input value={t.name} onChange={(e)=> save(t.id, { name: e.target.value })} style={{ fontWeight: 700, border: '1px solid var(--border)', borderRadius: 8, padding: 6 }} />
                <div className="meta">{new Date(t.created_at).toLocaleString()}</div>
              </div>
              <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', gap:8 }}>
                <span className="chip" style={{ marginRight: 8 }}>{t.video_url ? 'Video' : t.audio_url ? 'Audio' : 'Text'}</span>
                <span className="sub" style={{fontSize:12}}>{t.is_validated ? 'Validated' : 'Pending'}</span>
                <label className="switch">
                  <input type="checkbox" checked={t.is_validated} onChange={(e)=> approve(t.id, e.currentTarget.checked)} />
                </label>
              </div>
            </div>
            {!t.video_url && !t.audio_url && (
              <div className="text" style={{ marginBottom: 8 }}>
                <textarea value={t.text || ''} onChange={(e)=> save(t.id, { text: e.target.value })} rows={5} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }} />
              </div>
            )}
            {t.video_url && (
              <video className="media" src={t.video_url} controls />
            )}
            {t.audio_url && (
              <audio className="media" src={t.audio_url} controls />
            )}
            <div style={{ display: 'grid', gap: 8 }}>
              <input placeholder="Phone" value={t.phone || ''} onChange={(e)=> save(t.id, { phone: e.target.value })} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }} />
              <input placeholder="Email" value={t.email || ''} onChange={(e)=> save(t.id, { email: e.target.value })} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn outline" onClick={()=> remove(t.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {msg && <div className="sub" style={{ color: 'crimson', marginTop: 12 }}>{msg}</div>}
    </div>
  )
}
