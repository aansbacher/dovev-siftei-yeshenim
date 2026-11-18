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
    subBrand: 'דּוֹבֵב שִׂפְתֵי יְשֵׁנִים',
    landingSub: 'מסע יומי אל אור הצדיקים. בכל יום, סיפור ופנינה מתורתו של בעל ההילולא של היום.',
    todayIs: 'היום,', ctaToday: 'לגיליון של היום',
    whyTitle: 'למה מזכירים את הצדיקים?',
    whyBody: 'כשלומדים את תורתם של הצדיקים ואומרים אותה, שפתותיהם רוחשות בקבר. אנו מדובבים את שפתיהם, וזו מעלה גדולה להם ולנו.',
    whyCta: 'קראו על הרעיון שמאחורי האתר',
    todayCardSub: 'גלו את בעלי ההילולא של כל יום בשנה',
    ab_eyebrow: 'אודות',
    ab_heroBody: 'בכל יום בשנה האירו צדיקי ישראל את העולם בתורתם ובמעשיהם. כאן אנו נפגשים, יום אחר יום, עם בעל ההילולא של אותו היום: סיפור אחד שנוגע ללב, ופנינה אחת מתורתו.',
    ab_nameEyebrow: 'מאחורי השם',
    ab_nameVerse: 'שיר השירים ז, י',
    ab_nameBody: 'שלמה המלך מתאר את מתיקותה של התורה, שבכוחה להניע את שפתיהם של הצדיקים שהלכו לעולמם. מכאן בא שמו הפנימי של האתר, "דובב שפתי ישנים": כשלומדים את תורתם של הצדיקים ואומרים אותה בעולם הזה, שפתותיהם רוחשות בקבר, והם שבים ומאירים את דרכנו.',
    ab_talmud: '"כל תלמיד חכם שאומרים דבר שמועה מפיו בעולם הזה, שפתותיו דובבות בקבר"',
    ab_talmudSrc: 'תלמוד בבלי, יבמות צז ע"א',
    ab_nameBody2: 'זו מעלה גדולה לשני הצדדים. לנשמת הצדיק, שתורתה ממשיכה לחיות ולהשפיע. ולנו, הזוכים לטעום מאורו ולהתחבר אל חכמת הדורות. בכל פעם שאנו קוראים סיפור או אומרים וורט בשמו של צדיק, אנו מדובבים את שפתיו.',
    ab_hilulaTitle: 'מהו יום הילולא',
    ab_hilulaBody1: 'יום פטירתו של צדיק נקרא "יום הילולא". ביום הזה, לפי המסורת, כל תורתו ומעשיו של הצדיק מתעלים ומאירים, והוא נעשה עת רצון שבה ראוי לחבר אל הצדיק את הלב. לכן נהגו ישראל מדורי דורות לציין את יום ההילולא בלימוד תורתו של הצדיק, בסיפור שבחיו ובתפילה.',
    ab_hilulaBody2: 'כאן תמצאו בכל יום את בעלי ההילולא של אותו התאריך העברי, מסודרים לפי הכרתם וחשיבותם, כדי שתוכלו לעצור לרגע, להכיר ולהתחבר.',
    ab_findTitle: 'מה תמצאו כאן',
    ab_find: [
      ['בעל ההילולא של היום', 'הצדיקים שנפטרו בתאריך העברי של היום, יום אחר יום לאורך כל השנה.'],
      ['סיפור אמיתי', 'מעשה אחד חי ונוגע מתוך חייו של הצדיק, ולא תקציר אנציקלופדי יבש.'],
      ['פנינה מתורתו', 'נקודה חדה אחת מדרכו ומתורתו, שנשארת בלב.'],
      ['מקורות אמינים', 'מבוססים על ספרים ומקורות נאמנים. בלי המצאות, ובלי ציטוטים שלא נאמרו.'],
    ] as [string, string][],
    ab_commitTitle: 'ההתחייבות שלנו',
    ab_commitBody: 'כבוד הצדיקים הוא נר לרגלינו. לכן כל סיפור וכל וורט נבדקים ומבוססים על מקור אמיתי, וכל ציטוט מובא כלשונו או שאינו מובא כלל. עדיף לדלג מאשר לפגוע בכבודו של צדיק.',
    sub_eyebrow: 'הִצְטָרְפוּ', sub_title: 'קבלו את גיליון הצדיקים מדי יום',
    sub_body: 'מסר קצר, סיפור ותורה מבעלי ההילולה, ישירות למייל או לוואטסאפ.',
    sub_email: 'כתובת אימייל', sub_phone: 'וואטסאפ (אופציונלי)',
    sub_emailBtn: '📧 מייל', sub_waBtn: '💬 וואטסאפ', sub_submit: 'הרשמה', sub_sending: 'שולח...',
    sub_thanks: 'תודה! ההרשמה נקלטה בהצלחה.', sub_error: 'אירעה שגיאה. נסו שוב מאוחר יותר.',
    sub_pickOne: 'בחרו לפחות דרך אחת לקבלת דיוור.', sub_or: 'אוֹ',
    sub_waPrefer: 'מעדיפים וואטסאפ? הצטרפו לקבוצה השקטה וקבלו את הגיליון מדי יום',
    sub_waJoin: 'הצטרפו לקבוצת הוואטסאפ',
    cal_yesterday: 'אתמול', cal_today: 'היום', cal_tomorrow: 'מחר', cal_backToToday: 'חזרה להיום',
    cal_prevMonth: 'חודש קודם', cal_nextMonth: 'חודש הבא',
    cal_dow: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
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
    subBrand: 'Dovev Siftei Yeshenim',
    landingSub: "A daily journey toward the light of the tzaddikim. Each day, a story and a gem from the Torah of the one whose yahrzeit falls today.",
    todayIs: 'Today,', ctaToday: "Today's edition",
    whyTitle: 'Why do we recall the tzaddikim?',
    whyBody: "When we study the Torah of the tzaddikim and recite it, their lips murmur in the grave. We give voice to their lips — a great merit for them and for us.",
    whyCta: 'Read about the idea behind the site',
    todayCardSub: 'Discover the tzaddikim whose yahrzeit falls on each day of the year',
    ab_eyebrow: 'About',
    ab_heroBody: "On every day of the year, the tzaddikim of Israel illuminated the world with their Torah and their deeds. Here we meet, day after day, the one whose yahrzeit falls on that day: one story that touches the heart, and one gem from his Torah.",
    ab_nameEyebrow: 'Behind the name',
    ab_nameVerse: 'Song of Songs 7:10',
    ab_nameBody: 'King Solomon describes the sweetness of the Torah, which has the power to move the lips of the tzaddikim who have passed on. From here comes the inner name of the site, "Dovev Siftei Yeshenim" (giving voice to the lips of those who sleep): when we study the Torah of the tzaddikim and recite it in this world, their lips murmur in the grave, and they once again illuminate our path.',
    ab_talmud: '"Every Torah scholar in whose name a teaching is said in this world — his lips murmur in the grave."',
    ab_talmudSrc: 'Babylonian Talmud, Yevamos 97a',
    ab_nameBody2: 'This is a great merit for both sides. For the soul of the tzaddik, whose Torah continues to live and to influence. And for us, who merit to taste of his light and to connect to the wisdom of the generations. Each time we read a story or say a vort in the name of a tzaddik, we give voice to his lips.',
    ab_hilulaTitle: 'What is a yahrzeit (hilula)',
    ab_hilulaBody1: "The day of a tzaddik's passing is called a 'yom hilula.' On this day, according to tradition, all the Torah and deeds of the tzaddik ascend and shine, and it becomes an auspicious time (eis ratzon) in which it is fitting to bind one's heart to the tzaddik. Therefore Israel has been accustomed for generations to mark the yahrzeit by studying the tzaddik's Torah, recounting his praises, and prayer.",
    ab_hilulaBody2: 'Here you will find each day those whose yahrzeit falls on that Hebrew date, arranged by their renown and importance, so that you can pause for a moment, come to know them, and connect.',
    ab_findTitle: "What you'll find here",
    ab_find: [
      ["Today's commemorated tzaddikim", "The tzaddikim who passed away on today's Hebrew date, day after day throughout the year."],
      ['A true story', "One living, touching episode from the tzaddik's life — not a dry encyclopedic summary."],
      ['A gem from his Torah', 'One sharp point from his path and his teaching, that stays in the heart.'],
      ['Reliable sources', 'Based on trustworthy books and sources. No fabrications, and no quotations that were never said.'],
    ] as [string, string][],
    ab_commitTitle: 'Our commitment',
    ab_commitBody: 'The honor of the tzaddikim is a lamp to our feet. Therefore every story and every vort is verified and based on a true source, and every quotation is brought in its exact words or not brought at all. Better to skip than to harm the honor of a tzaddik.',
    sub_eyebrow: 'Join', sub_title: 'Receive the daily tzaddikim edition',
    sub_body: "A short message, a story and Torah from the day's tzaddikim, straight to your email or WhatsApp.",
    sub_email: 'Email address', sub_phone: 'WhatsApp (optional)',
    sub_emailBtn: '📧 Email', sub_waBtn: '💬 WhatsApp', sub_submit: 'Subscribe', sub_sending: 'Sending…',
    sub_thanks: 'Thank you! Your subscription was received.', sub_error: 'An error occurred. Please try again later.',
    sub_pickOne: 'Choose at least one way to receive the mailing.', sub_or: 'or',
    sub_waPrefer: 'Prefer WhatsApp? Join the quiet group and receive the daily edition.',
    sub_waJoin: 'Join the WhatsApp group',
    cal_yesterday: 'Yesterday', cal_today: 'Today', cal_tomorrow: 'Tomorrow', cal_backToToday: 'Back to today',
    cal_prevMonth: 'Previous month', cal_nextMonth: 'Next month',
    cal_dow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
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

