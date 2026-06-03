import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { PdfPreview } from "../components/PdfPreview";
import { triggerDownload, getFriendlyErrorMessage, getPdfJs } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import { PDFPageInfo } from "../types";

export default function RotatePage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [isDocumentLocked, setIsDocumentLocked] = useState<boolean>(false);
  const [pdfPages, setPdfPages] = useState<PDFPageInfo[]>([]);
  const [pdfDocument, setPdfDocument] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (completedResult) {
        URL.revokeObjectURL(completedResult.url);
      }
    };
  }, [completedResult]);

  useEffect(() => {
    let active = true;
    let loadingTask: any = null;

    const renderPDFThumbnails = async () => {
      setIsDocumentLocked(false);
      if (selectedFiles.length === 0) {
        setPdfPages([]);
        setPdfDocument(null);
        return;
      }

      setLoading(true);
      try {
        const primaryFile = selectedFiles[0];
        const arrayBuffer = await primaryFile.arrayBuffer();

        if (!active) return;

        let sanitizedBytes: any = new Uint8Array(arrayBuffer);
        try {
          const sanitizedResult = PDFSanitizer.sanitize(sanitizedBytes);
          sanitizedBytes = sanitizedResult.bytes;
        } catch (err: any) {
          if (err?.message?.includes("SECURED_LOCKED")) {
            setIsDocumentLocked(true);
            setLoading(false);
            showToast(
              "🔒 Standard secured/locked PDF file detected. Rotation is restricted. Use the Unlock tool first.",
              "error"
            );
            return;
          }
          throw err;
        }

        const pdfjs = await getPdfJs();
        loadingTask = pdfjs.getDocument({
          data: sanitizedBytes as any,
          useSystemFonts: true,
        });

        const pdf = await loadingTask.promise;
        if (!active) return;

        const pageCount = pdf.numPages;
        const previews: PDFPageInfo[] = [];

        for (let i = 1; i <= Math.min(pageCount, 150); i++) {
          if (!active) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });

          previews.push({
            index: i - 1,
            rotation: 0,
            thumbnailUrl: "",
            width: viewport.width,
            height: viewport.height,
          });
        }
        if (active) {
          setPdfDocument(pdf);
          setPdfPages(previews);
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          showToast("Info: Unable to render preview thumbnails for this document lock/format.", "info");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    renderPDFThumbnails();

    return () => {
      active = false;
      if (loadingTask && typeof loadingTask.destroy === "function") {
        loadingTask.destroy();
      }
    };
  }, [selectedFiles]);

  const handleFilesSelected = (files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) {
      showToast("Only PDF files are supported for rotation.", "error");
      return;
    }

    const file = pdfs[0];
    if (file.size > 50 * 1024 * 1024) {
      showToast(`File '${file.name}' exceeds the 50MB limit.`, "error");
      return;
    }

    setCompletedResult(null);
    setSelectedFiles([file]);
    showToast(`Loaded document: ${file.name}`, "success");
  };

  const handleThumbnailRotate = (idx: number) => {
    setPdfPages((prev) =>
      prev.map((p) => {
        if (p.index === idx) {
          return { ...p, rotation: ((p.rotation + 90) % 360) };
        }
        return p;
      })
    );
    showToast(`Page ${idx + 1} rotated locally in preview. Press Apply down here to compile.`, "info");
  };

  const handleBatchRotate = (deg: 90 | 180 | 270) => {
    setPdfPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + deg) % 360,
      }))
    );
    showToast(`All pages rotated clockwise +${deg}°. Click Apply status to save.`, "success");
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setPdfPages([]);
    setPdfDocument(null);
    setIsDocumentLocked(false);
    setCompletedResult(null);
  };

  const executeRotate = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const buffer = await primaryFile.arrayBuffer();
      const fileBytes = new Uint8Array(buffer);

      setProcessingProgress(40);
      const { createDedicatedWorker } = await import("../core/WorkerManager");
      const worker = createDedicatedWorker("rotate");

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, `rotated_${primaryFile.name}`, setCompletedResult);
          showToast("Document rotations applied successfully completely offline!", "success");
        } else {
          showToast(getFriendlyErrorMessage("Rotation application failed", error), "error");
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error("Rotate Worker Error:", err);
        showToast("Worker error occurred during rotate.", "error");
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      const pageRotations = pdfPages.map((p) => ({
        index: p.index,
        rotation: (p.rotation % 360) as 0 | 90 | 180 | 270,
      }));
      worker.postMessage({ type: "rotate", fileBytes, pageRotations }, [
        fileBytes.buffer,
      ]);
      setProcessingProgress(70);
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Rotation application failed", err), "error");
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadein relative z-10 font-sans text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link
            to="/"
            id="back-to-dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer decoration-none border-0 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Rotate Pages Tool Panel
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Form Side */}
          <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-slate-100 dark:border-slate-800 border-r">
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg font-black text-slate-905 dark:text-slate-50 leading-tight">
                  Rotate PDF Pages Clockwise
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Select a document and visually rotate individual page orientation offsets.
                </p>
              </div>

              {!completedResult && selectedFiles.length === 0 && (
                <FileUploader
                  placeholder="Drop a PDF file here or click to choose"
                  multiple={false}
                  accept="application/pdf"
                  onFilesSelected={handleFilesSelected}
                />
              )}

              {selectedFiles.length > 0 && !completedResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-800/40 text-xs">
                    <span className="font-semibold truncate text-slate-700 dark:text-slate-350 max-w-[170px]">
                      📂 {selectedFiles[0].name}
                    </span>
                    <button
                      type="button"
                      onClick={clearWorkspace}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-700 font-sans border-0 bg-transparent cursor-pointer"
                    >
                      Clear File
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Rotate All Pages Clockwise
                    </label>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-150 dark:border-slate-850/60">
                      <button
                        type="button"
                        onClick={() => handleBatchRotate(90)}
                        className="py-2.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all border-0 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs cursor-pointer hover:bg-slate-50 border border-slate-200 dark:border-slate-700 hover:scale-[1.02]"
                      >
                        +90° CW
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBatchRotate(180)}
                        className="py-2.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all border-0 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs cursor-pointer hover:bg-slate-50 border border-slate-200 dark:border-slate-700 hover:scale-[1.02]"
                      >
                        180° Flip
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBatchRotate(270)}
                        className="py-2.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all border-0 bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs cursor-pointer hover:bg-slate-50 border border-slate-200 dark:border-slate-700 hover:scale-[1.02]"
                      >
                        -90° (270°)
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                    💡 Click the quick batch buttons above to rotate all pages immediately, or click individual rotate buttons within the workspace preview. Select your rotation configuration and target layout before compiling.
                  </div>
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      Applying rotation states...
                    </p>
                    {processingProgress !== null && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        Progress: {processingProgress}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Result Screen */}
              {completedResult && (
                <div className="py-8 text-center space-y-5 animate-fadein">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-50">
                      Rotations Exported!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate max-w-sm mx-auto select-all">
                      {completedResult.filename}
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={clearWorkspace}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
                    >
                      Rotate Another File
                    </button>
                    <a
                      href={completedResult.url}
                      download={completedResult.filename}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer decoration-none scale-102 hover:scale-105 active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Download PDF Now
                    </a>
                  </div>
                </div>
              )}
            </div>

            {!loading && !completedResult && selectedFiles.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
                <button
                  type="button"
                  onClick={executeRotate}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-1 animate-none" />
                  <span>Apply Orientation & Save</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview Canvas Side */}
          <div className="lg:col-span-8 bg-slate-50/20 dark:bg-slate-950/10 p-6 md:p-8 flex flex-col justify-start overflow-y-auto max-h-[80vh] min-h-[400px]">
            <div className="mb-4">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Visual Document Rotation Workspace
              </span>
            </div>

            {selectedFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-600">
                <span>📄 Render preview thumbnail checks globally inside sandbox</span>
              </div>
            ) : isDocumentLocked ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl">
                <span className="text-2xl mb-2">🔒</span>
                <p className="text-xs font-black text-slate-700 dark:text-slate-350">
                  Standard Password Encrypted PDF
                </p>
                <Link
                  to="/unlock-pdf"
                  className="mt-4 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 decoration-none"
                >
                  Open Decryptor Tool
                </Link>
              </div>
            ) : (
              <PdfPreview
                pdfPages={pdfPages}
                pdfDocument={pdfDocument}
                activeTool="rotate"
                handleThumbnailRotate={handleThumbnailRotate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
