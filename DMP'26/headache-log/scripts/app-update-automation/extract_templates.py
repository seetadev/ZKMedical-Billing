import re
import json
import html
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(script_dir, 'templates/BloodPressureReport/www/templates/tab-home.html')

if not os.path.exists(html_path):
    print(f"Error: HTML file not found at {html_path}")
    exit(1)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Regular expression to extract the contents of the textareas
pattern_tab = re.compile(r'<textarea\s+name="savestr"\s+id="sheetdata"\s+style="display:none;">(.*?)<\/textarea>', re.DOTALL | re.IGNORECASE)
pattern_mob = re.compile(r'<textarea\s+id="sheetdata1"\s+style="display:none;">(.*?)<\/textarea>', re.DOTALL | re.IGNORECASE)

match_tab = pattern_tab.search(content)
match_mob = pattern_mob.search(content)

if not match_tab:
    print("Error: Could not find textarea with id='sheetdata'")
    exit(1)

if not match_mob:
    print("Error: Could not find textarea with id='sheetdata1'")
    exit(1)

raw_tab = html.unescape(match_tab.group(1).strip())
raw_mob = html.unescape(match_mob.group(1).strip())

try:
    json_tab = json.loads(raw_tab)
    print("Success: Tablet sheetdata is valid JSON")
except Exception as e:
    print(f"Error parsing tablet JSON: {e}")
    exit(1)

try:
    json_mob = json.loads(raw_mob)
    print("Success: Mobile sheetdata1 is valid JSON")
except Exception as e:
    print(f"Error parsing mobile JSON: {e}")
    exit(1)

# Format to the modern template layout: { mainSheet, msc, footers, appMapping }
bp_footers = [
    {"name": "Introduction", "index": 1, "isActive": True},
    {"name": "Checklist", "index": 2, "isActive": True},
    {"name": "Graph", "index": 3, "isActive": True},
    {"name": "Tracker", "index": 4, "isActive": True}
]

tablet_template = {
    "mainSheet": "sheet1",
    "msc": json_tab,
    "footers": bp_footers,
    "appMapping": {}
}

mobile_template = {
    "mainSheet": "sheet1",
    "msc": json_mob,
    "footers": bp_footers,
    "appMapping": {}
}

# Save output JSON files
out_tab_path = os.path.join(script_dir, 'templates/tab.json')
out_mob_path = os.path.join(script_dir, 'templates/mob.json')

with open(out_tab_path, 'w', encoding='utf-8') as f:
    json.dump(tablet_template, f, indent=2)
print(f"Wrote tablet template to {out_tab_path}")

with open(out_mob_path, 'w', encoding='utf-8') as f:
    json.dump(mobile_template, f, indent=2)
print(f"Wrote mobile template to {out_mob_path}")