// Hebrew → English (Ashkenazi transliteration) for the weekly Torah portion.
const PARSHA_EN: Record<string, string> = {
  'בראשית': 'Bereishis', 'נח': 'Noach', 'לך לך': 'Lech Lecha', 'וירא': 'Vayeira',
  'חיי שרה': 'Chayei Sarah', 'תולדות': 'Toldos', 'ויצא': 'Vayeitzei', 'וישלח': 'Vayishlach',
  'וישב': 'Vayeishev', 'מקץ': 'Mikeitz', 'ויגש': 'Vayigash', 'ויחי': 'Vayechi',
  'שמות': 'Shemos', 'וארא': "Va'eira", 'בא': 'Bo', 'בשלח': 'Beshalach', 'יתרו': 'Yisro',
  'משפטים': 'Mishpatim', 'תרומה': 'Terumah', 'תצוה': 'Tetzaveh', 'כי תשא': 'Ki Sisa',
  'ויקהל': 'Vayakhel', 'פקודי': 'Pekudei', 'ויקרא': 'Vayikra', 'צו': 'Tzav', 'שמיני': 'Shemini',
  'תזריע': 'Tazria', 'מצורע': 'Metzora', 'אחרי מות': 'Acharei Mos', 'אחרי': 'Acharei Mos',
  'קדושים': 'Kedoshim', 'אמור': 'Emor', 'בהר': 'Behar', 'בחקתי': 'Bechukosai', 'בחוקותי': 'Bechukosai',
  'במדבר': 'Bamidbar', 'נשא': 'Naso', 'בהעלתך': "Beha'aloscha", 'בהעלותך': "Beha'aloscha",
  'שלח': 'Shelach', 'שלח לך': 'Shelach', 'קרח': 'Korach', 'חקת': 'Chukas', 'חוקת': 'Chukas',
  'בלק': 'Balak', 'פינחס': 'Pinchas', 'פנחס': 'Pinchas', 'מטות': 'Matos', 'מסעי': 'Masei',
  'דברים': 'Devarim', 'ואתחנן': "Va'eschanan", 'עקב': 'Eikev', 'ראה': "Re'eh",
  'שפטים': 'Shoftim', 'שופטים': 'Shoftim', 'כי תצא': 'Ki Seitzei', 'כי תבוא': 'Ki Savo',
  'נצבים': 'Nitzavim', 'ניצבים': 'Nitzavim', 'וילך': 'Vayeilech', 'האזינו': "Ha'azinu",
  'וזאת הברכה': "V'Zos HaBracha", 'זאת הברכה': "V'Zos HaBracha",
}

/** English name of a Hebrew month, falling back to the Hebrew. */
export function hebMonthEn(he?: string): string {
  return he ? (HEB_MONTH_EN[he] ?? he) : ''
}

/** English name of a parsha from its (cleaned) Hebrew name, falling back to the Hebrew. */
export function parshaEn(he: string): string {
  const key = he.trim()
  if (PARSHA_EN[key]) return PARSHA_EN[key]
  // combined portions like "ויקהל-פקודי" / "מטות מסעי"
  const parts = key.split(/\s*[-–]\s*|\s+/)
  const mapped = parts.map((p) => PARSHA_EN[p]).filter(Boolean)
  if (mapped.length >= 2) return mapped.join('-')
  return he
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
