import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { SocialCalcAdapter } from "./adapters/socialcalc/adapter.js";
import { sheetToMarkdownTable } from "./utils/markdown.js";
import { parseRange, colIndexToLetter, colLetterToIndex, formatCoordinate } from "./utils/coordinate.js";
import { StyleService } from "./services/styles.js";
import { SheetService } from "./services/sheet.js";
import { Workbook } from "./models/workbook.js";
import { serializeWorkbookJson } from "./adapters/socialcalc/serializer.js";
import { FORMULAS } from "./utils/formulas.js";
import { SpreadsheetService } from "./services/spreadsheetService.js";

const adapter = new SocialCalcAdapter();

// Helper to resolve sheet by number or name
function resolveSheet(workbook: any, args: any) {
  let sheet;
  if (args.sheetNumber !== undefined && args.sheetNumber !== null) {
    const meta = workbook.getSheetsMetadata();
    const idx = Number(args.sheetNumber) - 1;
    if (idx >= 0 && idx < meta.length) {
      sheet = workbook.getSheetById(meta[idx].id);
    }
  }
  if (!sheet && args.sheetName) {
    sheet = workbook.getSheetByName(args.sheetName);
  }
  if (!sheet) {
    sheet = workbook.getActiveSheet() || workbook.sheets.values().next().value;
  }
  return sheet;
}

// Helper to normalize format names to standard SocialCalc formats
function normalizeFormat(format: string): string {
  const normalized = format.trim().toLowerCase();
  switch (normalized) {
    case "html":
      return "text-html";
    case "plain text":
    case "text":
    case "plain":
      return "text-plain";
    case "wikitext":
    case "wiki":
      return "text-wiki";
    case "link":
      return "text-link";
    default:
      return format.trim();
  }
}

// Helper to update layout settings to match SocialCalc's layout regex strictly:
// /^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/
function parseAndFormatLayout(layoutStr: string, updates: { padding?: string; top?: string; right?: string; bottom?: string; left?: string; verticalAlign?: string }): string {
  let top = "*";
  let right = "*";
  let bottom = "*";
  let left = "*";
  let verticalAlign = "*";

  const layoutre = /^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);/;
  const match = layoutStr.match(layoutre);
  if (match) {
    top = match[1];
    right = match[2];
    bottom = match[3];
    left = match[4];
    verticalAlign = match[5];
  }

  if (updates.padding !== undefined) {
    const p = updates.padding.trim().split(/\s+/);
    if (p.length === 1) {
      const val = isNaN(Number(p[0])) ? p[0] : `${p[0]}px`;
      top = right = bottom = left = val;
    } else if (p.length === 2) {
      const v = isNaN(Number(p[0])) ? p[0] : `${p[0]}px`;
      const h = isNaN(Number(p[1])) ? p[1] : `${p[1]}px`;
      top = bottom = v;
      right = left = h;
    } else if (p.length === 4) {
      top = isNaN(Number(p[0])) ? p[0] : `${p[0]}px`;
      right = isNaN(Number(p[1])) ? p[1] : `${p[1]}px`;
      bottom = isNaN(Number(p[2])) ? p[2] : `${p[2]}px`;
      left = isNaN(Number(p[3])) ? p[3] : `${p[3]}px`;
    }
  }

  if (updates.top !== undefined) {
    top = isNaN(Number(updates.top)) ? updates.top : `${updates.top}px`;
  }
  if (updates.right !== undefined) {
    right = isNaN(Number(updates.right)) ? updates.right : `${updates.right}px`;
  }
  if (updates.bottom !== undefined) {
    bottom = isNaN(Number(updates.bottom)) ? updates.bottom : `${updates.bottom}px`;
  }
  if (updates.left !== undefined) {
    left = isNaN(Number(updates.left)) ? updates.left : `${updates.left}px`;
  }

  if (updates.verticalAlign !== undefined) {
    verticalAlign = updates.verticalAlign;
  }

  return `padding:${top} ${right} ${bottom} ${left};vertical-align:${verticalAlign};`;
}

