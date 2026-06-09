import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { PdfPreview } from "../components/PdfPreview";
import { ToolExplanation } from "../components/ToolExplanation";
import { triggerDownload } from "../core/utils";
import { preprocessAndLoadPdf, executePdfWorker } from "../core/pdfRunner";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Stamp from "lucide-react/icons/stamp";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import { PDFPageInfo } from "../types";
import { UPLOAD_LIMITS } from "../config/constants";

export default function WatermarkPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkSize, setWatermarkSize] = useState(45);
  const [watermarkRotation, setWatermarkRotation] = useState(45);

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
          customLockMessage: "🔒 Standard secured/locked PDF file detected. Watermarking is restricted. Use the Unlock tool first."
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
        if (active) {
          setLoading(false);
        }
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
      showToast("Only PDF files are supported for watermarking.", "error");
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

  const executeWatermark = async () => {
    if (selectedFiles.length === 0) return;
    if (!watermarkText.trim()) {
      showToast("Please enter a valid watermark word/phrase.", "error");
      return;
    }

    setLoading(true);
    setProcessingProgress(20);
    try {
      const primaryFile = selectedFiles[0];
      const buffer = await primaryFile.arrayBuffer();
      const fileBytes = new Uint8Array(buffer);

      setProcessingProgress(40);
      setProcessingProgress(70);

      const { bytes } = await executePdfWorker(
        "watermark",
        {
          fileBytes,
          watermarkText,
          watermarkOpacity,
          watermarkSize,
          watermarkRotation,
        },
        [fileBytes.buffer]
      );

      setProcessingProgress(100);
      triggerDownload(bytes, "watermarked_document.pdf", setCompletedResult);
      showToast("Watermark applied successfully off the main thread!", "success");
    } catch (err: any) {
      showToast(`Watermark application failed: ${err.message || err}`, "error");
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
              Watermark Tool Panel
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
                  Watermark PDF Pages
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Insert customized text overlays onto all pages of your PDF document securely entirely offline.
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

                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label htmlFor="watermark-text-input" className="text-xs font-bold text-slate-705 dark:text-slate-300 block">
                        Watermark String/Message
                      </label>
                      <input
                        id="watermark-text-input"
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="e.g. DRAFT or CONFIDENTIAL"
                        className="w-full text-xs font-extrabold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                      />
                      {/[^\x1f-\x7e\xa0-\xff]/.test(watermarkText) && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold mt-1.5 leading-normal bg-amber-500/10 dark:bg-amber-400/5 p-2.5 rounded-lg border border-amber-500/20">
                          ⚠️ Non-Latin characters (CJK, Bangla, Arabic, Cyrillic, or Emojis) detected. Standard offline document fonts do not have glyph sets for these scripts and will likely render as unreadable glyph boxes. For best results, use standard alphanumeric English phrases.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <label htmlFor="watermark-opacity-range">Opacity Preset</label>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {Math.round(watermarkOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        id="watermark-opacity-range"
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 shrink-0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <label htmlFor="watermark-size-range">Text Size Scale</label>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {watermarkSize} px
                        </span>
                      </div>
                      <input
                        id="watermark-size-range"
                        type="range"
                        min="12"
                        max="120"
                        step="1"
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 shrink-0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <label htmlFor="watermark-rotation-range">Rotation degree</label>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {watermarkRotation}°
                        </span>
                      </div>
                      <input
                        id="watermark-rotation-range"
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={watermarkRotation}
                        onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 shrink-0"
                      />
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
                      Stamping watermarks...
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
                      Watermark Stamp Complete!
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
                  onClick={executeWatermark}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <Stamp className="w-4 h-4 mr-1" />
                  <span>Stamping Watermarks onto Pages</span>
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
                activeTool="watermark"
              />
            )}
          </div>
        </div>
      </div>
      <ToolExplanation />
    </div>
  );
}
