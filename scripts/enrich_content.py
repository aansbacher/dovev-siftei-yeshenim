#!/usr/bin/env python3
"""
Enrich tzaddikim records that have a biography but no story/quote/torah.
Uses Claude Haiku to generate story, quote, and torah from the biography.

Usage:
  python scripts/enrich_content.py [--limit N] [--dry-run]
"""
import httpx, os, sys, re, json, time, argparse
sys.stdout.reconfigure(encoding='utf-8')
import anthropic

SUPABASE_URL = 'https://xcdnophqazxcpeavmthu.supabase.co'
KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
ANTHROPIC_KEY = os.environ['ANTHROPIC_API_KEY']
H = {'Authorization': f'Bearer {KEY}', 'apikey': KEY, 'Content-Type': 'application/json'}

ENRICH_PROMPT = """\
להלן ביוגרפיה קצרה של צדיק יהודי:
שם: {name}
ביוגרפיה: {biography}

על סמך הביוגרפיה, כתוב JSON בלבד עם השדות:
- "story": סיפור מרתק ומעניין אחד על הצדיק, 2-4 משפטים בעברית. אם הביוגרפיה קצרה מדי - המצא סיפור קצר ומתאים לרוחו
- "quote": ציטוט קצר ומעורר מחשבה שמתאים לרוח הצדיק. משפט אחד
- "torah": משפט מתורתו או דרכו - לקח רוחני קצר, משפט אחד

JSON בלבד."""


def fetch_batch(offset: int, limit: int) -> list[dict]:
    r = httpx.get(
        f'{SUPABASE_URL}/rest/v1/tzaddikim'
        f'?select=id,popular_name,biography,story,quote,torah'
        f'&biography=not.is.null'
        f'&story=is.null'
        f'&limit={limit}&offset={offset}',
        headers=H, timeout=30
    )
    data = r.json()
    # Also skip records with empty biography
    return [row for row in data if (row.get('biography') or '').strip()]


def enrich(client: anthropic.Anthropic, row: dict) -> dict:
    prompt = ENRICH_PROMPT.format(
        name=row.get('popular_name', ''),
        biography=(row.get('biography') or '')[:1200],
    )
    resp = client.messages.create(
        model='claude-haiku-4-5-20251001',
        max_tokens=600,
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


def patch_record(rid: int, data: dict, dry_run: bool) -> bool:
    if dry_run:
        print(f'    [DRY-RUN] would patch id={rid}: story={len(data.get("story",""))}ch')
        return True
    r = httpx.patch(
        f'{SUPABASE_URL}/rest/v1/tzaddikim?id=eq.{rid}',
        json=data,
        headers={**H, 'Prefer': 'return=minimal'},
        timeout=15,
    )
    return r.status_code in (200, 204)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=0, help='Max records to process (0=all)')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    success = errors = 0
    offset = 0
    PAGE = 100

    while True:
        batch = fetch_batch(offset, PAGE)
        if not batch:
            break

        for row in batch:
            if args.limit and success + errors >= args.limit:
                print(f'\n[DONE] Limit reached. success={success} errors={errors}')
                return

            rid = row['id']
            name = row.get('popular_name', '')
            print(f'[{success+errors+1}] id={rid} {name[:30]}')

            try:
                enriched = enrich(client, row)
            except Exception as e:
                print(f'  Claude error: {e}')
                errors += 1
                time.sleep(2)
                continue

            if not enriched:
                print(f'  Empty response, skipping')
                errors += 1
                continue

            patch = {k: enriched[k] for k in ('story', 'quote', 'torah') if enriched.get(k)}
            if not patch:
                print(f'  No fields to update')
                continue

            if patch_record(rid, patch, args.dry_run):
                success += 1
                print(f'  OK: story={len(patch.get("story",""))}ch quote={len(patch.get("quote",""))}ch')
            else:
                errors += 1
                print(f'  Patch failed')

            time.sleep(0.35)

        offset += PAGE
        if len(batch) < PAGE:
            break

    print(f'\n[DONE] success={success} errors={errors}')


if __name__ == '__main__':
    main()
