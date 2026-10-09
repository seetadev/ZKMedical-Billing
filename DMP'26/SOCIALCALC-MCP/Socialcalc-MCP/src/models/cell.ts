export interface CellBorder {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export class Cell {
  coord: string; // e.g. "A1"
  text?: string; // t attribute
  val?: number; // v attribute
  formula?: string; // formula string from vtf attribute
  valuetype?: string; // type from vtf (e.g. n, nt, nd, n$, n%, nl, e)
  
  // Style registry indices
  fontIndex?: number; // f attribute
  textColorIndex?: number; // c attribute
  bgColorIndex?: number; // bg attribute
  cellFormatIndex?: number; // cf attribute
  layoutIndex?: number; // l attribute
  nonTextValueFormatIndex?: number; // ntvf attribute
  textValueFormatIndex?: number; // tvf attribute
  
  borders?: CellBorder; // b attribute (top:right:bottom:left)
  colspan?: number;
  rowspan?: number;
  comment?: string; // comment attribute

  constructor(coord: string) {
    this.coord = coord.toUpperCase();
  }

  /**
   * Checks if this cell has any meaningful data or styling.
   */
  isEmpty(): boolean {
    return (
      this.text === undefined &&
      this.val === undefined &&
      this.formula === undefined &&
      this.fontIndex === undefined &&
      this.textColorIndex === undefined &&
      this.bgColorIndex === undefined &&
      this.cellFormatIndex === undefined &&
      this.layoutIndex === undefined &&
      this.nonTextValueFormatIndex === undefined &&
      this.textValueFormatIndex === undefined &&
      this.borders === undefined &&
      this.colspan === undefined &&
      this.rowspan === undefined &&
      this.comment === undefined
    );
  }
}
