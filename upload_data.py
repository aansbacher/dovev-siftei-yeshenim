import os
import pandas as pd
from supabase import create_client, Client

# Load environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def upload_tzaddikim(excel_file: str, sheet_name: str = 'tzaddikim'):
    """
    Upload tzaddikim data from Excel to Supabase.

    Expected columns in Excel:
    - hebrew_day: int
    - hebrew_month: str
    - popular_name: str
    - full_name: str
    - years: str
    - quote: str
    - stream: str
    - role: str
    - image_url: str (optional)
    - sources: str (comma-separated)
    - importance_score: int
    """
    df = pd.read_excel(excel_file, sheet_name=sheet_name)

    # Prepare data
    records = []
    for _, row in df.iterrows():
        record = {
            'hebrew_day': int(row['hebrew_day']),
            'hebrew_month': row['hebrew_month'],
            'popular_name': row['popular_name'],
            'full_name': row['full_name'],
            'years': row['years'],
            'quote': row['quote'],
            'stream': row['stream'],
            'role': row['role'],
            'importance_score': int(row['importance_score'])
        }

        if pd.notna(row.get('image_url')):
            record['image_url'] = row['image_url']

        if pd.notna(row.get('sources')):
            record['sources'] = [s.strip() for s in str(row['sources']).split(',')]

        records.append(record)

    # Upload to Supabase
    response = supabase.table('tzaddikim').insert(records).execute()
    print(f"Uploaded {len(records)} tzaddikim records")
    return response

def upload_daily_sparks(excel_file: str, sheet_name: str = 'daily_sparks'):
    """
    Upload daily sparks data from Excel to Supabase.

    Expected columns in Excel:
    - hebrew_day: int
    - hebrew_month: str
    - parasha: str
    - content: str
    - source: str
    - related_to: str (optional)
    """
    df = pd.read_excel(excel_file, sheet_name=sheet_name)

    # Prepare data
    records = []
    for _, row in df.iterrows():
        record = {
            'hebrew_day': int(row['hebrew_day']),
            'hebrew_month': row['hebrew_month'],
            'parasha': row['parasha'],
            'content': row['content'],
            'source': row['source']
        }

        if pd.notna(row.get('related_to')):
            record['related_to'] = row['related_to']

        records.append(record)

    # Upload to Supabase
    response = supabase.table('daily_sparks').insert(records).execute()
    print(f"Uploaded {len(records)} daily sparks records")
    return response

if __name__ == "__main__":
    excel_file = 'data.xlsx'  # Replace with your Excel file path

    # Upload tzaddikim
    try:
        upload_tzaddikim(excel_file)
    except Exception as e:
        print(f"Error uploading tzaddikim: {e}")

    # Upload daily sparks
    try:
        upload_daily_sparks(excel_file)
    except Exception as e:
        print(f"Error uploading daily sparks: {e}")