import { Sheet } from "../models/sheet.js";

/**
 * Service to register styling rules and manage layout indices inside a Sheet registry.
 */
export class StyleService {
  /**
   * General helper to register a definition in a registry Map.
   * Avoids duplicate definitions by reusing existing indices.
   */
  private static register(registry: Map<number, string>, definition: string): number {
    const trimmed = definition.trim();
    
    // Check if definition is already registered
    for (const [index, def] of registry.entries()) {
      if (def === trimmed) {
        return index;
      }
    }

    // Find next available index (1-based index)
    const keys = Array.from(registry.keys());
    const nextIndex = keys.length > 0 ? Math.max(...keys) + 1 : 1;
    registry.set(nextIndex, trimmed);
    return nextIndex;
  }

  /**
   * Registers a font description (e.g. "bold 11pt Arial")
   */
  static registerFont(sheet: Sheet, fontDef: string): number {
    return this.register(sheet.fonts, fontDef);
  }

  /**
   * Registers a color description (e.g. "rgb(255, 255, 255)" or "#ffffff")
   */
  static registerColor(sheet: Sheet, colorDef: string): number {
    return this.register(sheet.colors, colorDef);
  }

  /**
   * Registers a border description (e.g. "1px solid rgb(0,0,0)")
   */
  static registerBorder(sheet: Sheet, borderDef: string): number {
    return this.register(sheet.borders, borderDef);
  }

  /**
   * Registers a layout setting (e.g. "padding:6px 6px 6px 6px;vertical-align:middle;")
   */
  static registerLayout(sheet: Sheet, layoutDef: string): number {
    return this.register(sheet.layouts, layoutDef);
  }

  /**
   * Registers cell alignment / format rules (e.g. "left", "center", "right")
   */
  static registerCellFormat(sheet: Sheet, formatDef: string): number {
    return this.register(sheet.cellFormats, formatDef);
  }

  /**
   * Registers custom value format settings (e.g. "##0.00")
   */
  static registerValueFormat(sheet: Sheet, formatDef: string): number {
    return this.register(sheet.valueFormats, formatDef);
  }
}
