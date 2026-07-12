import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: any, res: any) {
  const { q = '', page = '0', size = '25' } = req.query
  const offset = parseInt(page as string) * parseInt(size as string)

  let query = supabase
    .from('tzaddikim')
    .select('id, popular_name, full_name, hebrew_month, hebrew_day, image_url, biography, story, torah, quote, importance_score')
    .order('importance_score', { ascending: false, nullsFirst: false })
    .range(offset, offset + parseInt(size as string) - 1)

  if (q) {
    query = (query as any).ilike('popular_name', `%${q}%`)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data ?? [])
}