// Helper to update font properties (style, weight, size, family)
function updateFontProperty(fontStr: string, updates: { style?: string; weight?: string; size?: string; family?: string }): string {
  const parts = fontStr.split(" ");
  let style = "normal";
  let weight = "normal";
  let size = "10pt";
  let family = "Arial";
  
  if (parts.length === 4) {
    style = parts[0];
    weight = parts[1];
    size = parts[2];
    family = parts.slice(3).join(" ");
  } else if (parts.length === 3) {
    style = parts[0];
    weight = parts[1];
    size = parts[2];
  }
  
  if (updates.style !== undefined) style = updates.style;
  if (updates.weight !== undefined) weight = updates.weight;
  if (updates.size !== undefined) {
    const num = Number(updates.size);
    size = isNaN(num) ? updates.size : `${num}pt`;
  }
  if (updates.family !== undefined) family = updates.family;
  
  return `${style} ${weight} ${size} ${family}`;
}

export class SocialcalcMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "socialcalc-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  getServerInstance(): Server {
    return this.server;
  }

  /**
   * Public method to list available tools. Exposes metadata schema.
   */
  public listTools() {
    return [
      {
        name: "list_workbooks",
        description: "Lists all available workbook files in a target directory (defaults to './data').",
        inputSchema: {
          type: "object",
          properties: {
            directoryPath: { type: "string", description: "Optional directory path to look in." }
          }
        }
      },
      {
        name: "list_sheets",
        description: "Lists all sheets inside a workbook file.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." }
          },
          required: ["workbookPath"]
        }
      },
      {
        name: "read_range",
        description: "Reads a coordinate range (e.g. 'A1:C10') from a sheet and returns it as a Markdown table.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Range of cells, e.g. A1:D5." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "write_range",
        description: "Writes a single value or a 2D array of data starting at a cell or range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target range or starting cell, e.g., A1." },
            value: { type: "string", description: "A single text or numeric value to write." },
            data: { 
              type: "array", 
              items: { type: "array", items: { type: "any" } },
              description: "A 2D array of grid values (alternative to single value)."
            }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "format_cells",
        description: "Applies styles like bold, text color, alignment, or background color to a cell range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell range, e.g., A1:C5." },
            bold: { type: "boolean", description: "Set font weight to bold." },
            textColor: { type: "string", description: "Color value (e.g., 'rgb(255,0,0)' or hex)." },
            bgColor: { type: "string", description: "Background color value." },
            align: { type: "string", enum: ["left", "center", "right"], description: "Text alignment." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "list_tool",
        description: "Lists all available tools registered on this MCP server.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "describe_tool",
        description: "Explains how to use a specific tool and describes its parameters.",
        inputSchema: {
          type: "object",
          properties: {
            toolName: { type: "string", description: "The name of the tool to describe." }
          },
          required: ["toolName"]
        }
      },
      {
        name: "delete_text",
        description: "Clears cell content values/formulas within a cell or range while keeping styles.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "set_cell_to_default",
        description: "Clears both content and styles for a cell or range, resetting to default.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "set_font_color",
        description: "Sets text color for a cell or cell range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            color: { type: "string", description: "Color string, e.g. 'rgb(255,0,0)' or hex '#ff0000'." }
          },
          required: ["workbookPath", "range", "color"]
        }
      },
      {
        name: "set_cell_bg",
        description: "Sets background color for a cell or cell range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            color: { type: "string", description: "Color string, e.g. 'rgb(240,240,240)' or hex." }
          },
          required: ["workbookPath", "range", "color"]
        }
      },
      {
        name: "set_border",
        description: "Sets all borders or individual borders (top, right, bottom, left) for a cell range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            border: { type: "string", description: "Shorthand for all borders, formatted as '<thickness> <style> <color>' (e.g. '1px solid rgb(0,0,0)' or '2px dashed #ff0000'). Available styles: solid, dashed, dotted, double, groove, ridge, inset, outset, none." },
            top: { type: "string", description: "Top border specification, formatted as '<thickness> <style> <color>'." },
            right: { type: "string", description: "Right border specification, formatted as '<thickness> <style> <color>'." },
            bottom: { type: "string", description: "Bottom border specification, formatted as '<thickness> <style> <color>'." },
            left: { type: "string", description: "Left border specification, formatted as '<thickness> <style> <color>'." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "set_padding",
        description: "Sets padding style for a cell or cell range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            padding: { type: "string", description: "Shorthand padding value, e.g. '6px' or '4px 8px'." },
            top: { type: "string", description: "Top padding value." },
            right: { type: "string", description: "Right padding value." },
            bottom: { type: "string", description: "Bottom padding value." },
            left: { type: "string", description: "Left padding value." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "set_alignment",
        description: "Sets horizontal and vertical alignments for a cell or range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            align: { type: "string", enum: ["left", "center", "right"], description: "Horizontal alignment." },
            verticalAlign: { type: "string", enum: ["top", "middle", "bottom"], description: "Vertical alignment." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "set_font_size",
        description: "Sets font size for a cell or range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            size: { type: "string", description: "Font size value, e.g. '12pt', '14px', or '11'." }
          },
          required: ["workbookPath", "range", "size"]
        }
      },
      {
        name: "set_font_family",
        description: "Sets font family for a cell or range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            family: { type: "string", description: "Font family, e.g. 'Courier New', 'Arial', 'Verdana'." }
          },
          required: ["workbookPath", "range", "family"]
        }
      },
      {
        name: "set_font_style",
        description: "Sets font style (italic, normal) and weight (bold) for a cell range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            style: { type: "string", enum: ["default", "normal", "italic", "bold", "bold italic"], description: "Font style." },
            bold: { type: "boolean", description: "Set font weight to bold." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "set_format",
        description: "Applies cell value formats (plain text, html, percentages, currency, etc.).",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates or range, e.g., A1:C5." },
            format: { type: "string", description: "Format definition (e.g. '0.00%', '$#,##0.00', 'Plain Text', 'HTML', 'Automatic')." }
          },
          required: ["workbookPath", "range", "format"]
        }
      },
      {
        name: "merge_cells",
        description: "Merges a cell range.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target range to merge, e.g., A1:C3." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "unmerge_cells",
        description: "Unmerges a previously merged cell.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            range: { type: "string", description: "Target cell coordinates to unmerge, e.g., A1." }
          },
          required: ["workbookPath", "range"]
        }
      },
      {
        name: "new_workbook",
        description: "Creates a new workbook file with a default sheet.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path where the new workbook file will be created." },
            sheetName: { type: "string", description: "Optional name of the default sheet (defaults to 'sheet1')." }
          },
          required: ["workbookPath"]
        }
      },
      {
        name: "insert_row",
        description: "Inserts empty row(s) before or after a target row.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            row: { type: "number", description: "Target row number (1-based)." },
            count: { type: "number", description: "Optional number of rows to insert (default 1)." },
            position: { type: "string", enum: ["before", "after"], description: "Optional position relative to the target row (default 'before')." }
          },
          required: ["workbookPath", "row"]
        }
      },
      {
        name: "insert_col",
        description: "Inserts empty column(s) before or after a target column.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            column: { type: "string", description: "Target column letter (e.g. 'A')." },
            count: { type: "number", description: "Optional number of columns to insert (default 1)." },
            position: { type: "string", enum: ["before", "after"], description: "Optional position relative to the target column (default 'before')." }
          },
          required: ["workbookPath", "column"]
        }
      },
      {
        name: "delete_row",
        description: "Deletes row(s) starting from a target row.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            row: { type: "number", description: "Start row number (1-based) to delete." },
            count: { type: "number", description: "Optional number of rows to delete (default 1)." }
          },
          required: ["workbookPath", "row"]
        }
      },
      {
        name: "delete_col",
        description: "Deletes column(s) starting from a target column.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            column: { type: "string", description: "Start column letter (e.g. 'A') to delete." },
            count: { type: "number", description: "Optional number of columns to delete (default 1)." }
          },
          required: ["workbookPath", "column"]
        }
      },
      {
        name: "new_sheet",
        description: "Creates a new sheet in the workbook.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetName: { type: "string", description: "Name of the new sheet." }
          },
          required: ["workbookPath", "sheetName"]
        }
      },
      {
        name: "rename_sheet",
        description: "Renames a sheet in the workbook.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            oldName: { type: "string", description: "Current name of the sheet." },
            newName: { type: "string", description: "New name of the sheet." }
          },
          required: ["workbookPath", "oldName", "newName"]
        }
      },
      {
        name: "set_col_width",
        description: "Sets the width of a column.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." },
            column: { type: "string", description: "Column letter (e.g. 'A') to resize." },
            width: { type: "number", description: "Width value in pixels." }
          },
          required: ["workbookPath", "column", "width"]
        }
      },
      {
        name: "get_formulas",
        description: "Lists all available spreadsheet formulas in SocialCalc, optionally filtered by category.",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Optional category to filter by (e.g. 'Math & Trig', 'Statistical', 'Text', 'Date & Time', 'Logical', 'Lookup & Reference', 'Financial')." }
          }
        }
      },
      {
        name: "describe_formula",
        description: "Provides a detailed explanation and usage example for a specific SocialCalc formula function.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the formula function (e.g. 'SUM', 'VLOOKUP', 'IF')." }
          },
          required: ["name"]
        }
      },
      {
        name: "read_sheet",
        description: "Reads the entire content of a worksheet, returning a Markdown table and raw cell details.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." }
          },
          required: ["workbookPath"]
        }
      },
      {
        name: "summarize_workbook",
        description: "Summarizes the entire workbook, listing all sheets, dimensions, hidden status, and cell counts.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." }
          },
          required: ["workbookPath"]
        }
      },
      {
        name: "get_sheet_dimensions",
        description: "Returns the row and column dimensions (count) of a worksheet.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." }
          },
          required: ["workbookPath"]
        }
      },
      {
        name: "describe_sheet",
        description: "Lists sheet details, column names, column headers contents, and size.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." }
          },
          required: ["workbookPath"]
        }
      },
      {
        name: "summarize_sheet",
        description: "Provides a structured mathematical and textual summary of the sheet's populated cells.",
        inputSchema: {
          type: "object",
          properties: {
            workbookPath: { type: "string", description: "Path to the workbook file." },
            sheetNumber: { type: "number", description: "Optional 1-based sheet index." },
            sheetName: { type: "string", description: "Optional sheet name." }
          },
          required: ["workbookPath"]
        }
      }
    ];
  }

  /**
   * Public execution handler to run an MCP tool.
   */
  public async executeTool(name: string, args: any) {
    try {
      // Validate required arguments based on tool schema
      const tool = this.listTools().find(t => t.name === name);
      if (tool && tool.inputSchema && tool.inputSchema.required) {
        for (const reqProp of tool.inputSchema.required) {
          if (args === undefined || args[reqProp] === undefined || args[reqProp] === null || args[reqProp] === "") {
            throw new Error(`Missing required argument '${reqProp}' for tool '${name}'`);
          }
        }
      }

      switch (name) {
        case "list_workbooks": {
          const dir = args.directoryPath || "./data";
          const files = await fs.readdir(dir);
          const workbooks = files.filter(f => f.endsWith(".json") || f.endsWith(".msc"));
          return {
            content: [{ type: "text", text: `Found workbooks in ${dir}:\n${workbooks.map(w => `- ${w}`).join("\n") || "No workbooks found."}` }]
          };
        }

        case "list_sheets": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheets = workbook.getSheetsMetadata();
          const sheetList = sheets.map(s => `- **${s.name}** (ID: ${s.id}${s.hidden ? ", hidden" : ""})`).join("\n");
          return {
            content: [{ type: "text", text: `Workbook sheets:\n${sheetList}` }]
          };
        }

        case "read_range": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const range = parseRange(args.range);
          const markdown = sheetToMarkdownTable(sheet, range.startRow, range.endRow, range.startColIndex, range.endColIndex);
          return {
            content: [{ type: "text", text: `### Sheet: ${sheet.name} (Range: ${args.range})\n\n${markdown || "*No data in range*"}` }]
          };
        }

        case "write_range": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          let gridData: (string | number | null)[][] = [];

          if (args.data) {
            gridData = args.data;
          } else if (args.value !== undefined) {
            const num = Number(args.value);
            const val = isNaN(num) || args.value === "" ? args.value : num;
            
            const range = parseRange(args.range);
            const rows = range.endRow - range.startRow + 1;
            const cols = range.endColIndex - range.startColIndex + 1;
            
            gridData = Array.from({ length: rows }, () => Array(cols).fill(val));
          } else {
            throw new Error("Must provide either 'value' or 'data' for writing.");
          }

          adapter.writeRange(sheet, args.range, gridData);
          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully wrote data to ${args.range} in sheet '${sheet.name}'.` }]
          };
        }

        case "format_cells": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const style: any = {};
          if (args.bold) style.font = "normal bold 10pt Arial";
          if (args.textColor) style.textColor = args.textColor;
          if (args.bgColor) style.bgColor = args.bgColor;
          if (args.align) style.align = args.align;

          adapter.applyStyle(sheet, args.range, style);
          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully formatted cells ${args.range} in sheet '${sheet.name}'.` }]
          };
        }

        case "list_tool": {
          const tools = this.listTools();
          const toolSummary = tools.map(t => `- **${t.name}**: ${t.description}`).join("\n");
          return {
            content: [{ type: "text", text: `### Registered MCP Tools\n\n${toolSummary}` }]
          };
        }

        case "describe_tool": {
          const tool = this.listTools().find(t => t.name === args.toolName);
          if (!tool) throw new Error(`Tool '${args.toolName}' not found`);

          const props = tool.inputSchema?.properties || {};
          const required = tool.inputSchema?.required || [];
          let paramsHelp = "";
          for (const [propName, propSchema] of Object.entries(props) as any) {
            const req = required.includes(propName) ? " *(required)*" : "";
            paramsHelp += `- **${propName}** (${propSchema.type})${req}: ${propSchema.description || "No description provided."}\n`;
          }

          const helpText = `### Tool: ${tool.name}\n\n${tool.description}\n\n**Arguments:**\n${paramsHelp || "*No arguments required*"}`;
          return {
            content: [{ type: "text", text: helpText }]
          };
        }

        case "delete_text": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);
          for (const { cell } of rangeCells) {
            delete cell.val;
            delete cell.text;
            delete cell.formula;
            delete cell.valuetype;
          }
          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully cleared cell content in range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_cell_to_default": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const range = parseRange(args.range);
          for (let r = range.startRow; r <= range.endRow; r++) {
            for (let c = range.startColIndex; c <= range.endColIndex; c++) {
              sheet.deleteCell(formatCoordinate(c, r));
            }
          }
          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully reset cells in range '${args.range}' to default in sheet '${sheet.name}'.` }]
          };
        }

        case "set_font_color": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          adapter.applyStyle(sheet, args.range, { textColor: args.color });
          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set font color to '${args.color}' for range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_cell_bg": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          adapter.applyStyle(sheet, args.range, { bgColor: args.color });
          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set background color to '${args.color}' for range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_border": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);

          if (args.border) {
            const borderIdx = StyleService.registerBorder(sheet, args.border);
            for (const { cell } of rangeCells) {
              cell.borders = { top: borderIdx, right: borderIdx, bottom: borderIdx, left: borderIdx };
            }
          } else if (args.top || args.right || args.bottom || args.left) {
            for (const { cell } of rangeCells) {
              const borders = cell.borders || { top: 0, right: 0, bottom: 0, left: 0 };
              if (args.top) borders.top = StyleService.registerBorder(sheet, args.top);
              if (args.right) borders.right = StyleService.registerBorder(sheet, args.right);
              if (args.bottom) borders.bottom = StyleService.registerBorder(sheet, args.bottom);
              if (args.left) borders.left = StyleService.registerBorder(sheet, args.left);
              cell.borders = borders;
            }
          } else {
            throw new Error("Must provide 'border' or at least one of 'top', 'right', 'bottom', 'left'.");
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully applied borders to range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_padding": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);

          const updates: any = {};
          if (args.padding !== undefined) updates.padding = String(args.padding);
          if (args.top !== undefined) updates.top = String(args.top);
          if (args.right !== undefined) updates.right = String(args.right);
          if (args.bottom !== undefined) updates.bottom = String(args.bottom);
          if (args.left !== undefined) updates.left = String(args.left);

          if (Object.keys(updates).length === 0) {
            throw new Error("Must provide 'padding' or at least one of 'top', 'right', 'bottom', 'left'.");
          }

          for (const { cell } of rangeCells) {
            const currentLayout = cell.layoutIndex ? (sheet.layouts.get(cell.layoutIndex) || "") : "";
            const newLayout = parseAndFormatLayout(currentLayout, updates);
            cell.layoutIndex = StyleService.registerLayout(sheet, newLayout);
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set padding in range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_alignment": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);

          for (const { cell } of rangeCells) {
            if (args.align) {
              cell.cellFormatIndex = StyleService.registerCellFormat(sheet, args.align);
            }
            if (args.verticalAlign) {
              const currentLayout = cell.layoutIndex ? (sheet.layouts.get(cell.layoutIndex) || "") : "";
              const newLayout = parseAndFormatLayout(currentLayout, { verticalAlign: args.verticalAlign });
              cell.layoutIndex = StyleService.registerLayout(sheet, newLayout);
            }
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set alignments in range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_font_size": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);

          for (const { cell } of rangeCells) {
            const currentFont = cell.fontIndex ? (sheet.fonts.get(cell.fontIndex) || "normal normal 10pt Arial") : "normal normal 10pt Arial";
            const newFont = updateFontProperty(currentFont, { size: String(args.size) });
            cell.fontIndex = StyleService.registerFont(sheet, newFont);
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set font size to '${args.size}' for range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_font_family": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);

          for (const { cell } of rangeCells) {
            const currentFont = cell.fontIndex ? (sheet.fonts.get(cell.fontIndex) || "normal normal 10pt Arial") : "normal normal 10pt Arial";
            const newFont = updateFontProperty(currentFont, { family: args.family });
            cell.fontIndex = StyleService.registerFont(sheet, newFont);
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set font family to '${args.family}' for range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_font_style": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);

          const updates: any = {};
          if (args.style) {
            if (args.style === "bold") {
              updates.style = "normal";
              updates.weight = "bold";
            } else if (args.style === "bold italic") {
              updates.style = "italic";
              updates.weight = "bold";
            } else if (args.style === "italic") {
              updates.style = "italic";
              updates.weight = "normal";
            } else if (args.style === "normal") {
              updates.style = "normal";
              updates.weight = "normal";
            } else if (args.style === "default") {
              updates.style = "normal";
              updates.weight = "normal";
            }
          }
          if (args.bold !== undefined) {
            updates.weight = args.bold ? "bold" : "normal";
          }

          for (const { cell } of rangeCells) {
            const currentFont = cell.fontIndex ? (sheet.fonts.get(cell.fontIndex) || "normal normal 10pt Arial") : "normal normal 10pt Arial";
            const newFont = updateFontProperty(currentFont, updates);
            cell.fontIndex = StyleService.registerFont(sheet, newFont);
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set font style in range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "set_format": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const normalizedFormat = normalizeFormat(args.format);
          const vfIdx = StyleService.registerValueFormat(sheet, normalizedFormat);
          const isTextFormat = normalizedFormat.toLowerCase().startsWith("text-");

          const rangeCells = SheetService.getRangeCells(sheet, args.range);
          for (const { cell } of rangeCells) {
            if (isTextFormat) {
              cell.textValueFormatIndex = vfIdx;
            } else {
              cell.nonTextValueFormatIndex = vfIdx;
            }
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully applied format '${args.format}' to range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "merge_cells": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const range = parseRange(args.range);
          const topLeftCoord = `${colIndexToLetter(range.startColIndex)}${range.startRow}`;
          const targetCell = sheet.getCell(topLeftCoord, true)!;

          const colspan = range.endColIndex - range.startColIndex + 1;
          const rowspan = range.endRow - range.startRow + 1;

          if (colspan > 1) targetCell.colspan = colspan;
          if (rowspan > 1) targetCell.rowspan = rowspan;

          for (let r = range.startRow; r <= range.endRow; r++) {
            for (let c = range.startColIndex; c <= range.endColIndex; c++) {
              const coord = `${colIndexToLetter(c)}${r}`;
              if (coord !== topLeftCoord) {
                sheet.deleteCell(coord);
              }
            }
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully merged cells in range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "unmerge_cells": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const range = parseRange(args.range);
          const topLeftCoord = `${colIndexToLetter(range.startColIndex)}${range.startRow}`;
          const targetCell = sheet.getCell(topLeftCoord);
          if (!targetCell) throw new Error(`Top-left cell '${topLeftCoord}' not found`);

          delete targetCell.colspan;
          delete targetCell.rowspan;

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully unmerged cells in range '${args.range}' in sheet '${sheet.name}'.` }]
          };
        }

        case "new_workbook": {
          const workbook = new Workbook();
          const sheetName = args.sheetName || "sheet1";
          const sheet = workbook.addSheet("sheet1", sheetName, false);
          sheet.maxCol = 1;
          sheet.maxRow = 1;
          workbook.setActiveSheet("sheet1");

          const absolutePath = path.resolve(args.workbookPath);
          await fs.mkdir(path.dirname(absolutePath), { recursive: true });
          const serialized = serializeWorkbookJson(workbook);
          await fs.writeFile(absolutePath, serialized, "utf-8");

          return {
            content: [{ type: "text", text: `Successfully created workbook at '${args.workbookPath}' with sheet '${sheetName}'.` }]
          };
        }

        case "insert_row": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const count = args.count || 1;
          const atRow = Number(args.row);
          const position = args.position || "before";

          for (let i = 0; i < count; i++) {
            if (position === "after") {
              SheetService.insertRow(sheet, atRow);
            } else {
              SheetService.insertRow(sheet, atRow - 1);
            }
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully inserted ${count} row(s) ${position} row ${atRow} in sheet '${sheet.name}'.` }]
          };
        }

        case "insert_col": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const count = args.count || 1;
          const colLetter = args.column.toUpperCase();
          const position = args.position || "before";

          const colIdx = colLetterToIndex(colLetter);

          for (let i = 0; i < count; i++) {
            if (position === "after") {
              SheetService.insertCol(sheet, colLetter);
            } else {
              const beforeCol = colIdx > 1 ? colIndexToLetter(colIdx - 1) : "";
              SheetService.insertCol(sheet, beforeCol);
            }
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully inserted ${count} column(s) ${position} column '${colLetter}' in sheet '${sheet.name}'.` }]
          };
        }

        case "delete_row": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const count = args.count || 1;
          const startRow = Number(args.row);

          for (let i = 0; i < count; i++) {
            SheetService.deleteRow(sheet, startRow);
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully deleted ${count} row(s) starting from row ${startRow} in sheet '${sheet.name}'.` }]
          };
        }

        case "delete_col": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const count = args.count || 1;
          const colLetter = args.column.toUpperCase();

          for (let i = 0; i < count; i++) {
            SheetService.deleteCol(sheet, colLetter);
          }

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully deleted ${count} column(s) starting from column '${colLetter}' in sheet '${sheet.name}'.` }]
          };
        }

        case "new_sheet": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          if (workbook.getSheetByName(args.sheetName)) {
            throw new Error(`Sheet with name '${args.sheetName}' already exists.`);
          }

          adapter.createSheet(workbook, args.sheetName);
          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully created sheet '${args.sheetName}' in workbook.` }]
          };
        }

        case "rename_sheet": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          if (workbook.getSheetByName(args.newName)) {
            throw new Error(`Sheet with name '${args.newName}' already exists.`);
          }

          const success = adapter.renameSheet(workbook, args.oldName, args.newName);
          if (!success) throw new Error(`Sheet '${args.oldName}' not found`);

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully renamed sheet '${args.oldName}' to '${args.newName}'.` }]
          };
        }

        case "set_col_width": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const colLetter = args.column.toUpperCase();
          const width = Number(args.width);

          sheet.colWidths.set(colLetter, width);

          await adapter.saveWorkbook(workbook, args.workbookPath);
          return {
            content: [{ type: "text", text: `Successfully set column '${colLetter}' width to ${width}px.` }]
          };
        }

        case "get_formulas": {
          const category = args.category;
          let list = FORMULAS;
          if (category) {
            list = FORMULAS.filter(f => f.category.toLowerCase() === category.toLowerCase());
          }
          const formatted = list.map(f => `- **${f.name}** (${f.category}): ${f.desc}`).join("\n");
          return {
            content: [{ type: "text", text: `Available formulas in SocialCalc${category ? ` (filtered by category: ${category})` : ""}:\n\n${formatted || "No formulas found matching category."}` }]
          };
        }

        case "describe_formula": {
          const name = args.name.toUpperCase().trim();
          const formula = FORMULAS.find(f => f.name === name);
          if (!formula) {
            throw new Error(`Formula function '${name}' not found.`);
          }
          const info = [
            `### Formula: ${formula.name}`,
            `- **Category**: ${formula.category}`,
            `- **Description**: ${formula.desc}`,
            `- **Usage Syntax**: \`${formula.usage}\``,
            `- **Usage Example**: \`${formula.example}\``
          ].join("\n");
          return {
            content: [{ type: "text", text: info }]
          };
        }

        case "read_sheet": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const startRow = 1;
          const endRow = sheet.maxRow || 1;
          const startColIdx = 1;
          const endColIdx = sheet.maxCol || 1;

          const markdownTable = sheetToMarkdownTable(sheet, startRow, endRow, startColIdx, endColIdx);

          const cellDetails: Record<string, any> = {};
          for (const [coord, cell] of sheet.cells.entries()) {
            cellDetails[coord] = {
              value: cell.val,
              text: cell.text,
              formula: cell.formula,
              valuetype: cell.valuetype,
              font: cell.fontIndex ? sheet.fonts.get(cell.fontIndex) : undefined,
              textColor: cell.textColorIndex ? sheet.colors.get(cell.textColorIndex) : undefined,
              bgColor: cell.bgColorIndex ? sheet.colors.get(cell.bgColorIndex) : undefined,
              border: cell.borders,
              colspan: cell.colspan,
              rowspan: cell.rowspan,
            };
          }

          const resultText = `### Sheet: ${sheet.name} (Full Sheet)\n\n${markdownTable || "*No data in sheet*"}\n\n#### Raw Cell Details:\n\`\`\`json\n${JSON.stringify(cellDetails, null, 2)}\n\`\`\``;

          return {
            content: [{ type: "text", text: resultText }]
          };
        }

        case "summarize_workbook": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const metadata = workbook.getSheetsMetadata();
          
          const summaryLines = [];
          for (const meta of metadata) {
            const sheet = workbook.getSheetById(meta.id);
            const rows = sheet ? (sheet.maxRow || 0) : 0;
            const cols = sheet ? (sheet.maxCol || 0) : 0;
            const cellCount = sheet ? sheet.cells.size : 0;
            summaryLines.push(
              `- **${meta.name}** (ID: ${meta.id}): ${rows} rows x ${cols} columns, ${cellCount} populated cells. Hidden: ${meta.hidden ? "Yes" : "No"}. ${meta.id === workbook.currentId ? "[Active]" : ""}`
            );
          }

          return {
            content: [{ type: "text", text: `### Workbook Summary: ${args.workbookPath}\nTotal Sheets: ${metadata.length}\n\n${summaryLines.join("\n")}` }]
          };
        }

        case "get_sheet_dimensions": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const maxRow = sheet.maxRow || 0;
          const maxCol = sheet.maxCol || 0;

          return {
            content: [{ type: "text", text: `Sheet '${sheet.name}' dimensions: ${maxRow} rows, ${maxCol} columns.` }]
          };
        }

        case "describe_sheet": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const colHeaders: { col: string; header: string }[] = [];
          const maxCol = sheet.maxCol || 1;
          for (let c = 1; c <= maxCol; c++) {
            const colLetter = colIndexToLetter(c);
            const cell = sheet.getCell(formatCoordinate(c, 1));
            const headerVal = cell ? (cell.text || cell.val?.toString() || "") : "";
            colHeaders.push({ col: colLetter, header: headerVal });
          }

          const descStr = `### Sheet: ${sheet.name}\n` +
            `- Dimensions: ${sheet.maxRow} Rows x ${sheet.maxCol} Columns\n` +
            `- Columns Schema:\n` +
            colHeaders.map(ch => `  - **${ch.col}**: ${ch.header || "*No Header*"}`).join("\n");

          return {
            content: [{ type: "text", text: descStr }]
          };
        }

        case "summarize_sheet": {
          const workbook = await adapter.openWorkbook(args.workbookPath);
          const sheet = resolveSheet(workbook, args);
          if (!sheet) throw new Error("Target sheet not found");

          const summary = SpreadsheetService.getSheetSummary(sheet);

          return {
            content: [{ type: "text", text: `### Sheet Summary: ${sheet.name}\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`` }]
          };
        }

        default:
          throw new Error(`Tool not found: ${name}`);
      }
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${error.message}` }]
      };
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: this.listTools() };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await this.executeTool(name, args);
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.server.close();
      process.exit(0);
    });
  }
}
