/**
 * Converts a 1-based column index to standard spreadsheet column letters (e.g. 1 -> A, 27 -> AA).
 */
export function colIndexToLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = "";
  while (temp > 0) {
    const modulo = (temp - 1) % 26;
    letter = String.fromCharCode(65 + modulo) + letter;
    temp = Math.floor((temp - modulo) / 26);
  }
  return letter;
}

/**
 * Converts spreadsheet column letters to a 1-based column index (e.g. A -> 1, AA -> 27).
 */
export function colLetterToIndex(letter: string): number {
  let index = 0;
  const uppercase = letter.toUpperCase();
  for (let i = 0; i < uppercase.length; i++) {
    index = index * 26 + (uppercase.charCodeAt(i) - 64);
  }
  return index;
}

/**
 * Parses a coordinate string like "B25" into column letter, row number, and column index.
 */
export function parseCoordinate(coord: string): { col: string; row: number; colIndex: number } {
  const match = coord.toUpperCase().match(/^([A-Z]+)([0-9]+)$/);
  if (!match) {
    throw new Error(`Invalid coordinate format: ${coord}`);
  }
  const col = match[1];
  const row = parseInt(match[2], 10);
  return { col, row, colIndex: colLetterToIndex(col) };
}

/**
 * Formats a column index and row number into a coordinate string (e.g., 2, 5 -> "B5").
 */
export function formatCoordinate(colIndex: number, row: number): string {
  return `${colIndexToLetter(colIndex)}${row}`;
}

/**
 * Parses a range string (e.g., "A1:C10") into start and end coordinates.
 */
export function parseRange(rangeStr: string): {
  startCol: string;
  startRow: number;
  startColIndex: number;
  endCol: string;
  endRow: number;
  endColIndex: number;
} {
  const parts = rangeStr.split(":");
  if (parts.length === 1) {
    const parsed = parseCoordinate(parts[0]);
    return {
      startCol: parsed.col,
      startRow: parsed.row,
      startColIndex: parsed.colIndex,
      endCol: parsed.col,
      endRow: parsed.row,
      endColIndex: parsed.colIndex,
    };
  } else if (parts.length === 2) {
    const start = parseCoordinate(parts[0]);
    const end = parseCoordinate(parts[1]);
    return {
      startCol: start.col,
      startRow: start.row,
      startColIndex: start.colIndex,
      endCol: end.col,
      endRow: end.row,
      endColIndex: end.colIndex,
    };
  }
  throw new Error(`Invalid range format: ${rangeStr}`);
}
