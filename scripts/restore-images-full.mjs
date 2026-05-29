/**
 * Full image restore:
 * 1. From local Hebrew-named files: parse month/day from filename, assign to all records that day
 * 2. From existing DB records that still have images: propagate to null siblings on the same day
 * 3. From parsed_tzaddikim.json: explicit popular_name→image mappings
 */
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'

function parseEnv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  return text.split(/\r?\n/).reduce((env, line) => {
    const cleaned = line.trim()
    if (!cleaned || cleaned.startsWith('#')) return env
    const [key, ...rest] = cleaned.split('=')
    env[key.trim()] = rest.join('=').trim()
    return env
  }, {})
}

const LOCAL_DIR = path.resolve('public/images/tzaddikim')
const BUCKET = 'tzaddikim-images'
const PARSED_FILE = 'C:\\Users\\aansb\\Downloads\\facebook_extract\\parsed_tzaddikim.json'
const BATCH_SIZE = 30

// Map Hebrew month names to canonical forms used in DB
const MONTH_MAP = {
  'תשרי': 'תשרי', 'חשוון': 'חשוון', 'כסלו': 'כסלו', 'טבת': 'טבת',
  'שבט': 'שבט', 'אדר': 'אדר', 'ניסן': 'ניסן', 'אייר': 'אייר',
  'סיון': 'סיון', 'תמוז': 'תמוז', 'אב': 'אב', 'אלול': 'אלול',
}

function parseLocalFilename(filename) {
  // Format: {month}_{day}_{n}.jpg  e.g. חשוון_4_286.jpg
  const base = path.basename(filename, path.extname(filename))
  const parts = base.split('_')
  if (parts.length < 2) return null
  const month = parts[0]
  const day = parseInt(parts[1], 10)
  if (!MONTH_MAP[month] || isNaN(day)) return null
  return { month, day }
}

async function main() {
  const env = parseEnv(path.resolve('.env.local'))
  const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '')
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Load all DB records
  console.log('Loading all DB records...')
  let all = [], from = 0
  while (true) {
    const { data, error } = await supabase
      .from('tzaddikim')
      .select('id, popular_name, full_name, hebrew_day, hebrew_month, image_url')
      .range(from, from + 999)
    if (error) { console.error('DB error:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    all.push(...data)
    from += 1000
    if (data.length < 1000) break
  }
  console.log(`Total records: ${all.length}`)
  console.log(`With image: ${all.filter(r => r.image_url).length}`)
  console.log(`Without image: ${all.filter(r => !r.image_url).length}`)

  // Build day key helper
  const dayKey = (month, day) => `${month}|${day}`

  // Step 1: Build day→imageUrl map from records that ALREADY have images
  const dayImageMap = {}
  for (const r of all) {
    if (r.image_url?.startsWith('http')) {
      const k = dayKey(r.hebrew_month, r.hebrew_day)
      if (!dayImageMap[k]) dayImageMap[k] = r.image_url
    }
  }
  console.log(`Days with existing images: ${Object.keys(dayImageMap).length}`)

  // Step 2: Add local file day images for days not yet covered
  if (fs.existsSync(LOCAL_DIR)) {
    const localFiles = fs.readdirSync(LOCAL_DIR)
    for (const filename of localFiles) {
      const parsed = parseLocalFilename(filename)
      if (!parsed) continue
      const k = dayKey(parsed.month, parsed.day)
      if (!dayImageMap[k]) {
        const hash = createHash('sha256').update(filename).digest('hex').slice(0, 20)
        const ext = path.extname(filename) || '.jpg'
        dayImageMap[k] = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/local/${hash}${ext}`
      }
    }
    console.log(`Days with images after local scan: ${Object.keys(dayImageMap).length}`)
  }

  // Step 3: Add from parsed_tzaddikim.json for remaining days
  if (fs.existsSync(PARSED_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(PARSED_FILE, 'utf8'))
    for (const t of parsed) {
      if (!t.image_uri || !t.hebrew_day || !t.hebrew_month) continue
      const k = dayKey(t.hebrew_month, t.hebrew_day)
      if (!dayImageMap[k]) {
        const filename = t.image_uri.split('/').pop()
        dayImageMap[k] = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/facebook/${filename}`
      }
    }
    console.log(`Days with images after parsed JSON: ${Object.keys(dayImageMap).length}`)
  }

  // Step 4: Assign images to null records based on their day
  const toUpdate = []
  for (const r of all) {
    if (r.image_url) continue // already has image
    const k = dayKey(r.hebrew_month, r.hebrew_day)
    const imageUrl = dayImageMap[k]
    if (imageUrl) toUpdate.push({ id: r.id, imageUrl })
  }
  console.log(`\nRecords to restore: ${toUpdate.length}`)

  let updated = 0, errors = 0
  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = toUpdate.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async ({ id, imageUrl }) => {
      const { error } = await supabase
        .from('tzaddikim')
        .update({ image_url: imageUrl })
        .eq('id', id)
      if (error) { console.error(`  ✗ id=${id}: ${error.message}`); errors++ }
      else updated++
    }))
    if (i % 300 === 0) console.log(`  ${Math.min(i + BATCH_SIZE, toUpdate.length)}/${toUpdate.length} — updated: ${updated}`)
  }

  console.log(`\nDone! Restored: ${updated}  Errors: ${errors}`)
  const remaining = all.filter(r => !r.image_url).length - updated + errors
  console.log(`Still without image: ~${remaining}`)
}

main().catch(err => { console.error(err); process.exit(1) })
