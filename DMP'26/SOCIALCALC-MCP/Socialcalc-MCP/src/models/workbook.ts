import { Sheet } from "./sheet.js";

export interface SheetMetadata {
  id: string;      // e.g. "sheet1"
  name: string;    // e.g. "sheet1" or "Sales Report"
  hidden: boolean; // hidden status
}

export class Workbook {
  sheets: Map<string, Sheet> = new Map();
  sheetMeta: Map<string, SheetMetadata> = new Map();
  currentId: string = "";
  currentName: string = "";

  constructor() {}

  /**
   * Adds a sheet to the workbook.
   */
  addSheet(id: string, name: string, isHidden: boolean = false): Sheet {
    const sheet = new Sheet(name);
    this.sheets.set(id, sheet);
    this.sheetMeta.set(id, { id, name, hidden: isHidden });
    if (!this.currentId) {
      this.currentId = id;
      this.currentName = name;
    }
    return sheet;
  }

  /**
   * Retrieves a sheet by ID.
   */
  getSheetById(id: string): Sheet | undefined {
    return this.sheets.get(id);
  }

  /**
   * Retrieves a sheet by name.
   */
  getSheetByName(name: string): Sheet | undefined {
    for (const [id, meta] of this.sheetMeta.entries()) {
      if (meta.name === name) {
        return this.sheets.get(id);
      }
    }
    return undefined;
  }

  /**
   * Returns the sheet metadata list in order.
   */
  getSheetsMetadata(): SheetMetadata[] {
    return Array.from(this.sheetMeta.values());
  }

  /**
   * Removes a sheet by ID.
   */
  removeSheet(id: string): boolean {
    const deletedMeta = this.sheetMeta.get(id);
    if (!deletedMeta) return false;

    this.sheets.delete(id);
    this.sheetMeta.delete(id);

    // If we deleted the active sheet, reset active sheet to the first available one
    if (this.currentId === id) {
      const keys = Array.from(this.sheetMeta.keys());
      if (keys.length > 0) {
        this.currentId = keys[0];
        this.currentName = this.sheetMeta.get(this.currentId)!.name;
      } else {
        this.currentId = "";
        this.currentName = "";
      }
    }
    return true;
  }

  /**
   * Sets the active sheet by ID or Name.
   */
  setActiveSheet(identifier: string): boolean {
    // Check if ID first
    if (this.sheetMeta.has(identifier)) {
      const meta = this.sheetMeta.get(identifier)!;
      this.currentId = identifier;
      this.currentName = meta.name;
      return true;
    }

    // Check by name
    for (const [id, meta] of this.sheetMeta.entries()) {
      if (meta.name === identifier) {
        this.currentId = id;
        this.currentName = meta.name;
        return true;
      }
    }

    return false;
  }

  /**
   * Gets the active sheet.
   */
  getActiveSheet(): Sheet | undefined {
    if (!this.currentId) return undefined;
    return this.sheets.get(this.currentId);
  }
}
