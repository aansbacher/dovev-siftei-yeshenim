import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function parseEnv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  return text.split(/\r?\n/).reduce((env, line) => {
    const cleaned = line.trim()
    if (!cleaned || cleaned.startsWith('#')) return env
    const [key, ...rest] = cleaned.split('=')
    env[key] = rest.join('=').trim()
    return env
  }, {})
}

function parseCsv(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text.split(/\r?\n/).filter(Boolean)
  const [headerLine, ...rows] = lines
  const headers = headerLine.split(',').map((col) => col.trim())
  return rows.map((line) => {
    const cols = line.split(',').map((item) => item.trim())
    return headers.reduce((obj, name, index) => {
      obj[name] = cols[index] ?? ''
      return obj
    }, {})
  })
}

async function main() {
  const [,, bucket, csvPath] = process.argv
  if (!bucket || !csvPath) {
    console.error('Usage: node scripts/apply-image-urls.mjs <bucket-name> <mapping.csv>')
    console.error('mapping.csv columns: id,filename')
    process.exit(1)
  }

  const env = parseEnv(path.resolve('.env.local'))
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const mappings = parseCsv(path.resolve(csvPath))

  console.log(`Applying ${mappings.length} URL updates to tzaddikim from bucket ${bucket}`)

  for (const { id, filename } of mappings) {
    if (!id || !filename) {
      console.warn('Skipping invalid row:', { id, filename })
      continue
    }
    const imageUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${filename}`
    const { error } = await supabase
      .from('tzaddikim')
      .update({ image_url: imageUrl })
      .eq('id', id)

    if (error) {
      console.error(`Failed updating id=${id}`, error.message)
      process.exit(1)
    }
    console.log(`Updated id=${id} -> ${imageUrl}`)
  }

  console.log('All updates complete.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
