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
    errorStr.includes("no pdf header found") ||
    errorStr.includes("failed to parse pdf document") ||
    errorStr.includes("invalid pdf") ||
    errorStr.includes("formaterror") ||
    errorStr.includes("pdfdocument")
  ) {
    return `${prefix}: ফাইলটি পাসওয়ার্ড-লকড বা এনক্রিপ্ট করা রয়েছে। অনুগ্রহ করে প্রথমে "Unlock PDF" টুল ব্যবহার করে লকটি খুলুন! (The file is encrypted or locked. Please use the "Unlock PDF" tool first to decrypt it.)`;
  }
  
  if (
    errorStr.includes("incorrect password") || 
    errorStr.includes("decrypt") || 
    errorStr.includes("bad decrypt")
  ) {
    return `${prefix}: ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন। (Incorrect password! Better luck next time.)`;
  }
  
  return `${prefix}: ${rawError?.message || rawError}`;
};

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
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

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

  // 1. Prefetch the route's lazy-loaded page component
  const loader = prefetchMap[cacheKey];
  if (loader) {
    loader().catch((err) => console.debug("Prefetching route chunk error:", err));
  }

  // 2. Proactively prefetch full heavy processing libraries (pdf-lib and pdfjs-dist)
  import("pdf-lib").catch((err) => console.debug("Prefetching pdf-lib error:", err));
  getPdfJs().catch((err) => console.debug("Prefetching pdfjs-dist error:", err));
};

