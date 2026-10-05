import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

/** Full explanation of the project: the name, the maalah, the hilula, what we do. */
export function About() {
  return (
    <div className="grid gap-5 pb-8">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[26px] border border-rule shadow-[0_14px_40px_-16px_var(--shadow)] bg-surface">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 50% -10%, #FCEFD6 0%, #EEF0FD 45%, #FFFFFF 80%)' }}
        />
        <div className="relative px-6 pt-9 pb-8 text-center">
          <p className="text-[12.5px] font-semibold tracking-wide text-gold">אודות</p>
          <h1 className="font-display text-[30px] leading-tight text-ink mt-1.5">קדושים בכל יום</h1>
          <p className="mt-3 text-[14.5px] text-ink-soft max-w-[21rem] mx-auto leading-relaxed">
            בכל יום בשנה האירו צדיקי ישראל את העולם בתורתם ובמעשיהם. כאן אנו נפגשים, יום אחר יום,
            עם בעל ההילולא של אותו היום: סיפור אחד שנוגע ללב, ופנינה אחת מתורתו.
          </p>
        </div>
      </section>

      {/* ── The name ── */}
      <section className="rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-7">
        <p className="text-[12.5px] font-semibold tracking-wide text-gold">מאחורי השם</p>
        <h2 className="font-display text-[22px] text-ink mt-1 leading-tight">דּוֹבֵב שִׂפְתֵי יְשֵׁנִים</h2>
        <p className="text-[12px] text-muted mt-1">שיר השירים ז, י</p>

        <p className="text-[15px] leading-[1.95] text-ink-soft mt-4">
          שלמה המלך מתאר את מתיקותה של התורה, שבכוחה להניע את שפתיהם של הצדיקים שהלכו לעולמם.
          מכאן בא שמו הפנימי של האתר, "דובב שפתי ישנים": כשלומדים את תורתם של הצדיקים ואומרים
          אותה בעולם הזה, שפתותיהם רוחשות בקבר, והם שבים ומאירים את דרכנו.
        </p>

        <div className="mt-5 rounded-2xl bg-surface-2 px-5 py-4 text-center">
          <p className="text-[15px] leading-[1.95] text-ink">
            "כל תלמיד חכם שאומרים דבר שמועה מפיו בעולם הזה, שפתותיו דובבות בקבר"
          </p>
          <p className="text-[12px] text-muted mt-2">תלמוד בבלי, יבמות צז ע"א</p>
        </div>

        <p className="text-[15px] leading-[1.95] text-ink-soft mt-5">
          זו מעלה גדולה לשני הצדדים. לנשמת הצדיק, שתורתה ממשיכה לחיות ולהשפיע. ולנו, הזוכים לטעום
          מאורו ולהתחבר אל חכמת הדורות. בכל פעם שאנו קוראים סיפור או אומרים וורט בשמו של צדיק,
          אנו מדובבים את שפתיו.
        </p>
      </section>

      {/* ── Hilula ── */}
      <section className="rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-7">
        <h2 className="font-display text-[20px] text-ink leading-tight">מהו יום הילולא</h2>
        <p className="text-[15px] leading-[1.95] text-ink-soft mt-3">
          יום פטירתו של צדיק נקרא "יום הילולא". ביום הזה, לפי המסורת, כל תורתו ומעשיו של הצדיק
          מתעלים ומאירים, והוא נעשה עת רצון שבה ראוי לחבר אל הצדיק את הלב. לכן נהגו ישראל מדורי דורות
          לציין את יום ההילולא בלימוד תורתו של הצדיק, בסיפור שבחיו ובתפילה.
        </p>
        <p className="text-[15px] leading-[1.95] text-ink-soft mt-3">
          כאן תמצאו בכל יום את בעלי ההילולא של אותו התאריך העברי, מסודרים לפי הכרתם וחשיבותם,
          כדי שתוכלו לעצור לרגע, להכיר ולהתחבר.
        </p>
      </section>

      {/* ── What you'll find ── */}
      <section className="rounded-[22px] bg-surface border border-rule shadow-[0_8px_24px_-14px_var(--shadow)] px-6 py-7">
        <h2 className="font-display text-[20px] text-ink leading-tight">מה תמצאו כאן</h2>
        <div className="mt-4 space-y-3">
          {[
            ['בעל ההילולא של היום', 'הצדיקים שנפטרו בתאריך העברי של היום, יום אחר יום לאורך כל השנה.'],
            ['סיפור אמיתי', 'מעשה אחד חי ונוגע מתוך חייו של הצדיק, ולא תקציר אנציקלופדי יבש.'],
            ['פנינה מתורתו', 'נקודה חדה אחת מדרכו ומתורתו, שנשארת בלב.'],
            ['מקורות אמינים', 'מבוססים על ספרים ומקורות נאמנים. בלי המצאות, ובלי ציטוטים שלא נאמרו.'],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3.5 items-start">
              <span className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-gold" />
              <div>
                <p className="font-bold text-ink text-[15px] leading-snug">{t}</p>
                <p className="text-[13.5px] text-ink-soft mt-0.5 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our commitment ── */}
      <section className="rounded-[22px] bg-warm-soft border border-[color:var(--warm-line)] px-6 py-6">
        <h2 className="font-display text-[19px] text-ink leading-tight">ההתחייבות שלנו</h2>
        <p className="text-[14.5px] leading-[1.9] text-ink-soft mt-2.5">
          כבוד הצדיקים הוא נר לרגלינו. לכן כל סיפור וכל וורט נבדקים ומבוססים על מקור אמיתי,
          וכל ציטוט מובא כלשונו או שאינו מובא כלל. עדיף לדלג מאשר לפגוע בכבודו של צדיק.
        </p>
      </section>

      {/* ── CTA ── */}
      <Link
        to="/today"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-white font-bold text-[15px] py-3.5 shadow-[0_10px_24px_-8px_rgba(91,118,229,.65)] hover:bg-gold-deep transition active:scale-[.99]"
      >
        <BookOpen className="w-[18px] h-[18px]" />
        לגיליון של היום
      </Link>
    </div>
  )
}
