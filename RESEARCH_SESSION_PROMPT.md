# Prompt for tzaddikim web research sessions

## Context

Project: `dovev-siftei-yeshenim` — React/Supabase app about Jewish tzaddikim.

Script: `research_tzaddikim.py`
Checkpoint: `research_checkpoint.json`

## What the script does

For each tzaddik in a given month:
1. **Wikipedia (Hebrew)** — biography + image download
2. **hyomi.org.il** — stories, quotes by hilula date
3. **mytzadik.com** — additional info
4. **Claude Haiku** — synthesizes biography (120w), story (120w), torah/quote (120w)
5. **Downloads image** → `public/images/tzaddikim/{name}.jpg`
6. **Updates** `tzaddikim_clean.xlsx` + checkpoint after every row

## Month order (process in this order)

| Session | Months         | Status    |
|---------|---------------|-----------|
| 1       | סיון           | pending   |
| 2       | תמוז           | pending   |
| 3       | אב             | pending   |
| 4       | אלול           | pending   |
| 5       | תשרי, חשוון    | pending   |
| 6       | כסלו, טבת      | pending   |
| 7       | שבט, אדר       | pending   |
| 8       | ניסן, אייר     | pending   |

## Commands

### Run next session (replace months):
```
cd C:\Users\aansb\dovev-siftei-yeshenim
python research_tzaddikim.py --months סיון --resume
```

### Dry-run to preview:
```
python research_tzaddikim.py --months סיון --dry-run
```

### After research done — re-upload to Supabase:
```
python upload_tzaddikim.py --excel tzaddikim_clean.xlsx
```

## Sources used

- `he.wikipedia.org` — biography + image (Wikipedia API)
- `hyomi.org.il` — stories, quotes by hilula date
- `mytzadik.com` — additional biographical info
- `dirshu.co.il` — additional info (can add)
- Facebook group `929503647575786` — inaccessible without login, skip

## Fields filled

| Field | Column in Excel | Supabase column |
|-------|----------------|-----------------|
| biography | biography | biography |
| story | story | story |
| Torah/quote | torah | torah |
| Short quote | opening_quote | quote |
| Image | image_filename | image_url |

## Rules (do not change)

- Max 120 words per field
- Simple Hebrew, 3rd person
- No hallucination — only from sources
- Leave empty if no source found
- Resume with `--resume` to skip already-done rows
- Images saved to `public/images/tzaddikim/`
- After all months done → run `upload_tzaddikim.py`
