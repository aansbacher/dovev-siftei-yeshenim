"""
extract-facebook-tzaddikim.py

Extracts tzaddik data from Facebook group export → CSV for Google Sheets review.

Usage:
    python scripts/extract-facebook-tzaddikim.py

Output:
    tzaddikim_extracted.csv  (project root)
"""

import sys, io, os, json, re, csv
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
FB_BASE     = r'C:\Users\aansb\Downloads\facebook-ariansbacher-2026-05-12-337VNCuJ'
GROUP_POSTS = os.path.join(FB_BASE, 'your_facebook_activity', 'groups', 'group_posts_and_comments.json')
OUTPUT_CSV  = os.path.join(PROJECT_DIR, 'tzaddikim_extracted.csv')

# ── Encoding fix ──────────────────────────────────────────────────────────────
def fix_fb(t):
    if not t: return ''
    try: return t.encode('latin1').decode('utf-8')
    except: return t

# ── Hebrew date parsing ───────────────────────────────────────────────────────
MONTHS = ['תשרי','חשוון','חשון','כסלו','טבת','שבט','אדר','אדר א','אדר ב',
          'ניסן','אייר','סיון','תמוז','אב','אלול']
MONTH_NORM = {'חשון': 'חשוון'}

_LV = {'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ל':30}

def heb_to_int(s):
    clean = re.sub(r'[\'\"״׳\s]','',s)
    v = sum(_LV.get(c,0) for c in clean)
    return v if 1 <= v <= 30 else None

def parse_date(text):
    mp = '|'.join(re.escape(m) for m in sorted(MONTHS, key=len, reverse=True))
    m = re.search(r'([א-ת]{1,3})[\'״\"]?\s*ב(' + mp + r')', text)
    if m:
        d = heb_to_int(m.group(1))
        month = MONTH_NORM.get(m.group(2), m.group(2))
        return d, month
    return None, None

# ── Name extraction ───────────────────────────────────────────────────────────
NAME_MARKERS = r'(?:האדמו"ר|האדמו\'\'ר|הגאון|הרב |הרבי |רבי |ר\' |מרן |החכם |הצדיק |הגה"ק|מו"ר)'

def extract_names_and_bios(text):
    """
    Split post text into (name, biography) pairs.
    Handles both **bold** format and plain-text format.
    """
    results = []

    # Strategy 1: split on **bold name** markers
    # Find all **...** spans that look like names
    bold_spans = list(re.finditer(r'\*{1,3}([^\n*]{3,120})\*{1,3}', text))
    name_spans = [(m.start(), m.end(), m.group(1).strip())
                  for m in bold_spans
                  if re.search(NAME_MARKERS, m.group(1))]

    if name_spans:
        for i, (start, end, raw_name) in enumerate(name_spans):
            # Bio = text from end of this name to start of next name (or end of text)
            bio_start = end
            bio_end   = name_spans[i+1][0] if i+1 < len(name_spans) else len(text)
            bio = text[bio_start:bio_end].strip()
            bio = re.sub(r'\*{1,3}[^\n*]*\*{1,3}', '', bio)  # remove any remaining bold
            bio = re.sub(r'#{1,6}', '', bio).strip()
            results.append((raw_name.strip(' -–'), bio))
        return results

    # Strategy 2: name not bold — look for lines that start with a name keyword
    # After skipping the date header line(s)
    lines = text.splitlines()
    # Find first "name line" (line with NAME_MARKERS not in first 2 lines)
    name_line_idx = None
    for i, line in enumerate(lines):
        stripped = line.strip(' *#')
        if re.search(NAME_MARKERS, stripped) and i > 0:
            name_line_idx = i
            break

    if name_line_idx is not None:
        name_raw = lines[name_line_idx].strip(' *#')
        bio = '\n'.join(lines[name_line_idx+1:]).strip()
        bio = re.sub(r'\*{1,3}', '', bio)
        bio = re.sub(r'#{1,6}', '', bio).strip()
        results.append((name_raw, bio))
        return results

    # Strategy 3: no structured name found — treat first non-empty non-date line as name
    date_re = re.compile(r'[\'*#\s]*[א-ת]{1,3}[\'״\"]?\s*ב(?:' + '|'.join(re.escape(m) for m in MONTHS) + r')')
    for i, line in enumerate(lines):
        stripped = line.strip(' *#\n\r')
        if stripped and not date_re.search(stripped) and len(stripped) > 5:
            bio = '\n'.join(lines[i+1:]).strip()
            bio = re.sub(r'[\*#]{1,3}', '', bio).strip()
            results.append((stripped, bio))
            return results

    return [('', text.strip())]


