# Prompt for future tzaddikim enrichment sessions

## Context

Project: `dovev-siftei-yeshenim` — React/Supabase app about Jewish tzaddikim.

Files:
- Data: `C:\Users\aansb\dovev-siftei-yeshenim\tzaddikim_clean.xlsx` (sheet: tzaddikim)
- Script: `C:\Users\aansb\dovev-siftei-yeshenim\enrich_tzaddikim.py`
- Checkpoint: `C:\Users\aansb\dovev-siftei-yeshenim\enrich_checkpoint.json`
- Upload script: `C:\Users\aansb\dovev-siftei-yeshenim\upload_tzaddikim.py`

## What the enrichment script does

1. Filters rows by `hilula_month` (Hebrew months specified via `--months`)
2. **Name normalization**: `popular_name` → `הרב/רבי [name] זצ"ל`
   - If original starts with רבי/רבנו/רבן → use `רבי`, otherwise `הרב`
   - Strips: מרן, הגאון, הרה"ג, existing זצ"ל, date parentheticals
3. **AI rewriting** (Claude Haiku) — each non-empty field:
   - `biography` = "רקע עליו" — up to 120 words, simple Hebrew, 3rd person
   - `story` = "סיפור" — up to 120 words, simple Hebrew
   - `torah` = "מתורתו" — up to 120 words, simple Hebrew
4. Empty fields stay empty (never fill with placeholder text)
5. Saves checkpoint after every row → safe to interrupt and resume

## Month order (process in this order)

| Session | Months         | Status    |
|---------|---------------|-----------|
| 1       | תשרי, חשוון    | DONE      |
| 2       | כסלו, טבת      | pending   |
| 3       | שבט, אדר       | pending   |
| 4       | ניסן, אייר     | pending   |
| 5       | סיון, תמוז     | pending   |
| 6       | אב, אלול       | pending   |

## Commands

### Run next session (replace months):
```
cd C:\Users\aansb\dovev-siftei-yeshenim
python enrich_tzaddikim.py --months כסלו,טבת --resume
```

### Dry-run first (to preview):
```
python enrich_tzaddikim.py --months כסלו,טבת --dry-run
```

### Names only (no AI, just normalize):
```
python enrich_tzaddikim.py --months כסלו,טבת --names-only
```

### After ALL months done — upload to Supabase:
```
python upload_tzaddikim.py --excel tzaddikim_clean.xlsx
```

## Requirements

- `pip install anthropic openpyxl pandas`
- `ANTHROPIC_API_KEY=sk-ant-...` in `.env.local`

## Rules (do not change)

- Max 120 words per field
- Rewrite in simple, clear Hebrew — no copy-paste from original
- 3rd person (גוף שלישי)
- No nikud addition (leave as-is)
- No hallucination — only rewrite facts present in original text
- Leave empty fields empty
- Resume with `--resume` to skip already-processed rows
