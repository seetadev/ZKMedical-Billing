/**
 * TEMPORARY type shim for socialcalc-ai@1.1.2.
 *
 * The package's dist/index.d.ts omits these runtime exports, so tsc rejects the app's calls.
 * Signatures come from the package source (JSDoc / function bodies).
 *
 * TODO: delete this file once socialcalc-ai ships typings for these functions
 * (fix/missing-typings on aspiringsdgs/socialcalc-ai).
 */
import "socialcalc-ai"; // makes this file a module so the block below augments, not replaces, the package types

declare module "socialcalc-ai" {
  export interface SheetSummary {
    id: string;
    name: string;
    title: string;
    htmlContent: string;
  }
  export interface WorkbookInfo {
    numsheets: number;
    sheets: string[];
  }
  export interface CellFormatting {
    font: string | null;
    fontValue: string | null;
    fontSize: string | null;
    fontFamily: string | null;
    bold: boolean;
    italic: boolean;
    color: string | null;
    bgcolor: string | null;
    align: string | null;
    valueFormat: string | null;
    textFormat: string | null;
    borders: { top: string | null; bottom: string | null; left: string | null; right: string | null };
    coord: string;
  }
  export interface CellFormattingInput {
    fontSize?: string | null;
    fontColor?: any;
    bgColor?: any;
    borders?: { top?: string; bottom?: string; left?: string; right?: string };
    valueFormat?: string;
  }
  export type DeviceType = "default" | "iPod" | "iPad" | "iPhone" | "Android";

  export function initializeApp(data: string): void;
  export function viewFile(filename: string, data: string): void;
  export function getDeviceType(): DeviceType;
  export function getSpreadsheetContent(): string;
  export function getCSVContent(): string;
  export function getCurrentHTMLContent(): string;
  export function getAllSheetsData(): SheetSummary[];
  export function getWorkbookInfo(): WorkbookInfo;
  export function activateFooterButton(index: number): void;
  export function undo(): void;
  export function redo(): void;
  export function getCellFormatting(coord?: string): CellFormatting | null;
  export function updateCellValueAndFormat(
    coord: string,
    val: string | number | null | undefined,
    formatting?: CellFormattingInput,
    options?: { detectTypes?: boolean }
  ): boolean;
  export function applySelectedFormatting(
    coord: string,
    formatting: { fontSize?: string | null; fontColor?: string | null; bgColor?: string | null }
  ): void;
  export function changeSheetBackgroundColor(colorName: string): void;
  export function changeSheetFontColor(colorName: string): void;
  export function addLogo(coord: string | Record<string, string>, url: string): Promise<any>;
  export function removeLogo(coord: string | Record<string, string>): Promise<any>;
  /** Installs a global, idempotent editor mouse patch. Returns nothing (no cleanup handle). */
  export function setupMouseListener(): void;
  /** Returns a cleanup function that removes only this listener. */
  export function setupCellChangeListener(callback: (coord: string, detail: any) => void): () => void;
  export function enableTouchScroll(): void;
  export function disableTouchScroll(): void;
  export function addInvoiceData(invoiceData: any): Promise<any>;
  export function clearInvoiceData(): Promise<any>;
}
