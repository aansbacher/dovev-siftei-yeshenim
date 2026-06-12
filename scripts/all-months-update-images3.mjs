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
  // בן איש חי — רבי יוסף חיים מבגדד, אלול יג
  { id: 11660, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Rabbi_Yosef_Haim.jpg/400px-Rabbi_Yosef_Haim.jpg' },

  // מהר"ל מפראג — אלול יח (פסל בפראג)
  { id: 11666, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rabbi_L%C3%B6w_Saloun.JPG/400px-Rabbi_L%C3%B6w_Saloun.JPG' },

  // רב קדורי — שבט טז
  { id: 11886, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/GPO_-_Rabbi_Yitzchak_Kaduri_%28cropped%29.jpg/400px-GPO_-_Rabbi_Yitzchak_Kaduri_%28cropped%29.jpg' },

  // אור שמח — מאיר שמחה מדווינסק, אלול כד
  { id: 11573, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ohr_Sameach.jpg/400px-Ohr_Sameach.jpg' },

  // יהונתן אייבשיץ — אלול כו
  { id: 11692, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Eybeschuetz00.jpg/400px-Eybeschuetz00.jpg' },

  // קלונימוס קלמן שפירא — פיאסצנה, חשוון ד
  { id: 11731, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Piesesne.jpg/400px-Piesesne.jpg' },

  // הרב אהרן ליב שטינמן — כסלו כד
  { id: 11757, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/%D7%94%D7%A8%D7%91_%D7%A9%D7%98%D7%99%D7%99%D7%A0%D7%9E%D7%A0%D7%9F_5.jpg/400px-%D7%94%D7%A8%D7%91_%D7%A9%D7%98%D7%99%D7%99%D7%A0%D7%9E%D7%A0%D7%9F_5.jpg' },

  // ר' חיים עוזר גרודז'ינסקי — אב ה
  { id: 12070, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Chaim_Ozer_Grodzinski.jpg/400px-Chaim_Ozer_Grodzinski.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
