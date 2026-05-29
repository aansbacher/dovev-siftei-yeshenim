"""
enrich_from_facebook.py
Extracts rich tzaddik content from Facebook group export ZIP.

For each post in the group:
  1. Parses date (Hebrew day + month) and rabbi sections from text
  2. Matches each section to an Excel row
  3. Extracts biography/story/torah text from the post
  4. Uses Claude to synthesize into clean structured fields
  5. For images: direct match if 1 image, Vision API if multiple
  6. Saves to Excel, optionally uploads to Supabase

Usage:
    python enrich_from_facebook.py --zip PATH --month חשוון [--dry-run]
    python enrich_from_facebook.py --zip PATH --month all [--text-only]
"""

import os, re, sys, io, json, base64, argparse, zipfile, shutil, time
from pathlib import Path
from difflib import SequenceMatcher

import pandas as pd

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_DIR   = Path(__file__).parent
EXCEL_PATH = BASE_DIR / 'tzaddikim_clean.xlsx'
IMAGES_DIR = BASE_DIR / 'public' / 'images' / 'tzaddikim'

MONTHS = ['תשרי','חשוון','כסלו','טבת','שבט','אדר','אדר א','אדר ב','ניסן','אייר','סיון','תמוז','אב','אלול']

HEBREW_DAY = {
    'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,
    'יא':11,'יב':12,'יג':13,'יד':14,'טו':15,'טז':16,'יז':17,'יח':18,
    'יט':19,'כ':20,'כא':21,'כב':22,'כג':23,'כד':24,'כה':25,
    'כו':26,'כז':27,'כח':28,'כט':29,'ל':30,
}
REV_DAY = {v: k for k, v in HEBREW_DAY.items()}

MODEL_TEXT   = 'claude-haiku-4-5-20251001'
MODEL_VISION = 'claude-sonnet-4-6'

# ── Encoding fix ──────────────────────────────────────────────────────────────

def fix(s: str) -> str:
    try:
        return s.encode('latin-1').decode('utf-8')
    except Exception:
        return s

# ── Text parsing ──────────────────────────────────────────────────────────────

def extract_date(text: str):
    """Return (day_int, month_str) from text like 'ד' בחשוון'."""
    for month in MONTHS:
        m = re.search(rf"([א-ת]{{1,2}})'?\s+ב{month}", text)
        if m:
            day = HEBREW_DAY.get(m.group(1).replace("'", '').replace('"', ''))
            if day:
                return day, month
    return None, None


def split_into_sections(text: str):
    """
    Split post text into rabbi sections.
    Each section: (rabbi_name, section_text).
    Sections are delimited by bold headers (**name**) or # headers.
    """
    # Split on bold or heading patterns
    pattern = re.compile(
        r'(?:^|\n)\s*(?:#+\s*)?\*\*([^*\n]{3,80})\*\*',
        re.MULTILINE
    )
    matches = list(pattern.finditer(text))
    if not matches:
        return []

    sections = []
    for i, m in enumerate(matches):
        name_raw = m.group(1).strip()
        # Skip if it's a date header or generic title (no rabbi keywords)
        rabbi_kws = ['רבי','הרב','האדמו"ר','חכם','הגאון','מרן','ר\'']
        if not any(kw in name_raw for kw in rabbi_kws):
            continue
        # Text for this section: from end of name to start of next section
        start = m.end()
        end   = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section_text = text[start:end].strip()
        # Remove markdown noise
        section_text = re.sub(r'\*\*', '', section_text)
        section_text = re.sub(r'#+\s*', '', section_text)
        section_text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', section_text)  # markdown links
        section_text = re.sub(r'📷', '', section_text)
        section_text = re.sub(r'\n{3,}', '\n\n', section_text).strip()
        sections.append((name_raw, section_text))
    return sections


