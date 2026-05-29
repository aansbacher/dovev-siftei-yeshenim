#!/usr/bin/env python3
"""
Null out image_url for any rabbi whose image_url appears on more than one record.
These came from an unrelated Facebook group import and aren't properly mapped.
"""
import httpx, os, sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = 'https://xcdnophqazxcpeavmthu.supabase.co'
KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
H = {'Authorization': f'Bearer {KEY}', 'apikey': KEY, 'Content-Type': 'application/json'}

# Fetch all image_urls (paginate, Supabase caps at 1000/request)
print('Fetching all image_urls...')
rows = []
offset = 0
PAGE = 1000
while True:
    r = httpx.get(
        f'{SUPABASE_URL}/rest/v1/tzaddikim?select=id,popular_name,image_url&limit={PAGE}&offset={offset}',
        headers=H, timeout=30
    )
    page = r.json()
    rows.extend(page)
    if len(page) < PAGE:
        break
    offset += PAGE
print(f'  Total rows: {len(rows)}')

# Count occurrences per image_url
url_count: dict[str, int] = {}
for row in rows:
    img = row.get('image_url')
    if img:
        url_count[img] = url_count.get(img, 0) + 1

duplicate_urls = {url for url, count in url_count.items() if count > 1}
print(f'  Unique image_urls: {len(url_count)}')
print(f'  Duplicate image_urls (appear on >1 record): {len(duplicate_urls)}')

affected = [row for row in rows if row.get('image_url') in duplicate_urls]
print(f'  Records with duplicate image_urls: {len(affected)}')

if not affected:
    print('Nothing to clean up.')
    sys.exit(0)

print('\nTop duplicate images:')
for url, count in sorted(url_count.items(), key=lambda x: -x[1])[:5]:
    print(f'  {count}x {url[:80]}')

# Null out image_url for all affected records
print(f'\nNulling image_url for {len(affected)} records...')
nulled = 0
errors = 0
for row in affected:
    rid = row['id']
    patch = httpx.patch(
        f'{SUPABASE_URL}/rest/v1/tzaddikim?id=eq.{rid}',
        json={'image_url': None},
        headers={**H, 'Prefer': 'return=minimal'},
        timeout=15,
    )
    if patch.status_code in (200, 204):
        nulled += 1
    else:
        print(f'  ERROR id={rid}: {patch.status_code} {patch.text[:100]}')
        errors += 1

print(f'\n[DONE] Nulled: {nulled}, Errors: {errors}')
