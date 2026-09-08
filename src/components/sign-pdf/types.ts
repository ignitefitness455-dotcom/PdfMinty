export type FieldType = 'signature' | 'initials' | 'text' | 'date' | 'checkmark';

export interface PlacedField {
  id: string;
  type: FieldType;
  pageNumber: number; // 1-indexed (matching PDF.js & pdf-lib)
  x: number; // percentage 0 to 100 relative to page width
  y: number; // percentage 0 to 100 relative to page height
  width: number; // width in unscaled page points / pixels
  height: number; // height in unscaled page points / pixels
  value: string; // signature PNG data URL, text string, date, or '✓'
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  isSigned?: boolean;
}

export interface PageInfo {
  pageNumber: number; // 1-indexed
  width: number; // points (72dpi default)
  height: number;
  aspectRatio: number;
}

export interface SignatureData {
  type: 'draw' | 'type' | 'upload';
  dataUrl: string;
}

export interface ToolHistoryState {
  fields: PlacedField[];
}
