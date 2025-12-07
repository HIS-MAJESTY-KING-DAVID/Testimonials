import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSupabase } from '../shared/supabase'
import { Testimony } from '../types'
import TestimonyCard from '../shared/TestimonyCard'

export default function Home() {
  const [items, setItems] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 8

  useEffect(() => {
    const load = async () => {
      let client
      try { client = getSupabase() } catch { setLoading(false); return }
      const { data } = await client
        .from('testimonies')
        .select('*')
        .eq('is_validated', true)
        .order('created_at', { ascending: false })
        .range(0, pageSize - 1)
      const list = data || []
      setItems(list)
      setHasMore(list.length === pageSize)
      setLoading(false)
    }
    load()
  }, [])

  const loadMore = async () => {
    const from = items.length
    const to = from + pageSize - 1
    const client = getSupabase()
    const { data } = await client
      .from('testimonies')
      .select('*')
      .eq('is_validated', true)
      .order('created_at', { ascending: false })
      .range(from, to)
    const list = data || []
    setItems((prev) => [...prev, ...list])
    if (list.length < pageSize) setHasMore(false)
  }

  return (
    <div className="container">
      <div className="hero">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img className="logo" src="/logo-ifa.png" alt="IFA Church" onError={(e)=>{e.currentTarget.src='/favicon.svg'}} />
          <div>
            <h1 className="title">Testimonials</h1>
            <div className="sub">IFA Church testimonies board</div>
          </div>
        </div>
        <Link className="btn" to="/submit">Add Testimony</Link>
      </div>
      {loading && (
        <>
          <div className="skeleton card"></div>
          <div className="skeleton card"></div>
        </>
      )}
      {!loading && items.length === 0 && (
        <div className="empty">No testimonies yet. Be the first to share.</div>
      )}
      <div className="grid">
        {items.map((t) => (
          <TestimonyCard key={t.id} item={t} />
        ))}
      </div>
      {!loading && hasMore && (
        <button className="btn loadMore" onClick={loadMore}>Load More</button>
      )}
      <Link className="fab" to="/submit">＋ Add Testimony</Link>
    </div>
  )
}
