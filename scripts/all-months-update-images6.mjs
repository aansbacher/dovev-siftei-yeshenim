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
  // ר' איסר זלמן מלצר — כסלו י
  { id: 11753, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Isser_Zalman_Meltzer.JPG/400px-Isser_Zalman_Meltzer.JPG' },

  // אברבנאל — סיון יט (ציור תקופתי)
  { id: 12003, image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Abravanel.JPG' },

  // ר' ישראל מרוז'ין — ארמון שושלת סדיגורה (חשוון ג + תשרי יד)
  { id: 11828, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Sadigura_rebbe%27s_palace.jpg/400px-Sadigura_rebbe%27s_palace.jpg',
    story: 'רבי ישראל פרידמן מרוז\'ין (ג\' חשוון ת"ר - תר"י, 1797-1850), נין הבעל שם טוב, היה מגדולי צדיקי דורו ומהבולטים בין אדמו"רי המאה ה-19. נודע בהנהגתו המלכותית: נסע בכרכרה מפוארת, לבש בגדי משי ופרוות יקרות, ולחצרו נהרו אלפים. אמרו שמנהגיו המלכותיים הם תיקון לנשמות הנמוכות ביותר. הוקיר את כבוד ישראל כגאולה עצמה. ייסד את שושלת סדיגורה-בויאן-קאריצ\'ין שהמשיכה להאיר עד היום.' },

  { id: 11806, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Sadigura_rebbe%27s_palace.jpg/400px-Sadigura_rebbe%27s_palace.jpg' },

  // חוזה מלובלין — קבר (אב ט)
  { id: 12079, image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Old-Jewish-Cemetery.Lublin.mazevah.Chozeh.2015.mb.jpg/400px-Old-Jewish-Cemetery.Lublin.mazevah.Chozeh.2015.mb.jpg' },
]

let passed = 0, failed = 0

for (const u of updates) {
  const upd = { image_url: u.image_url }
  if (u.story) upd.story = u.story
  const { error } = await sb.from('tzaddikim').update(upd).eq('id', u.id)
  if (error) { console.error(`✗ id=${u.id}: ${error.message}`); failed++ }
  else { process.stdout.write(`✓${u.id} `); passed++ }
}

console.log(`\n\nעודכנו: ${passed} | נכשלו: ${failed}`)
