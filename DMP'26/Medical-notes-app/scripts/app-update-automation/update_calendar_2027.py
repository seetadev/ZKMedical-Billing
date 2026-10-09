#!/usr/bin/env python3
"""
Update Medical Notes MSC templates from 2016 calendar to 2027 calendar.

Changes:
- January: No changes (both 2016 and 2027 start on Friday, 31 days)
- February: Remove day 29 (2016 leap year → 2027 non-leap), fix borders
- March–December: Shift all day names by -1 (because Feb lost 1 day)
- Tablet yearly sheet: Update year number and rebuild calendar grid

Updates both source templates (mob.json, tab.json) and deployed copies
(public/templates/data/mobile.json, tablet.json).
"""

import json
import calendar
import re
import os
import sys

TARGET_YEAR = 2027

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))

MOB_SRC = os.path.join(SCRIPT_DIR, 'templates', 'mob.json')
TAB_SRC = os.path.join(SCRIPT_DIR, 'templates', 'tab.json')
MOB_DST = os.path.join(PROJECT_ROOT, 'public', 'templates', 'data', 'mobile.json')
TAB_DST = os.path.join(PROJECT_ROOT, 'public', 'templates', 'data', 'tablet.json')

# Day name constants
SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

# Shift by -1 day (Mar-Dec all shift by exactly 1 day earlier)
SHORT_SHIFT = {
    'Mon': 'Sun', 'Tue': 'Mon', 'Wed': 'Tue', 'Thu': 'Wed',
    'Fri': 'Thu', 'Sat': 'Fri', 'Sun': 'Sat'
}
FULL_SHIFT = {
    'Monday': 'Sunday', 'Tuesday': 'Monday', 'Wednesday': 'Tuesday',
    'Thursday': 'Wednesday', 'Friday': 'Thursday', 'Saturday': 'Friday',
    'Sunday': 'Saturday'
}


# ─────────────────────────────────────────────────────────────────────
#  MOBILE TEMPLATE (3-letter day abbreviations in column C)
# ─────────────────────────────────────────────────────────────────────

def shift_mobile_days(sheet):
    """Shift 3-letter day names by -1 in column C for mobile sheets."""
    savestr = sheet['sheetstr']['savestr']
    lines = savestr.split('\n')
    new_lines = []
    day_pattern = re.compile(
        r'(cell:C\d+:t:)(' + '|'.join(SHORT_DAYS) + r')(:)'
    )
    changed = 0
    for line in lines:
        m = day_pattern.search(line)
        if m:
            old_day = m.group(2)
            new_day = SHORT_SHIFT[old_day]
            line = day_pattern.sub(m.group(1) + new_day + m.group(3), line)
            changed += 1
        new_lines.append(line)
    sheet['sheetstr']['savestr'] = '\n'.join(new_lines)
    return changed


def fix_february_mobile(sheet):
    """Remove day 29 row from mobile February and fix borders."""
    savestr = sheet['sheetstr']['savestr']
    lines = savestr.split('\n')

    # Find the row containing date 29 in column D
    date29_row = None
    for line in lines:
        m = re.match(r'cell:D(\d+):v:29:', line)
        if m:
            date29_row = int(m.group(1))
            break
    if date29_row is None:
        print("    ⚠ Could not find date 29 in February mobile sheet")
        return 0

    date28_row = date29_row - 1
    border_row = date29_row + 1       # old border row
    new_border_row = date29_row       # moves up by 1

    new_lines = []
    removed = 0
    for line in lines:
        cell_m = re.match(r'cell:([A-Z]+)(\d+):', line)
        if cell_m:
            col = cell_m.group(1)
            row = int(cell_m.group(2))

            # 1) Skip all cells on the day-29 row
            if row == date29_row:
                removed += 1
                continue

            # 2) On the day-28 row, add bottom border to C/D/E
            #    Pattern: :b::1::1  →  :b::1:1:1
            if row == date28_row and col in ('C', 'D', 'E'):
                line = line.replace(':b::1::1', ':b::1:1:1')

            # 3) Renumber the old border row → new_border_row
            if row == border_row:
                line = re.sub(
                    r'^(cell:[A-Z]+)\d+:',
                    rf'\g<1>{new_border_row}:',
                    line
                )

        # 4) Update sheet row count
        if line.startswith('sheet:'):
            line = re.sub(r':r:\d+:', f':r:{new_border_row}:', line)

        new_lines.append(line)

    sheet['sheetstr']['savestr'] = '\n'.join(new_lines)
    return removed


# ─────────────────────────────────────────────────────────────────────
#  TABLET MONTHLY SHEETS (full day names in column D)
# ─────────────────────────────────────────────────────────────────────

