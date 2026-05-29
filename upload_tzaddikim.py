"""
upload_tzaddikim.py
Upload tzaddikim data from tzaddikim_clean.xlsx → Supabase.

Usage:
    python upload_tzaddikim.py [--excel PATH] [--table TABLE] [--dry-run]

Reads credentials from .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
or environment variables SUPABASE_URL / SUPABASE_KEY.

Table schema expected in Supabase (tzaddikim):
    popular_name    text
    full_name       text
    birth_day       text
    hilula_day      text        -- Hebrew letter e.g. 'כו''
    hilula_day_num  int         -- integer 1-30
    hilula_month    text        -- e.g. 'תשרי'
    stream          text
    role            text
    image_filename  text
    importance_score int
    opening_quote   text
    story           text
    torah           text
    biography       text
    sources         text
"""

import os, re, sys, io, argparse
import pandas as pd
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── Load credentials ──────────────────────────────────────────────────────────

def load_env(path='.env.local'):
    env = {}
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip()
    return env

_env = load_env(os.path.join(os.path.dirname(__file__), '.env.local'))

SUPABASE_URL = (os.getenv('SUPABASE_URL')
                or _env.get('VITE_SUPABASE_URL', ''))
SUPABASE_KEY = (os.getenv('SUPABASE_KEY')
                or os.getenv('SUPABASE_ANON_KEY')
                or _env.get('VITE_SUPABASE_ANON_KEY', ''))

# ── Hebrew helpers ────────────────────────────────────────────────────────────

_LETTER_VAL = {'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,
               'י':10,'כ':20,'ל':30}

def day_to_int(day_str: str) -> int | None:
    clean = re.sub(r"['׳\s]", '', str(day_str or '')).strip()
    val   = sum(_LETTER_VAL.get(c, 0) for c in clean)
    return val if 1 <= val <= 30 else None

# ── Data preparation ──────────────────────────────────────────────────────────

EXCEL_DEFAULT = os.path.join(
    os.path.expanduser('~'), 'Downloads', 'tzaddikim_clean.xlsx'
)

def prepare_records(df: pd.DataFrame) -> list[dict]:
    """
    Convert DataFrame rows to Supabase-ready dicts.
    Drops rows that have no hilula_month (can't be displayed on any date).
    """
    records = []
    skipped = 0

    for _, row in df.iterrows():
        month = str(row.get('hilula_month', '') or '').strip()
        if not month or month == 'nan':
            skipped += 1
            continue

        day_str = str(row.get('hilula_day', '') or '').strip()
        day_num = day_to_int(day_str)
        if day_num is None:
            # Try hilula_day_num column if present
            raw_num = str(row.get('hilula_day_num', '') or '').strip()
            if raw_num and raw_num != 'nan':
                try:
                    day_num = int(float(raw_num))
                except ValueError:
                    pass

        def val(col):
            v = str(row.get(col, '') or '').strip()
            return v if v and v != 'nan' else None

        def val_int(col, default=5):
            v = val(col)
            if v is None: return default
            try: return int(float(v))
            except: return default

        record = {
            'popular_name':    val('popular_name'),
            'full_name':       val('full_name'),
            'years':           val('birth_day'),
            'hebrew_day':      day_num,
            'hebrew_month':    month,
            'stream':          val('stream'),
            'role':            val('role'),
            'image_url':       val('image_filename'),
            'importance_score': val_int('importance_score'),
            'quote':           val('opening_quote'),
            'story':           val('story'),
            'torah':           val('torah'),
            'biography':       val('biography'),
            'sources':         val('sources'),
        }
        # Drop None keys to avoid overwriting existing data with nulls
        record = {k: v for k, v in record.items() if v is not None}

        if not record.get('popular_name'):
            skipped += 1
            continue

        records.append(record)

    print(f"  Prepared {len(records)} records (skipped {skipped} without month/name)")
    return records

# ── Supabase upsert ───────────────────────────────────────────────────────────

BATCH_SIZE = 200  # Supabase recommends ≤500 per request

def upload(table: str, records: list[dict], dry_run: bool):
    if not dry_run:
        try:
            from supabase import create_client
        except ImportError:
            print("ERROR: supabase-py not installed. Run: pip install supabase")
            sys.exit(1)
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("ERROR: Missing Supabase credentials.")
            print("  Set SUPABASE_URL and SUPABASE_KEY env vars, or check .env.local")
            sys.exit(1)
        client = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Clear existing data before full reload
        print("  Deleting existing rows...", end=' ', flush=True)
        client.table(table).delete().neq('id', 0).execute()
        print("OK")
    else:
        client = None

    total   = len(records)
    success = 0
    errors  = 0

    for start in range(0, total, BATCH_SIZE):
        batch = records[start:start + BATCH_SIZE]
        end   = min(start + BATCH_SIZE, total)
        print(f"  Uploading rows {start+1}-{end} / {total}...", end=' ', flush=True)
        if dry_run:
            print(f"[DRY-RUN] would insert {len(batch)} rows")
            success += len(batch)
            continue
        try:
            client.table(table).insert(batch).execute()
            success += len(batch)
            print("OK")
        except Exception as e:
            errors += len(batch)
            print(f"  ERROR: {e}")

    status = '[DRY-RUN] ' if dry_run else ''
    print(f"\n{status}Done: {success} uploaded, {errors} errors")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Upload tzaddikim to Supabase')
    parser.add_argument('--excel',   default=EXCEL_DEFAULT,
                        help=f'Path to Excel file (default: {EXCEL_DEFAULT})')
    parser.add_argument('--table',   default='tzaddikim',
                        help='Supabase table name (default: tzaddikim)')
    parser.add_argument('--sheet',   default='tzaddikim',
                        help='Excel sheet name (default: tzaddikim)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print what would be uploaded without actually uploading')
    args = parser.parse_args()

    print(f"Reading {args.excel} [{args.sheet}]...")
    try:
        df = pd.read_excel(args.excel, sheet_name=args.sheet, dtype=str)
    except FileNotFoundError:
        print(f"ERROR: File not found: {args.excel}")
        sys.exit(1)
    print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

    records = prepare_records(df)
    if not records:
        print("No records to upload.")
        return

    print(f"\n{'[DRY-RUN] ' if args.dry_run else ''}Uploading {len(records)} records "
          f"to table '{args.table}'...")
    upload(args.table, records, args.dry_run)


if __name__ == '__main__':
    main()
