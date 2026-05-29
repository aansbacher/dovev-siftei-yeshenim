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

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  const [,, bucket, localDir, destPrefix = ''] = process.argv
  if (!bucket || !localDir) {
    console.error('Usage: node scripts/upload-images-to-bucket.mjs <bucket-name> <local-dir> [dest-prefix]')
    process.exit(1)
  }

  const env = parseEnv(path.resolve('.env.local'))
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const absoluteDir = path.resolve(localDir)
  const files = walkDir(absoluteDir)

  console.log(`Uploading ${files.length} files from ${absoluteDir} to bucket ${bucket}`)

  for (const filePath of files) {
    const relativePath = path.relative(absoluteDir, filePath).replace(/\\/g, '/')
    const remotePath = destPrefix ? `${destPrefix.replace(/\\/g, '/')}/${relativePath}` : relativePath

    console.log(`Uploading ${relativePath} -> ${remotePath}`)
    const fileData = fs.readFileSync(filePath)

    const { error } = await supabase.storage
      .from(bucket)
      .upload(remotePath, fileData, { upsert: true })

    if (error) {
      console.error(`Failed uploading ${relativePath}:`, error.message)
      process.exit(1)
    }
  }

  console.log('Upload complete.')
  console.log(`Public URL prefix: ${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${destPrefix ? `${destPrefix.replace(/\\/g, '/')}/` : ''}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
