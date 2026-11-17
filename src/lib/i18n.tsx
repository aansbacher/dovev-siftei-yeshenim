import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'he' | 'en'

// ── Strings (chrome only; tzaddik content comes from the DB via pick()) ──────
const STR = {
  he: {
    brand: 'קדושים בכל יום',
    nav_home: 'דף הבית', nav_today: 'הצדיק של היום', nav_about: 'אודות',
    tab_home: 'בית', tab_search: 'חיפוש', tab_today: 'היום',
    openMenu: 'פתח תפריט', closeMenu: 'סגור תפריט', menuFooter: 'זכר צדיקים לברכה',
    oneToday: 'צדיק אחד היום', nToday: (n: number) => `${n} צדיקים היום`,
    parsha: (p: string) => `פרשת ${p}`,
    readingStyle: 'סגנון קריאה', font: 'גופן', textSize: 'גודל טקסט',
    nikud: 'ניקוד', noNikud: 'בלי ניקוד', withNikud: 'מְנֻקָּד',
    fontRound: 'עגול', fontClassic: 'קלאסי', fontPlain: 'רגיל',
    prev: 'הצדיק הקודם', next: 'הצדיק הבא',
    counter: (i: number, n: number) => `צדיק ${i} מתוך ${n}`,
    swipeHint: 'החליקו הצידה או הקישו על החצים לדפדוף בין צדיקי היום',
    eyebrow: 'בעל ההילולה',
    tab_life: 'חייו', tab_story: 'סיפור', tab_teaching: 'מתורתו',
    emptyLife: 'אין רקע זמין', emptyStory: 'אין סיפור זמין', emptyTeaching: 'אין תורה זמינה',
    shareWhatsapp: 'שיתוף בוואטסאפ', deepen: 'העמק בצדיק',
    save: 'שמירה', saved: 'נשמר', copy: 'העתקת טקסט', copied: 'הטקסט הועתק ✓',
    deepenStory: 'הַסִּפּוּר', deepenTeaching: 'מִתּוֹרָתוֹ', furtherReading: 'להרחבה',
    webSearch: 'חיפוש ברשת', wikipedia: 'ויקיפדיה',
    emptyDay: 'אין צדיקים מתועדים ליום זה', emptyDaySub: 'נסו לבחור תאריך אחר בלוח',
  },
  en: {
    brand: 'Kedoshim Bechol Yom',
    nav_home: 'Home', nav_today: "Today's Tzaddik", nav_about: 'About',
    tab_home: 'Home', tab_search: 'Search', tab_today: 'Today',
    openMenu: 'Open menu', closeMenu: 'Close menu', menuFooter: 'May the memory of the righteous be a blessing',
    oneToday: 'one tzaddik today', nToday: (n: number) => `${n} tzaddikim today`,
    parsha: (p: string) => `Parshas ${p}`,
    readingStyle: 'Reading style', font: 'Font', textSize: 'Text size',
    nikud: 'Nikud', noNikud: 'None', withNikud: 'Nikud',
    fontRound: 'Round', fontClassic: 'Classic', fontPlain: 'Plain',
    prev: 'Previous tzaddik', next: 'Next tzaddik',
    counter: (i: number, n: number) => `Tzaddik ${i} of ${n}`,
    swipeHint: "Swipe sideways or tap the arrows to move between today's tzaddikim",
    eyebrow: 'Commemorated today',
    tab_life: 'Life', tab_story: 'Story', tab_teaching: 'Teaching',
    emptyLife: 'No background available', emptyStory: 'No story available', emptyTeaching: 'No teaching available',
    shareWhatsapp: 'Share on WhatsApp', deepen: 'Learn more',
    save: 'Save', saved: 'Saved', copy: 'Copy text', copied: 'Text copied ✓',
    deepenStory: 'The Story', deepenTeaching: 'His Teaching', furtherReading: 'Further reading',
    webSearch: 'Web search', wikipedia: 'Wikipedia',
    emptyDay: 'No tzaddikim recorded for this day', emptyDaySub: 'Try selecting another date on the calendar',
  },
}

export type Strings = typeof STR['he']

const HEB_MONTH_EN: Record<string, string> = {
  'תשרי': 'Tishrei', 'חשוון': 'Cheshvan', 'חשון': 'Cheshvan', 'כסלו': 'Kislev',
  'טבת': 'Teves', 'שבט': 'Shevat', 'אדר': 'Adar', 'אדר א': 'Adar I', 'אדר ב': 'Adar II',
  'ניסן': 'Nisan', 'אייר': 'Iyar', 'סיון': 'Sivan', 'סיוון': 'Sivan',
  'תמוז': 'Tammuz', 'אב': 'Av', 'אלול': 'Elul',
}

/** English rendering of a Hebrew calendar date, e.g. (2, "כסלו") → "2 Kislev". */
export function hebDateEn(day?: number, monthHe?: string): string {
  const m = monthHe ? (HEB_MONTH_EN[monthHe] ?? monthHe) : ''
  return [day, m].filter(Boolean).join(' ')
}

interface Ctx {
  lang: Lang
  dir: 'rtl' | 'ltr'
  setLang: (l: Lang) => void
  t: Strings
  /** content value for the active language, falling back to Hebrew when the translation is missing */
  pick: (he?: string | null, en?: string | null) => string | undefined
}

const I18nContext = createContext<Ctx | null>(null)

function readLang(): Lang {
  try { return localStorage.getItem('site-lang') === 'en' ? 'en' : 'he' } catch { return 'he' }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)
  const dir: 'rtl' | 'ltr' = lang === 'en' ? 'ltr' : 'rtl'

  useEffect(() => {
    const el = document.documentElement
    el.setAttribute('dir', dir)
    el.setAttribute('lang', lang)
  }, [lang, dir])

  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem('site-lang', l) } catch {} }
  const t = STR[lang]
  const pick = (he?: string | null, en?: string | null) =>
    (lang === 'en' && en && en.trim() ? en : (he ?? undefined)) ?? undefined

  return <I18nContext.Provider value={{ lang, dir, setLang, t, pick }}>{children}</I18nContext.Provider>
}

export function useI18n(): Ctx {
  const c = useContext(I18nContext)
  if (!c) throw new Error('useI18n must be used within I18nProvider')
  return c
}
