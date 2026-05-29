#!/usr/bin/env python3
import httpx, re, sys
sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'he-IL,he;q=0.9',
}

url = 'https://zusha.org.il/tag/%D7%A1%D7%99%D7%A4%D7%95%D7%A8%D7%99-%D7%97%D7%A1%D7%99%D7%93%D7%99%D7%9D/'
r = httpx.get(url, headers=HEADERS, timeout=20, follow_redirects=True)
print('Status:', r.status_code)
print('Text length:', len(r.text))

# Find article/post links
links = re.findall(r'href="(https://zusha\.org\.il/\d{4}/[^"]+)"', r.text)
links = list(dict.fromkeys(links))
print(f'Story links found: {len(links)}')
for l in links[:10]:
    print(' ', l)

# Find titles
titles = re.findall(r'<h[12][^>]*>(.*?)</h[12]>', r.text, re.DOTALL)
titles = [re.sub(r'<[^>]+>', '', t).strip() for t in titles if t.strip()]
print('\nTitles:')
for t in titles[:10]:
    print(' ', t)

# Pagination
pages = re.findall(r'zusha\.org\.il/tag/[^/]+/page/(\d+)', r.text)
print('\nPages referenced:', sorted(set(pages)))

# Print a snippet of the raw HTML to understand structure
idx = r.text.find('entry-title')
if idx > 0:
    print('\nEntry-title context:')
    print(r.text[idx-100:idx+300])
