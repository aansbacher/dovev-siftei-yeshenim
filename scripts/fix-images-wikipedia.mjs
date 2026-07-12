/**
 * Find Wikipedia images for tzaddikim with missing or broken (Facebook) images.
 * Cleans names before searching, tries multiple fallbacks.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k?.trim() && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Strip honorifics and noise from names before searching Wikipedia
function cleanName(name) {
  if (!name) return ''
  return name
    .replace(/זצ["״]ל|זי["״]ע|נ["״]ע|ז["״]ל|זכותו יגן עלינו|זיע["״]א|זצוקלה["״]ה|שליט["״]א|הי["״]ד|עליו השלום/g, '')
    .replace(/\*+/g, '')
    .replace(/\([^)]*\)/g, '')   // remove parentheses content
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Generate search variants from a name
function searchVariants(rawName) {
  const clean = cleanName(rawName)
  const withoutTitle = clean
    .replace(/^(רבי|הרב|ר'|האדמו"ר|הגאון|הצדיק|הרה"ג)\s+/i, '')
    .trim()
  const short = clean.split(/\s+/).slice(0, 3).join(' ')   // first 3 words
  return [...new Set([clean, withoutTitle, short].filter(s => s.length > 2))]
}

async function searchWikipedia(query) {
  for (const lang of ['he', 'en']) {
    try {
      const searchUrl = `https://${lang}.wikipedia.org/w/api.php?` +
        `action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`
      const res = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) })
      const json = await res.json()
      const title = json?.query?.search?.[0]?.title
      if (!title) continue

      const imgUrl = `https://${lang}.wikipedia.org/w/api.php?` +
        `action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=600&format=json&origin=*`
      const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(8000) })
      const imgJson = await imgRes.json()
      const page = Object.values(imgJson?.query?.pages ?? {})[0]
      const thumb = page?.thumbnail?.source
      if (thumb) return { url: thumb, lang, title }
    } catch { /* try next */ }
  }
  return null
}

// Fetch ALL records with missing or Facebook images (paginate)
let allNeedImage = []
let page = 0
const PAGE = 1000
while (true) {
  const { data } = await supabase
    .from('tzaddikim')
    .select('id, popular_name, full_name, image_url, importance_score')
    .order('importance_score', { ascending: false, nullsFirst: false })
    .range(page * PAGE, (page + 1) * PAGE - 1)
  if (!data?.length) break
  allNeedImage.push(...data.filter(r =>
    !r.image_url || r.image_url.includes('facebook') || r.image_url.includes('fbcdn')
  ))
  if (data.length < PAGE) break
  page++
}

console.log(`סה"כ צדיקים שצריכים תמונה: ${allNeedImage.length}`)

let updated = 0, notFound = 0

for (const tzaddik of allNeedImage) {
  const names = [tzaddik.popular_name, tzaddik.full_name].filter(Boolean)
  const queries = [...new Set(names.flatMap(searchVariants))]
  let found = null

  for (const q of queries) {
    found = await searchWikipedia(q)
    if (found) break
    await new Promise(r => setTimeout(r, 250))
  }

  if (found) {
    const { error } = await supabase
      .from('tzaddikim')
      .update({ image_url: found.url })
      .eq('id', tzaddik.id)
    if (error) {
      console.log(`❌ ${tzaddik.popular_name}: ${error.message}`)
    } else {
      console.log(`✓ ${tzaddik.popular_name} → ${found.lang} (${found.title})`)
      updated++
    }
  } else {
    console.log(`  — ${tzaddik.popular_name}`)
    notFound++
  }

  await new Promise(r => setTimeout(r, 300))
}

console.log(`\nסיום: עודכנו ${updated} | לא נמצאו ${notFound}`)
