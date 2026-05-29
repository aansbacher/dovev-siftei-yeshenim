#!/usr/bin/env python3
"""
Parse Google Doc tzaddikim data, rewrite with Claude, and seed into Supabase.

Usage:
  python scripts/seed_tzaddikim.py [--dry-run] [--start N] [--limit N]
"""

import json
import re
import time
import sys
import os
import httpx
import anthropic
import argparse

# Path to the downloaded Google Doc tool result
DOC_PATH = r'C:/Users/aansb/.claude/projects/c--Users-aansb-dovev/33a084ef-92f6-466a-b2b7-634fa3a6896e/tool-results/mcp-claude_ai_Google_Drive-read_file_content-1778958040341.txt'

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://xcdnophqazxcpeavmthu.supabase.co')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

# Hebrew month names: doc name → canonical app name
MONTH_NORM = {
    'תשרי':    'תשרי',
    'מרחשון':  'חשוון',
    'חשון':    'חשוון',
    'כסלו':    'כסלו',
    'טבת':     'טבת',
    'שבט':     'שבט',
    'אדר':     'אדר',
    'ניסן':    'ניסן',
    'אייר':    'אייר',
    'סיון':    'סיון',
    'תמוז':    'תמוז',
    'אב':      'אב',
    'אלול':    'אלול',
}

HEBREW_VALS = {
    'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,
    'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,  'י': 10,
    'כ': 20, 'ל': 30,
}

MONTHS_RE = '|'.join(re.escape(m) for m in MONTH_NORM)
DATE_PATTERN = re.compile(
    r'^([א-ת]{1,3})[\'״"׳]?\s+ב(' + MONTHS_RE + r')',
    re.MULTILINE,
)
BOLD_PATTERN = re.compile(r'\*\*([^*]+)\*\*')
NIKUD = re.compile(r'[֑-ׇ]')


def strip_nikud(text: str) -> str:
    return NIKUD.sub('', text)


def hebrew_to_int(s: str) -> int:
    s = re.sub(r'[\'״"׳\s]', '', s)
    return sum(HEBREW_VALS.get(c, 0) for c in s)


def parse_doc(content: str) -> list[dict]:
    """Split document by ♦ ♦ ♦ and extract one dict per tzaddik."""
    sections = content.split('♦ ♦ ♦')
    entries = []
    current_day: int | None = None
    current_month: str | None = None

    for section in sections:
        section = section.strip()
        if not section:
            continue

        # Detect date header anywhere in the first 120 chars
        date_match = DATE_PATTERN.search(section[:120])
        if date_match:
            current_day = hebrew_to_int(date_match.group(1))
            current_month = MONTH_NORM.get(date_match.group(2), date_match.group(2))
            # Remove the date header line from the text
            section = (section[:date_match.start()] + section[date_match.end():]).strip()

        if current_day is None or current_month is None or not section:
            continue

        # Extract bold fields
        bolds = [b.strip() for b in BOLD_PATTERN.findall(section)]
        popular_name = strip_nikud(bolds[0]) if bolds else ''

        death_year = ''
        for b in bolds:
            if 'נפטר' in b or 'נִפְטַר' in b:
                death_year = strip_nikud(b)
                break

        # Plain text without **
        plain = BOLD_PATTERN.sub(lambda m: m.group(1), section)
        plain = strip_nikud(plain)

        # Remove lines that are just the popular name or death year
        lines = [l.strip() for l in plain.split('\n') if l.strip()]
        bio_lines = []
        skipped = 0
        for line in lines:
            clean = line.strip()
            if skipped < 3 and (popular_name.strip() in clean or 'נפטר' in clean):
                skipped += 1
                continue
            bio_lines.append(clean)
        raw_bio = ' '.join(bio_lines).strip()

        entries.append({
            'hebrew_day':   current_day,
            'hebrew_month': current_month,
            'popular_name': popular_name,
            'death_year':   death_year,
            'raw_bio':      raw_bio,
        })

    return entries


