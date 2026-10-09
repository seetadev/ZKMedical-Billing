import { Sheet } from "../models/sheet.js";
import { Cell } from "../models/cell.js";
import {
  parseCoordinate,
  formatCoordinate,
  parseRange,
  colIndexToLetter,
  colLetterToIndex,
} from "../utils/coordinate.js";

/**
 * Service to manipulate sheet data.
 */
export class SheetService {
  /**
   * Sets the value of a cell. Detects formulas if starting with '='.
   */
  static setCellValue(sheet: Sheet, coord: string, input: string | number | null): Cell {
    const uppercaseCoord = coord.toUpperCase();
    const cell = sheet.getCell(uppercaseCoord, true)!;

    // Track grid size boundaries
    const parsed = parseCoordinate(uppercaseCoord);
    if (parsed.colIndex > sheet.maxCol) sheet.maxCol = parsed.colIndex;
    if (parsed.row > sheet.maxRow) sheet.maxRow = parsed.row;

    if (input === null || input === "") {
      sheet.deleteCell(uppercaseCoord);
      return cell;
    }

    if (typeof input === "string" && input.startsWith("=")) {
      // It's a formula
      cell.formula = input.substring(1);
      cell.valuetype = "n"; // Default formula type to numeric
      cell.val = undefined;
      cell.text = undefined;
    } else if (typeof input === "number") {
      cell.val = input;
      cell.text = undefined;
      cell.formula = undefined;
      cell.valuetype = undefined;
    } else {
      // It's text/string
      // Check if it represents a number
      const numVal = Number(input);
      if (!isNaN(numVal) && input.trim() !== "") {
        cell.val = numVal;
        cell.text = undefined;
      } else {
        cell.text = input;
        cell.val = undefined;
      }
      cell.formula = undefined;
      cell.valuetype = undefined;
    }

    return cell;
  }

  /**
   * Clears a cell value and styles.
   */
  static clearCell(sheet: Sheet, coord: string): void {
    sheet.deleteCell(coord);
  }

  /**
   * Retrieves all cells falling in a range (e.g. "A1:C10").
   */
  static getRangeCells(sheet: Sheet, rangeStr: string): { coord: string; cell: Cell }[] {
    const range = parseRange(rangeStr);
    const results: { coord: string; cell: Cell }[] = [];

    for (let r = range.startRow; r <= range.endRow; r++) {
      for (let c = range.startColIndex; c <= range.endColIndex; c++) {
        const coord = formatCoordinate(c, r);
        const cell = sheet.getCell(coord, true)!;
        results.push({ coord, cell });
      }
    }

    return results;
  }

  /**
   * Inserts a row at target index, shifting subsequent cells down.
   */
  static insertRow(sheet: Sheet, afterRowIndex: number): void {
    const cellsToShift: { key: string; cell: Cell }[] = [];
    
    // 1. Gather all cells to shift
    for (const [key, cell] of sheet.cells.entries()) {
      const parsed = parseCoordinate(key);
      if (parsed.row > afterRowIndex) {
        cellsToShift.push({ key, cell });
      }
    }

    // Sort descending by row to prevent overwrite collisions during move
    cellsToShift.sort((a, b) => {
      const rowA = parseCoordinate(a.key).row;
      const rowB = parseCoordinate(b.key).row;
      return rowB - rowA;
    });

    // 2. Move cells
    for (const item of cellsToShift) {
      const parsed = parseCoordinate(item.key);
      const newCoord = formatCoordinate(parsed.colIndex, parsed.row + 1);
      
      sheet.deleteCell(item.key);
      item.cell.coord = newCoord;
      sheet.setCell(item.cell);
    }

    // 3. Move row heights mapping
    const newHeights = new Map<number, number>();
    for (const [rowNum, height] of sheet.rowHeights.entries()) {
      if (rowNum > afterRowIndex) {
        newHeights.set(rowNum + 1, height);
      } else {
        newHeights.set(rowNum, height);
      }
    }
    sheet.rowHeights = newHeights;

    sheet.maxRow += 1;
  }

