import httpx, os, sys
sys.stdout.reconfigure(encoding='utf-8')
key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
h = {'Authorization': f'Bearer {key}', 'apikey': key}

# Sample 10 records - check what fields are populated
r = httpx.get('https://xcdnophqazxcpeavmthu.supabase.co/rest/v1/tzaddikim?select=id,popular_name,biography,story,torah,quote,image_url,stream,role,years&limit=10&order=id.asc', headers=h)
rows = r.json()
for row in rows:
    bio = row.get('biography') or ''
    story = row.get('story') or ''
    torah = row.get('torah') or ''
    quote = row.get('quote') or ''
    img = row.get('image_url') or ''
    print(f"id={row['id']} | {row.get('popular_name','')[:30]}")
    print(f"  bio={len(bio)}ch | story={len(story)}ch | torah={len(torah)}ch | quote={len(quote)}ch")
    print(f"  image_url: {img[:80] if img else 'NONE'}")
    print()

# Count how many have each field
print('=== Field coverage ===')
r2 = httpx.get('https://xcdnophqazxcpeavmthu.supabase.co/rest/v1/tzaddikim?select=biography,story,torah,quote,image_url&limit=2500', headers=h)
all_rows = r2.json()
total = len(all_rows)
has_bio = sum(1 for r in all_rows if r.get('biography'))
has_story = sum(1 for r in all_rows if r.get('story'))
has_torah = sum(1 for r in all_rows if r.get('torah'))
has_quote = sum(1 for r in all_rows if r.get('quote'))
has_image = sum(1 for r in all_rows if r.get('image_url'))
dup_images = {}
for r in all_rows:
    img = r.get('image_url')
    if img:
        dup_images[img] = dup_images.get(img, 0) + 1
top_images = sorted(dup_images.items(), key=lambda x: -x[1])[:5]
print(f"Total: {total}")
print(f"Has biography: {has_bio} ({has_bio*100//total}%)")
print(f"Has story: {has_story} ({has_story*100//total}%)")
print(f"Has torah: {has_torah} ({has_torah*100//total}%)")
print(f"Has quote: {has_quote} ({has_quote*100//total}%)")
print(f"Has image_url: {has_image} ({has_image*100//total}%)")
print(f"Top duplicate images:")
for url, count in top_images:
    print(f"  {count}x {url[:80]}")
