import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(f) {
  return fs.readFileSync(f,'utf8').split(/\r?\n/).reduce((e,l)=>{
    const c=l.trim(); if(!c||c.startsWith('#')) return e;
    const [k,...r]=c.split('='); e[k.trim()]=r.join('=').trim(); return e;
  },{})
}
const env = parseEnv(path.resolve('.env.local'))
const supabase = createClient(env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/,''), env.SUPABASE_SERVICE_ROLE_KEY)

let all = [], from = 0
while(true) {
  const { data, error } = await supabase.from('tzaddikim')
    .select('id,hebrew_month,image_url,biography,story,torah')
    .range(from, from+999)
  if(error) { console.error(error.message); process.exit(1) }
  if(!data || data.length===0) break
  all.push(...data)
  from += 1000
  if(data.length < 1000) break
}

const total = all.length
const withImage = all.filter(r=>r.image_url).length
const withBio   = all.filter(r=>r.biography && r.biography.trim().length>10).length
const withStory = all.filter(r=>r.story && r.story.trim().length>10).length
const withTorah = all.filter(r=>r.torah && r.torah.trim().length>10).length
const withAll3  = all.filter(r=>r.biography && r.biography.trim().length>10 && r.story && r.story.trim().length>10 && r.torah && r.torah.trim().length>10).length
const withNone  = all.filter(r=>!r.biography && !r.story && !r.torah).length

console.log('=== סטטיסטיקה כללית ===')
console.log('סה"כ רשומות:  ', total)
console.log('עם תמונה:     ', withImage, `(${Math.round(withImage/total*100)}%)`)
console.log('עם ביוגרפיה:  ', withBio,   `(${Math.round(withBio/total*100)}%)`)
console.log('עם סיפור:     ', withStory,  `(${Math.round(withStory/total*100)}%)`)
console.log('עם תורה:      ', withTorah,  `(${Math.round(withTorah/total*100)}%)`)
console.log('עם כל 3:      ', withAll3,   `(${Math.round(withAll3/total*100)}%)`)
console.log('ללא שום תוכן: ', withNone,   `(${Math.round(withNone/total*100)}%)`)

const monthOrder = ['תשרי','חשוון','כסלו','טבת','שבט','אדר','ניסן','אייר','סיון','תמוז','אב','אלול']
const months = {}
for(const r of all) {
  const m = r.hebrew_month || '?'
  if(!months[m]) months[m]={total:0,bio:0,story:0,torah:0,image:0}
  months[m].total++
  if(r.biography && r.biography.trim().length>10) months[m].bio++
  if(r.story    && r.story.trim().length>10)    months[m].story++
  if(r.torah    && r.torah.trim().length>10)    months[m].torah++
  if(r.image_url) months[m].image++
}

console.log('\n=== לפי חודש: total | ביוגרפיה | סיפור | תורה | תמונה ===')
for(const m of monthOrder) {
  const s = months[m]; if(!s) continue
  const pct = n => String(Math.round(n/s.total*100)).padStart(3)+'%'
  console.log(`${m.padEnd(7)} ${String(s.total).padStart(4)}  bio:${pct(s.bio)}  story:${pct(s.story)}  torah:${pct(s.torah)}  img:${pct(s.image)}`)
}
