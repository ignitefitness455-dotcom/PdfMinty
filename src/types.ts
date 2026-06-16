export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export type ToolType =
  | "merge"
  | "split"
  | "reorder"
  | "extract"
  | "rotate"
  | "protect"
  | "unlock"
  | "page-numbers"
  | "watermark"
  | "add-blank"
  | "delete-pages"
  | "img-to-pdf"
  | "pdf-to-img"
  | "compress"
  | "ai-analyze";

export interface PDFPageInfo {
  index: number;
  rotation: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export interface LazyPDFPageProps {
  pdfDoc: any;
  pageIndex: number;
  rotation: number;
  onPageSelect?: (index: number) => void;
  isSelected?: boolean;
}