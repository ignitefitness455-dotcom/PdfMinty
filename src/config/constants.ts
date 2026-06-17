// @ts-ignore
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
export const PDFJS_WORKER_SRC = pdfjsWorker;

export const PDF_PAGE_SIZES = {
  A4: [595.28, 841.89] as const,
  Letter: [612, 792] as const,
  Legal: [612, 1008] as const,
  A3: [841.89, 1190.55] as const,
};

export const COMPRESS_QUALITY = {
  low: { dpi: 72, jpegQuality: 0.6 },
  medium: { dpi: 96, jpegQuality: 0.75 },
  high: { dpi: 150, jpegQuality: 0.85 },
  metadata: null, // strip metadata only
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const MAX_FILES = 20;

export const WATERMARK_DEFAULTS = {
  text: "CONFIDENTIAL",
  rotation: -45,
  opacity: 0.3,
  color: [0.7, 0.7, 0.7] as [number, number, number],
  fontSize: 42,
};

export const PAGE_NUMBER_DEFAULTS = {
  position: "bottom-center" as const,
  startNumber: 1,
  skipFirst: false,
};

export const AI_ANALYSIS = {
  MAX_PAGES: 50,
  MAX_TEXT_LENGTH: 10000,
  API_ENDPOINT: "/api/gemini-proxy",
};