REWRITE_PROMPT = """\
להלן טקסט עברי על צדיק מתוך מסמך היסטורי (ללא ניקוד).
שם: {popular_name}
{death_year_line}
טקסט מקורי:
{raw_bio}

כתוב מחדש (אל תעתיק) ותן תשובה כ-JSON בלבד עם השדות הבאים:
- "biography": ביוגרפיה קצרה ברורה ומרתקת, 3-4 משפטים בעברית תקינה
- "story": סיפור מרתק אחד על הצדיק (אם קיים), 2-4 משפטים. אחרת מחרוזת ריקה
- "quote": ציטוט קצר מדבריו (אם קיים). אחרת מחרוזת ריקה
- "full_name": שמו המלא הפורמלי בלי ניקוד
- "stream": אחד מ: חסידות / ליטא / ספרד / תימן / כללי
- "role": אחד מ: רב / אדמו"ר / ראש ישיבה / מקובל / פוסק / פייטן / מגיד / אחר

JSON בלבד, ללא שום הסבר."""


def rewrite_with_claude(client: anthropic.Anthropic, entry: dict) -> dict:
    death_line = f'שנת פטירה: {entry["death_year"]}' if entry['death_year'] else ''
    prompt = REWRITE_PROMPT.format(
        popular_name=entry['popular_name'],
        death_year_line=death_line,
        raw_bio=entry['raw_bio'][:1800],
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


def insert_records(records: list[dict], dry_run: bool = False) -> bool:
    if dry_run:
        for r in records:
            print(f"  [DRY-RUN] {r['hebrew_day']} {r['hebrew_month']} – {r['popular_name']}")
        return True

    url = f'{SUPABASE_URL}/rest/v1/tzaddikim'
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
    }
    try:
        resp = httpx.post(url, json=records, headers=headers, timeout=30)
        if resp.status_code in (200, 201):
            return True
        print(f'  ⚠ Supabase error {resp.status_code}: {resp.text[:300]}')
        return False
    except Exception as e:
        print(f'  ⚠ HTTP error: {e}')
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Parse only, no DB writes')
    parser.add_argument('--start',   type=int, default=0,   help='Start from entry index')
    parser.add_argument('--limit',   type=int, default=0,   help='Max entries to process (0=all)')
    args = parser.parse_args()

    # Validate credentials
    if not args.dry_run and not SUPABASE_SERVICE_KEY:
        sys.exit('Set SUPABASE_SERVICE_ROLE_KEY env var')
    if not ANTHROPIC_API_KEY:
        sys.exit('Set ANTHROPIC_API_KEY env var')

    print('[*] Loading Google Doc...')
    with open(DOC_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    content = data['fileContent']

    print('[*] Parsing entries...')
    entries = parse_doc(content)
    print(f'   Found {len(entries)} entries total')

    # Apply range
    subset = entries[args.start:]
    if args.limit:
        subset = subset[:args.limit]
    print(f'   Processing entries {args.start}–{args.start + len(subset) - 1}')

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    batch: list[dict] = []
    success = error = 0

    for i, entry in enumerate(subset, start=args.start + 1):
        print(f'[{i}/{len(entries)}] {entry["hebrew_day"]} {entry["hebrew_month"]} – {entry["popular_name"]}')
        try:
            rw = rewrite_with_claude(client, entry)
        except Exception as e:
            print(f'  ⚠ Claude error: {e}')
            rw = {}

        record = {
            'hebrew_day':       entry['hebrew_day'],
            'hebrew_month':     entry['hebrew_month'],
            'popular_name':     entry['popular_name'],
            'full_name':        rw.get('full_name', ''),
            'years':            entry['death_year'],
            'biography':        rw.get('biography', entry['raw_bio'][:600]),
            'story':            rw.get('story', ''),
            'quote':            rw.get('quote', ''),
            'stream':           rw.get('stream', 'כללי'),
            'role':             rw.get('role', 'רב'),
            'importance_score': 50,
            'sources':          'ספר הצדיקים',
        }
        batch.append(record)

        if len(batch) >= 10:
            ok = insert_records(batch, dry_run=args.dry_run)
            if ok:
                success += len(batch)
            else:
                error += len(batch)
            batch = []

        time.sleep(0.3)   # ~3 req/sec to Claude

    if batch:
        ok = insert_records(batch, dry_run=args.dry_run)
        if ok:
            success += len(batch)
        else:
            error += len(batch)

    print(f'\n[DONE] inserted: {success}, errors: {error}')


if __name__ == '__main__':
    main()
