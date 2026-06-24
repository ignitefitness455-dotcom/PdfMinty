import confetti from 'canvas-confetti';
import type * as PDFJSTypes from 'pdfjs-dist';

import { PDFSanitizer } from './PDFSanitizer';

export { WorkerManager } from './WorkerManager';

let cachedPdfJs: typeof import('pdfjs-dist') | null = null;

if (import.meta.hot) {
  import.meta.hot.dispose(() => { cachedPdfJs = null; });
}

export const getPdfJs = async () => {
  if (cachedPdfJs) return cachedPdfJs;
  const pdfjs = await import('pdfjs-dist');
  // Worker must be initialized in exactly ONE place. Duplicate GlobalWorkerOptions.workerSrc
  // assignments across multiple page components previously caused the worker to never attach
  // correctly, hanging loadingTask.promise forever and silently dropping uploaded files.
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  cachedPdfJs = pdfjs;
  return pdfjs;
};

export const getFriendlyErrorMessage = (prefix: string, rawError: unknown): string => {
  const message = rawError instanceof Error ? rawError.message : String(rawError || '');
  const errorStr = message.toLowerCase();
  if (['secured_locked', '/encrypt', 'no pdf header found', 'failed to parse pdf document', 'invalid pdf', 'formaterror', 'encrypted content'].some(s => errorStr.includes(s))) {
    return `${prefix}: The file is encrypted or locked. Please use the "Unlock PDF" tool first to decrypt it.`;
  }
  if (['pdf header magic', 'missing the standard', 'header signature'].some(s => errorStr.includes(s))) {
    return `${prefix}: Incompatible file format. The file is missing a standard '%PDF' header signature.`;
  }
  if (['incorrect password', 'decrypt', 'bad decrypt'].some(s => errorStr.includes(s))) {
    return `${prefix}: Incorrect password! Please verify and try again.`;
  }
  return `${prefix}: ${message}`;
};

export function truncateTextGrapheme(text: string, maxGraphemes: number): string {
  const normalized = text.normalize('NFC');
  try {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    let count = 0, result = '';
    for (const segment of segmenter.segment(normalized)) {
      if (count >= maxGraphemes) break;
      result += segment.segment;
      count++;
    }
    return result;
  } catch {
    return normalized.substring(0, maxGraphemes);
  }
}

export const triggerDownload = (
  bytes: Uint8Array,
  filename: string,
  setCompletedResult?: (res: { url: string; filename: string; type: string } | null) => void
) => {
  const mimeType = filename.endsWith('.zip') ? 'application/zip' : 'application/pdf';
  const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  if (setCompletedResult) {
    setCompletedResult({ url, filename, type: mimeType });
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  // 1000ms delay + explicit revokeObjectURL: prevents a mobile-browser download race condition
  // AND a memory leak from un-revoked blob URLs that was previously hit in production.
  setTimeout(() => {
    if (document.body.contains(link)) document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);

  try {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.8 } });
  } catch { /* non-critical */ }
};

export interface PreprocessResult {
  pdf: unknown;
  sanitizedBytes: Uint8Array;
}
export interface PreprocessOptions {
  skipEncryptionCheck?: boolean;
  onEncrypted?: () => void;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
  customLockMessage?: string;
}

export async function preprocessAndLoadPdf(file: File, options?: PreprocessOptions): Promise<PreprocessResult> {
  const arrayBuffer = await file.arrayBuffer();
  let sanitizedBytes = new Uint8Array(arrayBuffer) as any;
  try {
    const sanResult = PDFSanitizer.sanitize(sanitizedBytes, { skipEncryptionCheck: options?.skipEncryptionCheck });
    sanitizedBytes = sanResult.bytes as Uint8Array;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err || '');
    if (message.includes('SECURED_LOCKED')) {
      options?.onEncrypted?.();
      options?.showToast?.(
        options?.customLockMessage || '🔒 Secured/locked PDF detected. Please use the Unlock tool first.',
        'error'
      );
    }
    throw err;
  }
  const pdfjs = (await getPdfJs()) as typeof PDFJSTypes;
  const loadingTask = pdfjs.getDocument({ data: sanitizedBytes });
  const pdf = await loadingTask.promise;
  return { pdf, sanitizedBytes };
}