def clean_name_for_match(name: str) -> str:
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'\d{4}', '', name)
    name = re.sub(r'[–\-].*', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def find_match(day: int, month: str, fb_name: str, df: pd.DataFrame):
    day_letter = REV_DAY.get(day, '')
    candidates = df[
        (df['hilula_month'] == month) &
        (df['hilula_day'].str.replace("'", '').str.replace('"', '').str.strip() == day_letter)
    ]
    if candidates.empty:
        return None, 0.0
    if len(candidates) == 1:
        return candidates.index[0], 1.0

    fb_clean = clean_name_for_match(fb_name)
    best_idx, best_score = None, 0.0
    for idx, row in candidates.iterrows():
        for col in ('popular_name', 'full_name'):
            score = similarity(fb_clean, clean_name_for_match(str(row.get(col) or '')))
            if score > best_score:
                best_score = score
                best_idx = idx
    return best_idx, best_score

# ── Claude synthesis ──────────────────────────────────────────────────────────

_SYS_TEXT = """\
אתה עורך תוכן רוחני לאפליקציה יהודית-חסידית על צדיקים ורבנים.
הסגנון: חם, מכובד, נוגע ללב — כפי שמספרים על צדיקים בבית מדרש.
כללים:
- עברית ברורה, ללא ניקוד.
- אל תקצר ואל תשמיט — שמור על כל הסיפורים, דברי התורה והפרטים החשובים.
- בגוף שלישי. ללא כותרת.
- החזר מחרוזת ריקה רק אם אין כלל מידע.
"""

_PROMPT_EXTRACT = """\
להלן טקסט מקבוצת פייסבוק על {name}:

{text}

חלץ וכתוב מחדש — שמור על כל הפרטים, אל תקצר:
<biography>ביוגרפיה מלאה, עובדות ותולדות חיים. כל הפרטים החשובים.</biography>
<story>סיפור מעניין אחד או יותר המובאים בטקסט (מסופר כי...). שמור על מלוא הסיפור.</story>
<torah>דברי תורה, אמרות ועיקרים רוחניים המיוחסים לו. שמור על הכל.</torah>
<opening_quote>ציטוט ישיר ומרשים, עד שני משפטים. ריק אם אין.</opening_quote>

רק ארבע תגיות, ללא הסברים.
"""

def parse_xml(text: str) -> dict:
    result = {}
    for field in ('biography', 'story', 'torah', 'opening_quote'):
        m = re.search(rf'<{field}>(.*?)</{field}>', text, re.DOTALL)
        if m:
            val = m.group(1).strip()
            if val:
                result[field] = val
    return result


def synthesize_text(client, name: str, section_text: str) -> dict:
    if not section_text or len(section_text) < 30:
        return {}
    prompt = _PROMPT_EXTRACT.format(name=name, text=section_text[:3000])
    try:
        resp = client.messages.create(
            model=MODEL_TEXT,
            max_tokens=2000,
            system=_SYS_TEXT,
            messages=[{'role': 'user', 'content': prompt}],
        )
        return parse_xml(resp.content[0].text.strip())
    except Exception as e:
        print(f'    [Claude text] {e}', flush=True)
    return {}

# ── Claude Vision ─────────────────────────────────────────────────────────────

_SYS_VISION = """\
אתה מומחה לזיהוי צדיקים ורבנים יהודים מתמונות.
ענה בעברית בלבד. אם אינך מזהה — אמור "לא ידוע".
"""

_PROMPT_VISION = """\
התמונה מפוסט פייסבוק על צדיק שנפטר בתאריך {day} {month}.
הצדיקים האפשריים לתאריך זה: {candidates}.

1. מי הרב בתמונה? ציין שם מדויק.
2. אם יש כיתוב/טקסט בתמונה — ציין אותו.
3. רמת ביטחון: גבוהה / בינונית / נמוכה.

תשובה בפורמט:
<name>שם הרב</name>
<caption>כיתוב בתמונה אם יש</caption>
<confidence>גבוהה/בינונית/נמוכה</confidence>
"""

def vision_identify(client, img_bytes: bytes, day: int, month: str, candidates: list) -> dict:
    b64 = base64.standard_b64encode(img_bytes).decode()
    ext_guess = 'jpeg'
    candidates_str = ', '.join(candidates[:8])
    prompt = _PROMPT_VISION.format(
        day=REV_DAY.get(day, str(day)),
        month=month,
        candidates=candidates_str,
    )
    try:
        resp = client.messages.create(
            model=MODEL_VISION,
            max_tokens=300,
            system=_SYS_VISION,
            messages=[{
                'role': 'user',
                'content': [
                    {'type': 'image', 'source': {'type': 'base64', 'media_type': f'image/{ext_guess}', 'data': b64}},
                    {'type': 'text', 'text': prompt},
                ],
            }],
        )
        text = resp.content[0].text.strip()
        result = {}
        for field in ('name', 'caption', 'confidence'):
            m = re.search(rf'<{field}>(.*?)</{field}>', text, re.DOTALL)
            if m:
                result[field] = fix(m.group(1).strip())
        return result
    except Exception as e:
        print(f'    [Claude vision] {e}', flush=True)
    return {}

# ── Excel helpers ─────────────────────────────────────────────────────────────

def val_str(v) -> str:
    if v is None: return ''
    s = str(v).strip()
    return '' if s in ('nan', 'None', '') else s


def save_excel(df: pd.DataFrame, path: str):
    try:
        existing = pd.read_excel(path, sheet_name=None, dtype=str)
    except Exception:
        existing = {}
    with pd.ExcelWriter(path, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='tzaddikim', index=False)
        for s, d in existing.items():
            if s != 'tzaddikim':
                d.to_excel(writer, sheet_name=s, index=False)
    print(f'  Saved {path}', flush=True)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--zip',      required=True)
    parser.add_argument('--month',    default='חשוון',
                        help='Hebrew month name, or "all"')
    parser.add_argument('--excel',    default=str(EXCEL_PATH))
    parser.add_argument('--dry-run',  action='store_true')
    parser.add_argument('--text-only', action='store_true',
                        help='Skip image processing (Vision API)')
    parser.add_argument('--min-score', type=float, default=0.40)
    args = parser.parse_args()

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(args.excel, sheet_name='tzaddikim', dtype=str)
    print(f'Loaded {len(df)} rows', flush=True)

    # Load .env.local manually
    env_path = BASE_DIR / '.env.local'
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print('ERROR: ANTHROPIC_API_KEY missing'); sys.exit(1)

    import anthropic
    client = anthropic.Anthropic(api_key=api_key)

    zip_path = Path(args.zip)
    target_months = MONTHS if args.month == 'all' else [args.month]

    with zipfile.ZipFile(zip_path) as zf:
        with zf.open('your_facebook_activity/groups/group_posts_and_comments.json') as f:
            data = json.loads(f.read().decode('utf-8'))
        posts = data if isinstance(data, list) else data.get('group_posts_v2', [])
        print(f'Total group posts: {len(posts)}', flush=True)

        keywords = ['רבי','הרב','צדיק','הילולא','זצ','נפטר','נסתלק']

        text_updated = img_matched = img_vision = skipped = 0

        for month in target_months:
            month_posts = []
            for post in posts:
                text = fix((post.get('data') or [{}])[0].get('post', ''))
                if month not in text: continue
                if not any(kw in text for kw in keywords): continue
                day, post_month = extract_date(text)
                if not day or post_month != month: continue
                month_posts.append((day, text, post))

            print(f'\n=== {month}: {len(month_posts)} posts ===', flush=True)

            for day, text, post in month_posts:
                # Collect images
                imgs_uris = []
                for att in post.get('attachments', []):
                    for item in att.get('data', []):
                        uri = item.get('media', {}).get('uri', '')
                        if uri and uri.endswith(('.jpg','.jpeg','.png','.webp','.jfif')):
                            imgs_uris.append(uri)

                # Split into rabbi sections
                sections = split_into_sections(text)
                if not sections:
                    skipped += 1
                    continue

                # Get candidate names for Vision
                day_letter = REV_DAY.get(day, '')
                candidates_df = df[
                    (df['hilula_month'] == month) &
                    (df['hilula_day'].str.replace("'","").str.replace('"','').str.strip() == day_letter)
                ]
                candidate_names = [
                    val_str(r.get('popular_name')) or val_str(r.get('full_name'))
                    for _, r in candidates_df.iterrows()
                ]

                # Process each section
                for sec_i, (rabbi_name, section_text) in enumerate(sections):
                    idx, score = find_match(day, month, rabbi_name, df)
                    if idx is None or score < args.min_score:
                        print(f'  [no match] {month} {day} | {rabbi_name[:40]} ({score:.2f})', flush=True)
                        continue

                    row = df.loc[idx]
                    name_display = val_str(row.get('popular_name')) or rabbi_name

                    # ── Text enrichment ──
                    if section_text and not args.dry_run:
                        result = synthesize_text(client, rabbi_name, section_text)
                        time.sleep(0.5)
                        changed = False
                        for field in ('biography', 'story', 'torah', 'opening_quote'):
                            new_val = result.get(field, '').strip()
                            if not new_val:
                                continue
                            existing = val_str(row.get(field))
                            # Prefer Facebook content (richer) over Wikipedia
                            if not existing or len(new_val) > len(existing):
                                df.at[idx, field] = new_val
                                changed = True
                        if changed:
                            text_updated += 1
                            print(f'  [text ✓] {name_display[:40]}', flush=True)

                    # ── Image matching ──
                    if args.text_only or not imgs_uris:
                        continue

                    existing_img = val_str(row.get('image_filename'))
                    has_img = bool(existing_img) and (IMAGES_DIR / existing_img).exists()
                    if has_img:
                        continue

                    assigned_uri = None

                    if len(imgs_uris) == 1:
                        # Direct match
                        assigned_uri = imgs_uris[0]
                    elif len(imgs_uris) == len(sections):
                        # Same count → order-based
                        assigned_uri = imgs_uris[sec_i]
                    else:
                        # Vision API
                        try:
                            img_uri = imgs_uris[sec_i] if sec_i < len(imgs_uris) else imgs_uris[0]
                            img_bytes = zf.read(img_uri)
                            vision_result = vision_identify(client, img_bytes, day, month, candidate_names)
                            time.sleep(1)
                            identified = vision_result.get('name', '')
                            confidence = vision_result.get('confidence', '')
                            caption    = vision_result.get('caption', '')

                            # Check if identified name matches this rabbi
                            if identified and identified != 'לא ידוע':
                                sim = similarity(
                                    clean_name_for_match(identified),
                                    clean_name_for_match(rabbi_name)
                                )
                                if sim >= 0.35 or confidence == 'גבוהה':
                                    assigned_uri = img_uri
                                    img_vision += 1
                                    print(f'  [vision ✓ {confidence}] {name_display[:35]} | {identified[:35]}', flush=True)
                                else:
                                    print(f'  [vision ✗] {name_display[:35]} identified as: {identified[:35]}', flush=True)
                            elif caption:
                                # Try to match via caption text
                                sim = similarity(
                                    clean_name_for_match(caption),
                                    clean_name_for_match(rabbi_name)
                                )
                                if sim >= 0.40:
                                    assigned_uri = img_uri
                                    img_vision += 1
                        except Exception as e:
                            print(f'    [vision err] {e}', flush=True)

                    if assigned_uri and not args.dry_run:
                        ext = Path(assigned_uri).suffix or '.jpg'
                        dest_name = f"{month}_{day}_{idx}{ext}"
                        dest_path = IMAGES_DIR / dest_name
                        try:
                            with zf.open(assigned_uri) as src, open(dest_path, 'wb') as dst:
                                shutil.copyfileobj(src, dst)
                            df.at[idx, 'image_filename'] = dest_name
                            img_matched += 1
                            print(f'  [img ✓] {name_display[:40]} → {dest_name}', flush=True)
                        except Exception as e:
                            print(f'    [img err] {e}', flush=True)

            # Save after each month
            if not args.dry_run:
                print(f'\nSaving after {month}...', flush=True)
                save_excel(df, args.excel)

    print(f'\n=== DONE ===')
    print(f'Text updated:   {text_updated}')
    print(f'Images matched: {img_matched} (vision: {img_vision})')
    print(f'Skipped:        {skipped}')


if __name__ == '__main__':
    main()
