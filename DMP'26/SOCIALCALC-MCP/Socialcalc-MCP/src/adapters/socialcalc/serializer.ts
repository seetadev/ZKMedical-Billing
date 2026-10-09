import { Workbook } from "../../models/workbook.js";
import { Sheet, NamedRange } from "../../models/sheet.js";
import { Cell } from "../../models/cell.js";

/**
 * Encodes special characters for SocialCalc formats:
 * \ -> \b
 * newline -> \n
 * : -> \c
 */
export function encodeString(val: string): string {
  if (!val) return "";
  return val
    .replace(/\\/g, "\\b")
    .replace(/\n/g, "\\n")
    .replace(/:/g, "\\c");
}

/**
 * Serializes a Sheet model to a raw SocialCalc sheet save string.
 */
export function serializeSheetSaveStr(sheet: Sheet): string {
  let out = "version:1.5\n";

  // 1. Serialize Registries
  for (const [id, def] of sheet.fonts.entries()) {
    out += `font:${id}:${def}\n`;
  }
  for (const [id, def] of sheet.colors.entries()) {
    out += `color:${id}:${def}\n`;
  }
  for (const [id, def] of sheet.borders.entries()) {
    out += `border:${id}:${def}\n`;
  }
  for (const [id, def] of sheet.layouts.entries()) {
    out += `layout:${id}:${def}\n`;
  }
  for (const [id, def] of sheet.cellFormats.entries()) {
    out += `cellformat:${id}:${def}\n`;
  }
  for (const [id, def] of sheet.valueFormats.entries()) {
    out += `valueformat:${id}:${def}\n`;
  }

  // 2. Column widths
  for (const [col, width] of sheet.colWidths.entries()) {
    out += `col:${col}:w:${width}\n`;
  }

  // 3. Row heights
  for (const [row, height] of sheet.rowHeights.entries()) {
    out += `row:${row}:h:${height}\n`;
  }

  // 4. Sheet dimensions
  const cols = Math.max(1, sheet.maxCol);
  const rows = Math.max(1, sheet.maxRow);
  let sheetLine = `sheet:c:${cols}:r:${rows}`;
  if (sheet.defaultColWidth !== undefined) sheetLine += `:w:${sheet.defaultColWidth}`;
  if (sheet.defaultRowHeight !== undefined) sheetLine += `:h:${sheet.defaultRowHeight}`;
  out += sheetLine + "\n";

  // 5. Named ranges
  for (const [, nr] of sheet.namedRanges.entries()) {
    out += `name:${nr.name}:${encodeString(nr.description)}:${encodeString(nr.value)}\n`;
  }

  // 6. Cells
  for (const [coord, cell] of sheet.cells.entries()) {
    if (cell.isEmpty()) continue;

    let cellLine = `cell:${coord}`;

    // Values & Formulas
    if (cell.formula !== undefined) {
      const type = cell.valuetype || "n";
      const rawVal = cell.val !== undefined ? cell.val.toString() : (cell.text !== undefined ? cell.text : "");
      cellLine += `:vtf:${type}:${encodeString(rawVal)}:${encodeString(cell.formula)}`;
    } else {
      if (cell.val !== undefined) {
        cellLine += `:v:${cell.val}`;
      }
      if (cell.text !== undefined) {
        cellLine += `:t:${encodeString(cell.text)}`;
      }
    }

    // Formatting references
    if (cell.fontIndex !== undefined) cellLine += `:f:${cell.fontIndex}`;
    if (cell.textColorIndex !== undefined) cellLine += `:c:${cell.textColorIndex}`;
    if (cell.bgColorIndex !== undefined) cellLine += `:bg:${cell.bgColorIndex}`;
    if (cell.cellFormatIndex !== undefined) cellLine += `:cf:${cell.cellFormatIndex}`;
    if (cell.layoutIndex !== undefined) cellLine += `:l:${cell.layoutIndex}`;
    if (cell.nonTextValueFormatIndex !== undefined) cellLine += `:ntvf:${cell.nonTextValueFormatIndex}`;
    if (cell.textValueFormatIndex !== undefined) cellLine += `:tvf:${cell.textValueFormatIndex}`;

    // Spans
    if (cell.colspan !== undefined) cellLine += `:colspan:${cell.colspan}`;
    if (cell.rowspan !== undefined) cellLine += `:rowspan:${cell.rowspan}`;

    // Comments
    if (cell.comment !== undefined) {
      cellLine += `:comment:${encodeString(cell.comment)}`;
    }

    // Borders
    if (cell.borders !== undefined) {
      const b = cell.borders;
      cellLine += `:b:${b.top}:${b.right}:${b.bottom}:${b.left}`;
    }

    out += cellLine + "\n";
  }

  return out;
}

/**
 * Serializes a Workbook model to a full MSC JSON string representation.
 */
export function serializeWorkbookJson(workbook: Workbook): string {
  const sheetArr: Record<string, any> = {};

  for (const [id, sheet] of workbook.sheets.entries()) {
    const meta = workbook.sheetMeta.get(id)!;
    sheetArr[id] = {
      sheetstr: {
        savestr: serializeSheetSaveStr(sheet),
      },
      name: meta.name,
      hidden: meta.hidden ? "1" : "0",
      freezeRowCount: sheet.freezeRowCount,
      freezeColCount: sheet.freezeColCount,
    };
  }

  const mscObj = {
    numsheets: workbook.sheets.size,
    currentid: workbook.currentId,
    currentname: workbook.currentName,
    sheetArr: sheetArr,
  };

  return JSON.stringify(mscObj, null, 2);
}
