// PDF Page Sizes (in points: 1pt = 1/72 inch)
export const PDF_PAGE_SIZES = {
  A4: [595.27, 841.89] as const,
  A3: [841.89, 1190.55] as const,
  LETTER: [612, 792] as const,
  LEGAL: [612, 1008] as const,
} as const;

export type PageSize = keyof typeof PDF_PAGE_SIZES;

// Watermark defaults
export const WATERMARK_DEFAULTS = {
  COLOR: { r: 0.62, g: 0.68, b: 0.75 },
  OPACITY: 0.5,
  SIZE: 48,
  ROTATION: -45,
  PADDING: 20,
} as const;

// Page number defaults
export const PAGE_NUMBER_DEFAULTS = {
  FONT_SIZE: 10,
  MARGIN: 25,
  COLOR: { r: 0.3, g: 0.4, b: 0.45 },
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500MB
  MAX_FILES: 50,
  MAX_SINGLE_FILE: 100 * 1024 * 1024, // 100MB
} as const;

// AI analysis
export const AI_LIMITS = {
  MAX_TEXT_LENGTH: 40000,
  DEFAULT_MODEL: 'gemini-1.5-flash',
} as const;

// Rate limits (matches server config)
export const RATE_LIMITS = {
  GEMINI_PROXY: 30, // per hour
  CONTACT: 3, // per hour
  FEEDBACK: 3, // per hour
} as const;

// App info
export const APP_INFO = {
  NAME: 'PDFMinty',
  VERSION: '1.0.0',
  URL: 'https://www.pdfminty.com',
  REPO_URL: 'https://github.com/ignitefitness455-dotcom/PdfMinty',
} as const;