def shift_tablet_days(sheet):
    """Shift full day names by -1 in column D for tablet sheets."""
    savestr = sheet['sheetstr']['savestr']
    lines = savestr.split('\n')
    new_lines = []
    # Sort by length descending so "Wednesday" matches before "Wed" etc.
    sorted_days = sorted(FULL_DAYS, key=len, reverse=True)
    day_pattern = re.compile(
        r'(cell:D\d+:t:)(' + '|'.join(sorted_days) + r')(:)'
    )
    changed = 0
    for line in lines:
        m = day_pattern.search(line)
        if m:
            old_day = m.group(2)
            new_day = FULL_SHIFT[old_day]
            line = day_pattern.sub(m.group(1) + new_day + m.group(3), line)
            changed += 1
        new_lines.append(line)
    sheet['sheetstr']['savestr'] = '\n'.join(new_lines)
    return changed


def fix_february_tablet(sheet):
    """Remove day 29 row from tablet February and fix borders."""
    savestr = sheet['sheetstr']['savestr']
    lines = savestr.split('\n')

    # Find the row containing date 29 in column E (tablet uses col E for dates)
    date29_row = None
    for line in lines:
        m = re.match(r'cell:E(\d+):v:29:', line)
        if m:
            date29_row = int(m.group(1))
            break
    if date29_row is None:
        print("    ⚠ Could not find date 29 in February tablet sheet")
        return 0

    date28_row = date29_row - 1
    border_row = date29_row + 1
    new_border_row = date29_row

    new_lines = []
    removed = 0
    for line in lines:
        cell_m = re.match(r'cell:([A-Z]+)(\d+):', line)
        if cell_m:
            col = cell_m.group(1)
            row = int(cell_m.group(2))

            # 1) Skip all cells on the day-29 row
            if row == date29_row:
                removed += 1
                continue

            # 2) On the day-28 row, add bottom border to D/E/F
            #    (C and G already have all-borders b:1:1:1:1)
            if row == date28_row and col in ('D', 'E', 'F'):
                line = line.replace(':b::1::1', ':b::1:1:1')

            # 3) Renumber old border row → new_border_row
            if row == border_row:
                line = re.sub(
                    r'^(cell:[A-Z]+)\d+:',
                    rf'\g<1>{new_border_row}:',
                    line
                )

        # 4) Update sheet row count
        if line.startswith('sheet:'):
            line = re.sub(r':r:\d+:', f':r:{new_border_row}:', line)

        new_lines.append(line)

    sheet['sheetstr']['savestr'] = '\n'.join(new_lines)
    return removed


# ─────────────────────────────────────────────────────────────────────
#  TABLET YEARLY SHEET (calendar grid)
# ─────────────────────────────────────────────────────────────────────

