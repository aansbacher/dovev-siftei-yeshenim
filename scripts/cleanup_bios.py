#!/usr/bin/env python3
"""Clean ** markdown and # headings from biography fields."""
import httpx, os, sys, re, time
sys.stdout.reconfigure(encoding='utf-8')

key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
base = 'https://xcdnophqazxcpeavmthu.supabase.co/rest/v1/tzaddikim'
h_read  = {'Authorization': f'Bearer {key}', 'apikey': key}
h_write = {**h_read, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'}

BOLD_RE    = re.compile(r'\*\*([^*]*)\*\*')
HEADING_RE = re.compile(r'^#+\s+.*$', re.MULTILINE)
NIKUD_RE   = re.compile(r'[֑-ׇ]')


def clean_bio(text: str) -> str:
    if not text:
        return text
    text = BOLD_RE.sub(lambda m: m.group(1), text)    # remove **
    text = HEADING_RE.sub('', text)                    # remove # headings
    text = NIKUD_RE.sub('', text)                      # remove nikud (vowel marks)
    text = re.sub(r'\n{3,}', '\n\n', text)             # collapse extra newlines
    return text.strip()


def needs_cleaning(bio: str) -> bool:
    if not bio:
        return False
    return '**' in bio or bio.lstrip().startswith('#') or bool(NIKUD_RE.search(bio))


offset = 0
cleaned = skipped = 0
batch_size = 200

while True:
    r = httpx.get(
        base + f'?select=id,biography&limit={batch_size}&offset={offset}&order=id.asc',
        headers=h_read, timeout=30,
    )
    rows = r.json()
    if not rows:
        break

    updates = []
    for row in rows:
        bio = row.get('biography') or ''
        if needs_cleaning(bio):
            fixed = clean_bio(bio)
            if fixed != bio:
                updates.append((row['id'], fixed))

    for rid, fixed_bio in updates:
        resp = httpx.patch(
            base + f'?id=eq.{rid}',
            json={'biography': fixed_bio},
            headers=h_write, timeout=20,
        )
        if resp.status_code in (200, 204):
            cleaned += 1
        else:
            print(f'  Error id={rid}: {resp.status_code}')
        time.sleep(0.05)

    skipped += len(rows) - len(updates)
    print(f'  offset={offset}: cleaned={len(updates)} skipped={len(rows)-len(updates)} | total cleaned={cleaned}')

    if len(rows) < batch_size:
        break
    offset += batch_size

print(f'\nDone. Total cleaned: {cleaned}, skipped (already clean): {skipped}')
