import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

function parseEnv(f) {
  return fs.readFileSync(f, 'utf8').split(/\r?\n/).reduce((e, l) => {
    const c = l.trim()
    if (!c || c.startsWith('#')) return e
    const [k, ...r] = c.split('=')
    e[k.trim()] = r.join('=').trim()
    return e
  }, {})
}
const env = parseEnv(path.resolve('c:/Users/aansb/dovev-siftei-yeshenim/.env.local'))
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const updates = [
  // שמחה בונם מפשיסחה — תמונה מ-1824 (ויקיפדיה)
  { id: 11650, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%D7%A9%D7%9E%D7%97%D7%94_%D7%91%D7%95%D7%A0%D7%99%D7%9D_%D7%9E%D7%A4%D7%A9%D7%99%D7%A1%D7%97%D7%94.jpg/400px-%D7%A9%D7%9E%D7%97%D7%94_%D7%91%D7%95%D7%A0%D7%99%D7%9D_%D7%9E%D7%A4%D7%A9%D7%99%D7%A1%D7%97%D7%94.jpg' },

  // יצחק יעקב ריינס — מייסד המזרחי
  { id: 11645, image_url: 'https://upload.wikimedia.org/wikipedia/he/thumb/a/ad/Reines.JPG/400px-Reines.JPG' },

  // יחזקאל סרנא — ראש ישיבת חברון
  { id: 11594, image_url: 'https://upload.wikimedia.org/wikipedia/he/thumb/f/fe/Yechezkel_Sarna.jpg/400px-Yechezkel_Sarna.jpg' },

  // חיים פינטו — צדיק מרוקו
  { id: 11713, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Haim_Pinto.JPG/400px-Haim_Pinto.JPG' },

  // ראובן מרגליות — חוקר התורה
  { id: 11601, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/%D7%A8%D7%90%D7%95%D7%91%D7%9F_%D7%9E%D7%A8%D7%92%D7%9C%D7%99%D7%95%D7%AA.jpg/400px-%D7%A8%D7%90%D7%95%D7%91%D7%9F_%D7%9E%D7%A8%D7%92%D7%9C%D7%99%D7%95%D7%AA.jpg' },

  // מהרי"ל — ציון קברו בוורמס
  { id: 12111, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/J%C3%BCdischer_Friedhof_Worms-4243.jpg/400px-J%C3%BCdischer_Friedhof_Worms-4243.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
