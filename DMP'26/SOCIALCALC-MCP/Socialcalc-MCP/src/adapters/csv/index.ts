import { Sheet } from "../../models/sheet.js";
import { formatCoordinate, colIndexToLetter } from "../../utils/coordinate.js";

/**
 * Converts a Sheet model into a standard CSV string.
 */
export function sheetToCsv(sheet: Sheet): string {
  const maxRow = sheet.maxRow || 1;
  const maxCol = sheet.maxCol || 1;
  const lines: string[] = [];

  for (let r = 1; r <= maxRow; r++) {
    const rowValues: string[] = [];
    for (let c = 1; c <= maxCol; c++) {
      const coord = formatCoordinate(c, r);
      const cell = sheet.getCell(coord);
      let cellText = "";
      if (cell) {
        if (cell.val !== undefined) {
          cellText = cell.val.toString();
        } else if (cell.text !== undefined) {
          cellText = cell.text;
        }
      }
      
      // Escape for CSV (contains comma, quotes, or newlines)
      if (cellText.includes(",") || cellText.includes('"') || cellText.includes("\n") || cellText.includes("\r")) {
        cellText = `"${cellText.replace(/"/g, '""')}"`;
      }
      rowValues.push(cellText);
    }
    lines.push(rowValues.join(","));
  }

  return lines.join("\n");
}

/**
 * Parses CSV content into a Sheet model.
 */
export function csvToSheet(sheet: Sheet, csvContent: string): void {
  sheet.clear();
  const lines = csvContent.split(/\r?\n/);
  
  let maxR = 0;
  let maxC = 0;

  for (let rIndex = 0; rIndex < lines.length; rIndex++) {
    const line = lines[rIndex];
    if (!line && rIndex === lines.length - 1) continue; // skip trailing newline

    const cells: string[] = [];
    let currentCell = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          currentCell += '"'; // escaped quote
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        cells.push(currentCell);
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell);

    const rNum = rIndex + 1;
    if (rNum > maxR) maxR = rNum;
    
    for (let cIndex = 0; cIndex < cells.length; cIndex++) {
      const valStr = cells[cIndex];
      if (valStr === undefined || valStr === "") continue;

      const cNum = cIndex + 1;
      if (cNum > maxC) maxC = cNum;

      const colLetter = colIndexToLetter(cNum);
      const coord = `${colLetter}${rNum}`;
      const cell = sheet.getCell(coord, true)!;

      const numVal = Number(valStr);
      if (!isNaN(numVal) && valStr.trim() !== "") {
        cell.val = numVal;
      } else {
        cell.text = valStr;
      }
    }
  }

  sheet.maxRow = maxR;
  sheet.maxCol = maxC;
}
