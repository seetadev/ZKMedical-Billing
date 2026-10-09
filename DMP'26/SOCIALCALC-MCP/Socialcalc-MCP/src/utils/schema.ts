import { z } from "zod";

// --- Style Schemas ---
export const formatStyleSchema = z.object({
  font: z.string().optional().describe("Font: '<style> <weight> <size> <family>' e.g. 'normal bold 10pt Arial'. All 4 parts required."),
  textColor: z.string().optional().describe("Text color, e.g. 'rgb(0,0,0)' or '#ff0000'."),
  bgColor: z.string().optional().describe("Background color, e.g. 'rgb(240,250,240)'."),
  border: z.string().optional().describe("Border setting, e.g. '1px solid rgb(0,0,0)'."),
  align: z.enum(["left", "center", "right"]).optional().describe("Horizontal text alignment."),
  layout: z.string().optional().describe("Layout/padding, e.g. 'padding:10px * * *;vertical-align:top;'."),
  valueFormat: z.string().optional().describe("Value format pattern, e.g. '$#,##0.00', '#,##0', '0.00%', 'mm/dd/yyyy'."),
  textValueFormat: z.string().optional().describe("Text value format, e.g. 'text-plain', 'text-html', 'text-wiki'."),
});

// --- Discovery Schemas ---
export const listWorkbooksSchema = z.object({
  directoryPath: z.string().optional().describe("The directory path to search. Defaults to './data'."),
});

export const listSheetsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
});

export const describeSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The sheet to describe. Defaults to active sheet."),
});

export const summarizeSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The sheet to summarize. Defaults to active sheet."),
});

// --- Reading Schemas ---
export const readRangeSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  range: z.string().describe("The range coordinate to read (e.g. 'A1:C10')."),
});

export const readRowsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  startRow: z.number().int().positive().describe("Starting row index (1-based)."),
  endRow: z.number().int().positive().describe("Ending row index (1-based)."),
});

export const readColumnsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  startCol: z.string().describe("Starting column letter (e.g., 'A')."),
  endCol: z.string().describe("Ending column letter (e.g., 'C')."),
});

export const findCellsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  query: z.string().describe("Search string query to locate cells."),
});

// --- Editing Schemas ---
export const writeRangeSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  range: z.string().describe("Start cell range (e.g. 'A1' or 'A1:B2')."),
  data: z.array(z.array(z.union([z.string(), z.number()]).nullable())).describe("2D array representing rows and column values to write."),
});

export const appendRowsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  data: z.array(z.array(z.union([z.string(), z.number()]).nullable())).describe("2D array of rows to append."),
});

export const createSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().describe("Name of the new sheet to create."),
});

export const deleteSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().describe("Name of the sheet to delete."),
});

export const renameSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  oldName: z.string().describe("Current name of the sheet."),
  newName: z.string().describe("New name of the sheet."),
});

export const setFormulaSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  cell: z.string().describe("Cell coordinate (e.g. 'C7')."),
  formula: z.string().describe("Formula body without leading '=' (e.g. 'SUM(C5:C6)'). Colons in ranges are auto-escaped."),
});

export const setValueSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  cell: z.string().describe("Cell coordinate (e.g. 'A1')."),
  value: z.union([z.string(), z.number()]).describe("The value to set."),
  valueType: z.enum(["text", "number", "date", "currency", "percentage"]).optional().describe("Value type hint. Defaults to auto-detect."),
});

export const writeSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet to update. Defaults to the active sheet."),
  operations: z.array(
    z.object({
      cell: z.string().describe("The cell coordinate to update (e.g. 'A1')."),
      value: z.union([z.string(), z.number()]).nullish().describe("The value (string or number) to set."),
      formula: z.string().optional().describe("The formula to write (e.g. 'SUM(A1:B2)')."),
    })
  ).min(1).describe("A list of cell operations to execute."),
});

export const querySheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet to query."),
  query: z.string().describe("Query parameter to filter or aggregate columns, e.g., 'SELECT A, B WHERE C > 100 ORDER BY B DESC'."),
});

// --- Cell Operations Schemas ---
export const eraseRangeSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  range: z.string().describe("Range to erase (e.g. 'A1:C10')."),
  mode: z.enum(["all", "formulas", "formats"]).optional().describe("What to erase: 'all' (default), 'formulas' (content only), 'formats' (styling only)."),
});

export const insertRowsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  atRow: z.number().int().positive().describe("Row number where new rows will be inserted (existing rows shift down)."),
  count: z.number().int().positive().optional().describe("Number of rows to insert. Defaults to 1."),
});

export const insertColumnsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  atColumn: z.string().describe("Column letter where new columns will be inserted (e.g. 'C'). Existing columns shift right."),
  count: z.number().int().positive().optional().describe("Number of columns to insert. Defaults to 1."),
});

