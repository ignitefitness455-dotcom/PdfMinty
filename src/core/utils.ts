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
  const blob = new Blob([bytes], { type: mimeType });
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
const prefetchMap: Record<string, () => Promise<void>> = {};
export function prefetchToolChunk(toolId: string): void {
  if (!prefetchMap[toolId]) {
    prefetchMap[toolId] = () => import(`../pages/${toolId}Page.tsx`);
  }
  // Use requestIdleCallback for non-critical prefetching
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => prefetchMap[toolId](), { timeout: 2000 });
  }
}
