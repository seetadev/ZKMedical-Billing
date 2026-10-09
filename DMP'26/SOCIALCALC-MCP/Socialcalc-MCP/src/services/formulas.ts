import { Sheet } from "../models/sheet.js";
import { parseRange, formatCoordinate } from "../utils/coordinate.js";

/**
 * Service to parse formulas and resolve dependencies and circular checks.
 */
export class FormulaService {
  /**
   * Extracts all unique single cell references from a formula string.
   * Expands ranges like "A1:B3" to individual cell coordinates ["A1", "A2", "A3", "B1", "B2", "B3"].
   */
  static extractReferences(formula: string): string[] {
    const references: string[] = [];
    
    // 1. Identify and expand ranges e.g. A1:B3
    const rangeRegex = /[A-Z]+[0-9]+:[A-Z]+[0-9]+/gi;
    const ranges = formula.match(rangeRegex) || [];
    
    let cleanedFormula = formula;
    for (const rangeStr of ranges) {
      cleanedFormula = cleanedFormula.replace(rangeStr, "");
      try {
        const range = parseRange(rangeStr);
        for (let r = range.startRow; r <= range.endRow; r++) {
          for (let c = range.startColIndex; c <= range.endColIndex; c++) {
            references.push(formatCoordinate(c, r));
          }
        }
      } catch {
        // Ignore parsing errors for malformed ranges
      }
    }
    
    // 2. Identify remaining single cell references e.g. A1
    const cellRegex = /[A-Z]+[0-9]+/gi;
    const cells = cleanedFormula.match(cellRegex) || [];
    for (const cell of cells) {
      references.push(cell.toUpperCase());
    }
    
    // Return unique uppercase coordinates
    return Array.from(new Set(references));
  }

  /**
   * Detects circular dependencies if a formula is added to a specific cell.
   * Uses Depth-First Search (DFS) to traverse the cell reference dependency tree.
   */
  static hasCircularDependency(sheet: Sheet, targetCell: string, formulaStr: string): boolean {
    const targetCellUpper = targetCell.toUpperCase();
    const visited = new Set<string>();

    function dfs(currentCoord: string, currentFormula: string): boolean {
      const refs = FormulaService.extractReferences(currentFormula);
      
      for (const ref of refs) {
        if (ref === targetCellUpper) {
          return true; // Cycle found (dependency points back to the starting cell)
        }
        
        if (!visited.has(ref)) {
          visited.add(ref);
          const cell = sheet.getCell(ref);
          if (cell && cell.formula) {
            if (dfs(ref, cell.formula)) {
              return true;
            }
          }
        }
      }
      
      return false;
    }

    return dfs(targetCellUpper, formulaStr);
  }
}
