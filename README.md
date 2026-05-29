# דובב שפתי ישנים

A React + Vite + TypeScript starter for a Hebrew daily inspiration newsletter app with RTL layout, Tailwind CSS, React Router v6, TanStack Query, Supabase client scaffolding, and placeholder components.

## איך להריץ

1. התקן תלותיות:
   ```bash
   npm install
   ```
2. הוסף קובץ `.env.local` עם ערכי Supabase:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
3. הרץ את השרת המקומי:
   ```bash
   npm run dev
   ```

## מסלולים

- `/` — דף נחיתה
- `/today` — גליון יומי
- `/spark` — דף ניצוץ יומי

## מבנה קבצים חשוב

- `src/components/layout` — כותרת ופוטר
- `src/components/home` — Hero ו-Methodology
- `src/components/today` — תצוגת תאריך, כרטיסי צדיקים, ניצוץ יומי וניווט תאריכים
- `src/components/subscribe` — טופס הרשמה
- `src/lib/supabase.ts` — לקוח Supabase
- `src/lib/hebrewDate.ts` — חישוב תאריך עברי ופרשה
- `src/lib/queries.ts` — שאילתות placeholder ל-Supabase
- `src/types/index.ts` — סוגי TypeScript

## הערות

- הקוד משתמש ב-Tailwind CSS v3 ו-React Router v6.
- אם אין Supabase URL/ANON_KEY מוגדרים, הקומפוננטות עדיין מציגות תכנים placeholder.
