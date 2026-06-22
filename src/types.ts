export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ToolId =
  | 'merge' | 'split' | 'compress' | 'rotate'
  | 'delete-pages' | 'extract-pages' | 'reorder'
  | 'watermark' | 'page-numbers' | 'add-blank'
  | 'protect' | 'unlock' | 'image-to-pdf'
  | 'pdf-to-image' | 'intelligence';

export interface PDFPageInfo {
  index: number;
  rotation: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}
