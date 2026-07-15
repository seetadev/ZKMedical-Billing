import json
import os

def revert_mobile_template(file_path):
    print(f"Reverting mobile template: {file_path}")
    if not os.path.exists(file_path):
        print(f"Skipping (does not exist): {file_path}")
        return
    with open(file_path, "r") as f:
        data = json.load(f)

    msc = data["msc"]
    
    # Rename names inside sheetArr
    if "sheet1" in msc["sheetArr"]:
        msc["sheetArr"]["sheet1"]["name"] = "sheet1"
    if "sheet2" in msc["sheetArr"]:
        msc["sheetArr"]["sheet2"]["name"] = "sheet2"
    if "sheet3" in msc["sheetArr"]:
        msc["sheetArr"]["sheet3"]["name"] = "sheet5"
    if "sheet4" in msc["sheetArr"]:
        msc["sheetArr"]["sheet4"]["name"] = "sheet6"

    msc["currentname"] = "sheet1"

    # Rename EditableCells keys
    old_cells = msc.get("EditableCells", {}).get("cells", {})
    new_cells = {}
    
    for cell_key, val in old_cells.items():
        if cell_key.startswith("Financial 1!"):
            new_key = cell_key.replace("Financial 1!", "sheet1!", 1)
        elif cell_key.startswith("Financial 2!"):
            new_key = cell_key.replace("Financial 2!", "sheet2!", 1)
        elif cell_key.startswith("Marketing 1!"):
            new_key = cell_key.replace("Marketing 1!", "sheet5!", 1)
        elif cell_key.startswith("Marketing 2!"):
            new_key = cell_key.replace("Marketing 2!", "sheet6!", 1)
        else:
            new_key = cell_key
        new_cells[new_key] = val
        
    msc["EditableCells"]["cells"] = new_cells

    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    print("Mobile template reverted successfully.")


def revert_tablet_template(file_path):
    print(f"Reverting tablet template: {file_path}")
    if not os.path.exists(file_path):
        print(f"Skipping (does not exist): {file_path}")
        return
    with open(file_path, "r") as f:
        data = json.load(f)

    msc = data["msc"]
    
    if "sheet3" in msc["sheetArr"]:
        msc["sheetArr"]["sheet3"]["name"] = "sheet1"
    if "sheet4" in msc["sheetArr"]:
        msc["sheetArr"]["sheet4"]["name"] = "sheet2"
    if "sheet5" in msc["sheetArr"]:
        msc["sheetArr"]["sheet5"]["name"] = "sheet5"
    if "sheet6" in msc["sheetArr"]:
        msc["sheetArr"]["sheet6"]["name"] = "sheet6"

    msc["currentname"] = "sheet1"

    old_cells = msc.get("EditableCells", {}).get("cells", {})
    new_cells = {}
    
    for cell_key, val in old_cells.items():
        if cell_key.startswith("Financial Calculator!"):
            new_key = cell_key.replace("Financial Calculator!", "sheet1!", 1)
        elif cell_key.startswith("Marketing Calculator!"):
            new_key = cell_key.replace("Marketing Calculator!", "sheet2!", 1)
        elif cell_key.startswith("Sample Financial Calculator!"):
            new_key = cell_key.replace("Sample Financial Calculator!", "sheet5!", 1)
        elif cell_key.startswith("Sample Marketing Calculator!"):
            new_key = cell_key.replace("Sample Marketing Calculator!", "sheet6!", 1)
        else:
            new_key = cell_key
        new_cells[new_key] = val
        
    msc["EditableCells"]["cells"] = new_cells

    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
    print("Tablet template reverted successfully.")


# Target files
revert_mobile_template("public/templates/data/mobile.json")
revert_tablet_template("public/templates/data/tablet.json")

# Source files (in templates folder)
revert_mobile_template("scripts/app-update-automation/templates/Business-Calculator/mobile_wrapped.json")
revert_tablet_template("scripts/app-update-automation/templates/Business-Calculator/tablet_wrapped.json")
