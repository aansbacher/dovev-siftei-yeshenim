import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const tabSystemPrompts: Record<string, string> = {
  teaching: 'המשתמש שואל על תורתו, ספריו, ואמרותיו של הצדיק. התמקד בתורה, משנתו הרוחנית, ספריו.',
  story:    'המשתמש שואל על סיפורים מחיי הצדיק. התמקד בסיפורים, אירועים, ניסים מתועדים.',
  bio:      'המשתמש שואל על ביוגרפיה. התמקד בתאריכים, מקומות, תפקידים, משפחה.',
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const { tzaddikName, query, tabType = 'bio' } = req.body ?? {}

  if (!tzaddikName || !query?.trim()) {
    res.status(400).json({ error: 'חסרים שדות' })
    return
  }

  const tabContext = tabSystemPrompts[tabType] ?? tabSystemPrompts.bio

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `אתה מומחה לביוגרפיות ותורת צדיקי ישראל. ${tabContext}

כללים מחייבים:
- השב בעברית בלבד
- רק מידע שאתה בטוח בו ממקורות מוכרים
- אם אינך בטוח — כתוב "אין לי מידע מאומת על כך"
- אל תמציא תאריכים, סיפורים, או ציטוטים
- תגובה קצרה וממוקדת — עד 150 מילה
- ציין מקור אם ידוע לך (שם ספר, ויקיפדיה וכד')`,
      messages: [{ role: 'user', content: `${tzaddikName}: ${query}` }],
    })

    const answer = (msg.content as Anthropic.TextBlock[])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()

    res.json({ answer })
  } catch (err: any) {
    console.error('chat-tzaddik error:', err?.message)
    res.status(500).json({ error: 'שגיאה. נסה שוב.' })
  }
}
