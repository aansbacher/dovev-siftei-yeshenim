import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-rule bg-surface py-7 text-center">
      <div className="mx-auto max-w-7xl px-4">
        <Link
          to="/suggest"
          className="inline-block font-display text-base font-bold text-gold-deep hover:text-gold transition"
        >
          הַצִּיעוּ צַדִּיק אוֹ הוֹסִיפוּ מֵידָע
        </Link>
        <div className="mt-4 text-xs text-muted">זכר צדיקים לברכה · קדושים בכל יום</div>
        <div className="mt-0.5 text-[10px] text-muted/70">דּוֹבֵב שִׂפְתֵי יְשֵׁנִים</div>
        <span className="block mt-1 text-muted/60 text-[10px]">v2.1</span>
      </div>
    </footer>
  )
}
