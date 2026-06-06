import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { triggerDownload, getFriendlyErrorMessage } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Trash2 from "lucide-react/icons/trash-2";
import ArrowUp from "lucide-react/icons/arrow-up";
import ArrowDown from "lucide-react/icons/arrow-down";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import { UPLOAD_LIMITS } from "../config/constants";

export default function MergePage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (completedResult) {
        URL.revokeObjectURL(completedResult.url);
      }
    };
  }, [completedResult]);

  const handleFilesSelected = (files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length !== files.length) {
      showToast("Only PDF files are supported for merging.", "error");
    }

    if (selectedFiles.length + pdfs.length > UPLOAD_LIMITS.MAX_FILES) {
      showToast(`Maximum limit of ${UPLOAD_LIMITS.MAX_FILES} files allowed.`, "error");
      return;
    }

    const currentSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    const incomingSize = pdfs.reduce((sum, f) => sum + f.size, 0);
    if (currentSize + incomingSize > UPLOAD_LIMITS.MAX_TOTAL_SIZE) {
      showToast(`Combined size exceeds client-side merge safety limit of ${UPLOAD_LIMITS.MAX_TOTAL_SIZE / (1024 * 1024)} MB.`, "error");
      return;
    }

    const filtered = pdfs.filter(file => {
      if (file.size === 0) {
        showToast(`Skipped empty file: '${file.name}'`, "error");
        return false;
      }
      if (file.size > UPLOAD_LIMITS.MAX_SINGLE_FILE) {
        showToast(`File '${file.name}' exceeds the ${UPLOAD_LIMITS.MAX_SINGLE_FILE / (1024 * 1024)}MB per-file safety limit.`, "error");
        return false;
      }
      return true;
    });

    if (filtered.length > 0) {
      setSelectedFiles(prev => [...prev, ...filtered]);
      showToast(`Added ${filtered.length} PDF file(s).`, "success");
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setSelectedFiles(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  const moveDown = (idx: number) => {
    setSelectedFiles(prev => {
      if (idx === prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  // Drag and Drop support
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setSelectedFiles(prev => {
      const copy = [...prev];
      const draggedItem = copy[draggedIndex!];
      copy.splice(draggedIndex!, 1);
      copy.splice(index, 0, draggedItem);
      return copy;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setProcessingProgress(null);
    setCompletedResult(null);
  };

  const executeMerge = async () => {
    if (selectedFiles.length < 2) {
      showToast("Please add at least 2 PDF files to merge.", "error");
      return;
    }

    setLoading(true);
    setProcessingProgress(10);
    try {
      const { createDedicatedWorker } = await import("../core/WorkerManager");
      const worker = createDedicatedWorker("merge");

      // Validate each file step-by-step and read contents safely with accurate progress
      const filesBytes: Uint8Array[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProcessingProgress(Math.min(45, 10 + Math.round((i / selectedFiles.length) * 35)));
        
        try {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          
          // Validate and sanitize the PDF stream using our core binary-level validator
          const sanitizedResult = PDFSanitizer.sanitize(bytes);
          filesBytes.push(sanitizedResult.bytes);
        } catch (fileErr: any) {
          let customMsg = fileErr.message || fileErr;
          if (customMsg.includes("SECURED_LOCKED")) {
            customMsg = "🔒 Standard secured/locked PDF file detected. Merging is restricted. Please use the Unlock PDF tool first to decrypt it.";
          } else if (customMsg.includes("PDF header magic") || customMsg.includes("%PDF")) {
            customMsg = "Incompatible file format. The file is missing a standard '%PDF' header signature.";
          }
          throw new Error(`Corrupted or incompatible file: "${file.name}". ${customMsg}`);
        }
      }

      setProcessingProgress(50);

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          setProcessingProgress(100);
          triggerDownload(bytes, "merged_document.pdf", setCompletedResult);
          showToast("PDFs successfully merged entirely offline!", "success");
        } else {
          showToast(getFriendlyErrorMessage("Merge failed", error), "error");
        }
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error("Merge Worker Error:", err);
        showToast("Worker error occurred during merge.", "error");
        setLoading(false);
        setProcessingProgress(null);
        worker.terminate();
      };

      worker.postMessage({ type: "merge", files: filesBytes });
      setProcessingProgress(75);
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Merge failed", err), "error");
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadein relative z-10 font-sans text-left">
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
              Merge PDFs Tool Panel
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Form Side */}
          <div className="lg:col-span-12 p-6 md:p-8 flex flex-col justify-between border-slate-100 dark:border-slate-800 border-r">
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg font-black text-slate-905 dark:text-slate-50 leading-tight">
                  Merge Multiple PDFs Sequentially
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Add two or more files to combine them into one single comprehensive PDF off-the-grid.
                </p>
              </div>

              {!completedResult && selectedFiles.length === 0 && (
                <FileUploader
                  placeholder="Drop multiple PDFs here or click to choose"
                  multiple={true}
                  accept="application/pdf"
                  onFilesSelected={handleFilesSelected}
                />
              )}

              {selectedFiles.length > 0 && !completedResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      Queue files ({selectedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={clearWorkspace}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/40 transition-colors border-0"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-2 space-y-1.5">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        draggable={!loading}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl cursor-grab active:cursor-grabbing hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                          draggedIndex === idx ? "opacity-30 border-dashed border-emerald-400" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate min-w-0 pr-4">
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center font-bold text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-400 text-[11px] font-semibold mr-2 hidden sm:inline">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>

                          <button
                            type="button"
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0 || loading}
                            className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 bg-transparent"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => moveDown(idx)}
                            disabled={idx === selectedFiles.length - 1 || loading}
                            className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 bg-transparent"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            disabled={loading}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded border border-rose-100 dark:border-rose-900/30 shrink-0 bg-transparent"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                    💡 Pages will be ordered according to the sequence listed above. You can drag and drop objects or use the up/down controllers to rearrange your sequence before compiling.
                  </div>
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-6">
                  <div className="relative flex items-center justify-center">
                    <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                    {processingProgress !== null && (
                      <span className="absolute text-[11px] font-black text-slate-700 dark:text-slate-200">
                        {processingProgress}%
                      </span>
                    )}
                  </div>
                  <div className="text-center w-full max-w-md px-6">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                      Merging PDFs completely offline...
                    </p>
                    {processingProgress !== null && (
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                    )}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold block mt-2">
                      Zero server-side bandwidth wasted. Zero exposure.
                    </span>
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
                      Files Merged Successfully!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate max-w-sm mx-auto">
                      {completedResult.filename}
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={clearWorkspace}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
                    >
                      Merge Other Files
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
                  onClick={executeMerge}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-1 animate-none" />
                  <span>Compile & Export Merged PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO/Details Content */}
      <div id="seo-merge-content" className="max-w-4xl mx-auto px-4 mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 animate-fadein font-sans text-left">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6">
          Merge PDF Free Online - Combine PDF Files Locally
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium select-text">
          Need to merge PDF without uploading sensitive documents to external servers? PDFMinty is a 100% free, private pdf editor browser only toolkit that requires no signup or registration. Work confidently knowing your files never leave your device, processed entirely locally in your web browser.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-sans">
              How to Merge PDF Files Locally
            </h2>
            <ol className="space-y-3.5">
              {[
                "Add your PDF files by dropping them into the workspace or clicking the upload area.",
                "Arrange the sequence of files as needed in the files slot list.",
                "Click \"Compile & Export\" to combine pages side-by-side locally.",
                "See a celebratory confirmation when processing completes instantly.",
                "Save your new merged PDF instantly to your computer or mobile."
              ].map((step, idx) => (
                <li key={idx} className="flex gap-3 text-xs font-medium text-slate-600 dark:text-slate-400 select-text">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-sans">
              Why use offline merging?
            </h2>
            <div className="space-y-4 text-xs font-medium text-slate-600 dark:text-slate-400 select-text">
              <p>
                <strong>Zero Upload Files:</strong> Traditional online PDF tools force you to upload documents of invoices, confidential reports, or IDs onto their remote clouds, creating serious security leaks.
              </p>
              <p>
                <strong>Uncompromising Performance:</strong> By merging directly inside your local hardware resources, PDFMinty bypasses lengthy network waiting times, making merging incredibly robust and faster.
              </p>
              <p>
                <strong>100% Client-Side Integrity:</strong> Enjoy limitless file merging options completely. Save files confidently offline!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
