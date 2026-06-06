import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { PdfPreview } from "../components/PdfPreview";
import { triggerDownload, getPdfJs } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Trash2 from "lucide-react/icons/trash-2";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import { PDFPageInfo } from "../types";
import { UPLOAD_LIMITS } from "../config/constants";

export default function DeletePagesPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [isDocumentLocked, setIsDocumentLocked] = useState<boolean>(false);
  const [pdfPages, setPdfPages] = useState<PDFPageInfo[]>([]);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
  const [rangeInputText, setRangeInputText] = useState("");

  const applyRangeSelection = () => {
    if (!pdfPages.length) return;
    const totalPages = pdfPages.length;
    const indices: number[] = [];
    const segments = rangeInputText.replace(/\s+/g, "").split(",");

    for (const segment of segments) {
      if (segment.includes("-")) {
        const [startStr, endStr] = segment.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const lower = Math.max(1, Math.min(start, totalPages));
          const upper = Math.max(1, Math.min(end, totalPages));
          for (
            let i = Math.min(lower, upper);
            i <= Math.max(lower, upper);
            i++
          ) {
            indices.push(i - 1);
          }
        }
      } else {
        const page = parseInt(segment, 10);
        if (!isNaN(page)) {
          const idx = page - 1;
          if (idx >= 0 && idx < totalPages) {
            indices.push(idx);
          }
        }
      }
    }

    if (indices.length === 0) {
      showToast("Invalid formats or page numbers out of range", "error");
      return;
    }

    const uniqueSet = Array.from(new Set([...pagesToDelete, ...indices])).sort((a, b) => a - b);
    setPagesToDelete(uniqueSet);
    showToast(`Added ${indices.length} page(s) to selector!`, "success");
    setRangeInputText("");
  };

  const selectEvenPages = () => {
    const evenIndices = pdfPages.map(p => p.index).filter(idx => idx % 2 === 1);
    setPagesToDelete(Array.from(new Set([...pagesToDelete, ...evenIndices])));
    showToast("Even numbered source pages queued.", "info");
  };

  const selectOddPages = () => {
    const oddIndices = pdfPages.map(p => p.index).filter(idx => idx % 2 === 0);
    setPagesToDelete(Array.from(new Set([...pagesToDelete, ...oddIndices])));
    showToast("Odd numbered source pages queued.", "info");
  };

  const clearSelection = () => {
    setPagesToDelete([]);
    showToast("Reset current selection markers.", "info");
  };

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
        setPagesToDelete([]);
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
              "🔒 Standard secured/locked PDF file detected. Slicing/deletion is restricted. Use the Unlock tool first.",
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
      showToast("Only PDF files are supported for deleting pages.", "error");
      return;
    }

    const file = pdfs[0];
    if (file.size > UPLOAD_LIMITS.MAX_SINGLE_FILE) {
      showToast(`File '${file.name}' exceeds the ${UPLOAD_LIMITS.MAX_SINGLE_FILE / (1024 * 1024)}MB limit.`, "error");
      return;
    }

    setCompletedResult(null);
    setSelectedFiles([file]);
    showToast(`Loaded document: ${file.name}`, "success");
  };

  const handleSelectPageToDelete = (idx: number) => {
    setPagesToDelete((prev) =>
      prev.includes(idx) ? prev.filter((p) => p !== idx) : [...prev, idx]
    );
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setPdfPages([]);
    setPdfDocument(null);
    setPagesToDelete([]);
    setIsDocumentLocked(false);
    setCompletedResult(null);
  };

  const executeDeletePages = async () => {
    if (selectedFiles.length === 0) return;
    if (pagesToDelete.length === 0) {
      showToast("Please tap on at least one page preview card on the right first.", "info");
      return;
    }

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const buffer = await primaryFile.arrayBuffer();
      const fileBytes = new Uint8Array(buffer);

      setProcessingProgress(40);
      const { createDedicatedWorker } = await import("../core/WorkerManager");
      const worker = createDedicatedWorker("delete-pages");

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, "sliced_document.pdf", setCompletedResult);
          showToast(`Deleted ${pagesToDelete.length} page(s) successfully!`, "success");
          setPagesToDelete([]);
        } else {
          showToast(`Deletion operation failed: ${error}`, "error");
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error("Delete Pages Worker Error:", err);
        showToast("Worker error occurred during page deletion.", "error");
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage(
        {
          type: "delete-pages",
          fileBytes,
          pagesToDelete,
        },
        [fileBytes.buffer]
      );
      setProcessingProgress(70);
    } catch (err: any) {
      showToast(`Deletion operation failed: ${err.message}`, "error");
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
              Delete Pages Tool Panel
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
                  Remove Pages from PDF
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Select and delete unnecessary pages visually. Save the pruned layout instantly.
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

                  {/* Range Definition Selection Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Add Pages to Selection by Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 1-3, 5, 8-10"
                        value={rangeInputText}
                        onChange={(e) => setRangeInputText(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={applyRangeSelection}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-750 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-lg border-0 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Quick selection actions */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Quick Marker Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-150 dark:border-slate-850/60">
                      <button
                        type="button"
                        onClick={selectEvenPages}
                        className="py-1.5 text-[10px] font-bold rounded bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-770 dark:text-slate-200 shadow-3xs hover:bg-slate-50 cursor-pointer"
                      >
                        Select Even
                      </button>
                      <button
                        type="button"
                        onClick={selectOddPages}
                        className="py-1.5 text-[10px] font-bold rounded bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-770 dark:text-slate-200 shadow-3xs hover:bg-slate-50 cursor-pointer"
                      >
                        Select Odd
                      </button>
                    </div>
                    {pagesToDelete.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="w-full py-1 text-[10px] font-bold text-rose-500 hover:text-rose-600 border border-transparent hover:border-rose-100 dark:hover:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/10 rounded-lg cursor-pointer"
                      >
                        Deselect All Marked Pages
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold space-y-2">
                    <p>💡 Click on page preview cards on the right or type ranges above to mark items for deletion. Marked items display an "Omit Page" badge.</p>
                    {pagesToDelete.length > 0 && (
                      <p className="text-rose-600 dark:text-rose-400 font-bold leading-tight">
                        ⚠️ Selection: {pagesToDelete.length} page(s) marked to be omitted.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      Deleting pages...
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
                      Pages Removed Successfully!
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
                      Process Another File
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
                  onClick={executeDeletePages}
                  disabled={pagesToDelete.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <Trash2 className="w-4 h-4 mr-1 animate-none" />
                  <span>Remove Selected Pages</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview Canvas Side */}
          <div className="lg:col-span-8 bg-slate-50/20 dark:bg-slate-950/10 p-6 md:p-8 flex flex-col justify-start overflow-y-auto max-h-[80vh] min-h-[400px]">
            <div className="mb-4">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Visual Page Pruning Canvas
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
                activeTool="delete-pages"
                pagesToDelete={pagesToDelete}
                togglePageDeletion={handleSelectPageToDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
