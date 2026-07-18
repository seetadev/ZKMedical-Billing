import re
import json
import html
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(script_dir, 'templates/medical notes/tab-home.html')

if not os.path.exists(html_path):
    print(f"Error: HTML file not found at {html_path}")
    exit(1)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Regular expressions to extract the contents of the textareas
pattern_tab = re.compile(r'<textarea\s+[^>]*id="sheetdata"[^>]*>(.*?)<\/textarea>', re.DOTALL | re.IGNORECASE)
pattern_mob = re.compile(r'<textarea\s+[^>]*id="sheetdata1"[^>]*>(.*?)<\/textarea>', re.DOTALL | re.IGNORECASE)

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
tab_footers = [
    {"name": "Yearly", "index": 1, "isActive": True},
    {"name": "Jan", "index": 2, "isActive": True},
    {"name": "Feb", "index": 3, "isActive": True},
    {"name": "Mar", "index": 4, "isActive": True},
    {"name": "Apr", "index": 5, "isActive": True},
    {"name": "May", "index": 6, "isActive": True},
    {"name": "Jun", "index": 7, "isActive": True},
    {"name": "Jul", "index": 8, "isActive": True},
    {"name": "Aug", "index": 9, "isActive": True},
    {"name": "Sep", "index": 10, "isActive": True},
    {"name": "Oct", "index": 11, "isActive": True},
    {"name": "Nov", "index": 12, "isActive": True},
    {"name": "Dec", "index": 13, "isActive": True}
]

mob_footers = [
    {"name": "Jan", "index": 1, "isActive": True},
    {"name": "Feb", "index": 2, "isActive": True},
    {"name": "Mar", "index": 3, "isActive": True},
    {"name": "Apr", "index": 4, "isActive": True},
    {"name": "May", "index": 5, "isActive": True},
    {"name": "Jun", "index": 6, "isActive": True},
    {"name": "Jul", "index": 7, "isActive": True},
    {"name": "Aug", "index": 8, "isActive": True},
    {"name": "Sep", "index": 9, "isActive": True},
    {"name": "Oct", "index": 10, "isActive": True},
    {"name": "Nov", "index": 11, "isActive": True},
    {"name": "Dec", "index": 12, "isActive": True}
]

tablet_template = {
    "mainSheet": "sheet1",
    "msc": json_tab,
    "footers": tab_footers,
    "appMapping": {}
}

mobile_template = {
    "mainSheet": "sheet1",
    "msc": json_mob,
    "footers": mob_footers,
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
