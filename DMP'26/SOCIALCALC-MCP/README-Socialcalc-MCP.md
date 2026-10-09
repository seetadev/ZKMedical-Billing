# Socialcalc-MCP

A Model Context Protocol (MCP) server that exposes 35 spreadsheet tools, allowing LLMs and AI desktop editors (Claude Desktop, Cursor, VS Code, Windsurf) to programmatically read, write, style, and analyze SocialCalc workbooks.

**NPM Package:** [socialcalc-mcp](https://www.npmjs.com/package/socialcalc-mcp)  
**GitHub:** [anisharma07/socialcalc-mcp](https://github.com/anisharma07/socialcalc-mcp)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Language | TypeScript 7.x |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.29.0 |
| Validation | Zod ^4.4.3 |
| Utilities | Lodash, UUID |
| Transport | stdio (JSON-RPC 2.0) |

---

## Architecture

```
+------------------------------------------+
|            MCP Client (LLM Host)          |
|  Claude Desktop / Cursor / VS Code /     |
|  Custom Agent (Python/Node)              |
+------------------------------------------+
              | JSON-RPC 2.0 (stdio)
              v
+------------------------------------------+
|         SocialcalcMcpServer              |
|         (src/server.ts)                   |
|                                          |
|  +---------+  +---------+  +----------+ |
|  | Tools   |  | Models  |  | Adapters | |
|  | (35)    |  |         |  |          | |
|  +---------+  +---------+  +----------+ |
+------------------------------------------+
              |
              v
+------------------------------------------+
|          File System (JSON workbooks)     |
|  *.json / *.msc workbook files           |
+------------------------------------------+
```

### Layered Architecture

```
src/
├── index.ts              # Entry point - starts stdio transport
├── server.ts             # MCP server class with 35 tool definitions & handlers
├── models/               # Domain models
│   ├── workbook.ts       # Workbook: multi-sheet container
│   ├── sheet.ts          # Sheet: cell grid with metadata
│   ├── cell.ts           # Cell: value, formula, styles
│   └── table.ts          # Table: structured data representation
├── services/             # Business logic
│   ├── spreadsheetService.ts  # High-level spreadsheet operations
│   ├── workbook.ts       # Workbook management (create, list)
│   ├── sheet.ts          # Sheet operations (CRUD, dimensions)
│   ├── styles.ts         # Style application (colors, fonts, borders)
│   └── formulas.ts       # Formula catalog and descriptions
├── adapters/             # Format adapters (serialization/deserialization)
│   ├── socialcalc/
│   │   ├── adapter.ts    # SocialCalcAdapter: open/save/write/style
│   │   ├── parser.ts     # Parse SocialCalc savestr format -> models
│   │   └── serializer.ts # Serialize models -> SocialCalc savestr
│   ├── csv/
│   │   └── index.ts      # CSV import/export
│   └── xlsx/
│       └── index.ts      # XLSX format support
└── utils/                # Shared utilities
    ├── coordinate.ts     # Cell coordinate parsing (A1 -> row/col)
    ├── formulas.ts       # Formula definitions catalog
    ├── markdown.ts       # Sheet -> Markdown table conversion
    ├── schema.ts         # Zod validation schemas
    └── validator.ts      # Input validation helpers
```

---

## MCP Tools (35 Total)

### Workbook Management
| Tool | Description |
|------|-------------|
| `list_workbooks` | Lists all workbook files in a directory |
| `new_workbook` | Creates a new workbook with a default sheet |
| `summarize_workbook` | Summarizes all sheets, dimensions, and cell counts |

### Sheet Operations
| Tool | Description |
|------|-------------|
| `list_sheets` | Lists all sheets in a workbook |
| `new_sheet` | Creates a new sheet |
| `rename_sheet` | Renames an existing sheet |
| `read_sheet` | Reads entire sheet as Markdown table + raw details |
| `describe_sheet` | Lists column headers, names, and size |
| `summarize_sheet` | Mathematical/textual summary of populated cells |
| `get_sheet_dimensions` | Returns row/column counts |

### Cell Reading & Writing
| Tool | Description |
|------|-------------|
| `read_range` | Reads a range (e.g., A1:C10) as Markdown table |
| `write_range` | Writes a value or 2D array to a range |
| `delete_text` | Clears cell content (preserves styles) |
| `set_cell_to_default` | Resets cells completely (content + styles) |

### Formatting & Styling
| Tool | Description |
|------|-------------|
| `format_cells` | Apply bold, text color, bg color, alignment |
| `set_font_color` | Set text color for a range |
| `set_cell_bg` | Set background color for a range |
| `set_border` | Set all or individual borders (top/right/bottom/left) |
| `set_padding` | Set cell padding |
| `set_alignment` | Set horizontal and vertical alignment |
| `set_font_size` | Set font size |
| `set_font_family` | Set font family |
| `set_font_style` | Set italic/bold/normal |
| `set_format` | Apply value formats (currency, percentage, dates, etc.) |

### Cell Merging
| Tool | Description |
|------|-------------|
| `merge_cells` | Merge a cell range |
| `unmerge_cells` | Unmerge previously merged cells |

### Row & Column Operations
| Tool | Description |
|------|-------------|
| `insert_row` | Insert row(s) before/after a target row |
| `insert_col` | Insert column(s) before/after a target column |
| `delete_row` | Delete row(s) |
| `delete_col` | Delete column(s) |
| `set_col_width` | Set column width in pixels |

### Formula Reference
| Tool | Description |
|------|-------------|
| `get_formulas` | List available formulas (optionally by category) |
| `describe_formula` | Detailed explanation + example for a formula |

### Meta / Self-Documentation
| Tool | Description |
|------|-------------|
| `list_tool` | Lists all registered MCP tools |
| `describe_tool` | Explains usage of a specific tool |

---

## Workbook File Format

Workbooks are stored as JSON files with this structure:

```json
{
  "numsheets": 3,
  "currentid": "sheet1",
  "currentname": "Sheet 1",
  "sheetArr": {
    "sheet1": {
      "name": "Sheet 1",
      "hidden": "0",
      "sheetstr": {
        "savestr": "cell:A1:v:100:t:n\ncell:B1:v:Hello:t:t\nsheet:c:5:r:10\n..."
      }
    },
    "sheet2": { ... }
  }
}
```

The `savestr` field contains SocialCalc's internal serialization format where each line represents a cell or sheet property.

---

## Setup

### Installation (from npm)

```bash
# Global install
npm install -g socialcalc-mcp

# Or use npx directly
npx socialcalc-mcp
```

### Local Development

```bash
cd Socialcalc-MCP

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode (tsx hot-reload)
npm run dev

# Run production build
npm start
```

### Integration with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "socialcalc": {
      "command": "npx",
      "args": ["-y", "socialcalc-mcp"]
    }
  }
}
```

### Integration with Cursor / VS Code

Add to your MCP settings:

```json
{
  "socialcalc-mcp": {
    "command": "npx",
    "args": ["-y", "socialcalc-mcp"]
  }
}
```

### Integration as a Library (Python Agent)

The SocialCalc-AI backend uses this server programmatically:

```python
# Launch as subprocess with stdio transport
proc = subprocess.Popen(
    ["node", "Socialcalc-MCP/dist/index.js"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    text=True
)

# JSON-RPC handshake
send({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {...}})
send({"jsonrpc": "2.0", "id": 2, "method": "notifications/initialized", "params": {}})

# Call tools
send({"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {
    "name": "write_range",
    "arguments": {"workbookPath": "/path/to/file.json", "range": "A1", "value": "Hello"}
}})
```

---

## Code Structure Detail

### Models

**`Workbook`** - Top-level container managing multiple sheets:
- `getSheetById(id)` / `getSheetByName(name)` / `getActiveSheet()`
- `getSheetsMetadata()` - Returns array of `{id, name, hidden}`
- `addSheet(name)` / `removeSheet(id)`

**`Sheet`** - Individual worksheet:
- `getCell(coord)` / `setCell(coord, cell)` / `deleteCell(coord)`
- `getDimensions()` - Returns `{rows, cols}`
- Internal cell storage keyed by coordinate string (e.g., "A1", "B3")

**`Cell`** - Single cell with value, formula, and styling:
- `val` - Display value
- `text` - Text content
- `formula` - Formula string
- `valuetype` - Type indicator (n=numeric, t=text, etc.)
- Style properties: `font`, `color`, `bgcolor`, `bt/br/bb/bl` (borders), `layout`

### Adapters

**`SocialCalcAdapter`** - Core adapter bridging models to SocialCalc format:
- `openWorkbook(path)` - Reads JSON file, parses into Workbook model
- `saveWorkbook(workbook, path)` - Serializes and writes to disk
- `writeRange(sheet, range, data)` - Writes 2D data array to cells
- `applyStyle(sheet, range, style)` - Applies formatting to cell range

**`parser.ts`** - Parses SocialCalc `savestr` lines into Sheet/Cell models
- Handles: `cell:`, `col:`, `row:`, `sheet:` directives
- Reconstructs cell values, formulas, and all style properties

**`serializer.ts`** - Converts models back to SocialCalc `savestr` format
- `serializeSheet(sheet)` - Sheet -> savestr string
- `serializeWorkbookJson(workbook)` - Workbook -> JSON structure

### Services

**`SheetService`** - Sheet-level operations:
- `getRangeCells(sheet, range)` - Gets all cells in a range
- Coordinate iteration and range expansion

**`StyleService`** - Formatting logic:
- Manages SocialCalc style indexes (fonts, colors, borders, layouts)
- Ensures style deduplication via index lookups

**`SpreadsheetService`** - High-level spreadsheet operations:
- Summarization, analysis, and description generation

### Utils

**`coordinate.ts`** - Cell coordinate utilities:
- `parseRange("A1:C10")` -> `{startRow, endRow, startColIndex, endColIndex}`
- `colIndexToLetter(index)` / `colLetterToIndex(letter)`
- `formatCoordinate(colIndex, row)` -> "A1"

**`formulas.ts`** - Complete formula catalog with categories:
- Math & Trig, Statistical, Text, Date & Time, Logical, Lookup & Reference, Financial
- Each formula has: name, description, syntax, example, category

**`markdown.ts`** - Converts sheet data to Markdown tables for LLM readability

---

## Communication Protocol

The server uses **JSON-RPC 2.0 over stdio** (standard MCP transport):

```
Client -> Server: {"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}
Server -> Client: {"jsonrpc":"2.0","id":1,"result":{...}}

Client -> Server: {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
Server -> Client: {"jsonrpc":"2.0","id":2,"result":{"tools":[...]}}

Client -> Server: {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"read_range","arguments":{...}}}
Server -> Client: {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"..."}]}}
```

---

## License

MIT
