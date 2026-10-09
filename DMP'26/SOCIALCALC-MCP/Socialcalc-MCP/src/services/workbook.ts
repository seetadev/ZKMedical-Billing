import * as fs from "fs/promises";
import * as path from "path";
import { Workbook } from "../models/workbook.js";
import { parseWorkbook } from "../adapters/socialcalc/parser.js";
import { serializeWorkbookJson, serializeSheetSaveStr } from "../adapters/socialcalc/serializer.js";
import SocialCalcValidator from "../utils/validator.js";

/**
 * Service to manage Workbook lifecycle, file I/O, and sheet operations.
 */
export class WorkbookService {
  /**
   * Loads a workbook from an MSC file on disk.
   */
  static async loadWorkbook(filePath: string): Promise<Workbook> {
    try {
      const absolutePath = path.resolve(filePath);
      const data = await fs.readFile(absolutePath, "utf-8");
      return parseWorkbook(data);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // File doesn't exist, return a fresh empty workbook
        const workbook = new Workbook();
        workbook.addSheet("sheet1", "sheet1");
        return workbook;
      }
      throw new Error(`Failed to load workbook at ${filePath}: ${error.message}`);
    }
  }

  /**
   * Validates all sheet strings in a workbook. Throws detailed validation errors on failure.
   */
  static validateWorkbook(workbook: Workbook): void {
    const validator = new SocialCalcValidator({
      enableSyntaxLevel: true,
      enableSemanticLevel: true,
      enableLogicLevel: true,
      strictMode: false,
    });

    for (const [id, sheet] of workbook.sheets.entries()) {
      // Don't validate entirely empty sheets (they are trivial and default)
      if (sheet.cells.size === 0 && sheet.maxCol === 0 && sheet.maxRow === 0) {
        continue;
      }

      const savestr = serializeSheetSaveStr(sheet);
      const result = validator.validate(savestr);

      if (!result.valid || result.errorCount > 0) {
        const errorDetails = result.errors
          .map((e: any) => `  - Line ${e.line} [${e.level}]: ${e.message}`)
          .join("\n");
        throw new Error(
          `SocialCalc syntax validation failed for sheet '${sheet.name}' (ID: ${id}):\n${errorDetails}`
        );
      }
    }
  }

  /**
   * Saves a workbook as an MSC JSON file to disk.
   * Runs the validator first to prevent writing any invalid save strings.
   */
  static async saveWorkbook(workbook: Workbook, filePath: string): Promise<void> {
    // 1. Run strict validation first
    WorkbookService.validateWorkbook(workbook);

    // 2. Save only if validation passes
    try {
      const absolutePath = path.resolve(filePath);
      // Ensure target directory exists
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      const serialized = serializeWorkbookJson(workbook);
      await fs.writeFile(absolutePath, serialized, "utf-8");
    } catch (error: any) {
      throw new Error(`Failed to save workbook to ${filePath}: ${error.message}`);
    }
  }

  /**
   * Creates a new in-memory Workbook with a default sheet.
   */
  static createWorkbook(): Workbook {
    const workbook = new Workbook();
    workbook.addSheet("sheet1", "sheet1");
    return workbook;
  }
}
