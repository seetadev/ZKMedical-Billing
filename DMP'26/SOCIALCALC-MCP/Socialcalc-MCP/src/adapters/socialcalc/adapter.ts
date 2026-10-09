import { Workbook } from "../../models/workbook.js";
import { Sheet } from "../../models/sheet.js";
import { Cell } from "../../models/cell.js";
import { WorkbookService } from "../../services/workbook.js";
import { SheetService } from "../../services/sheet.js";
import { StyleService } from "../../services/styles.js";
import { parseRange, formatCoordinate } from "../../utils/coordinate.js";

export interface FormatStyle {
  font?: string;
  textColor?: string;
  bgColor?: string;
  border?: string;
  align?: "left" | "center" | "right";
  layout?: string;
  valueFormat?: string;
  textValueFormat?: string;
}

/**
 * Adapter implementing Step 5 of the architectural guidance.
 * Standardizes SocialCalc interactions.
 */
export class SocialCalcAdapter {
  /**
   * Opens/loads a workbook from path.
   */
  async openWorkbook(path: string): Promise<Workbook> {
    return await WorkbookService.loadWorkbook(path);
  }

  /**
   * Saves a workbook back to path.
   */
  async saveWorkbook(workbook: Workbook, path: string): Promise<void> {
    await WorkbookService.saveWorkbook(workbook, path);
  }

  /**
   * Reads a coordinate range and returns cells.
   */
  readRange(sheet: Sheet, rangeStr: string): { coord: string; cell: Cell }[] {
    return SheetService.getRangeCells(sheet, rangeStr);
  }

  /**
   * Writes a grid (2D array) of values starting at the top-left of the range.
   */
  writeRange(sheet: Sheet, rangeStr: string, data: (string | number | null)[][]): void {
    const range = parseRange(rangeStr);
    
    // If it's a single cell, expand the bounds to match the data dimensions
    const isSingleCell = (range.startRow === range.endRow && range.startColIndex === range.endColIndex);
    const endRow = isSingleCell ? (range.startRow + data.length - 1) : range.endRow;
    const maxCols = data.reduce((max, row) => Math.max(max, row.length), 0);
    const endColIndex = isSingleCell ? (range.startColIndex + maxCols - 1) : range.endColIndex;

    for (let rOffset = 0; rOffset < data.length; rOffset++) {
      const rowData = data[rOffset];
      const r = range.startRow + rOffset;
      if (r > endRow) break;

      for (let cOffset = 0; cOffset < rowData.length; cOffset++) {
        const val = rowData[cOffset];
        const cIdx = range.startColIndex + cOffset;
        if (cIdx > endColIndex) break;

        const coord = formatCoordinate(cIdx, r);
        SheetService.setCellValue(sheet, coord, val);
      }
    }
  }

  /**
   * Creates a new sheet in the workbook.
   */
  createSheet(workbook: Workbook, name: string): Sheet {
    // Generate new sheet ID
    const nextNum = workbook.sheets.size + 1;
    const sheetId = `sheet${nextNum}`;
    return workbook.addSheet(sheetId, name);
  }

  /**
   * Deletes a sheet from the workbook by name.
   */
  deleteSheet(workbook: Workbook, name: string): boolean {
    const sheet = workbook.getSheetByName(name);
    if (!sheet) return false;
    
    // Find ID from metadata
    for (const meta of workbook.getSheetsMetadata()) {
      if (meta.name === name) {
        return workbook.removeSheet(meta.id);
      }
    }
    return false;
  }

  /**
   * Renames a sheet in the workbook.
   */
  renameSheet(workbook: Workbook, oldName: string, newName: string): boolean {
    const sheet = workbook.getSheetByName(oldName);
    if (!sheet) return false;

    for (const [id, meta] of workbook.sheetMeta.entries()) {
      if (meta.name === oldName) {
        meta.name = newName;
        sheet.name = newName;
        // If it was the active sheet, update workbook currentName
        if (workbook.currentId === id) {
          workbook.currentName = newName;
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Inserts row(s) after target index.
   */
  insertRows(sheet: Sheet, afterRow: number, numRows: number = 1): void {
    for (let i = 0; i < numRows; i++) {
      // Loop backwards or repeatedly insert at the same index
      SheetService.insertRow(sheet, afterRow);
    }
  }

  /**
   * Deletes row(s) starting from target index.
   */
  deleteRows(sheet: Sheet, startRow: number, numRows: number = 1): void {
    for (let i = 0; i < numRows; i++) {
      // Continuously delete the row at startRow (since rows shift up)
      SheetService.deleteRow(sheet, startRow);
    }
  }

  /**
   * Writes a formula to a cell.
   */
  setFormula(sheet: Sheet, cellCoord: string, formula: string): void {
    const formulaVal = formula.startsWith("=") ? formula : `=${formula}`;
    SheetService.setCellValue(sheet, cellCoord, formulaVal);
  }

  /**
   * Applies cell formatting styles to a range.
   */
  applyStyle(sheet: Sheet, rangeStr: string, style: FormatStyle): void {
    const rangeCells = SheetService.getRangeCells(sheet, rangeStr);

    let fontIdx: number | undefined;
    if (style.font) fontIdx = StyleService.registerFont(sheet, style.font);

    let textColIdx: number | undefined;
    if (style.textColor) textColIdx = StyleService.registerColor(sheet, style.textColor);

    let bgColIdx: number | undefined;
    if (style.bgColor) bgColIdx = StyleService.registerColor(sheet, style.bgColor);

    let borderIdx: number | undefined;
    if (style.border) borderIdx = StyleService.registerBorder(sheet, style.border);

    let cellFormatIdx: number | undefined;
    if (style.align) cellFormatIdx = StyleService.registerCellFormat(sheet, style.align);

    let layoutIdx: number | undefined;
    if (style.layout) layoutIdx = StyleService.registerLayout(sheet, style.layout);

    let valueFormatIdx: number | undefined;
    if (style.valueFormat) valueFormatIdx = StyleService.registerValueFormat(sheet, style.valueFormat);

    let textValueFormatIdx: number | undefined;
    if (style.textValueFormat) textValueFormatIdx = StyleService.registerValueFormat(sheet, style.textValueFormat);

    for (const { cell } of rangeCells) {
      if (fontIdx !== undefined) cell.fontIndex = fontIdx;
      if (textColIdx !== undefined) cell.textColorIndex = textColIdx;
      if (bgColIdx !== undefined) cell.bgColorIndex = bgColIdx;
      if (cellFormatIdx !== undefined) cell.cellFormatIndex = cellFormatIdx;
      if (layoutIdx !== undefined) cell.layoutIndex = layoutIdx;
      if (valueFormatIdx !== undefined) cell.nonTextValueFormatIndex = valueFormatIdx;
      if (textValueFormatIdx !== undefined) cell.textValueFormatIndex = textValueFormatIdx;
      if (borderIdx !== undefined) {
        cell.borders = {
          top: borderIdx,
          right: borderIdx,
          bottom: borderIdx,
          left: borderIdx,
        };
      }
    }
  }
}
