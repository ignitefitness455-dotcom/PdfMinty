export interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  icon: string;
}

export const tools: Tool[] = [
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description:
      'Combine multiple PDF files into a single, clean document in any order you choose.',
    category: 'page-operations',
    path: '/merge-pdf',
    icon: 'Merge',
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    description:
      'Extract ranges of pages or split custom pages into multi-part individual documents.',
    category: 'page-operations',
    path: '/split-pdf',
    icon: 'Scissors',
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description:
      'Reduce file size footprint using professional compression schemes purely in your browser.',
    category: 'utilities',
    path: '/compress-pdf',
    icon: 'Minimize2',
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    description:
      'Rotate single pages or the entire document pages 90, 180, or 270 degrees clockwise.',
    category: 'page-operations',
    path: '/rotate-pdf',
    icon: 'RotateCw',
  },
  {
    id: 'delete-pages-pdf',
    title: 'Delete Pages',
    description:
      'Selectively strip out unwanted, trailing, or confidential pages from your master files.',
    category: 'organize',
    path: '/delete-pages-pdf',
    icon: 'Trash2',
  },
  {
    id: 'watermark-pdf',
    title: 'Watermark PDF',
    description:
      'Superimpose elegant, custom diagonal text stamps with configurable size and transparency.',
    category: 'security-edit',
    path: '/watermark-pdf',
    icon: 'Bookmark',
  },
  {
    id: 'add-page-numbers',
    title: 'Page Numbers',
    description: 'Stitch standard page indices automatically onto document page footer panels.',
    category: 'security-edit',
    path: '/add-page-numbers',
    icon: 'Hash',
  },
  {
    id: 'add-blank-page',
    title: 'Add Blank Page',
    description:
      'Incorporate empty page spacing into start, middle, or end of your document flows.',
    category: 'organize',
    path: '/add-blank-page',
    icon: 'FilePlus',
  },
  {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description:
      'Encrypt and secure your sensitive PDFs using state-of-the-art browser password standard hashes.',
    category: 'security-edit',
    path: '/protect-pdf',
    icon: 'Shield',
  },
  {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description:
      'Strip document lock credentials from your standard user files for clear, unlocked reading.',
    category: 'security-edit',
    path: '/unlock-pdf',
    icon: 'Lock',
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert multiple PNG or JPG photos into clean formatted PDF pages instantly.',
    category: 'convert',
    path: '/image-to-pdf',
    icon: 'Image',
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to Image',
    description:
      'Convert multiple pages from document directly into portable standard image canvases.',
    category: 'convert',
    path: '/pdf-to-image',
    icon: 'Eye',
  },
  {
    id: 'ai-analyze',
    title: 'AI Analyze',
    description:
      'Summarize, analyze, and inspect your PDF document content using secure offline local text parsing boosted by premium AI assistance.',
    category: 'intelligence',
    path: '/intelligence',
    icon: 'Sparkles',
  },
];

export const PDF_PAGE_SIZES = {
  A4: [595.28, 841.89] as readonly [number, number],
  Letter: [612, 792] as readonly [number, number],
  Legal: [612, 1008] as readonly [number, number],
};

export const WATERMARK_DEFAULTS = {
  opacity: 0.35,
  size: 50,
  rotationDegrees: 45,
  colorHex: '#94a3b8',
};

export const PAGE_NUMBER_DEFAULTS = {
  position: 'bottom-right' as const,
  format: 'Page {n} of {total}',
  startFrom: 1,
  skipFirstPage: false,
};

export const UPLOAD_LIMITS = {
  MAX_TOTAL_SIZE: 150 * 1024 * 1024,
  MAX_FILES: 50,
  MAX_SINGLE_FILE: 100 * 1024 * 1024,
};

export const TOOL_SIZE_LIMITS: Record<string, { maxSingleMB: number; maxTotalMB?: number }> = {
  'merge-pdf': { maxSingleMB: 50, maxTotalMB: 150 },
  'split-pdf': { maxSingleMB: 50 },
  'compress-pdf': { maxSingleMB: 75 },
  'rotate-pdf': { maxSingleMB: 50 },
  'delete-pages-pdf': { maxSingleMB: 50 },
  'watermark-pdf': { maxSingleMB: 50 },
  'add-page-numbers': { maxSingleMB: 50 },
  'add-blank-page': { maxSingleMB: 50 },
  'protect-pdf': { maxSingleMB: 100 },
  'unlock-pdf': { maxSingleMB: 100 },
  'image-to-pdf': { maxSingleMB: 20, maxTotalMB: 100 },
  'pdf-to-image': { maxSingleMB: 35 },
  'ai-analyze': { maxSingleMB: 15 },
  'extract-pages-pdf': { maxSingleMB: 50 },
  'reorder-pdf': { maxSingleMB: 50 },
};

export const AI_LIMITS = {
  MAX_TEXT_LENGTH: 30000,
  DEFAULT_MODEL: 'gemini-3.5-flash',
};

export const RATE_LIMITS = {
  GEMINI_PROXY: 50,
  CONTACT: 10,
  FEEDBACK: 10,
};

export const APP_INFO = {
  NAME: 'PDFMinty',
  VERSION: '1.0.0',
  URL: 'https://pdfminty.com',
  REPO_URL: 'https://github.com/pdfminty/pdfminty',
};
