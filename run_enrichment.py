"""
run_enrichment.py
Simple launcher - no Hebrew needed in terminal.

Usage:
    python run_enrichment.py 1          # תשרי + חשוון
    python run_enrichment.py 2          # כסלו + טבת
    python run_enrichment.py 3          # שבט + אדר
    python run_enrichment.py 4          # ניסן + אייר
    python run_enrichment.py 5          # סיון + תמוז
    python run_enrichment.py 6          # אב + אלול
    python run_enrichment.py all        # all months
    python run_enrichment.py 1 --resume # resume from checkpoint
    python run_enrichment.py 1 --dry-run
    python run_enrichment.py 1 --names-only
"""

import sys, os, subprocess

# Force unbuffered UTF-8 output in subprocesses
_ENV = {**os.environ, 'PYTHONUNBUFFERED': '1', 'PYTHONIOENCODING': 'utf-8'}

GROUPS = {
    '1': ['תשרי', 'חשוון'],  # תשרי, חשוון
    '2': ['כסלו', 'טבת'],               # כסלו, טבת
    '3': ['שבט', 'אדר'],                     # שבט, אדר
    '4': ['ניסן', 'אייר'],         # ניסן, אייר
    '5': ['סיון', 'תמוז'],         # סיון, תמוז
    '6': ['אב', 'אלול'],                     # אב, אלול
}

GROUP_NAMES = {
    '1': 'Tishrei + Cheshvan',
    '2': 'Kislev + Tevet',
    '3': 'Shvat + Adar',
    '4': 'Nisan + Iyar',
    '5': 'Sivan + Tammuz',
    '6': 'Av + Elul',
}

def run_group(group_key, extra_args):
    months = ','.join(GROUPS[group_key])
    label = GROUP_NAMES[group_key]
    print(f"\n=== Group {group_key}: {label} ===")
    cmd = [sys.executable, '-u', 'enrich_tzaddikim.py', '--months', months] + extra_args
    subprocess.run(cmd, check=True, env=_ENV)

def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(0)

    group = args[0]
    extra = args[1:]  # e.g. --resume, --dry-run, --names-only

    if group == 'all':
        for k in sorted(GROUPS.keys()):
            run_group(k, extra)
    elif group in GROUPS:
        run_group(group, extra)
    else:
        print(f"Unknown group '{group}'. Use 1-6 or 'all'.")
        print(__doc__)
        sys.exit(1)

if __name__ == '__main__':
    main()
