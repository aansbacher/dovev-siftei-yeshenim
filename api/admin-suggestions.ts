import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_STATUS = ['pending', 'processing', 'done', 'rejected']

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { password, action, id, status } = req.body ?? {}

  const envPw = (process.env.ADMIN_PASSWORD ?? '').trim()
  if (!envPw) return res.status(401).json({ error: 'env_missing' })
  if ((password ?? '').trim() !== envPw) return res.status(401).json({ error: 'wrong_password' })

  // list pending/all suggestions (newest first)
  if (!action || action === 'list') {
    const { data, error } = await supabase
      .from('suggestions')
      .select('id, created_at, type, tzaddik_id, tzaddik_name, hebrew_date, content, sources, status')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, rows: data ?? [] })
  }

  // update a suggestion's status
  if (action === 'set_status') {
    if (!id || !ALLOWED_STATUS.includes(status)) return res.status(400).json({ error: 'bad_params' })
    const { error } = await supabase.from('suggestions').update({ status }).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  return res.status(400).json({ error: 'unknown_action' })
}
