import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const tabContext: Record<string, string> = {
  teaching: 'תורתו, ספריו, ואמרותיו',
  story:    'סיפורים מחייו ואירועים מתועדים',
  bio:      'ביוגרפיה, תאריכים, תפקידים, ומשפחה',
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).end(); return }

  const { tzaddikName, query, tabType = 'bio' } = req.body ?? {}
  if (!tzaddikName || !query?.trim()) {
    res.status(400).json({ error: 'חסרים שדות' }); return
  }

  const context = tabContext[tabType] ?? tabContext.bio

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `אתה עוזר שמחפש מידע מאומת על צדיקי ישראל.
נושא הטאב הנוכחי: ${context}.

כללים קריטיים:
- חפש תמיד ב-Web לפני שאתה עונה — אל תסמוך רק על זיכרון
- השב בעברית בלבד
- ציין את מקור כל עובדה (שם ספר / אתר / ויקיפדיה)
- אם לא מצאת מידע מאומת — כתוב בדיוק: "לא מצאתי מידע מאומת על כך"
- אל תמציא תאריכים, סיפורים, ציטוטים — אפילו לא "בערך"
- תגובה ממוקדת, עד 200 מילה`,
      messages: [{ role: 'user', content: `${tzaddikName}: ${query}` }],
      tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
    })

    // Extract text blocks (web_search results are included automatically by the API)
    const answer = msg.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text as string)
      .join('\n')
      .trim()

    res.json({ answer: answer || 'לא נמצא מידע מאומת.' })
  } catch (err: any) {
    console.error('chat-tzaddik:', err?.message)
    // Surface the real error in dev so we can debug
    res.status(500).json({ error: `שגיאה: ${err?.message ?? 'נסה שוב'}` })
  }
}
