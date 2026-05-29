#!/usr/bin/env python3
"""
Scrape tzaddikim from mytzadik.com for a given Hebrew date,
rewrite biographies with Claude Haiku, and insert into Supabase.

Usage:
  python scripts/scrape_mytzadik.py --day 29 --month 2          # 29 Iyar
  python scripts/scrape_mytzadik.py --day 1  --month 7          # 1 Tishrei
  python scripts/scrape_mytzadik.py --all                       # all months (slow)
  python scripts/scrape_mytzadik.py --day 29 --month 2 --dry-run

Hebrew month numbers (same as @hebcal/core):
  Nisan=1 Iyar=2 Sivan=3 Tamuz=4 Av=5 Elul=6
  Tishrei=7 Cheshvan=8 Kislev=9 Tevet=10 Shevat=11 Adar=12
"""

import httpx, re, os, sys, json, time, argparse
sys.stdout.reconfigure(encoding='utf-8')
import anthropic

SUPABASE_URL = 'https://xcdnophqazxcpeavmthu.supabase.co'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
ANTHROPIC_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

HEBREW_MONTHS = {
    1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
    7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר',
}
MONTH_DAYS = {
    1: 30, 2: 29, 3: 30, 4: 29, 5: 30, 6: 29,
    7: 30, 8: 29, 9: 30, 10: 29, 11: 30, 12: 29,
}

MAX_PER_DAY = 4   # show at most 4 tzaddikim per day

BASE = 'https://www.mytzadik.com'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept-Language': 'he-IL,he;q=0.9',
}

# ---------- Scraping ----------

def get_tzaddik_ids_for_day(day: int, month: int) -> list[int]:
    """Fetch list of tzaddik IDs for a given Hebrew day/month."""
    url = f'{BASE}/main.aspx?Hlula={day}&month={month}'
    try:
        resp = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
        ids = list(dict.fromkeys(
            int(m.group(1))
            for m in re.finditer(r'tzadik\.aspx\?id=(\d+)', resp.text)
        ))
        return ids
    except Exception as e:
        print(f'  Error fetching day {day}/{month}: {e}')
        return []


def scrape_tzaddik_page(tzadik_id: int) -> dict | None:
    """Scrape a single tzaddik page and return raw data."""
    url = f'{BASE}/tzadik.aspx?id={tzadik_id}'
    try:
        resp = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
        text = resp.text

        # Extract Hebrew text content via regex on visible text
        # Remove scripts, styles, HTML tags
        clean = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<style[^>]*>.*?</style>', '', clean, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r'<!--.*?-->', '', clean, flags=re.DOTALL)
        clean = re.sub(r'<[^>]+>', ' ', clean)
        clean = re.sub(r'[ \t]+', ' ', clean)
        clean = re.sub(r'\n{3,}', '\n\n', clean)

        # Find the Hebrew content block (at least 50 Hebrew chars)
        hebrew_blocks = re.findall(r'[֐-׿\s\'""\.,!?\-–]{50,}', clean)
        content = '\n'.join(b.strip() for b in hebrew_blocks if b.strip())

        # Try to extract death date (hillula date) from page
        hillula_match = re.search(
            r"[א-ת]['\"]{0,2}\s+(?:ב)?(?:תשרי|חשוון|כסלו|טבת|שבט|אדר|ניסן|אייר|סיון|תמוז|אב|אלול)",
            content
        )
        hillula = hillula_match.group(0).strip() if hillula_match else ''

        # Name: usually appears near top of content
        name = ''
        name_match = re.search(
            r'(?:רבי|הרב|אדמו"ר|חכם|הגאון|הצדיק)[^\n]{3,60}',
            content
        )
        if name_match:
            name = name_match.group(0).strip()

        return {
            'id': tzadik_id,
            'url': url,
            'name': name,
            'hillula': hillula,
            'raw_content': content[:3000],
        }
    except Exception as e:
        print(f'  Error scraping id={tzadik_id}: {e}')
        return None


# ---------- Claude rewrite ----------

REWRITE_PROMPT = """\
להלן מידע שנסרק מאתר על צדיק יהודי.
תאריך הילולא: {day} ב{month}
תוכן גולמי מהאתר:
{raw_content}

כתוב מחדש (אל תעתיק) ותן תשובה כ-JSON בלבד עם השדות:
- "popular_name": שמו המוכר (ללא זצ"ל), קצר
- "full_name": שמו המלא הפורמלי
- "biography": ביוגרפיה קצרה ברורה ומרתקת, 3-4 משפטים בעברית תקינה. כתוב מחדש
- "story": סיפור מרתק אחד (אם קיים). אחרת מחרוזת ריקה
- "quote": ציטוט קצר מדבריו (אם קיים). אחרת מחרוזת ריקה
- "birth_day": שנת הפטירה בפורמט קצר, כגון "נפטר תרכ"ה"
- "stream": אחד מ: חסידות / ליטא / ספרד / תימן / כללי / איטליה / בוכרה
- "role": אחד מ: רב / אדמו"ר / ראש ישיבה / מקובל / פוסק / פייטן / מגיד / דיין

JSON בלבד."""


