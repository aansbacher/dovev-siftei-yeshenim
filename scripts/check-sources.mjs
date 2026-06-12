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
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

for (const month of ['סיון', 'תמוז']) {
  const { data } = await supabase
    .from('tzaddikim')
    .select('id, hebrew_day, popular_name, sources, image_url')
    .eq('hebrew_month', month)
    .order('hebrew_day')

  let withSources = 0, withImages = 0, dirshu = 0, noSources = []

  for (const r of data) {
    const hasSrc = r.sources && r.sources.length > 0
    if (hasSrc) {
      withSources++
      const srcs = Array.isArray(r.sources) ? r.sources : [r.sources]
      if (srcs.some(s => String(s).includes('dirshu'))) dirshu++
    } else {
      noSources.push(`  יום ${r.hebrew_day} id=${r.id} ${r.popular_name || ''}`)
    }
    if (r.image_url) withImages++
  }

  console.log(`\n=== ${month} (${data.length} רשומות) ===`)
  console.log(`עם מקורות: ${withSources}/${data.length} | מתוכם דירשו: ${dirshu} | עם תמונה: ${withImages}`)
  if (noSources.length) {
    console.log(`חסרי מקורות (${noSources.length}):`)
    noSources.forEach(l => console.log(l))
  } else {
    console.log('✓ לכולם יש מקורות')
  }
}
