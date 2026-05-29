/**
 * Restores image_url for records that had their image set to null.
 * Uses parsed_tzaddikim.json as the source of the original image mappings.
 *
 * Usage: node scripts/restore-images.mjs
 */
import fs from 'fs'
import path from 'path'
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

const PARSED_FILE = 'C:\\Users\\aansb\\Downloads\\facebook_extract\\parsed_tzaddikim.json'
const BUCKET = 'tzaddikim-images'
const BATCH_SIZE = 20

async function main() {
  const env = parseEnv(path.resolve('.env.local'))
  const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '')
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Load the original parsed data
  const parsed = JSON.parse(fs.readFileSync(PARSED_FILE, 'utf8'))
  console.log(`Loaded ${parsed.length} entries from parsed_tzaddikim.json`)

  // Build map: (popular_name, hebrew_day, hebrew_month) → image URL
  const nameKey = (name, day, month) => `${name}|${day}|${month}`
  const imageMap = {}
  for (const t of parsed) {
    if (!t.image_uri) continue
    const filename = t.image_uri.split('/').pop()
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/facebook/${filename}`
    const key = nameKey(t.popular_name, t.hebrew_day, t.hebrew_month)
    imageMap[key] = imageUrl
  }
  console.log(`Image mappings from source: ${Object.keys(imageMap).length}`)

  // Load all DB records with no image
  console.log('Loading DB records with no image...')
  let all = [], from = 0
  while (true) {
    const { data, error } = await supabase
      .from('tzaddikim')
      .select('id, popular_name, full_name, hebrew_day, hebrew_month, image_url')
      .is('image_url', null)
      .range(from, from + 999)
    if (error) { console.error('DB error:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    all.push(...data)
    from += 1000
    if (data.length < 1000) break
  }
  console.log(`Records with no image: ${all.length}`)

  // Match records to image URLs
  const toUpdate = []
  for (const r of all) {
    // Try matching by popular_name first
    let imageUrl = imageMap[nameKey(r.popular_name, r.hebrew_day, r.hebrew_month)]
    // Fall back to full_name if popular_name didn't match
    if (!imageUrl && r.full_name) {
      imageUrl = imageMap[nameKey(r.full_name, r.hebrew_day, r.hebrew_month)]
    }
    if (imageUrl) {
      toUpdate.push({ id: r.id, imageUrl })
    }
  }
  console.log(`Matched: ${toUpdate.length} records`)

  // Update in batches
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
    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`  ${Math.min(i + BATCH_SIZE, toUpdate.length)}/${toUpdate.length} — updated: ${updated}, errors: ${errors}`)
    }
  }

  console.log(`\nDone! Updated: ${updated}  Errors: ${errors}`)
  console.log(`Still without image: ${all.length - updated}`)
}

main().catch(err => { console.error(err); process.exit(1) })
