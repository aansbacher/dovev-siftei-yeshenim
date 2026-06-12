import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(f) {
  return fs.readFileSync(f, 'utf8').split(/\r?\n/).reduce((e, l) => {
    const c = l.trim()
    if (!c || c.startsWith('#')) return e
    const [k, ...r] = c.split('=')
    e[k.trim()] = r.join('=').trim()
    return e
  }, {})
}
const env = parseEnv(path.resolve('.env.local'))
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// Check image status for manually-added Av records (batches 2-7)
const ids = [
  12076,12077,12078,12079,12080, // batch2
  12081,12082,12083,12084,       // batch3
  12085,12086,12087,12088,12089, // batch4
  12090,12091,12092,12093,       // batch5
  12094,12095,12096,             // batch6
  12097,12098,12099,12100,12101,12102, // batch7
]

const { data } = await sb.from('tzaddikim')
  .select('id, popular_name, image_url')
  .in('id', ids)
  .order('id')

console.log('צדיקים ללא תמונה:')
for (const r of data) {
  const status = r.image_url ? `✓ ${r.image_url.slice(0,60)}` : '✗ אין תמונה'
  console.log(`  id=${r.id} ${(r.popular_name||'').padEnd(20)} ${status}`)
}
