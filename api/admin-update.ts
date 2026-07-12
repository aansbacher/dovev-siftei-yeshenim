import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_FIELDS = ['image_url', 'biography', 'story', 'torah', 'quote', 'popular_name', 'full_name']

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { password, id, fields, checkOnly } = req.body ?? {}

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (checkOnly) return res.json({ ok: true })

  if (!id || !fields) return res.status(400).json({ error: 'Missing id or fields' })

  const clean: Record<string, unknown> = {}
  for (const k of ALLOWED_FIELDS) {
    if (k in fields) clean[k] = fields[k] || null
  }

  if (Object.keys(clean).length === 0) return res.status(400).json({ error: 'No valid fields' })

  const { error } = await supabase.from('tzaddikim').update(clean).eq('id', id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
}
