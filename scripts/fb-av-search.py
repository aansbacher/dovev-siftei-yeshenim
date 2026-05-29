import csv, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
terms = ['חוזה מלובלין','בית יעקב מאיזביצ','סבא מקלם','זיסקינד זיו','בן איש חי','שמואל סלנט','דיסקין','מהר"ם בנט','אוסטרובה','דוד הגר','אברהם אזולאי','אהרן תאומים','משה שטרן','שלמה חנוך','יהודה מרגוזה','טריסק','צבי אלימלך שפירא','פנחס קוריצר']
found = {}
with open(r'C:\Users\aansb\Downloads\facebook_extract\facebook_posts.csv', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        text = row.get('post_text','') or ''
        for t in terms:
            if t in text and t not in found:
                found[t] = text[:700]
                break
for t, txt in found.items():
    print(f'=== {t} ===')
    print(txt)
    print()
