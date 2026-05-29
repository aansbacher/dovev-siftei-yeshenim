import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(f) {
  return fs.readFileSync(f,'utf8').split(/\r?\n/).reduce((e,l)=>{
    const c=l.trim(); if(!c||c.startsWith('#')) return e
    const [k,...r]=c.split('='); e[k.trim()]=r.join('=').trim(); return e
  },{})
}
const env = parseEnv(path.resolve('.env.local'))
const supabase = createClient(env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/,''), env.SUPABASE_SERVICE_ROLE_KEY)

let all = [], from = 0
while(true) {
  const { data, error } = await supabase.from('tzaddikim')
    .select('id,popular_name,full_name,hebrew_month,hebrew_day,image_url,biography,story,torah')
    .range(from, from+999)
  if(error) { console.error(error.message); process.exit(1) }
  if(!data || data.length===0) break
  all.push(...data)
  from += 1000
  if(data.length < 1000) break
}

// --- 1. Duplicate images ---
const imageGroups = {}
for(const r of all) {
  if(!r.image_url) continue
  if(!imageGroups[r.image_url]) imageGroups[r.image_url] = []
  imageGroups[r.image_url].push(r)
}
const dupImages = Object.entries(imageGroups).filter(([,v]) => v.length > 1)
console.log(`\n=== תמונות משוכפלות: ${dupImages.length} כתובות מופיעות ביותר מרשומה אחת ===`)
// Show only cases where records are on DIFFERENT days (same-day sharing is acceptable)
const crossDayDups = dupImages.filter(([, recs]) => {
  const keys = new Set(recs.map(r => r.hebrew_month + '|' + r.hebrew_day))
  return keys.size > 1
})
console.log(`כפילויות חוצות-יום (בעייתיות): ${crossDayDups.length}`)
crossDayDups.slice(0,20).forEach(([url, recs]) => {
  console.log('  URL:', url.slice(-40))
  recs.forEach(r => console.log(`    ${r.hebrew_month} ${r.hebrew_day} — ${(r.popular_name||r.full_name||'').slice(0,35)}`))
})

// Same-day sharing
const sameDayDups = dupImages.filter(([, recs]) => {
  const keys = new Set(recs.map(r => r.hebrew_month + '|' + r.hebrew_day))
  return keys.size === 1
})
console.log(`\nכפילויות בתוך אותו יום (צפוי): ${sameDayDups.length}`)

// --- 2. Quality issues in text ---
const DAY_HEADER = /היום\s+יום\s+(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)|יום\s+(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)\s+[א-ת]|^-\s*הרב|^-\s*רבי|^\s*[-–]\s*(הרב|רבי|חכם)/m
const DATE_ONLY = /^\s*[(\[]\s*[0-9]{4}|^\s*[(\[]\s*ה'/
const CHESS = /שחמטאי|chess|Chess/i
const TOO_SHORT = 15

const issues = []
for(const r of all) {
  const fields = { biography: r.biography, story: r.story, torah: r.torah }
  for(const [field, val] of Object.entries(fields)) {
    if(!val || val.trim().length < TOO_SHORT) continue
    if(DAY_HEADER.test(val)) issues.push({ id: r.id, field, issue: 'כותרת יום', name: (r.popular_name||r.full_name||'').slice(0,35), month: r.hebrew_month, day: r.hebrew_day })
    else if(DATE_ONLY.test(val)) issues.push({ id: r.id, field, issue: 'תאריך בלבד', name: (r.popular_name||r.full_name||'').slice(0,35), month: r.hebrew_month, day: r.hebrew_day })
    else if(CHESS.test(val)) issues.push({ id: r.id, field, issue: 'שחמטאי-תוכן שגוי', name: (r.popular_name||r.full_name||'').slice(0,35), month: r.hebrew_month, day: r.hebrew_day })
  }
}
console.log(`\n=== בעיות איכות תוכן: ${issues.length} ===`)
issues.forEach(i => console.log(`  id=${i.id} [${i.field}] ${i.issue} — ${i.month} ${i.day} ${i.name}`))

// --- 3. Missing content summary ---
const missing = all.filter(r => !r.biography || !r.story || !r.torah)
console.log(`\n=== חסר תוכן: ${missing.length} רשומות ===`)
const byMonth = {}
for(const r of missing) {
  const m = r.hebrew_month||'?'
  if(!byMonth[m]) byMonth[m] = 0
  byMonth[m]++
}
const monthOrder = ['תשרי','חשוון','כסלו','טבת','שבט','אדר','ניסן','אייר','סיון','תמוז','אב','אלול']
for(const m of monthOrder) if(byMonth[m]) console.log(`  ${m}: ${byMonth[m]}`)
