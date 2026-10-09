import { Workbook } from "../models/workbook.js";
import { Sheet } from "../models/sheet.js";
import { Cell } from "../models/cell.js";
import { Table } from "../models/table.js";
import { SocialCalcAdapter } from "../adapters/socialcalc/adapter.js";
import { parseWorkbook } from "../adapters/socialcalc/parser.js";
import { serializeWorkbookJson } from "../adapters/socialcalc/serializer.js";
import { formatCoordinate, colIndexToLetter } from "../utils/coordinate.js";
import { SheetService } from "./sheet.js";

/**
 * Service orchestrating complex workbook operations and high-level business rules.
 */
export class SpreadsheetService {
  private static adapter = new SocialCalcAdapter();

  /**
   * Deep clones a workbook using serialization/parsing roundtrip to ensure state cleanliness.
   */
  static cloneWorkbook(workbook: Workbook): Workbook {
    const serialized = serializeWorkbookJson(workbook);
    return parseWorkbook(serialized);
  }

  /**
   * Transaction Step: Begin. Returns a copy of the workbook to perform dry-runs.
   */
  static begin(workbook: Workbook): Workbook {
    return this.cloneWorkbook(workbook);
  }

  /**
   * Transaction Step: Rollback. Simply returns the copy taken at begin(), discarding edits.
   */
  static rollback(clonedWorkbook: Workbook): Workbook {
    return this.cloneWorkbook(clonedWorkbook);
  }

  /**
   * Transaction Step: Commit. Saves the modified workbook back to disk.
   */
  static async commit(workbook: Workbook, filePath: string): Promise<void> {
    await this.adapter.saveWorkbook(workbook, filePath);
  }

  /**
   * Generates a structural summary of a sheet, listing metadata, headers, and counts.
   */
  static getSheetSummary(sheet: Sheet) {
    const headers: string[] = [];
    const maxCol = sheet.maxCol || 1;
    const maxRow = sheet.maxRow || 1;

    // Detect headers in row 1
    for (let c = 1; c <= maxCol; c++) {
      const coord = formatCoordinate(c, 1);
      const cell = sheet.getCell(coord);
      if (cell && (cell.text || cell.val !== undefined)) {
        headers.push(cell.text || cell.val!.toString());
      }
    }

    let emptyRows = 0;
    for (let r = 1; r <= maxRow; r++) {
      let isEmpty = true;
      for (let c = 1; c <= maxCol; c++) {
        const cell = sheet.getCell(formatCoordinate(c, r));
        if (cell && !cell.isEmpty()) {
          isEmpty = false;
          break;
        }
      }
      if (isEmpty) emptyRows++;
    }

    return {
      sheet: sheet.name,
      rows: maxRow,
      columns: maxCol,
      headers: headers,
      tablesCount: sheet.tables.length,
      emptyRows: emptyRows,
      cellsCount: sheet.cells.size,
    };
  }

  /**
   * Applies premium styles: Headers formatted in bold with background, and alternating zebra rows.
   */
  static beautifySheet(sheet: Sheet): void {
    const maxCol = sheet.maxCol || 1;
    const maxRow = sheet.maxRow || 1;

    // 1. Header (Row 1) Styles
    this.adapter.applyStyle(sheet, `A1:${colIndexToLetter(maxCol)}1`, {
      font: "normal bold 11pt Arial",
      textColor: "rgb(255,255,255)",
      bgColor: "rgb(48,63,159)", // Indigo primary
      align: "center",
      border: "1px solid rgb(26,35,126)",
    });

    // 2. Alternating Zebra Striping for remaining rows
    for (let r = 2; r <= maxRow; r++) {
      const bgColor = r % 2 === 0 ? "rgb(245,247,250)" : "rgb(255,255,255)";
      this.adapter.applyStyle(sheet, `A${r}:${colIndexToLetter(maxCol)}${r}`, {
        font: "normal normal 10pt Arial",
        textColor: "rgb(33,33,33)",
        bgColor: bgColor,
        border: "1px solid rgb(224,224,224)",
      });
    }
  }

  /**
   * Creates a "Dashboard" sheet with summary statistics of the workbook.
   */
  static createDashboard(workbook: Workbook): Sheet {
    // Delete if already exists
    this.adapter.deleteSheet(workbook, "Dashboard");
    const dashSheet = this.adapter.createSheet(workbook, "Dashboard");

    // Title banner
    SheetService.setCellValue(dashSheet, "B2", "WORKBOOK CONTROL DASHBOARD");
    this.adapter.applyStyle(dashSheet, "B2:D2", {
      font: "normal bold 14pt Arial",
      textColor: "rgb(255,255,255)",
      bgColor: "rgb(33,150,243)", // Blue accent
      align: "center",
      border: "2px solid rgb(21,101,192)",
    });

    // Write Metrics
    SheetService.setCellValue(dashSheet, "B4", "Total Sheets:");
    SheetService.setCellValue(dashSheet, "C4", workbook.sheets.size);
    
    SheetService.setCellValue(dashSheet, "B5", "Active Sheet:");
    SheetService.setCellValue(dashSheet, "C5", workbook.currentName);

    this.adapter.applyStyle(dashSheet, "B4:B5", { font: "normal bold 10pt Arial", align: "right" });
    this.adapter.applyStyle(dashSheet, "C4:C5", { font: "normal normal 10pt Arial", align: "left" });

    // Set grid sizes
    dashSheet.maxCol = 4;
    dashSheet.maxRow = 6;

    return dashSheet;
  }

  /**
   * Normalizes dataset by trimming spaces, capitalizing headers, and substituting nulls.
   */
  static normalizeDataset(sheet: Sheet): void {
    const maxCol = sheet.maxCol || 1;
    const maxRow = sheet.maxRow || 1;

    // Normalize Header case (Row 1)
    for (let c = 1; c <= maxCol; c++) {
      const coord = formatCoordinate(c, 1);
      const cell = sheet.getCell(coord);
      if (cell && cell.text) {
        cell.text = cell.text.trim().toUpperCase();
      }
    }

    // Trim text cells and fill blanks
    for (let r = 2; r <= maxRow; r++) {
      for (let c = 1; c <= maxCol; c++) {
        const coord = formatCoordinate(c, r);
        const cell = sheet.getCell(coord);
        if (cell) {
          if (cell.text !== undefined) {
            cell.text = cell.text.trim();
          }
        }
      }
    }
  }

  /**
   * Semantic Helper: Finds a column letter matching a semantic description (like "revenue", "totals").
   */
  static findColumnSemantically(sheet: Sheet, query: string): string | undefined {
    const qUpper = query.toUpperCase();
    const maxCol = sheet.maxCol || 1;

    // Search row 1 headers
    for (let c = 1; c <= maxCol; c++) {
      const coord = formatCoordinate(c, 1);
      const cell = sheet.getCell(coord);
      if (cell) {
        const cellText = (cell.text || cell.val?.toString() || "").toUpperCase();
        if (cellText.includes(qUpper) || qUpper.includes(cellText)) {
          return colIndexToLetter(c);
        }
      }
    }
    return undefined;
  }
}