def clean_name(raw):
    """Strip years, dashes, markdown from name."""
    s = re.sub(r'\*{1,3}','', raw)
    s = re.sub(r'#{1,6}','', s)
    s = re.sub(r'\s*[-–]\s*\d{3,4}.*$','', s)   # remove trailing year range
    s = re.sub(r'\(.*?\)','', s)                  # remove parentheses
    s = s.strip(' -–,.')
    return s


def extract_years(raw):
    m = re.search(r'(\d{3,4}\s*[-–]\s*\d{3,4}|\d{3,4})', raw)
    return m.group(0).strip() if m else ''


def extract_quote(bio):
    m = re.search(r'["""״](.*?)["""״]', bio)
    return m.group(1)[:200] if m else ''


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f'Reading {GROUP_POSTS}...')
    with open(GROUP_POSTS, encoding='utf-8') as f:
        data = json.load(f)
    posts = data['group_posts_v2']
    print(f'Total posts: {len(posts)}')

    rows = []
    skipped = 0

    for post in posts:
        raw_text = ''
        for d in post.get('data', []):
            if 'post' in d:
                raw_text = d['post']
                break
        if not raw_text:
            skipped += 1
            continue

        text = fix_fb(raw_text)

        # Filter: must mention tzaddik
        if not any(kw in text for kw in ['רבי','הרב ','האדמו','זצ','הילולא','נפטר','יארצייט','גאון']):
            skipped += 1
            continue

        # Get images
        images = []
        for att in post.get('attachments', []):
            for item in att.get('data', []):
                if 'media' in item:
                    uri = item['media'].get('uri','')
                    fn = uri.split('/')[-1]
                    if fn.lower().endswith(('.jpg','.jpeg','.png','.webp')):
                        images.append(fn)

        # Parse date from first 6 lines
        day_num, month = None, None
        for line in text.splitlines()[:6]:
            d, m = parse_date(line)
            if d:
                day_num, month = d, m
                break
        if not day_num:
            day_num, month = parse_date(text)

        # Extract tzaddikim from this post
        name_bio_pairs = extract_names_and_bios(text)

        for idx, (name_raw, bio) in enumerate(name_bio_pairs):
            img = images[idx] if idx < len(images) else (images[0] if images else '')

            rows.append({
                'popular_name':   clean_name(name_raw),
                'full_name':      '',
                'years':          extract_years(name_raw + ' ' + bio[:100]),
                'hebrew_day':     day_num or '',
                'hebrew_month':   month or '',
                'image_filename': img,
                'biography':      bio[:3000],
                'story':          '',
                'torah':          '',
                'quote':          extract_quote(bio),
                'stream':         '',
                'role':           '',
                'sources':        'קבוצת פייסבוק דובב שפתי ישנים',
                'importance_score': 5,
                'note':           '',   # column for manual reviewer notes
            })

    print(f'Extracted {len(rows)} records ({skipped} posts skipped)')

    fieldnames = ['popular_name','full_name','years','hebrew_day','hebrew_month',
                  'image_filename','biography','story','torah','quote',
                  'stream','role','sources','importance_score','note']

    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8-sig') as f:
        csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore').writeheader()
        csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore').writerows(rows)

    print(f'Saved → {OUTPUT_CSV}')

    with_name = sum(1 for r in rows if r['popular_name'])
    with_date = sum(1 for r in rows if r['hebrew_day'])
    with_img  = sum(1 for r in rows if r['image_filename'])
    with_bio  = sum(1 for r in rows if len(r['biography']) > 80)
    print(f'\nStats:  name={with_name}  date={with_date}  image={with_img}  bio={with_bio}  /  total={len(rows)}')

if __name__ == '__main__':
    main()
