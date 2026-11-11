// Live nikud proxy — adds Hebrew vowel-points to a text via Dicta's Nakdan API.
// Server-to-server (avoids browser CORS) and shields the client from the token format.

const DICTA = 'https://nakdan-2-0.loadbalancer.dicta.org.il/api'

type Token = { word: string; sep: boolean; options: string[] }

/** Rebuild a nikud'd string: best option per real word, separators (spaces/punct) kept as-is.
 *  Dicta marks prefix boundaries inside a word with "|" (e.g. "מִ|לִּינִיץ") — strip those for display. */
function rebuild(tokens: Token[]): string {
  return tokens
    .map((t) => (t.sep ? t.word : t.options && t.options.length ? t.options[0] : t.word))
    .join('')
    .replace(/\|/g, '')
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).end(); return }

  const text: string = (req.body?.text ?? '').toString()
  if (!text.trim()) { res.status(400).json({ error: 'missing text' }); return }
  // Guard: skip absurdly long input (our fields are short); caller can chunk if needed.
  if (text.length > 6000) { res.status(200).json({ nikud: text }); return }

  try {
    const r = await fetch(DICTA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'nakdan',
        data: text,
        genre: 'rabbinic',   // best fit for chassidic / rabbinic prose
        addmorph: false,
        keepmetadata: false,
        matchpartial: true,
        keepqq: false,
      }),
    })
    if (!r.ok) { res.status(200).json({ nikud: text }); return }
    const tokens = (await r.json()) as Token[]
    const nikud = Array.isArray(tokens) ? rebuild(tokens) : text
    // Cache at the CDN edge for a day — the same text always nikuds the same way.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    res.status(200).json({ nikud })
  } catch {
    // Degrade gracefully: return the original text so the UI never breaks.
    res.status(200).json({ nikud: text })
  }
}
