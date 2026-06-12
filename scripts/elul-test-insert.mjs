import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
const env = fs.readFileSync('c:/Users/aansb/dovev-siftei-yeshenim/.env.local','utf8').split(/\r?\n/).reduce((e,l)=>{const c=l.trim();if(!c||c.startsWith('#'))return e;const[k,...r]=c.split('=');e[k.trim()]=r.join('=').trim();return e},{})
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const {data: maxData} = await sb.from('tzaddikim').select('id').order('id',{ascending:false}).limit(1)
console.log('max id:', maxData[0].id)

const {data, error} = await sb.from('tzaddikim')
  .insert({hebrew_month:'אלול', hebrew_day:16, popular_name:'test_16', years:'תש"פ', story:'test', sources:['test']})
  .select('id')

if (error) console.log('insert error:', error.message, error.details)
else {
  console.log('inserted id:', data[0].id)
  await sb.from('tzaddikim').delete().eq('id', data[0].id)
  console.log('cleaned up')
}
