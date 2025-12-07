import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../shared/supabase'
import { Testimony } from '../types'
import TestimonyCard from '../shared/TestimonyCard'

export default function Home() {
  const [items, setItems] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 8

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('testimonies')
        .select('*')
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
    const { data } = await supabase
      .from('testimonies')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)
    const list = data || []
    setItems((prev) => [...prev, ...list])
    if (list.length < pageSize) setHasMore(false)
  }

  return (
    <div className="container">
      <div className="hero">
        <div>
          <h1 className="title">Believers' Testimonies</h1>
          <div className="sub">Stories of faith, hope, and transformation</div>
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
