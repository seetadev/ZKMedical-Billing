import { Cell } from "./cell.js";
import { Table } from "./table.js";

export interface NamedRange {
  name: string;
  description: string;
  value: string;
}

export class Sheet {
  name: string;
  cells: Map<string, Cell> = new Map();
  tables: Table[] = [];

  // Custom column widths and row heights
  colWidths: Map<string, number> = new Map();
  rowHeights: Map<number, number> = new Map();

  // Grid size properties
  maxCol: number = 0;
  maxRow: number = 0;

  // Default values
  defaultColWidth?: number;
  defaultRowHeight?: number;

  // Freeze panes
  freezeRowCount?: number;
  freezeColCount?: number;

  // Named ranges
  namedRanges: Map<string, NamedRange> = new Map();

  // Style Registries (index -> definition string)
  fonts: Map<number, string> = new Map();
  colors: Map<number, string> = new Map();
  borders: Map<number, string> = new Map();
  layouts: Map<number, string> = new Map();
  cellFormats: Map<number, string> = new Map();
  valueFormats: Map<number, string> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Retrieves a cell at the specified coordinate.
   * If it doesn't exist, it can optionally be created.
   */
  getCell(coord: string, createIfMissing: boolean = false): Cell | undefined {
    const key = coord.toUpperCase();
    let cell = this.cells.get(key);
    if (!cell && createIfMissing) {
      cell = new Cell(key);
      this.cells.set(key, cell);
    }
    return cell;
  }

  /**
   * Set or overwrite a cell in the sheet
   */
  setCell(cell: Cell): void {
    this.cells.set(cell.coord.toUpperCase(), cell);
  }

  /**
   * Deletes a cell from the sheet
   */
  deleteCell(coord: string): void {
    this.cells.delete(coord.toUpperCase());
  }

  /**
   * Clear all cells and configurations from the sheet
   */
  clear(): void {
    this.cells.clear();
    this.tables = [];
    this.colWidths.clear();
    this.rowHeights.clear();
    this.maxCol = 0;
    this.maxRow = 0;
    this.freezeRowCount = undefined;
    this.freezeColCount = undefined;
    this.namedRanges.clear();
    this.fonts.clear();
    this.colors.clear();
    this.borders.clear();
    this.layouts.clear();
    this.cellFormats.clear();
    this.valueFormats.clear();
  }
}
