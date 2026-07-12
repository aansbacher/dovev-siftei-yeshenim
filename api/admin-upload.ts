import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'tzaddikim-images'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { password, base64, filename } = req.body ?? {}

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!base64 || !filename) return res.status(400).json({ error: 'Missing fields' })

  const buffer = Buffer.from(base64, 'base64')
  const ext = (filename.split('.').pop() ?? 'jpg').toLowerCase()
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false })

  if (error) return res.status(500).json({ error: error.message })

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  res.json({ url: data.publicUrl })
}
