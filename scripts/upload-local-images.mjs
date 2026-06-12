/**
 * Upload Hebrew-named images from public/images/tzaddikim/ to Supabase storage.
 * Hebrew filenames are not allowed as Supabase keys, so we hash them to ASCII.
 * After upload, updates image_url in the tzaddikim table with the full public URL.
 *
 * Usage: node scripts/upload-local-images.mjs
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
const DEST_PREFIX = 'local/'  // separate subfolder from facebook/ images
const BATCH_SIZE = 20

async function main() {
  const env = parseEnv(path.resolve('.env.local'))
  const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '')
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log(`Bucket: ${BUCKET}  Prefix: ${DEST_PREFIX}`)

  // Load all DB records with bare filenames (not starting with http)
  console.log('Loading tzaddikim from DB...')
  let allRows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('tzaddikim')
      .select('id, image_url')
      .range(from, from + 999)
    if (error) { console.error('DB error:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    allRows.push(...data)
    from += 1000
    if (data.length < 1000) break
  }

  // Filter: bare filenames that contain Hebrew (non-ASCII)
  const hebrewBare = allRows.filter(r => {
    const url = r.image_url || ''
    return url && !url.startsWith('http') && /[א-ת]/.test(url)
  })
  console.log(`Records with Hebrew bare filename: ${hebrewBare.length}`)

  // Build map: original_filename → list of record IDs
  const filenameToIds = {}
  for (const row of hebrewBare) {
    const fn = row.image_url
    if (!filenameToIds[fn]) filenameToIds[fn] = []
    filenameToIds[fn].push(row.id)
  }
  const uniqueFilenames = Object.keys(filenameToIds)
  console.log(`Unique Hebrew filenames: ${uniqueFilenames.length}`)

  // Check which local files exist
  const localFiles = new Set(fs.readdirSync(LOCAL_DIR))
  const toUpload = uniqueFilenames.filter(fn => localFiles.has(fn))
  const missing = uniqueFilenames.filter(fn => !localFiles.has(fn))
  console.log(`Found locally: ${toUpload.length}   Missing locally: ${missing.length}`)
  if (missing.length > 0) {
    console.log('Missing files (first 5):', missing.slice(0, 5))
  }
  console.log()

  let uploaded = 0, updated = 0, errors = 0

  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (filename) => {
      const localPath = path.join(LOCAL_DIR, filename)
      const fileData = fs.readFileSync(localPath)
      const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png'
        : filename.toLowerCase().endsWith('.webp') ? 'image/webp'
        : 'image/jpeg'

      // Hash the Hebrew filename to get an ASCII-safe key
      const hash = createHash('sha256').update(filename).digest('hex').slice(0, 20)
      const ext = path.extname(filename) || '.jpg'
      const storagePath = `${DEST_PREFIX}${hash}${ext}`
      const fullUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileData, { upsert: true, contentType: mimeType })

      if (upErr) {
        console.error(`  ✗ Upload failed: ${filename} → ${storagePath} — ${upErr.message}`)
        errors++
        return
      }
      uploaded++

      // Update all DB records that reference this Hebrew filename
      const ids = filenameToIds[filename]
      for (const id of ids) {
        const { error: dbErr } = await supabase
          .from('tzaddikim')
          .update({ image_url: fullUrl })
          .eq('id', id)
        if (dbErr) {
          console.error(`  ✗ DB update failed id=${id}: ${dbErr.message}`)
          errors++
        } else {
          updated++
        }
      }
      console.log(`  ✓ ${filename} → ${storagePath}  (${ids.length} records)`)
    }))
  }

  console.log()
  console.log(`Done!  Uploaded: ${uploaded}  DB updated: ${updated}  Errors: ${errors}`)
}

main().catch(err => { console.error(err); process.exit(1) })
