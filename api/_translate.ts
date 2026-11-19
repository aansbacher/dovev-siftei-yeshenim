import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Shared helper (NOT an HTTP endpoint — leading underscore keeps Vercel from routing it).
// Auto-translates a tzaddik's Hebrew fields into the English (_en) mirror columns.

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Hebrew source field -> English mirror column
const FIELD_MAP: Record<string, string> = {
  popular_name: 'popular_name_en',
  full_name: 'full_name_en',
  role: 'role_en',
  years: 'years_en',
  quote: 'quote_en',
  biography: 'biography_en',
  story: 'story_en',
  torah: 'torah_en',
}
export const HE_TRANSLATABLE = Object.keys(FIELD_MAP)

// Safety net: strip Hebrew honorific abbreviations the model should already have omitted.
const HON = ['zy"a', 'zy”a', 'zt"l', 'zt”l', 'ztz"l', 'ztz”l', 'Hy"d', 'hy"d', 'HY"D', 'zatzal', 'z"l', 'z”l']
function stripHonorifics(s: string): string {
  if (!s) return s
  let out = s
  for (const tok of HON) {
    const esc = tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp('(^|[\\s(,])[,\\s]*' + esc + '(?![\\w])', 'g'), '$1')
  }
  return out.replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1')
    .replace(/,\s*,/g, ',').replace(/[\s,]+$/g, '').replace(/^[\s,]+/g, '').trim()
}

const SYSTEM = `You translate Hebrew content about deceased tzaddikim (righteous Jewish Torah figures) into English for a memorial website. Translate faithfully — add nothing, invent nothing, and omit nothing of substance.

Rules:
- Output natural English. Do not leave whole Hebrew sentences untranslated.
- Translate ONLY what the source says. Never add facts, dates, quotes, or events that are not in the source. If the source is incomplete or cut off mid-sentence, translate what is there and stop where it stops.
- Names and titles: use the accepted Ashkenazi or Sephardi English transliteration (e.g., "Rabbi Yaakov", "Chacham David", "Rebbe", "the Chasam Sofer"). Keep the customary spelling of famous people and sefarim.
- Do NOT write Hebrew honorific abbreviations in English (no zt"l, zy"a, Hy"d, z"l) — omit them entirely.
- Hebrew calendar dates: render as e.g. "8 Kislev 5703 (1941)".
- Keep Torah terms that lack a clean English equivalent (Shas, halachah, chassidus, beis midrash, mitzvos, tzaddik, sefer, yeshiva, etc.).
- Preserve the respectful register and any wordplay where possible.

Return ONLY a valid JSON object whose keys are exactly the field names you were given and whose values are the English translations. No preface, no explanation, no markdown fences.`

function extractJson(text: string): Record<string, string> {
  const s = text.indexOf('{')
  const e = text.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('no JSON object in model output')
  return JSON.parse(text.slice(s, e + 1))
}

/**
 * Translate a tzaddik's Hebrew into the _en columns.
 * @param id tzaddik id
 * @param onlyFields when given, only (re)translate these Hebrew fields (e.g. the ones an edit changed);
 *                   omit to translate every present Hebrew field. Fields whose Hebrew is empty get their _en cleared.
 */
export async function translateTzaddik(
  id: number,
  onlyFields?: string[],
): Promise<{ ok: boolean; translated?: string[]; error?: string }> {
  try {
    const { data: row, error } = await sb
      .from('tzaddikim')
      .select('id, popular_name, full_name, role, years, quote, biography, story, torah')
      .eq('id', id)
      .single()
    if (error || !row) return { ok: false, error: error?.message || 'not_found' }

    const consider = onlyFields && onlyFields.length
      ? onlyFields.filter(f => HE_TRANSLATABLE.includes(f))
      : HE_TRANSLATABLE
    if (!consider.length) return { ok: true, translated: [] }

    const src: Record<string, string> = {}
    const upd: Record<string, string | null> = {}
    for (const f of consider) {
      const v = (row as any)[f]
      if (v && String(v).trim()) src[f] = String(v)
      else upd[FIELD_MAP[f]] = null // Hebrew is empty -> clear its English mirror
    }

    if (Object.keys(src).length) {
      // Lazy-init so a missing/empty key can never crash module load (keeps the admin login working).
      if (!process.env.ANTHROPIC_API_KEY) return { ok: false, error: 'ANTHROPIC_API_KEY not configured' }
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const user = `Translate each of the following Hebrew fields to English. Return ONLY a JSON object whose keys are exactly these field names.\n\n${JSON.stringify(src, null, 2)}`
      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-5-5',
        max_tokens: 4096,
        system: SYSTEM,
        messages: [{ role: 'user', content: user }],
      })
      const text = (msg.content as any[]).filter(b => b.type === 'text').map(b => b.text).join('').trim()
      const json = extractJson(text)
      for (const f of Object.keys(src)) {
        if (json[f] != null && String(json[f]).trim()) upd[FIELD_MAP[f]] = stripHonorifics(String(json[f]))
      }
    }

    if (!Object.keys(upd).length) return { ok: true, translated: [] }
    const { error: e2 } = await sb.from('tzaddikim').update(upd).eq('id', id)
    if (e2) return { ok: false, error: e2.message }
    return { ok: true, translated: Object.keys(upd) }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'translate_failed' }
  }
}
