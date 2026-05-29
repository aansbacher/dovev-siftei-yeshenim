"""
match_fb_images.py
Extracts tzaddik images from Facebook export ZIP, matches them to Excel rows,
and copies them to public/images/tzaddikim/.

Usage:
    python match_fb_images.py --zip PATH_TO_ZIP [--dry-run]
"""

import os, re, sys, io, json, argparse, zipfile, shutil
from pathlib import Path
from difflib import SequenceMatcher

import pandas as pd

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_DIR   = Path(__file__).parent
EXCEL_PATH = BASE_DIR / 'tzaddikim_clean.xlsx'
IMAGES_DIR = BASE_DIR / 'public' / 'images' / 'tzaddikim'

# Hebrew letter → day number
HEBREW_DAY = {
    'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,
    'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,  'י': 10,
    'יא': 11,'יב': 12,'יג': 13,'יד': 14,'טו': 15,
    'טז': 16,'יז': 17,'יח': 18,'יט': 19,'כ': 20,
    'כא': 21,'כב': 22,'כג': 23,'כד': 24,'כה': 25,
    'כו': 26,'כז': 27,'כח': 28,'כט': 29,'ל': 30,
}

# Hebrew day display → number (handle "א'" → 1 etc.)
def parse_day(s):
    s = re.sub(r"['\"\s]", '', s.strip())
    return HEBREW_DAY.get(s)

MONTHS = ['תשרי','חשוון','כסלו','טבת','שבט','אדר','ניסן','אייר','סיון','תמוז','אב','אלול']

def fix_enc(s):
    try:
        return s.encode('latin-1').decode('utf-8')
    except Exception:
        return s


def extract_date_from_text(text: str):
    """Extract (day_num, month_str) from post text like 'ד' בחשוון'."""
    # Pattern: Hebrew letter(s) + ' + space + ב + month
    for month in MONTHS:
        patterns = [
            rf"([א-ת]{{1,2}})'?\s+ב{month}",
            rf"ב{month}.*?([א-ת]{{1,2}})'",
        ]
        for pat in patterns:
            m = re.search(pat, text)
            if m:
                day = parse_day(m.group(1))
                if day:
                    return day, month
    return None, None


def extract_names_from_text(text: str):
    """Extract rabbi names from bold markdown: **name** or # **name**."""
    names = []
    # Bold markdown **...**
    for m in re.finditer(r'\*\*([^*]{3,80})\*\*', text):
        name = m.group(1).strip()
        # Filter out dates and short strings
        if any(kw in name for kw in ['רבי','הרב','האדמו"ר','חכם','הגאון','מרן']):
            names.append(name)
    return names


def clean_name(name: str) -> str:
    """Remove dates, parentheticals, honorific suffixes for comparison."""
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'\d{4}', '', name)
    name = re.sub(r'[–\-].*$', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def find_best_match(day: int, month: str, fb_name: str, df: pd.DataFrame):
    """Find the best matching row in df by day+month, then name similarity."""
    # Filter by day and month
    day_strs = [f"א' ב' ג' ד' ה' ו' ז' ח' ט' י'".split()[day-1] if day <= 10 else '']
    # Build day string as it appears in Excel (e.g. "ד'" or "יד'")
    rev_day = {v: k for k, v in HEBREW_DAY.items()}
    day_letter = rev_day.get(day, '')

    candidates = df[
        (df['hilula_month'] == month) &
        (df['hilula_day'].str.replace("'", '').str.replace('"', '').str.strip() == day_letter)
    ]

    if candidates.empty:
        return None, 0.0

    if len(candidates) == 1:
        return candidates.index[0], 1.0

    # Multiple candidates — match by name
    fb_clean = clean_name(fb_name)
    best_idx, best_score = None, 0.0
    for idx, row in candidates.iterrows():
        for col in ('popular_name', 'full_name'):
            cell = str(row.get(col, '') or '')
            score = similarity(fb_clean, clean_name(cell))
            if score > best_score:
                best_score = score
                best_idx = idx
    return best_idx, best_score


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--zip',      required=True, help='Path to Facebook export ZIP')
    parser.add_argument('--excel',    default=str(EXCEL_PATH))
    parser.add_argument('--sheet',    default='tzaddikim')
    parser.add_argument('--dry-run',  action='store_true')
    parser.add_argument('--min-score', type=float, default=0.35,
                        help='Minimum name similarity score (0-1)')
    args = parser.parse_args()

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_excel(args.excel, sheet_name=args.sheet, dtype=str)
    print(f'Loaded {len(df)} rows from Excel', flush=True)

    zip_path = Path(args.zip)
    matched = unmatched = skipped = 0
    results = []  # (idx, fb_file, score, name)

    with zipfile.ZipFile(zip_path) as zf:
        # Load group posts JSON
        with zf.open('your_facebook_activity/groups/group_posts_and_comments.json') as f:
            data = json.loads(f.read().decode('utf-8'))
        posts = data if isinstance(data, list) else data.get('group_posts_v2', [])
        print(f'Scanning {len(posts)} group posts...', flush=True)

        keywords = ['רבי','הרב','צדיק','הילולא','יארצייט','זצ','נפטר','נסתלק']

        for post in posts:
            text = ''
            if post.get('data'):
                text = fix_enc(post['data'][0].get('post', ''))
            title = fix_enc(post.get('title', ''))
            full_text = title + '\n' + text

            if not any(kw in full_text for kw in keywords):
                continue

            # Collect image URIs
            imgs = []
            for att in post.get('attachments', []):
                for item in att.get('data', []):
                    media = item.get('media', {})
                    uri = media.get('uri', '')
                    if uri and uri.endswith(('.jpg','.jpeg','.png','.webp','.jfif')):
                        imgs.append(uri)
            if not imgs:
                continue

            day, month = extract_date_from_text(full_text)
            if not day or not month:
                unmatched += 1
                continue

            names = extract_names_from_text(full_text)
            if not names:
                unmatched += 1
                continue

            # Match first name to Excel (primary rabbi of the post)
            fb_name = names[0]
            idx, score = find_best_match(day, month, fb_name, df)

            if idx is None or score < args.min_score:
                unmatched += 1
                print(f'  [no match] {month} {day} | {fb_name[:50]} (score={score:.2f})')
                continue

            # Check if row already has an image
            existing_img = str(df.at[idx, 'image_filename'] or '')
            if existing_img and existing_img != 'nan' and (IMAGES_DIR / existing_img).exists():
                skipped += 1
                continue

            # Use first image
            uri = imgs[0]
            ext = Path(uri).suffix or '.jpg'
            dest_name = f"{month}_{day}_{idx}{ext}"
            dest_path = IMAGES_DIR / dest_name

            if not args.dry_run:
                try:
                    with zf.open(uri) as src, open(dest_path, 'wb') as dst:
                        shutil.copyfileobj(src, dst)
                    df.at[idx, 'image_filename'] = dest_name
                    matched += 1
                    print(f'  [✓ {score:.2f}] {month} {day} | {fb_name[:45]} → {dest_name}')
                except Exception as e:
                    print(f'  [err] {e}')
            else:
                print(f'  [DRY {score:.2f}] {month} {day} | {fb_name[:45]} → {dest_name}')
                matched += 1

    print(f'\nMatched: {matched} | Unmatched: {unmatched} | Skipped (already has image): {skipped}')

    if matched > 0 and not args.dry_run:
        print('Saving Excel...')
        with pd.ExcelWriter(args.excel, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name=args.sheet, index=False)
        print(f'Saved {args.excel}')


if __name__ == '__main__':
    main()