def rewrite_with_claude(client: anthropic.Anthropic, raw: dict, day: int, month: int) -> dict:
    month_name = HEBREW_MONTHS.get(month, '')
    prompt = REWRITE_PROMPT.format(
        day=day,
        month=month_name,
        raw_content=raw.get('raw_content', '')[:2000],
    )
    resp = client.messages.create(
        model='claude-haiku-4-5-20251001',
        max_tokens=900,
        messages=[{'role': 'user', 'content': prompt}],
    )
    text = resp.content[0].text.strip()
    m = re.search(r'\{[\s\S]*\}', text)
    if m:
        try:
            return json.loads(m.group())
        except json.JSONDecodeError:
            pass
    return {}


# ---------- Supabase ----------

def get_existing_for_day(day: int, month_name: str) -> list[str]:
    """Return list of popular_names already in DB for this date."""
    r = httpx.get(
        f'{SUPABASE_URL}/rest/v1/tzaddikim?hebrew_day=eq.{day}&hebrew_month=eq.{month_name}&select=popular_name&limit=10',
        headers={'Authorization': f'Bearer {SUPABASE_KEY}', 'apikey': SUPABASE_KEY},
        timeout=15,
    )
    return [row.get('popular_name', '') for row in r.json()]


COMMON_TITLES = {'רבי', 'הרב', 'ראבי', 'אדמו"ר', 'חכם', 'הגאון', 'גאון', 'מרן', 'רבן', 'מורנו', 'קדוש'}

def name_already_exists(name: str, existing_names: list[str]) -> bool:
    """Fuzzy match on meaningful words (ignoring titles and very common names)."""
    words = [w for w in name.split() if len(w) > 3 and w not in COMMON_TITLES]
    if not words:
        return False
    return any(
        any(w in existing for w in words)
        for existing in existing_names
    )


def insert_record(record: dict, dry_run: bool = False) -> bool:
    if dry_run:
        print(f'  [DRY-RUN] Would insert: {record["popular_name"]}')
        return True
    r = httpx.post(
        f'{SUPABASE_URL}/rest/v1/tzaddikim',
        json=record,
        headers={
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        timeout=20,
    )
    return r.status_code in (200, 201)


# ---------- Main ----------

def process_day(day: int, month: int, client: anthropic.Anthropic, dry_run: bool) -> tuple[int, int]:
    month_name = HEBREW_MONTHS.get(month, '')
    print(f'\n--- {day} {month_name} ---')

    # Check how many records already exist for this day
    existing_names = get_existing_for_day(day, month_name)
    slots_left = MAX_PER_DAY - len(existing_names)
    if slots_left <= 0:
        print(f'  Already has {len(existing_names)} records, skipping')
        return 0, len(existing_names)

    ids = get_tzaddik_ids_for_day(day, month)
    if not ids:
        print(f'  No tzaddikim found on mytzadik.com')
        return 0, 0

    # mytzadik.com orders by importance, so take the first ones
    ids = ids[:slots_left * 3]   # fetch a few extra to allow for duplicates
    print(f'  {len(existing_names)} existing, {slots_left} slots left | IDs to try: {ids}')
    inserted = skipped = 0

    for tzadik_id in ids:
        if inserted >= slots_left:
            break

        raw = scrape_tzaddik_page(tzadik_id)
        if not raw:
            continue

        rw = rewrite_with_claude(client, raw, day, month)
        if not rw or not rw.get('popular_name'):
            print(f'  Skipping id={tzadik_id} (Claude returned empty)')
            continue

        name = rw.get('popular_name', '')
        print(f'  [{tzadik_id}] {name}')

        if name_already_exists(name, existing_names):
            print(f'    -> already in DB, skipping')
            skipped += 1
            continue

        record = {
            'hebrew_day':       day,
            'hebrew_month':     month_name,
            'popular_name':     name,
            'full_name':        rw.get('full_name', ''),
            'years':            rw.get('birth_day', ''),
            'biography':        rw.get('biography', ''),
            'story':            rw.get('story', ''),
            'quote':            rw.get('quote', ''),
            'stream':           rw.get('stream', 'כללי'),
            'role':             rw.get('role', 'רב'),
            'importance_score': 40,
            'sources':          f'mytzadik.com|{raw["url"]}',
        }

        if insert_record(record, dry_run):
            print(f'    -> inserted ({inserted+1}/{slots_left})')
            existing_names.append(name)
            inserted += 1
        else:
            print(f'    -> insert failed')

        time.sleep(0.4)

    return inserted, skipped


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--day',   type=int, help='Hebrew day (1-30)')
    parser.add_argument('--month', type=int, help='Hebrew month number (Nisan=1, Iyar=2, ..., Tishrei=7)')
    parser.add_argument('--all',   action='store_true', help='Scrape all months/days (very slow ~2h)')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    if not args.all and (not args.day or not args.month):
        parser.error('Provide --day and --month, or --all')

    if not SUPABASE_KEY: sys.exit('Set SUPABASE_SERVICE_ROLE_KEY')
    if not ANTHROPIC_KEY: sys.exit('Set ANTHROPIC_API_KEY')

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    total_inserted = total_skipped = 0

    if args.all:
        for month in range(1, 13):
            for day in range(1, MONTH_DAYS[month] + 1):
                ins, skp = process_day(day, month, client, args.dry_run)
                total_inserted += ins
                total_skipped += skp
                time.sleep(1)
    else:
        ins, skp = process_day(args.day, args.month, client, args.dry_run)
        total_inserted += ins
        total_skipped += skp

    print(f'\n[DONE] inserted={total_inserted} skipped={total_skipped}')


if __name__ == '__main__':
    main()
