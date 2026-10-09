import { Workbook } from "../../models/workbook.js";
import { Sheet, NamedRange } from "../../models/sheet.js";
import { Cell, CellBorder } from "../../models/cell.js";

/**
 * Decodes escaped characters in SocialCalc formats:
 * \c -> :
 * \n -> newline
 * \b -> \
 */
export function decodeString(val: string): string {
  if (!val) return "";
  return val
    .replace(/\\c/g, ":")
    .replace(/\\n/g, "\n")
    .replace(/\\b/g, "\\");
}

/**
 * Parses a raw SocialCalc sheet save string (savestr) into a Sheet object.
 */
export function parseSheetSaveStr(sheet: Sheet, saveStr: string): void {
  sheet.clear();
  const lines = saveStr.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) {
      continue; // Skip comments and empty lines
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const lineType = line.substring(0, colonIndex);
    const rest = line.substring(colonIndex + 1);

    switch (lineType) {
      case "version":
        // version:X.X
        break;

      case "font":
      case "color":
      case "border":
      case "layout":
      case "cellformat":
      case "valueformat": {
        // e.g. font:1:bold 10pt Arial
        const nextColon = rest.indexOf(":");
        if (nextColon !== -1) {
          const index = parseInt(rest.substring(0, nextColon));
          const definition = rest.substring(nextColon + 1);
          if (!isNaN(index)) {
            if (lineType === "font") sheet.fonts.set(index, definition);
            else if (lineType === "color") sheet.colors.set(index, definition);
            else if (lineType === "border") sheet.borders.set(index, definition);
            else if (lineType === "layout") sheet.layouts.set(index, definition);
            else if (lineType === "cellformat") sheet.cellFormats.set(index, definition);
            else if (lineType === "valueformat") sheet.valueFormats.set(index, definition);
          }
        }
        break;
      }

      case "col": {
        // col:A:w:10
        const parts = rest.split(":");
        if (parts.length >= 3 && parts[1] === "w") {
          const colLetter = parts[0].toUpperCase();
          const width = parseFloat(parts[2]);
          if (!isNaN(width)) {
            sheet.colWidths.set(colLetter, width);
          }
        }
        break;
      }

      case "row": {
        // row:1:h:20
        const parts = rest.split(":");
        if (parts.length >= 3 && parts[1] === "h") {
          const rowNum = parseInt(parts[0]);
          const height = parseFloat(parts[2]);
          if (!isNaN(rowNum) && !isNaN(height)) {
            sheet.rowHeights.set(rowNum, height);
          }
        }
        break;
      }

      case "sheet": {
        // sheet:c:5:r:12:w:10:h:20
        const parts = rest.split(":");
        for (let j = 0; j < parts.length; j += 2) {
          if (j + 1 >= parts.length) break;
          const attr = parts[j];
          const val = parts[j + 1];
          if (attr === "c") sheet.maxCol = parseInt(val) || 0;
          else if (attr === "r") sheet.maxRow = parseInt(val) || 0;
          else if (attr === "w") sheet.defaultColWidth = parseFloat(val) || undefined;
          else if (attr === "h") sheet.defaultRowHeight = parseFloat(val) || undefined;
        }
        break;
      }

      case "name": {
        // name:NAME:description:value
        const parts = rest.split(":");
        if (parts.length >= 3) {
          const name = parts[0];
          const desc = decodeString(parts[1]);
          const value = decodeString(parts.slice(2).join(":"));
          sheet.namedRanges.set(name, { name, description: desc, value });
        }
        break;
      }

      case "cell": {
        // cell:B2:b:1:1:1:1:bg:1:t:Amount...
        const parts = rest.split(":");
        if (parts.length < 1) continue;
        const coord = parts[0].toUpperCase();
        const cell = sheet.getCell(coord, true)!;

        const attrs = parts.slice(1);
        let j = 0;
        while (j < attrs.length) {
          const attrName = attrs[j];
          if (!attrName) {
            j++;
            continue;
          }

          let attrValue = "";
          if (attrName === "vtf") {
            // vtf:type:value:formula
            if (j + 3 >= attrs.length) break;
            const type = attrs[j + 1];
            const value = attrs[j + 2];
            const formula = attrs[j + 3];
            cell.valuetype = type;
            
            // Check if value is numeric or text
            const parsedVal = parseFloat(value);
            if (!isNaN(parsedVal)) {
              cell.val = parsedVal;
            } else {
              cell.text = decodeString(value);
            }
            cell.formula = decodeString(formula);
            j += 4;
          } else if (attrName === "b") {
            // b:top:right:bottom:left
            if (j + 4 >= attrs.length) break;
            cell.borders = {
              top: parseInt(attrs[j + 1]) || 0,
              right: parseInt(attrs[j + 2]) || 0,
              bottom: parseInt(attrs[j + 3]) || 0,
              left: parseInt(attrs[j + 4]) || 0,
            };
            j += 5;
          } else {
            if (j + 1 >= attrs.length) break;
            attrValue = attrs[j + 1];
            
            if (attrName === "v") {
              cell.val = parseFloat(attrValue);
            } else if (attrName === "t") {
              cell.text = decodeString(attrValue);
            } else if (attrName === "f") {
              cell.fontIndex = parseInt(attrValue);
            } else if (attrName === "c") {
              cell.textColorIndex = parseInt(attrValue);
            } else if (attrName === "bg") {
              cell.bgColorIndex = parseInt(attrValue);
            } else if (attrName === "cf") {
              cell.cellFormatIndex = parseInt(attrValue);
            } else if (attrName === "l") {
              cell.layoutIndex = parseInt(attrValue);
            } else if (attrName === "ntvf") {
              cell.nonTextValueFormatIndex = parseInt(attrValue);
            } else if (attrName === "tvf") {
              cell.textValueFormatIndex = parseInt(attrValue);
            } else if (attrName === "colspan") {
              cell.colspan = parseInt(attrValue);
            } else if (attrName === "rowspan") {
              cell.rowspan = parseInt(attrValue);
            } else if (attrName === "comment") {
              cell.comment = decodeString(attrValue);
            }
            j += 2;
          }
        }
        break;
      }
    }
  }
}

