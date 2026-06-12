import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { PdfPreview } from "../components/PdfPreview";
import { ToolExplanation } from "../components/ToolExplanation";
import { triggerDownload, getFriendlyErrorMessage } from "../core/utils";
import { preprocessAndLoadPdf, executePdfWorker } from "../core/pdfRunner";

import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import { PDFPageInfo } from "../types";
import { UPLOAD_LIMITS } from "../config/constants";

export default function ExtractPagesPdfPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [splitRange, setSplitRange] = useState("1-3");
  const [splitMode, setSplitMode] = useState<"single" | "multiple">("single");
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
        const { pdf } = await preprocessAndLoadPdf(primaryFile, {
          onEncrypted: () => setIsDocumentLocked(true),
          showToast,
          customLockMessage: "🔒 Standard secured/locked PDF file detected. Page extraction is restricted for safety. Use the Unlock tool first."
        });

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
        if (active && !isDocumentLocked) {
          showToast("Info: Unable to render preview thumbnails for this document lock/format.", "info");
        }
      } finally {
        setLoading(false);
      }
    };

    renderPDFThumbnails();

    return () => {
      active = false;
    };
  }, [selectedFiles, isDocumentLocked]);

  const handleFilesSelected = (files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) {
      showToast("Only PDF files are supported for extraction.", "error");
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

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setPdfPages([]);
    setPdfDocument(null);
    setIsDocumentLocked(false);
    setCompletedResult(null);
  };

  // Helper parser for custom split/extraction ranges (e.g. "1-3, 5")
  const parsePageRanges = (rangeStr: string, totalPages: number): number[] => {
    const indices: number[] = [];
    const segments = rangeStr.replace(/\s+/g, "").split(",");

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
    return Array.from(new Set(indices)).sort((a, b) => a - b);
  };

  const executeSplit = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(15);
    try {
      const primaryFile = selectedFiles[0];
      const buffer = await primaryFile.arrayBuffer();
      const fileBytes = new Uint8Array(buffer);

      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(fileBytes);
      const totalPages = srcDoc.getPageCount();

      if (splitMode === "single") {
        const targetPageIndices = parsePageRanges(splitRange, totalPages);

        if (targetPageIndices.length === 0) {
          showToast("Invalid page range format or out of bounds.", "error");
          setLoading(false);
          setProcessingProgress(null);
          return;
        }

        setProcessingProgress(45);

        const { bytes } = await executePdfWorker(
          "split",
          { fileBytes, targetPageIndices },
          [fileBytes.buffer]
        );

        setProcessingProgress(100);
        triggerDownload(
          bytes,
          `${primaryFile.name.replace(/\.pdf$/i, "")}_extracted.pdf`,
          setCompletedResult
        );
        showToast("Requested pages extracted and compiled offline successfully!", "success");
      } else {
        // Multiple splits based on distinct segments
        const ranges: { start: number; end: number; name?: string }[] = [];
        const segments = splitRange.replace(/\s+/g, "").split(",");

        for (const segment of segments) {
          if (segment.includes("-")) {
            const [startStr, endStr] = segment.split("-");
            const start = parseInt(startStr, 10) - 1;
            const end = parseInt(endStr, 10) - 1;
            if (!isNaN(start) && !isNaN(end) && start >= 0 && end < totalPages && start <= end) {
              ranges.push({ start, end, name: `${primaryFile.name.replace(/\.pdf$/i, "")}_pages_${start + 1}_to_${end + 1}.pdf` });
            }
          } else {
            const page = parseInt(segment, 10);
            if (!isNaN(page)) {
              const idx = page - 1;
              if (idx >= 0 && idx < totalPages) {
                ranges.push({ start: idx, end: idx, name: `${primaryFile.name.replace(/\.pdf$/i, "")}_page_${page}.pdf` });
              }
            }
          }
        }

        if (ranges.length === 0) {
          showToast("Invalid split range configuration.", "error");
          setLoading(false);
          setProcessingProgress(null);
          return;
        }

        setProcessingProgress(45);

        const { results } = await executePdfWorker(
          "split-multi",
          { fileBytes, ranges },
          [fileBytes.buffer]
        );

        setProcessingProgress(80);
        try {
          if (results.length === 1) {
            const singleBytes = results[0].bytes;
            triggerDownload(singleBytes, results[0].name, setCompletedResult);
          } else {
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            results.forEach((r: any) => {
              zip.file(r.name, r.bytes);
            });
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            setCompletedResult({
              url,
              filename: `${primaryFile.name.replace(/\.pdf$/i, "")}_splits.zip`,
              type: "application/zip",
            });
            
            const a = document.createElement("a");
            a.href = url;
            a.download = `${primaryFile.name.replace(/\.pdf$/i, "")}_splits.zip`;
            a.click();
          }
          setProcessingProgress(100);
          showToast("PDF split into separate files successfully!", "success");
        } catch (zipErr: any) {
          showToast(`Failed to archive split files: ${zipErr.message || zipErr}`, "error");
        }
      }
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Split operation failed", err), "error");
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
              Extract PDF Pages Tool Panel
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
                  Extract Pages to New PDF
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Pick exact page ranges to extract into a fresh standalone PDF. Runs 100% offline in your browser.
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
                      className="text-[10px] font-black text-rose-500 hover:text-rose-700 font-sans border-0 bg-transparent"
                    >
                      Clear File
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Extraction Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-150 dark:border-slate-850/60">
                      <button
                        type="button"
                        onClick={() => setSplitMode("single")}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                          splitMode === "single"
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        One Combined PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitMode("multiple")}
                        className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                          splitMode === "multiple"
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        Separate Files (ZIP)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Extract Range Definition
                    </label>
                    <input
                      aria-label="Extraction range input"
                      type="text"
                      value={splitRange}
                      onChange={(e) => setSplitRange(e.target.value)}
                      placeholder="e.g. 1-3, 5, 8-10"
                      className="w-full text-xs font-extrabold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-none"
                    />
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-semibold">
                      Allowed syntax formats: Ranges (e.g. <span className="font-bold font-mono">1-3</span>) and comma separated bounds (e.g. <span className="font-bold font-mono">1-3, 5, 7</span>).
                    </div>
                  </div>
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      Processing page extraction...
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
                      Split / Extraction Succeeded!
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
                      Extract Another File
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
                  onClick={executeSplit}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-1 animate-none" />
                  <span>Extract Selected Pages</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview Canvas Side */}
          <div className="lg:col-span-8 bg-slate-50/20 dark:bg-slate-950/10 p-6 md:p-8 flex flex-col justify-start overflow-y-auto max-h-[80vh] min-h-[400px]">
            <div className="mb-4">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Visual Document Verification Canvas
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
                activeTool="split"
              />
            )}
          </div>
        </div>
      </div>
      <ToolExplanation />
    </div>
  );
}