def rebuild_yearly_grid(sheet):
    """Rebuild the tablet yearly calendar grid for TARGET_YEAR."""
    savestr = sheet['sheetstr']['savestr']
    lines = savestr.split('\n')

    # Column letters for each month position (Su, M, Tu, W, Th, F, Sa)
    pos_cols = {
        1: ['C', 'D', 'E', 'F', 'G', 'H', 'I'],
        2: ['K', 'L', 'M', 'N', 'O', 'P', 'Q'],
        3: ['S', 'T', 'U', 'V', 'W', 'X', 'Y'],
    }

    # Quarter definitions: (first_data_row, [month1, month2, month3])
    quarters = [
        (7,  [1, 2, 3]),
        (16, [4, 5, 6]),
        (25, [7, 8, 9]),
        (34, [10, 11, 12]),
    ]

    # Build set of all calendar grid cell positions to replace
    grid_cells = set()
    for first_row, _ in quarters:
        for offset in range(6):
            row = first_row + offset
            for pos in (1, 2, 3):
                for col in pos_cols[pos]:
                    grid_cells.add((col, row))

    # Generate 2027 calendar data for each month
    c = calendar.Calendar(firstweekday=6)
    month_grids = {}
    for month in range(1, 13):
        weeks = c.monthdayscalendar(TARGET_YEAR, month)
        # Pad to exactly 6 rows
        while len(weeks) < 6:
            weeks.append([0] * 7)
        month_grids[month] = weeks

    # Generate new cell lines for the grid
    new_grid = {}  # (col, row) → cell line
    for first_row, months in quarters:
        for offset in range(6):
            row = first_row + offset

            # Border pattern
            is_first = (offset == 0)
            is_last = (offset == 5)

            if is_first:
                border = 'b:1:1::1'
            elif is_last:
                border = 'b::1:1:1'
            else:
                border = 'b::1::1'

            # Shading: offset 1,3,5 are shaded
            is_shaded = (offset % 2 == 1)
            bg = ':bg:1' if is_shaded else ''
            cf = ':cf:2'

            for pos_idx, month in enumerate(months):
                pos = pos_idx + 1
                cols = pos_cols[pos]
                grid = month_grids[month]

                for col_idx, col in enumerate(cols):
                    date_val = grid[offset][col_idx]
                    if date_val > 0:
                        cell_line = f'cell:{col}{row}:v:{date_val}:{border}{bg}{cf}'
                    else:
                        cell_line = f'cell:{col}{row}:{border}{bg}{cf}'
                    new_grid[(col, row)] = cell_line

    # Reconstruct savestr
    new_lines = []
    replaced = set()

    for line in lines:
        cell_m = re.match(r'cell:([A-Z]+)(\d+):', line)
        if cell_m:
            col = cell_m.group(1)
            row = int(cell_m.group(2))

            # Replace grid cells with regenerated ones
            if (col, row) in grid_cells:
                if (col, row) not in replaced:
                    new_lines.append(new_grid[(col, row)])
                    replaced.add((col, row))
                continue  # skip original line

            # Update year: cell:C2:v:2016 → cell:C2:v:2027
            if col == 'C' and row == 2 and ':v:2016:' in line:
                line = line.replace(':v:2016:', f':v:{TARGET_YEAR}:')

        new_lines.append(line)

    # Add any grid cells that weren't replacements of existing cells
    remaining = set(new_grid.keys()) - replaced
    if remaining:
        # Find insertion point (before col: lines)
        insert_idx = len(new_lines)
        for i, line in enumerate(new_lines):
            if line.startswith('col:'):
                insert_idx = i
                break
        for key in sorted(remaining, key=lambda k: (k[1], ord(k[0][0]) if len(k[0])==1 else ord(k[0][0])*100+ord(k[0][1]))):
            new_lines.insert(insert_idx, new_grid[key])
            insert_idx += 1

    sheet['sheetstr']['savestr'] = '\n'.join(new_lines)
    return len(replaced)


# ─────────────────────────────────────────────────────────────────────
#  MAIN
# ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print(f"  Updating MSC templates: 2016 → {TARGET_YEAR}")
    print("=" * 60)

    # ── Mobile template ─────────────────────────────────────────────
    print("\n📱 Mobile template (mob.json)")
    with open(MOB_SRC, 'r', encoding='utf-8') as f:
        mob = json.load(f)
    msc_m = mob['msc']

    print("  sheet1 (Jan): No changes — identical calendar")

    n = fix_february_mobile(msc_m['sheetArr']['sheet2'])
    print(f"  sheet2 (Feb): Removed {n} cells (day 29), fixed borders")

    for i in range(3, 13):
        month_name = calendar.month_name[i]
        n = shift_mobile_days(msc_m['sheetArr'][f'sheet{i}'])
        print(f"  sheet{i} ({month_name}): Shifted {n} day names")

    with open(MOB_SRC, 'w', encoding='utf-8') as f:
        json.dump(mob, f, indent=2)
    print(f"  ✅ {MOB_SRC}")

    with open(MOB_DST, 'w', encoding='utf-8') as f:
        json.dump(mob, f, indent=2)
    print(f"  ✅ {MOB_DST}")

    # ── Tablet template ─────────────────────────────────────────────
    print("\n📱 Tablet template (tab.json)")
    with open(TAB_SRC, 'r', encoding='utf-8') as f:
        tab = json.load(f)
    msc_t = tab['msc']

    n = rebuild_yearly_grid(msc_t['sheetArr']['sheet1'])
    print(f"  sheet1 (Yearly): Rebuilt {n} grid cells, year → {TARGET_YEAR}")

    print("  sheet2 (Jan): No changes — identical calendar")

    n = fix_february_tablet(msc_t['sheetArr']['sheet3'])
    print(f"  sheet3 (Feb): Removed {n} cells (day 29), fixed borders")

    for i in range(4, 14):
        month_name = calendar.month_name[i - 1]  # sheet4=Mar, sheet5=Apr, …
        n = shift_tablet_days(msc_t['sheetArr'][f'sheet{i}'])
        print(f"  sheet{i} ({month_name}): Shifted {n} day names")

    with open(TAB_SRC, 'w', encoding='utf-8') as f:
        json.dump(tab, f, indent=2)
    print(f"  ✅ {TAB_SRC}")

    with open(TAB_DST, 'w', encoding='utf-8') as f:
        json.dump(tab, f, indent=2)
    print(f"  ✅ {TAB_DST}")

    print("\n" + "=" * 60)
    print("  ✅ Calendar update complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
