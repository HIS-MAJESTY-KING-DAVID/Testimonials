export type Testimony = {
  id: string
  name: string
  phone: string | null
  email: string | null
  photo_url: string | null
  video_url: string | null
  audio_url: string | null
  text: string | null
  is_validated: boolean
  created_at: string
}
