import { Testimony } from '../types'

export default function TestimonyCard({ item }: { item: Testimony }) {
  const type = item.video_url ? 'Video' : item.audio_url ? 'Audio' : 'Text'
  return (
    <div className="card">
      <div className="header">
        <img
          className="avatar"
          src={item.photo_url || '/avatar.svg'}
          alt={item.name}
          onError={(e) => { e.currentTarget.src = '/avatar.svg' }}
        />
        <div>
          <div className="name">{item.name}</div>
          <div className="meta">{new Date(item.created_at).toLocaleString()}</div>
        </div>
        <div style={{ marginLeft: 'auto' }} className="chip">{type}</div>
      </div>
      {item.text && <div className="text">{item.text}</div>}
      {item.video_url && (
        <video className="media" src={item.video_url} controls />
      )}
      {item.audio_url && (
        <audio className="media" src={item.audio_url} controls />
      )}
    </div>
  )
}
