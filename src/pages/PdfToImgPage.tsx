import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { DocumentPreview } from "../components/DocumentPreview";
import { triggerDownload, getFriendlyErrorMessage } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import { executePdfWorker } from "../core/pdfRunner";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Image from "lucide-react/icons/image";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import JSZip from "jszip";
import { UPLOAD_LIMITS } from "../config/constants";

export default function PdfToImgPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState<number>(2); // 1 = 72, 2 = 144, 3 = 216 DPI
  const [images, setImages] = useState<{ url: string; pageNum: number }[]>([]);

  useEffect(() => {
    return () => {
      if (completedResult) {
        URL.revokeObjectURL(completedResult.url);
      }
    };
  }, [completedResult]);

  const handleFilesSelected = (files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) {
      showToast("Only PDF files are supported for image extraction.", "error");
      return;
    }

    const file = pdfs[0];
    if (file.size > UPLOAD_LIMITS.MAX_SINGLE_FILE) {
      showToast(`File '${file.name}' exceeds the ${UPLOAD_LIMITS.MAX_SINGLE_FILE / (1024 * 1024)}MB limit.`, "error");
      return;
    }

    setCompletedResult(null);
    setSelectedFiles([file]);
    setImages([]);
    showToast(`Loaded document: ${file.name}`, "success");
  };

  const clearWorkspace = () => {
    images.forEach((img) => {
      if (img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });
    setSelectedFiles([]);
    setCompletedResult(null);
    setProcessingProgress(null);
    setImages([]);
  };

  const executePdfToImg = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(20);
    setImages([]);
    try {
      const primaryFile = selectedFiles[0];
      const arrayBuffer = await primaryFile.arrayBuffer();

      let sanitizedBytes: any = new Uint8Array(arrayBuffer);
      try {
        const sanitizedResult = PDFSanitizer.sanitize(sanitizedBytes);
        sanitizedBytes = sanitizedResult.bytes;
      } catch (err: any) {
        if (err?.message?.includes("SECURED_LOCKED")) {
          setLoading(false);
          showToast(
            "🔒 Standard secured/locked PDF file detected. Image extraction is restricted. Use the Unlock tool first.",
            "error"
          );
          return;
        }
        throw err;
      }

      setProcessingProgress(50);
      const { results } = await executePdfWorker(
        "pdf-to-image",
        { fileBytes: sanitizedBytes, scale, format },
        [sanitizedBytes.buffer]
      );

      setProcessingProgress(80);
      const extractedImages: { url: string; pageNum: number }[] = [];
      const zipDoc = new JSZip();

      for (const item of results) {
        const blob = new Blob([item.bytes], { type: format === "png" ? "image/png" : "image/jpeg" });
        const url = URL.createObjectURL(blob);
        extractedImages.push({ url, pageNum: item.pageNum });
        zipDoc.file(`page-${item.pageNum}.${format}`, item.bytes);
      }

      setImages(extractedImages);

      setProcessingProgress(95);
      const zipBytes = await zipDoc.generateAsync({ type: "uint8array" });
      const zipName = primaryFile.name.toLowerCase().endsWith(".pdf")
        ? primaryFile.name.replace(/\.pdf$/i, `_images_${format}.zip`)
        : `${primaryFile.name}_images_${format}.zip`;

      triggerDownload(zipBytes, zipName, setCompletedResult);
      showToast(`Document conversion successful! Extracted ${results.length} frames.`, "success");
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Conversion to image failed", err), "error");
    } finally {
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
              Extract PDF Pages tool
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-12 p-6 md:p-8 flex flex-col justify-between border-slate-100 dark:border-slate-800 border-r">
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg font-black text-slate-905 dark:text-slate-50 leading-tight">
                  Convert PDF Document into PNG/JPG Images
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Directly render pages at custom DPI density ranges and capture sequence offsets packed into a simple downloadable ZIP container.
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
                <div className="space-y-5 animate-fadein">
                  <DocumentPreview
                    file={selectedFiles[0]}
                    onClear={loading ? undefined : clearWorkspace}
                  />

                  {/* Settings Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/60 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                        Output Format
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                        {["png", "jpeg"].map((fmtOption) => (
                          <button
                            key={fmtOption}
                            type="button"
                            onClick={() => setFormat(fmtOption as any)}
                            className={`py-2 text-xs font-black rounded-lg transition-all border-0 cursor-pointer ${
                              format === fmtOption
                                ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                                : "bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-705"
                            }`}
                          >
                            {fmtOption.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <label htmlFor="scale-select" className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                        DPI Resolution Density
                      </label>
                      <select
                        id="scale-select"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-100 outline-none"
                      >
                        <option value={1}>72 DPI (Standard / Fast)</option>
                        <option value={2}>144 DPI (Medium HD Quality)</option>
                        <option value={3}>216 DPI (Ultra High Precision)</option>
                      </select>
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
                      Generating high definition frames...
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
                      Conversion Completed!
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
                      Convert Another File
                    </button>
                    <a
                      href={completedResult.url}
                      download={completedResult.filename}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer decoration-none scale-102 hover:scale-105 active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Download ZIP Now
                    </a>
                  </div>
                </div>
              )}

              {/* Active Image Previews Grid */}
              {images.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 animate-fadein">
                  <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    Extracted Page Frames ({images.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div
                        key={img.pageNum}
                        className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-2.5 flex flex-col space-y-2 hover:border-slate-305 dark:hover:border-slate-700 transition"
                      >
                        <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center relative group">
                          <img
                            src={img.url}
                            alt={`Page ${img.pageNum}`}
                            referrerPolicy="no-referrer"
                            className="max-w-full max-h-full object-contain transition group-hover:scale-105"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">
                            Page {img.pageNum}
                          </span>
                          <a
                            href={img.url}
                            download={`page-${img.pageNum}.${format}`}
                            className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 cursor-pointer decoration-none flex items-center gap-0.5"
                          >
                            <Download className="w-3 h-3" /> Save
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!loading && !completedResult && selectedFiles.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
                <button
                  type="button"
                  onClick={executePdfToImg}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <Image className="w-4 h-4 mr-1" />
                  <span>Render & Extract Sequence ZIP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
