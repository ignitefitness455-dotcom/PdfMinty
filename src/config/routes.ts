import { TOOLS } from './seo-data';

export const SITE_URL = 'https://pdfminty.com';

export const ROUTES = {
  HOME: '/',
  MERGE: `/${TOOLS.find((t) => t.id === 'merge')?.slug || 'merge-pdf'}`,
  SPLIT: `/${TOOLS.find((t) => t.id === 'split')?.slug || 'split-pdf'}`,
  ROTATE: `/${TOOLS.find((t) => t.id === 'rotate')?.slug || 'rotate-pdf'}`,
  DELETE_PAGES: `/${TOOLS.find((t) => t.id === 'delete-pages')?.slug || 'delete-pages-pdf'}`,
  EXTRACT_PAGES: `/${TOOLS.find((t) => t.id === 'extract-pages')?.slug || 'extract-pages-pdf'}`,
  REORDER: `/${TOOLS.find((t) => t.id === 'reorder')?.slug || 'reorder-pdf'}`,
  WATERMARK: `/${TOOLS.find((t) => t.id === 'watermark')?.slug || 'watermark-pdf'}`,
  PAGE_NUMBERS: `/${TOOLS.find((t) => t.id === 'page-numbers')?.slug || 'add-page-numbers'}`,
  ADD_BLANK: `/${TOOLS.find((t) => t.id === 'add-blank')?.slug || 'add-blank-page'}`,
  PROTECT: `/${TOOLS.find((t) => t.id === 'protect')?.slug || 'protect-pdf'}`,
  UNLOCK: `/${TOOLS.find((t) => t.id === 'unlock')?.slug || 'unlock-pdf'}`,
  IMG_TO_PDF: `/${TOOLS.find((t) => t.id === 'image-to-pdf')?.slug || 'image-to-pdf'}`,
  PDF_TO_IMG: `/${TOOLS.find((t) => t.id === 'pdf-to-image')?.slug || 'pdf-to-image'}`,
  AI_ANALYZE: `/${TOOLS.find((t) => t.id === 'intelligence')?.slug || 'intelligence'}`,
  GRAYSCALE: `/${TOOLS.find((t) => t.id === 'grayscale-pdf')?.slug || 'grayscale-pdf'}`,
  FLATTEN: `/${TOOLS.find((t) => t.id === 'flatten-pdf')?.slug || 'flatten-pdf'}`,
  REPAIR: `/${TOOLS.find((t) => t.id === 'repair-pdf')?.slug || 'repair-pdf'}`,
  TRUST_ARTICLE: `/${TOOLS.find((t) => t.id === 'trust-article')?.slug || 'is-it-safe-to-upload-pdf-to-online-tools'}`,
};
export default ROUTES;
