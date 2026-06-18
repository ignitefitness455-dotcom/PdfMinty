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

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  icon: string;
}

export const tools: ToolItem[] = [
  {
    id: "merge",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one single PDF easily.",
    category: "organize",
    path: "/merge-pdf",
    icon: "Merge",
  },
  {
    id: "compress",
    title: "Compress PDF",
    description: "Reduce PDF file size without losing premium quality.",
    category: "optimize",
    path: "/compress-pdf",
    icon: "Minimize2",
  },
  {
    id: "split",
    title: "Split PDF",
    description: "Split PDF pages into separate documents by page range.",
    category: "organize",
    path: "/split-pdf",
    icon: "Scissors",
  },
  {
    id: "reorder",
    title: "Organize PDF",
    description: "Rearrange, sort, and organize the pages of your PDF file.",
    category: "organize",
    path: "/reorder-pdf",
    icon: "ArrowUp",
  },
  {
    id: "extract",
    title: "Extract Pages",
    description: "Extract specific pages from your PDF file into a new document.",
    category: "organize",
    path: "/extract-pages-pdf",
    icon: "Layers",
  },
  {
    id: "img-to-pdf",
    title: "Image to PDF",
    description: "Convert JPG, PNG, and other images to PDF in seconds.",
    category: "convert",
    path: "/image-to-pdf",
    icon: "ImageIcon",
  },
  {
    id: "pdf-to-img",
    title: "PDF to Image",
    description: "Convert PDF pages into high-quality companion images.",
    category: "convert",
    path: "/pdf-to-image",
    icon: "Layers",
  },
  {
    id: "delete-pages",
    title: "Delete Pages",
    description: "Remove unwanted pages from your PDF file easily.",
    category: "organize",
    path: "/organize",
    icon: "Trash2",
  },
  {
    id: "rotate",
    title: "Rotate PDF",
    description: "Rotate one or all pages of your PDF document easily.",
    category: "organize",
    path: "/rotate-pdf",
    icon: "RotateCw",
  },
  {
    id: "watermark",
    title: "Add Watermark",
    description: "Add a custom text watermark seal over your PDF pages.",
    category: "security",
    path: "/watermark-pdf",
    icon: "Stamp",
  },
  {
    id: "page-numbers",
    title: "Page Numbers",
    description: "Add clean, structured page numbers to your PDF pages.",
    category: "organize",
    path: "/add-page-numbers",
    icon: "Hash",
  },
  {
    id: "add-blank",
    title: "Add Blank Page",
    description: "Add empty clean pages into any position of your PDF file.",
    category: "organize",
    path: "/add-blank-page",
    icon: "FileCode",
  },
  {
    id: "protect",
    title: "Protect PDF",
    description: "Lock your PDF with a strong security password locally.",
    category: "security",
    path: "/protect-pdf",
    icon: "Lock",
  },
  {
    id: "unlock",
    title: "Unlock PDF",
    description: "Remove passwords and locks from your PDF document easily.",
    category: "security",
    path: "/unlock-pdf",
    icon: "Unlock",
  },
  {
    id: "ai-analyze",
    title: "AI Analyze",
    description: "Summarize, analyze, and inspect your PDF document content using secure offline local text parsing boosted by premium AI assistance.",
    category: "intelligence",
    path: "/ai-analyze",
    icon: "Sparkles",
  }
];

