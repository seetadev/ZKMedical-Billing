import { Sheet } from "../../models/sheet.js";
import { Workbook } from "../../models/workbook.js";

/**
 * Placeholder stub for Excel XLSX exporting.
 * To implement, install 'exceljs' or 'xlsx' packages and parse/write binary streams here.
 */
export async function workbookToXlsx(_workbook: Workbook): Promise<Buffer> {
  throw new Error("XLSX export is not implemented. Install 'exceljs' or 'xlsx' to enable Excel interoperability.");
}

/**
 * Placeholder stub for Excel XLSX importing.
 */
export async function xlsxToWorkbook(_buffer: Buffer): Promise<Workbook> {
  throw new Error("XLSX import is not implemented. Install 'exceljs' or 'xlsx' to enable Excel interoperability.");
}
