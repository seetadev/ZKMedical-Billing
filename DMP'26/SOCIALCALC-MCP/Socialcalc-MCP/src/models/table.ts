/**
 * Represents a structured table range within a sheet.
 */
export class Table {
  name: string;
  range: string; // e.g. "A1:D10"
  headers: string[];

  constructor(name: string, range: string, headers: string[] = []) {
    this.name = name;
    this.range = range;
    this.headers = headers;
  }
}