/**
 * Parses a full Workbook object from either an MSC JSON string or a raw sheet save string.
 */
export function parseWorkbook(contentStr: string): Workbook {
  const workbook = new Workbook();
  const trimmed = contentStr.trim();

  if (trimmed.startsWith("{")) {
    // Parse as MSC JSON representation
    let mscData = JSON.parse(trimmed);
    if (mscData.workbook) {
      mscData = mscData.workbook;
    }
    
    // Set current active sheet properties if they exist
    const currentId = mscData.currentid || "sheet1";
    const currentName = mscData.currentname || "sheet1";

    const sheetArr = mscData.sheetArr || {};
    for (const sheetId in sheetArr) {
      if (Object.prototype.hasOwnProperty.call(sheetArr, sheetId)) {
        const sheetData = sheetArr[sheetId];
        const sheetName = sheetData.name || sheetId;
        const hidden = sheetData.hidden === "1";
        const sheet = workbook.addSheet(sheetId, sheetName, hidden);
        if (sheetData.freezeRowCount !== undefined) {
          sheet.freezeRowCount = sheetData.freezeRowCount;
        }
        if (sheetData.freezeColCount !== undefined) {
          sheet.freezeColCount = sheetData.freezeColCount;
        }
        
        const savestr = sheetData.sheetstr?.savestr || "";
        parseSheetSaveStr(sheet, savestr);
      }
    }

    if (workbook.sheets.size === 0) {
      // Fallback to default sheet
      workbook.addSheet("sheet1", "sheet1");
    }
    
    workbook.setActiveSheet(currentId);
  } else {
    // Parse as a single raw sheet save string
    const sheet = workbook.addSheet("sheet1", "sheet1");
    parseSheetSaveStr(sheet, trimmed);
    workbook.setActiveSheet("sheet1");
  }

  return workbook;
}