export const deleteRowsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  startRow: z.number().int().positive().describe("First row to delete."),
  endRow: z.number().int().positive().optional().describe("Last row to delete. Defaults to startRow."),
});

export const deleteColumnsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  startColumn: z.string().describe("First column letter to delete (e.g. 'B')."),
  endColumn: z.string().optional().describe("Last column letter to delete. Defaults to startColumn."),
});

export const unmergeCellsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  cell: z.string().describe("Top-left cell of the merged region to unmerge (e.g. 'A1')."),
});

export const resizeRowsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  row: z.number().int().positive().describe("Row number to resize."),
  height: z.number().positive().describe("Height value in pixels."),
});

// --- Formatting Schemas ---
export const formatCellsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  range: z.string().describe("Range of cells to format."),
  style: formatStyleSchema.describe("Style parameters to apply."),
});

export const mergeCellsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  range: z.string().describe("Cell range to merge (e.g. 'A1:B3')."),
});

export const resizeColumnsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  column: z.string().describe("Column letter to resize (e.g. 'A')."),
  width: z.number().positive().describe("Width value in pixels."),
});

export const freezeRowsSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  rowCount: z.number().int().nonnegative().describe("Number of rows to freeze/lock."),
});

export const applyThemeSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  themeName: z.enum(["classic", "modern", "dark", "teal", "salmon"]).describe("Theme name to apply."),
});

// --- Analysis Schemas ---
export const analyzeSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet."),
});

export const detectHeadersSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet."),
});

export const findDuplicatesSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet."),
});

export const cleanDatasetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet."),
});

// --- Utility Schemas ---
export const sortRangeSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  range: z.string().describe("Range to sort (e.g. 'A2:D20')."),
  sortBy: z.string().describe("Column letter to sort by (e.g. 'B')."),
  direction: z.enum(["up", "down"]).optional().describe("Sort direction. 'up' = ascending (default), 'down' = descending."),
});

export const setCellCommentSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The name of the sheet. Defaults to active sheet."),
  cell: z.string().describe("Cell coordinate (e.g. 'A1')."),
  comment: z.string().describe("Comment text. Pass empty string to remove."),
});

export const validateSheetSchema = z.object({
  workbookPath: z.string().describe("The file path to the workbook."),
  sheetName: z.string().optional().describe("The sheet to validate. Defaults to active sheet."),
});

export const getSyntaxReferenceSchema = z.object({});

// --- Generation/Advanced Schemas ---
export const createWorkbookSchema = z.object({
  workbookPath: z.string().describe("File path for the new workbook."),
  sheets: z.array(z.object({
    name: z.string().describe("Sheet name."),
    hidden: z.boolean().optional().describe("Whether sheet should be hidden."),
  })).min(1).describe("List of sheets to create in the workbook."),
});

export const writeRawMscSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sheetName: z.string().describe("Target sheet name (created if not exists)."),
  mscCode: z.string().describe("Raw MSC save-string code for the sheet. Must follow SocialCalc syntax (version:1.5, cell lines, sheet line, definition lines). Colons in formulas must be escaped as \\c."),
});

export const readRawMscSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sheetName: z.string().optional().describe("Sheet to read. Defaults to active sheet."),
});

export const copySheetSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sourceSheet: z.string().describe("Name of the sheet to copy."),
  newName: z.string().describe("Name for the new copy."),
});

export const setNamedRangeSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sheetName: z.string().optional().describe("Sheet name. Defaults to active sheet."),
  name: z.string().describe("Named range identifier (will be uppercased)."),
  value: z.string().describe("Cell reference (B5), range (A1:B7), or formula (=SUM(A1:A10)). Empty string removes the range."),
  description: z.string().optional().describe("Optional description for the named range."),
});

export const setSheetVisibilitySchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sheetName: z.string().describe("Sheet name to show/hide."),
  hidden: z.boolean().describe("true to hide, false to show."),
});

export const validateWorkbookSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook to validate."),
});

export const batchFormatCellsSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sheetName: z.string().optional().describe("Sheet name. Defaults to active sheet."),
  formats: z.array(z.object({
    range: z.string().describe("Cell range to format."),
    style: formatStyleSchema.describe("Styles to apply to this range."),
  })).min(1).describe("List of range+style operations to apply."),
});

export const freezeColumnsSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sheetName: z.string().optional().describe("Sheet name. Defaults to active sheet."),
  colCount: z.number().int().nonnegative().describe("Number of columns to freeze from the left."),
});

export const batchResizeColumnsSchema = z.object({
  workbookPath: z.string().describe("File path to the workbook."),
  sheetName: z.string().optional().describe("Sheet name. Defaults to active sheet."),
  columns: z.array(z.object({
    column: z.string().describe("Column letter (e.g. 'A')."),
    width: z.number().positive().describe("Width in pixels."),
  })).min(1).describe("Columns and their new widths."),
});
