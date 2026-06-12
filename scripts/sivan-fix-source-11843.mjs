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

const { error } = await supabase
  .from('tzaddikim')
  .update({ sources: ['קדושים בכל יום (Facebook)'] })
  .eq('id', 11843)

if (error) console.error('✗', error.message)
else console.log('✓ id=11843 (ר\' יוסף יצחק שניאורסון מאוורוטש) — עודכן מקור')
