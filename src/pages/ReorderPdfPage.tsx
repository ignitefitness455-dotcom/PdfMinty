import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { ToolExplanation } from "../components/ToolExplanation";
import { triggerDownload, getPdfJs, getFriendlyErrorMessage } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import GripVertical from "lucide-react/icons/grip-vertical";
import ArrowUp from "lucide-react/icons/arrow-up";
import ArrowDown from "lucide-react/icons/arrow-down";
import { UPLOAD_LIMITS } from "../config/constants";

interface ReorderPageInfo {
  originalIndex: number;
  currentIndex: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export default function ReorderPdfPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);
  const [isDocumentLocked, setIsDocumentLocked] = useState<boolean>(false);
  const [pages, setPages] = useState<ReorderPageInfo[]>([]);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (completedResult) URL.revokeObjectURL(completedResult.url);
    };
  }, [completedResult]);

  useEffect(() => {
    let active = true;
    let loadingTask: any = null;

    const renderThumbnails = async () => {
      setIsDocumentLocked(false);
      if (selectedFiles.length === 0) {
        setPages([]);
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
            showToast("🔒 Locked PDF detected. Use the Unlock tool first.", "error");
            return;
          }
          throw err;
        }

        const pdfjs = await getPdfJs();
        loadingTask = pdfjs.getDocument({ data: sanitizedBytes as any, useSystemFonts: true });
        const pdf = await loadingTask.promise;
        if (!active) return;

        const pageCount = pdf.numPages;
        const previews: ReorderPageInfo[] = [];

        for (let i = 1; i <= Math.min(pageCount, 100); i++) {
          if (!active) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.4 });

          // Render thumbnail
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
          }
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.75);
          canvas.width = 0;
          canvas.height = 0;

          previews.push({
            originalIndex: i - 1,
            currentIndex: i - 1,
            thumbnailUrl,
            width: viewport.width,
            height: viewport.height,
          });
        }

        if (active) {
          setPdfDocument(pdf);
          setPages(previews);
        }
      } catch (err: any) {
        console.error(err);
        if (active) showToast("Unable to render previews for this file.", "info");
      } finally {
        if (active) setLoading(false);
      }
    };

    renderThumbnails();
    return () => {
      active = false;
      if (loadingTask && typeof loadingTask.destroy === "function") loadingTask.destroy();
    };
  }, [selectedFiles]);

  const handleFilesSelected = (files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) { showToast("Only PDF files are supported.", "error"); return; }
    const file = pdfs[0];
    if (file.size > UPLOAD_LIMITS.MAX_SINGLE_FILE) {
      showToast(`File exceeds the ${UPLOAD_LIMITS.MAX_SINGLE_FILE / (1024 * 1024)}MB limit.`, "error");
      return;
    }
    setCompletedResult(null);
    setSelectedFiles([file]);
    showToast(`Loaded: ${file.name}`, "success");
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setPages([]);
    setPdfDocument(null);
    setIsDocumentLocked(false);
    setCompletedResult(null);
  };

  // Move page up
  const movePageUp = useCallback((idx: number) => {
    if (idx === 0) return;
    setPages(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  // Move page down
  const movePageDown = useCallback((idx: number) => {
    setPages(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  // Drag handlers
  const handleDragStart = (idx: number) => setDraggingIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === dropIdx) { setDragOverIdx(null); setDraggingIdx(null); return; }
    setPages(prev => {
      const next = [...prev];
      const [removed] = next.splice(draggingIdx, 1);
      next.splice(dropIdx, 0, removed);
      return next;
    });
    setDragOverIdx(null);
    setDraggingIdx(null);
  };

  const executeReorder = async () => {
    if (selectedFiles.length === 0 || !pdfDocument) return;
    if (pages.length === 0) { showToast("No pages loaded.", "error"); return; }

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const buffer = await primaryFile.arrayBuffer();
      const fileBytes = new Uint8Array(buffer);

      setProcessingProgress(40);
      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(fileBytes);

      setProcessingProgress(65);
      const newDoc = await PDFDocument.create();

      // Copy pages in new order
      for (const pageInfo of pages) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageInfo.originalIndex]);
        newDoc.addPage(copiedPage);
      }

      setProcessingProgress(90);
      const reorderedBytes = await newDoc.save();
      setProcessingProgress(100);

      triggerDownload(
        reorderedBytes,
        `${primaryFile.name.replace(/\.pdf$/i, "")}_reordered.pdf`,
        setCompletedResult
      );
      showToast("PDF pages reordered successfully!", "success");
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Reorder failed", err), "error");
    } finally {
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
              Reorder PDF Pages Tool Panel
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
                  Reorder PDF Pages
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Drag thumbnails or use arrow buttons to rearrange pages. All processing runs 100% locally.
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
                <div className="space-y-3">
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
                  {pages.length > 0 && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      {pages.length} pages loaded. Drag or use ↑↓ buttons on the right to reorder.
                    </p>
                  )}
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      {processingProgress !== null ? "Saving reordered PDF..." : "Loading page thumbnails..."}
                    </p>
                    {processingProgress !== null && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        Progress: {processingProgress}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Result */}
              {completedResult && (
                <div className="py-8 text-center space-y-5 animate-fadein">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-50">
                      Reorder Succeeded!
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
                      Reorder Another File
                    </button>
                    <a
                      href={completedResult.url}
                      download={completedResult.filename}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer decoration-none"
                    >
                      <Download className="w-4 h-4" /> Download PDF Now
                    </a>
                  </div>
                </div>
              )}
            </div>

            {!loading && !completedResult && selectedFiles.length > 0 && pages.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
                <button
                  type="button"
                  onClick={executeReorder}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  <span>Save Reordered PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview/Reorder Canvas Side */}
          <div className="lg:col-span-8 bg-slate-50/20 dark:bg-slate-950/10 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[80vh] min-h-[400px]">
            <div className="mb-4">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Page Order Canvas — Drag to Rearrange
              </span>
            </div>

            {selectedFiles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-600">
                <span>📄 Upload a PDF to reorder its pages</span>
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
            ) : loading && pages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pages.map((page, idx) => (
                  <div
                    key={`${page.originalIndex}-${idx}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={() => { setDraggingIdx(null); setDragOverIdx(null); }}
                    className={`relative bg-white dark:bg-slate-900 border rounded-xl p-2 flex flex-col items-center gap-2 group transition-all select-none ${
                      dragOverIdx === idx ? "border-emerald-500 scale-102 bg-emerald-50/10" : "border-slate-200 dark:border-slate-800"
                    } ${draggingIdx === idx ? "opacity-40" : ""}`}
                  >
                    <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-950 rounded overflow-hidden shadow-xs border border-slate-100 dark:border-slate-850 flex items-center justify-center">
                      {page.thumbnailUrl ? (
                        <img
                          src={page.thumbnailUrl}
                          alt={`page ${page.originalIndex + 1}`}
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-400">Loading...</div>
                      )}
                      
                      <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white rounded px-1.5 py-0.5 text-[9px] font-black">
                        Page {idx + 1}
                      </div>
                      
                      {page.originalIndex !== idx && (
                        <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white rounded px-1 text-[8px] font-bold">
                          Orig: {page.originalIndex + 1}
                        </div>
                      )}
                    </div>

                    <div className="w-full flex items-center justify-between text-[11px] gap-1 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <span className="p-1 cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                          <GripVertical className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePageUp(idx)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer border-0"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === pages.length - 1}
                          onClick={() => movePageDown(idx)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer border-0"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToolExplanation />
    </div>
  );
}
