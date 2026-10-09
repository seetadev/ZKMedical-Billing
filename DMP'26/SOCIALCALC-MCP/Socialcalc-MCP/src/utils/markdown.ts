import { Sheet } from "../models/sheet.js";
import { formatCoordinate } from "./coordinate.js";

/**
 * Converts a sheet or range of cells into a Markdown table.
 */
export function sheetToMarkdownTable(
  sheet: Sheet,
  startRow: number,
  endRow: number,
  startColIdx: number,
  endColIdx: number
): string {
  // Guard for empty bounds
  if (startRow > endRow || startColIdx > endColIdx) return "";

  const headers: string[] = ["Row"];
  for (let c = startColIdx; c <= endColIdx; c++) {
    // Column header e.g. Column B
    headers.push(sheet.colWidths.has(formatCoordinate(c, startRow).replace(/[0-9]/g, ""))
      ? `${formatCoordinate(c, startRow).replace(/[0-9]/g, "")}`
      : `${formatCoordinate(c, startRow).replace(/[0-9]/g, "")}`
    );
  }

  const separator = headers.map(() => "---").join(" | ");
  const rows: string[] = [headers.join(" | "), separator];

  for (let r = startRow; r <= endRow; r++) {
    const rowCells: string[] = [`**${r}**`];
    for (let c = startColIdx; c <= endColIdx; c++) {
      const coord = formatCoordinate(c, r);
      const cell = sheet.getCell(coord);
      let valStr = "";
      
      if (cell) {
        if (cell.formula !== undefined) {
          // If formula exists, print calculated numeric value or formula text
          valStr = cell.val !== undefined 
            ? `${cell.val} (=${cell.formula})` 
            : `=${cell.formula}`;
        } else if (cell.val !== undefined) {
          valStr = cell.val.toString();
        } else if (cell.text !== undefined) {
          valStr = cell.text;
        }
      }
      // Escape pipe character in content to not break markdown tables
      rowCells.push(valStr.replace(/\|/g, "\\|"));
    }
    rows.push(rowCells.join(" | "));
  }

  return rows.join("\n");
}
