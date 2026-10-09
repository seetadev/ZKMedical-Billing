# 📊 SocialCalc MCP Server

[![npm version](https://img.shields.io/npm/v/socialcalc-mcp.svg?style=flat-up)](https://www.npmjs.com/package/socialcalc-mcp)
[![License](https://img.shields.io/github/license/anisharma07/socialcalc-mcp.svg)](https://github.com/anisharma07/socialcalc-mcp/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/anisharma07/socialcalc-mcp.svg)](https://github.com/anisharma07/socialcalc-mcp/issues)

A Model Context Protocol (MCP) server that provides cell-level and sheet-level spreadsheet editing, styling, and analytical capabilities for SocialCalc workbooks. It allows LLMs and desktop AI environments (such as **Claude Desktop**, **Cursor**, **VS Code**, and **Windsurf**) to programmatically inspect, query, format, and edit spreadsheet grids.

This server supports **dual transport modes**: standard MCP Stdio transport for local agent orchestration, and an HTTP JSON-RPC bridge for browser-based tester interfaces and lightweight web clients.

---

## 🚀 Installation & Setup

You can run this server directly via `npx` or install it locally.

### 1. Running via npx (Recommended for AI Clients)
```bash
npx socialcalc-mcp
```

### 2. Manual Installation & Local Build
```bash
git clone https://github.com/anisharma07/socialcalc-mcp.git
cd socialcalc-mcp
npm install
npm run build
npm start
```

---

## 🛠️ Configuration in AI Editors

### Claude Desktop
Add this to your `claude_desktop_config.json` (usually located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "socialcalc-mcp": {
      "command": "npx",
      "args": ["-y", "socialcalc-mcp"]
    }
  }
}
```

### Cursor / VS Code / Windsurf
Configure a new MCP server in your editor settings:
- **Type**: `command`
- **Name**: `socialcalc-mcp`
- **Command**: `npx -y socialcalc-mcp`

---

## 📖 Tool API Reference

The server exposes 35 tools grouped into functional categories:

### 1. Workbook Inspection & Navigation
| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `list_workbooks` | `directoryPath` (opt) | Lists all workbook files in a target directory (defaults to `./data`). |
| `list_sheets` | `workbookPath` (req) | Lists all sheet names and metadata inside a workbook file. |
| `read_sheet` | `workbookPath` (req), `sheetName`/`sheetNumber` (opt) | Reads the entire content of a worksheet, returning a Markdown table and raw cell details. |
| `read_range` | `workbookPath` (req), `range` (req), `sheetName`/`sheetNumber` (opt) | Reads a coordinate range (e.g. `'A1:C10'`) and formats it as a Markdown table. |
| `get_sheet_dimensions` | `workbookPath` (req), `sheetName`/`sheetNumber` (opt) | Returns the row and column counts of a worksheet. |
| `describe_sheet` | `workbookPath` (req), `sheetName`/`sheetNumber` (opt) | Lists sheet details, column names, column headers contents, and size. |
| `summarize_workbook` | `workbookPath` (req) | Summarizes the entire workbook, listing all sheets, dimensions, hidden status, and cell counts. |
| `summarize_sheet` | `workbookPath` (req), `sheetName`/`sheetNumber` (opt) | Provides a structured mathematical and textual summary of the sheet's populated cells. |

### 2. Structural & Workbook Modification
| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `new_workbook` | `workbookPath` (req), `sheetName` (opt) | Creates a new empty workbook file at the specified path with an initial sheet. |
| `new_sheet` | `workbookPath` (req), `sheetName` (req) | Adds a new empty worksheet to the workbook. |
| `rename_sheet` | `workbookPath` (req), `oldName` (req), `newName` (req) | Renames an existing worksheet. |
| `insert_row` | `workbookPath` (req), `row` (req), `count` (opt), `position` (opt) | Inserts empty row(s) before or after a target row index. |
| `insert_col` | `workbookPath` (req), `column` (req), `count` (opt), `position` (opt) | Inserts empty column(s) before or after a target column letter. |
| `delete_row` | `workbookPath` (req), `row` (req), `count` (opt) | Deletes one or more rows starting from a target index. |
| `delete_col` | `workbookPath` (req), `column` (req), `count` (opt) | Deletes one or more columns starting from a target letter. |
| `set_col_width` | `workbookPath` (req), `column` (req), `width` (req) | Sets column width in pixels. |

### 3. Editing & Styling
| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `write_range` | `workbookPath` (req), `range` (req), `value`/`data` (opt) | Writes a single value or a 2D array of data starting at a cell range. Supports formulas. |
| `delete_text` | `workbookPath` (req), `range` (req) | Clears cell values/formulas while preserving styling. |
| `set_cell_to_default` | `workbookPath` (req), `range` (req) | Completely resets cell content, formula, and layout to defaults. |
| `set_font_color` | `workbookPath` (req), `range` (req), `color` (req) | Applies text foreground color (e.g. `rgb(255,0,0)`, `#ff0000`). |
| `set_cell_bg` | `workbookPath` (req), `range` (req), `color` (req) | Applies cell background color. |
| `set_border` | `workbookPath` (req), `range` (req), `border`/`top`/`right`/`bottom`/`left` (opt) | Applies border shorthands or TRBL overrides (e.g. `1px solid rgb(0,0,0)`). |
| `set_padding` | `workbookPath` (req), `range` (req), `padding`/`top`/`right`/`bottom`/`left` (opt) | Applies cell padding shorthand or TRBL overrides (e.g. `5px 10px`). |
| `set_alignment` | `workbookPath` (req), `range` (req), `align`/`verticalAlign` (opt) | Sets horizontal (`left`/`center`/`right`) and vertical (`top`/`middle`/`bottom`) alignments. |
| `set_font_size` | `workbookPath` (req), `range` (req), `size` (req) | Sets font size (e.g. `12pt`, `14px`). |
| `set_font_family` | `workbookPath` (req), `range` (req), `family` (req) | Sets font family (e.g. `Arial`, `Courier New`). |
| `set_font_style` | `workbookPath` (req), `range` (req), `style`/`bold` (opt) | Sets style (`italic`/`normal`) and weight (`bold`/`normal`). |
| `set_format` | `workbookPath` (req), `range` (req), `format` (req) | Applies text/numeric formatting formats (`HTML`, percentage `0.00%`, currency `$#,##0.00`). |
| `merge_cells` | `workbookPath` (req), `range` (req) | Merges cell ranges. |
| `unmerge_cells` | `workbookPath` (req), `range` (req) | Restores merged cell ranges. |

### 4. Formulas Reference & Help
| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `get_formulas` | `category` (opt) | Lists all available spreadsheet formulas in SocialCalc, optionally filtered by category. |
| `describe_formula` | `name` (req) | Explains and provides a detailed example of a specific formula. |
| `list_tool` | None | Lists all registered tools. |
| `describe_tool` | `toolName` (req) | Describes tool parameters dynamically. |

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
