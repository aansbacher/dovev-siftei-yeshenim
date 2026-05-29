"""
prepare_csv.py
Converts tzaddikim_clean.xlsx -> tzaddikim.csv + daily_sparks.csv
Ready to import directly into Supabase via Table Editor UI.

Usage:
    python prepare_csv.py
"""
import pandas as pd
import os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

EXCEL = 'tzaddikim_clean.xlsx'
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Read source Excel ─────────────────────────────────────────────────────────
print(f"Reading {EXCEL}...")
df = pd.read_excel(EXCEL, sheet_name='tzaddikim', dtype=str)
print(f"  Loaded {len(df)} rows")

# Replace 'nan' strings with empty
df = df.fillna('').replace('nan', '')

# ── Build tzaddikim CSV ───────────────────────────────────────────────────────
tzaddikim = pd.DataFrame({
    'hebrew_day':       df['hilula_day_num'],
    'hebrew_month':     df['hilula_month'],
    'popular_name':     df['popular_name'],
    'full_name':        df['full_name'],
    'years':            df['birth_day'],
    'quote':            df['opening_quote'],
    'stream':           df['stream'],
    'role':             df['role'],
    'image_url':        df['image_filename'],   # filename only for now
    'sources':          df['sources'],
    'importance_score': df['importance_score'],
    # Content tabs (used by app)
    'biography':        df['biography'],
    'story':            df['story'],
    'torah':            df['torah'],
})

# Keep only rows that have a date (hebrew_day + hebrew_month)
before = len(tzaddikim)
tzaddikim = tzaddikim[
    (tzaddikim['hebrew_day'] != '') &
    (tzaddikim['hebrew_month'] != '')
].copy()
print(f"  Rows with date: {len(tzaddikim)} (dropped {before - len(tzaddikim)} without date)")

# Convert hebrew_day to integer where possible
tzaddikim['hebrew_day'] = pd.to_numeric(tzaddikim['hebrew_day'], errors='coerce').astype('Int64')

# Convert importance_score to integer where possible
tzaddikim['importance_score'] = pd.to_numeric(tzaddikim['importance_score'], errors='coerce').astype('Int64')

# ── Save tzaddikim CSV ────────────────────────────────────────────────────────
out_tzaddikim = os.path.join(OUT_DIR, 'tzaddikim.csv')
tzaddikim.to_csv(out_tzaddikim, index=False, encoding='utf-8-sig')
print(f"  Saved: tzaddikim.csv ({len(tzaddikim)} rows)")

# ── Build daily_sparks CSV (empty template) ───────────────────────────────────
# No sparks data in source yet — creates empty table with correct columns
daily_sparks = pd.DataFrame(columns=[
    'hebrew_day', 'hebrew_month', 'parasha',
    'content', 'source', 'related_to'
])

out_sparks = os.path.join(OUT_DIR, 'daily_sparks.csv')
daily_sparks.to_csv(out_sparks, index=False, encoding='utf-8-sig')
print(f"  Saved: daily_sparks.csv (empty — add content manually in Supabase)")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"""
Done! Two files created in: {OUT_DIR}

  tzaddikim.csv   - {len(tzaddikim)} rows  <- upload this to 'tzaddikim' table
  daily_sparks.csv - empty template        <- upload this to 'daily_sparks' table

Columns in tzaddikim.csv:
  {list(tzaddikim.columns)}

Month breakdown:""")

for month, count in tzaddikim['hebrew_month'].value_counts().head(12).items():
    print(f"  {month}: {count}")
