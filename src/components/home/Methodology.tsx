const items = [
  {
    title: 'מקור מאומת',
    description: 'סיפורים ורעיונות מבוססים על מקורות מהימנים ומסורת צדיקים.',
  },
  {
    title: 'כתיבה אנושית',
    description: 'פורמט קריא וקל לבטן עם דגש על חיבור אישי ועל שפה חיה.',
  },
  {
    title: 'אישור עורך',
    description: 'כל גליון עובר בקרת תוכן כדי לשמור על אמינות ורוחניות.',
  },
]

export function Methodology() {
  return (
    <section className="grid gap-6 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
        </div>
      ))}
    </section>
  )
}
