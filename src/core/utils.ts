// PDF.js singleton with lazy initialization
let pdfJsInstance: typeof import("pdfjs-dist") | null = null;
export async function getPdfJs() {
  if (!pdfJsInstance) {
    pdfJsInstance = await import("pdfjs-dist");
    pdfJsInstance.GlobalWorkerOptions.workerSrc = 
      new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  return pdfJsInstance;
}

// User-friendly error messages
export function getFriendlyErrorMessage(toolName: string, error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("SECURED_LOCKED")) return `${toolName} failed: PDF is password-protected. Use Unlock PDF first.`;
  if (msg.includes("Invalid PDF")) return `${toolName} failed: File is corrupted or not a valid PDF.`;
  if (msg.includes("No PDF header")) return `${toolName} failed: File does not appear to be a PDF.`;
  return `${toolName} failed: ${msg}`;
}

// Unicode-safe text truncation
export function truncateTextGrapheme(text: string, maxLength: number): string {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = Array.from(segmenter.segment(text));
    return segments.length <= maxLength 
      ? text 
      : segments.slice(0, maxLength).map(s => s.segment).join("") + "…";
  }
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
}

// Download trigger with confetti
export function triggerDownload(
  bytes: Uint8Array, 
  filename: string,
  mimeType: string = "application/pdf"
): void {
  const blob = new Blob([bytes as any], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
  
  // Confetti celebration
  import("canvas-confetti").then(({ default: confetti }) => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  });
}

// Tool chunk prefetching for faster navigation
const chunkImports: Record<string, () => Promise<any>> = {
  "merge":             () => import("../pages/MergePage"),
  "merge-pdf":         () => import("../pages/MergePage"),
  "compress":          () => import("../pages/CompressPage"),
  "compress-pdf":      () => import("../pages/CompressPage"),
  "split":             () => import("../pages/SplitPage"),
  "split-pdf":         () => import("../pages/SplitPage"),
  "reorder":           () => import("../pages/ReorderPdfPage"),
  "reorder-pdf":       () => import("../pages/ReorderPdfPage"),
  "extract":           () => import("../pages/ExtractPagesPdfPage"),
  "extract-pages-pdf": () => import("../pages/ExtractPagesPdfPage"),
  "img-to-pdf":        () => import("../pages/ImgToPdfPage"),
  "image-to-pdf":      () => import("../pages/ImgToPdfPage"),
  "pdf-to-img":        () => import("../pages/PdfToImgPage"),
  "pdf-to-image":      () => import("../pages/PdfToImgPage"),
  "delete-pages":      () => import("../pages/DeletePagesPage"),
  "organize":          () => import("../pages/DeletePagesPage"),
  "rotate":            () => import("../pages/RotatePage"),
  "rotate-pdf":        () => import("../pages/RotatePage"),
  "watermark":         () => import("../pages/WatermarkPage"),
  "watermark-pdf":     () => import("../pages/WatermarkPage"),
  "page-numbers":      () => import("../pages/PageNumbersPage"),
  "add-page-numbers":  () => import("../pages/PageNumbersPage"),
  "protect":           () => import("../pages/ProtectPage"),
  "protect-pdf":       () => import("../pages/ProtectPage"),
  "unlock":            () => import("../pages/UnlockPage"),
  "unlock-pdf":        () => import("../pages/UnlockPage"),
  "add-blank":         () => import("../pages/AddBlankPage"),
  "add-blank-page":    () => import("../pages/AddBlankPage"),
  "ai-analyze":        () => import("../pages/AiAnalyzePage"),
  "intelligence":      () => import("../pages/AiAnalyzePage"),
};

export function prefetchToolChunk(toolId: string): void {
  const importFn = chunkImports[toolId];
  if (importFn && typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => importFn(), { timeout: 2000 });
  }
}