  /**
   * Deletes a row at target index, shifting subsequent cells up.
   */
  static deleteRow(sheet: Sheet, rowIndex: number): void {
    const cellsToShift: { key: string; cell: Cell }[] = [];

    // 1. Delete target row cells and gather shift candidates
    for (const [key, cell] of sheet.cells.entries()) {
      const parsed = parseCoordinate(key);
      if (parsed.row === rowIndex) {
        sheet.deleteCell(key);
      } else if (parsed.row > rowIndex) {
        cellsToShift.push({ key, cell });
      }
    }

    // Sort ascending by row for shifting up
    cellsToShift.sort((a, b) => {
      const rowA = parseCoordinate(a.key).row;
      const rowB = parseCoordinate(b.key).row;
      return rowA - rowB;
    });

    // 2. Move cells
    for (const item of cellsToShift) {
      const parsed = parseCoordinate(item.key);
      const newCoord = formatCoordinate(parsed.colIndex, parsed.row - 1);
      
      sheet.deleteCell(item.key);
      item.cell.coord = newCoord;
      sheet.setCell(item.cell);
    }

    // 3. Move row heights mapping
    const newHeights = new Map<number, number>();
    for (const [rowNum, height] of sheet.rowHeights.entries()) {
      if (rowNum > rowIndex) {
        newHeights.set(rowNum - 1, height);
      } else if (rowNum < rowIndex) {
        newHeights.set(rowNum, height);
      }
    }
    sheet.rowHeights = newHeights;

    if (sheet.maxRow > 0) sheet.maxRow -= 1;
  }

  /**
   * Inserts a column at target index, shifting subsequent cells right.
   */
  static insertCol(sheet: Sheet, afterColLetter: string): void {
    const afterColIndex = colLetterToIndex(afterColLetter);
    const cellsToShift: { key: string; cell: Cell }[] = [];

    for (const [key, cell] of sheet.cells.entries()) {
      const parsed = parseCoordinate(key);
      if (parsed.colIndex > afterColIndex) {
        cellsToShift.push({ key, cell });
      }
    }

    // Sort descending by column index to prevent overwrite collisions
    cellsToShift.sort((a, b) => {
      const colA = parseCoordinate(a.key).colIndex;
      const colB = parseCoordinate(b.key).colIndex;
      return colB - colA;
    });

    for (const item of cellsToShift) {
      const parsed = parseCoordinate(item.key);
      const newCoord = formatCoordinate(parsed.colIndex + 1, parsed.row);
      
      sheet.deleteCell(item.key);
      item.cell.coord = newCoord;
      sheet.setCell(item.cell);
    }

    // Move column widths
    const newWidths = new Map<string, number>();
    for (const [col, width] of sheet.colWidths.entries()) {
      const colIdx = colLetterToIndex(col);
      if (colIdx > afterColIndex) {
        newWidths.set(colIndexToLetter(colIdx + 1), width);
      } else {
        newWidths.set(col, width);
      }
    }
    sheet.colWidths = newWidths;

    sheet.maxCol += 1;
  }

  /**
   * Deletes a column at target index, shifting subsequent cells left.
   */
  static deleteCol(sheet: Sheet, colLetter: string): void {
    const colIndex = colLetterToIndex(colLetter);
    const cellsToShift: { key: string; cell: Cell }[] = [];

    for (const [key, cell] of sheet.cells.entries()) {
      const parsed = parseCoordinate(key);
      if (parsed.colIndex === colIndex) {
        sheet.deleteCell(key);
      } else if (parsed.colIndex > colIndex) {
        cellsToShift.push({ key, cell });
      }
    }

    // Sort ascending by column index
    cellsToShift.sort((a, b) => {
      const colA = parseCoordinate(a.key).colIndex;
      const colB = parseCoordinate(b.key).colIndex;
      return colA - colB;
    });

    for (const item of cellsToShift) {
      const parsed = parseCoordinate(item.key);
      const newCoord = formatCoordinate(parsed.colIndex - 1, parsed.row);
      
      sheet.deleteCell(item.key);
      item.cell.coord = newCoord;
      sheet.setCell(item.cell);
    }

    // Move column widths
    const newWidths = new Map<string, number>();
    for (const [col, width] of sheet.colWidths.entries()) {
      const colIdx = colLetterToIndex(col);
      if (colIdx > colIndex) {
        newWidths.set(colIndexToLetter(colIdx - 1), width);
      } else if (colIdx < colIndex) {
        newWidths.set(col, width);
      }
    }
    sheet.colWidths = newWidths;

    if (sheet.maxCol > 0) sheet.maxCol -= 1;
  }
}
