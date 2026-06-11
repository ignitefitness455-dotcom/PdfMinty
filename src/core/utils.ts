import confetti from "canvas-confetti";

let cachedPdfJs: any = null;

export const getPdfJs = async () => {
  if (cachedPdfJs) return cachedPdfJs;

  const pdfjs = await import("pdfjs-dist");

  // FIX: Worker is now initialized only here, in a single place.
  // Previously, CompressPage and SplitPage each ran their own
  // pdfjsLib.GlobalWorkerOptions.workerSrc assignment at import time,
  // creating a duplicate initialization that conflicted with this
  // function in production builds. The result was a worker that never
  // attached correctly, causing loadingTask.promise to hang forever,
  // setLoading(false) to never be called, and the uploaded file to
  // silently disappear when the component unmounted.
  const workerUrl = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  cachedPdfJs = pdfjs;
  return pdfjs;
};

export const getFriendlyErrorMessage = (prefix: string, rawError: any): string => {
  const errorStr = String(rawError?.message || rawError || "").toLowerCase();
  
  if (
    errorStr.includes("secured_locked") ||
    errorStr.includes("/encrypt") ||
    errorStr.includes("no pdf header found") ||
    errorStr.includes("failed to parse pdf document") ||
    errorStr.includes("invalid pdf") ||
    errorStr.includes("formaterror") ||
    errorStr.includes("holds encrypted content") ||
    errorStr.includes("encrypted content")
  ) {
    return `${prefix}: The file is encrypted or locked. Please use the "Unlock PDF" tool first to decrypt it.`;
  }
  
  if (
    errorStr.includes("pdf header magic") ||
    errorStr.includes("missing the standard") ||
    errorStr.includes("header signature")
  ) {
    return `${prefix}: Incompatible file format. The file is missing a standard '%PDF' header signature.`;
  }
  
  if (
    errorStr.includes("incorrect password") || 
    errorStr.includes("decrypt") || 
    errorStr.includes("bad decrypt")
  ) {
    return `${prefix}: Incorrect password! Please verify and try again.`;
  }
  
  return `${prefix}: ${rawError?.message || rawError}`;
};

export function truncateTextGrapheme(text: string, maxGraphemes: number): string {
  const normalized = text.normalize("NFC");
  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    let count = 0;
    let result = "";
    for (const segment of segmenter.segment(normalized)) {
      if (count >= maxGraphemes) break;
      result += segment.segment;
      count++;
    }
    return result;
  } catch (e) {
    return normalized.substring(0, maxGraphemes);
  }
}

export const triggerDownload = (
  bytes: Uint8Array,
  filename: string,
  setCompletedResult: (res: { url: string; filename: string; type: string } | null) => void
) => {
  const mimeType = filename.endsWith(".zip") ? "application/zip" : "application/pdf";
  const blob = new Blob([bytes as BlobPart], { type: mimeType });

  const url = URL.createObjectURL(blob);
  setCompletedResult({ url, filename, type: mimeType });

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  // Delay removal to allow mobile browsers time to process the download trigger
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 300);

  try {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.8 },
    });
  } catch (_) {}
};

// Lazy Page chunks preload map to avoid heavy wait times when users hover or focus the tool card
const prefetchMap: Record<string, () => Promise<any>> = {
  "merge-pdf": () => import("../pages/MergePage"),
  "split-pdf": () => import("../pages/SplitPage"),
  "compress-pdf": () => import("../pages/CompressPage"),
  "rotate-pdf": () => import("../pages/RotatePage"),
  "organize": () => import("../pages/DeletePagesPage"),
  "watermark-pdf": () => import("../pages/WatermarkPage"),
  "add-page-numbers": () => import("../pages/PageNumbersPage"),
  "add-blank-page": () => import("../pages/AddBlankPage"),
  "protect-pdf": () => import("../pages/ProtectPage"),
  "unlock-pdf": () => import("../pages/UnlockPage"),
  "image-to-pdf": () => import("../pages/ImgToPdfPage"),
  "pdf-to-image": () => import("../pages/PdfToImgPage"),
  "intelligence": () => import("../pages/AiAnalyzePage"),
};

const prefetchedSet = new Set<string>();

export const prefetchToolChunk = (slug: string) => {
  const cacheKey = slug.toLowerCase();
  if (prefetchedSet.has(cacheKey)) return;

  prefetchedSet.add(cacheKey);

  // FIX: আগে hover করলেই pdf-lib এবং pdfjs-dist (মোট ~2MB+) একসাথে prefetch
  // হতো, যার ফলে HomePage-এ প্রবেশের সাথে সাথেই initial load অনেক ভারী হয়ে যেত।
  // এখন শুধু নির্দিষ্ট tool-এর route chunk prefetch করা হয়।
  // pdf-lib এবং pdfjs-dist lazy load হবে শুধুমাত্র যখন user সত্যিকারের
  // tool page-এ navigate করবে — তখন tool page নিজেই এগুলো import করবে।
  const loader = prefetchMap[cacheKey];
  if (loader) {
    loader().catch((err) => console.debug("Prefetching route chunk error:", err));
  }
};

