/**
 * Uploads tzaddik images from the Facebook export to Supabase Storage
 * and updates image_url in the tzaddikim table.
 *
 * Usage:
 *   node scripts/upload-facebook-images.mjs <facebook-media-dir>
 *
 * Example:
 *   node scripts/upload-facebook-images.mjs "C:\Users\aansb\Downloads\facebook-ariansbacher-2026-05-12-337VNCuJ\your_facebook_activity\posts\media\your_posts"
 *
 * Requires:
 *   - .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   - A public Supabase storage bucket named "tzaddikim"
 *   - tzaddikim_clean.xlsx in the project root (for filename→tzaddik mapping)
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

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

const BUCKET = 'tzaddikim-images'
const PATH_PREFIX = 'facebook/'   // upload into facebook/ subfolder, matching existing URLs
const BATCH_SIZE = 20

async function main() {
  const [,, mediaDir] = process.argv
  if (!mediaDir) {
    console.error('Usage: node scripts/upload-facebook-images.mjs <facebook-media-dir>')
    process.exit(1)
  }

  const env = parseEnv(path.resolve('.env.local'))
  const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '')
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Verify bucket exists
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets()
  if (bErr) { console.error('Cannot list buckets:', bErr.message); process.exit(1) }
  if (!buckets.find(b => b.name === BUCKET)) {
    console.error(`Bucket "${BUCKET}" not found. Please create it in the Supabase dashboard:`)
    console.error(`  https://supabase.com/dashboard/project/${new URL(supabaseUrl).hostname.split('.')[0]}/storage/buckets`)
    console.error('  Name: tzaddikim | Enable "Public bucket"')
    process.exit(1)
  }
  console.log(`✓ Bucket "${BUCKET}" found`)

  // Load the Excel to get filename→tzaddik mapping
  // We use the tzaddikim table directly to find which filenames are in use
  console.log('Loading tzaddikim from database...')
  let allRows = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('tzaddikim')
      .select('id, popular_name, image_url')
      .range(from, from + 999)
    if (error) { console.error('DB error:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    allRows.push(...data)
    from += 1000
    if (data.length < 1000) break
  }
  console.log(`Loaded ${allRows.length} tzaddikim from DB`)

  // Build map: filename → list of tzaddik ids
  const filenameToIds = {}
  for (const row of allRows) {
    if (row.image_url) {
      // image_url might be a bare filename or a full URL
      const fn = row.image_url.includes('/') ? path.basename(row.image_url) : row.image_url
      if (!filenameToIds[fn]) filenameToIds[fn] = []
      filenameToIds[fn].push(row.id)
    }
  }
  console.log(`Found ${Object.keys(filenameToIds).length} unique image filenames in DB`)

  // List local files
  const localFiles = new Set(fs.readdirSync(mediaDir))
  console.log(`Found ${localFiles.size} files in media directory`)

  // Find files that need uploading (in DB and in local dir)
  const toUpload = Object.keys(filenameToIds).filter(fn => localFiles.has(fn))
  console.log(`Files to upload: ${toUpload.length}`)

  const notFound = Object.keys(filenameToIds).filter(fn => !localFiles.has(fn))
  if (notFound.length > 0) {
    console.log(`Files referenced in DB but not found locally (${notFound.length}):`, notFound.slice(0, 5), '...')
  }

  // Upload in batches and update DB
  let uploaded = 0
  let updated = 0
  let errors = 0

  for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
    const batch = toUpload.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (filename) => {
      const localPath = path.join(mediaDir, filename)
      const fileData = fs.readFileSync(localPath)
      const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png'
        : filename.toLowerCase().endsWith('.webp') ? 'image/webp'
        : 'image/jpeg'

      const storagePath = `${PATH_PREFIX}${filename}`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileData, { upsert: true, contentType: mimeType })

      if (upErr) {
        console.error(`  ✗ Upload failed: ${filename} — ${upErr.message}`)
        errors++
        return
      }

      uploaded++
      const fullUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`

      // Update all tzaddikim that reference this filename
      const ids = filenameToIds[filename]
      for (const id of ids) {
        const { error: dbErr } = await supabase
          .from('tzaddikim')
          .update({ image_url: fullUrl })
          .eq('id', id)
        if (dbErr) {
          console.error(`  ✗ DB update failed: id=${id} — ${dbErr.message}`)
          errors++
        } else {
          updated++
        }
      }
    }))

    const progress = Math.min(i + BATCH_SIZE, toUpload.length)
    console.log(`  ${progress}/${toUpload.length} — uploaded: ${uploaded}, db updated: ${updated}, errors: ${errors}`)
  }

  console.log(`\nDone!`)
  console.log(`  Uploaded: ${uploaded} files`)
  console.log(`  DB records updated: ${updated}`)
  console.log(`  Errors: ${errors}`)
}

main().catch(err => { console.error(err); process.exit(1) })
