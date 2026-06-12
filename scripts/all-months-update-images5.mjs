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
  // שפת אמת — קבר בגור, שבט ה
  { id: 11779, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/%D7%A7%D7%91%D7%A8%D7%99_%D7%94%D7%97%D7%99%D7%93%D7%95%D7%A9%D7%99_%D7%94%D7%A8%D7%99%22%D7%9D_%D7%95%D7%94%D7%A9%D7%A4%D7%AA_%D7%90%D7%9E%D7%AA_%D7%9E%D7%92%D7%95%D7%A8_%282%29.jpg/400px-%D7%A7%D7%91%D7%A8%D7%99_%D7%94%D7%97%D7%99%D7%93%D7%95%D7%A9%D7%99_%D7%94%D7%A8%D7%99%22%D7%9D_%D7%95%D7%94%D7%A9%D7%A4%D7%AA_%D7%90%D7%9E%D7%AA_%D7%9E%D7%92%D7%95%D7%A8_%282%29.jpg' },

  // ר' זושא מאניפולי — מאוזוליאום, שבט א-ב
  { id: 10360, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mausoleum_with_Zusha_of_Hanipol%2C_Dov_Ber_of_Mezeritch.jpg/400px-Mausoleum_with_Zusha_of_Hanipol%2C_Dov_Ber_of_Mezeritch.jpg' },
  { id: 10369, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mausoleum_with_Zusha_of_Hanipol%2C_Dov_Ber_of_Mezeritch.jpg/400px-Mausoleum_with_Zusha_of_Hanipol%2C_Dov_Ber_of_Mezeritch.jpg' },

  // בני יששכר — ספרו, טבת יח
  { id: 11768, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Book-beney_isoschor.jpg/400px-Book-beney_isoschor.jpg' },

  // קצות החושן — כריכת ספרו, טבת יט
  { id: 11769, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Ktzot.jpg/400px-Ktzot.jpg' },

  // הקלויזנבורגר — אדמו"ר, ח' תשרי (תיקון: אהרן ליב שטינמן כבר יש, זה מברדיוב)
  { id: 9435, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Admor_sitting_with_bekashe.jpg/400px-Admor_sitting_with_bekashe.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const { error } = await sb.from('tzaddikim').update({ image_url: u.image_url }).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nתמונות — עודכנו: ${passed} | נכשלו: ${failed}`)
