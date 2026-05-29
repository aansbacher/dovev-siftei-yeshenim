/**
 * Clean full_name fields that contain dates, years, or parenthetical info.
 * Rule: full_name should contain only the name — no dates, nicknames, or years.
 * The extracted extra info is prepended to the description field if description is empty.
 *
 * Usage: node scripts/fix-long-names.mjs [--dry-run]
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

const DATE_PATTERN = /\d{4}|ה'[תשצרקפ]|תר[א-ת]|תק[א-ת]|תש[א-ת]|נפטר|נולד|בולטימ|גאבס/
const NICK_PATTERN = /מכונה|כינויו|כינוי|כונה|ידוע|נקרא|לעיתים|קרי|היה מכונה/

function hasDateOrNick(str) {
  return DATE_PATTERN.test(str) || NICK_PATTERN.test(str)
}

// Try to extract a clean name from a full_name that contains dates/nicknames
function extractCleanName(name) {
  if (!name) return null

  // Scan for '(' whose content contains date/nickname info
  let trimAt = -1
  let i = 0
  while (i < name.length) {
    if (name[i] === '(') {
      const closeIdx = name.indexOf(')', i + 1)
      const inner = closeIdx >= 0 ? name.slice(i + 1, closeIdx) : name.slice(i + 1, Math.min(i + 80, name.length))
      if (hasDateOrNick(inner)) {
        trimAt = i
        break
      }
      i = closeIdx >= 0 ? closeIdx + 1 : name.length
    } else {
      i++
    }
  }

  // Also check for ; year (semicolon before year — sometimes used instead of parens)
  const semiYearMatch = name.match(/\s*;\s*(?:~?\d{4}|~?ה'[תשצרקפ])/)
  if (semiYearMatch && semiYearMatch.index > 3) {
    trimAt = trimAt >= 0 ? Math.min(trimAt, semiYearMatch.index) : semiYearMatch.index
  }

  // Standalone Gregorian year preceded by comma or space (not inside parens)
  if (trimAt < 0) {
    const yearMatch = name.match(/(?:\s*,\s*|\s+)(~?\d{4})\b/)
    if (yearMatch && yearMatch.index > 3) trimAt = yearMatch.index
  }

  if (trimAt > 3) {
    // Extract the name part, then clean up any short inline-nickname parens in it
    let cleanName = name.slice(0, trimAt).trim()
    cleanName = cleanName
      .replace(/\s*\(([^)]{1,25})\)\s*/g, (m, inner) => {
        if (hasDateOrNick(inner)) return m
        if (inner.trim().split(/\s+/).length > 2) return m
        return ' '
      })
      .replace(/\s+/g, ' ')
      .trim()
    if (cleanName.length >= 4) return cleanName
  }

  // Remove short inline alternate-name parens even with no date — e.g., (הירשל), (משה'ניו)
  const inlineCleaned = name
    .replace(/\s*\(([^)]{1,20})\)\s*/g, (m, inner) => {
      if (hasDateOrNick(inner)) return m
      if (inner.trim().split(/\s+/).length > 2) return m
      return ' '
    })
    .replace(/\s+/g, ' ')
    .trim()
  if (inlineCleaned !== name && inlineCleaned.length >= 4) return inlineCleaned

  return null
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const env = parseEnv(path.resolve('.env.local'))
  const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '')
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Loading tzaddikim...')
  let all = [], from = 0
  while (true) {
    const { data, error } = await supabase
      .from('tzaddikim')
      .select('id, full_name, popular_name, biography')
      .range(from, from + 999)
    if (error) { console.error('DB error:', error.message); process.exit(1) }
    if (!data || data.length === 0) break
    all.push(...data)
    from += 1000
    if (data.length < 1000) break
  }
  console.log(`Loaded ${all.length} records`)

  const fixes = []
  for (const r of all) {
    const clean = extractCleanName(r.full_name)
    if (clean && clean !== r.full_name) {
      fixes.push({
        id: r.id,
        oldName: r.full_name,
        newName: clean,
        extraInfo: r.full_name.slice(clean.length).trim(),
        currentDesc: r.biography || ''
      })
    }
  }

  console.log(`\nRecords needing full_name cleanup: ${fixes.length}`)
  console.log('\nFirst 20 examples:')
  fixes.slice(0, 20).forEach(f => {
    console.log(`  ID ${f.id}:`)
    console.log(`    old: ${f.oldName.slice(0, 70)}`)
    console.log(`    new: ${f.newName}`)
  })

  if (dryRun) {
    console.log('\n[dry-run] No changes made.')
    return
  }

  let updated = 0, errors = 0
  const BATCH = 20
  for (let i = 0; i < fixes.length; i += BATCH) {
    const batch = fixes.slice(i, i + BATCH)
    await Promise.all(batch.map(async (f) => {
      // Build new description: if empty, use the extra info; otherwise leave alone
      const newBio = !f.currentDesc && f.extraInfo.length > 3
        ? f.extraInfo
        : f.currentDesc

      const { error } = await supabase
        .from('tzaddikim')
        .update({ full_name: f.newName, biography: newBio || null })
        .eq('id', f.id)
      if (error) {
        console.error(`  ✗ id=${f.id}: ${error.message}`)
        errors++
      } else {
        updated++
      }
    }))
    console.log(`  ${Math.min(i + BATCH, fixes.length)}/${fixes.length} — updated: ${updated}, errors: ${errors}`)
  }

  console.log(`\nDone! Updated: ${updated}  Errors: ${errors}`)
}

main().catch(err => { console.error(err); process.exit(1) })
