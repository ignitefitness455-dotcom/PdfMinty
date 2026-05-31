import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { triggerDownload, getPdfJs } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Image from "lucide-react/icons/image";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import JSZip from "jszip";
import confetti from "canvas-confetti";

export default function PdfToImgPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [isDocumentLocked, setIsDocumentLocked] = useState<boolean>(false);

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
    if (file.size > 50 * 1024 * 1024) {
      showToast(`File '${file.name}' exceeds the 50MB limit.`, "error");
      return;
    }

    setCompletedResult(null);
    setSelectedFiles([file]);
    setIsDocumentLocked(false);
    showToast(`Loaded document: ${file.name}`, "success");
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setIsDocumentLocked(false);
    setCompletedResult(null);
    setProcessingProgress(null);
  };

  const executePdfToImg = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setProcessingProgress(0);
    try {
      const primaryFile = selectedFiles[0];
      const arrayBuffer = await primaryFile.arrayBuffer();

      let sanitizedBytes: any = new Uint8Array(arrayBuffer);
      try {
        const sanitizedResult = PDFSanitizer.sanitize(sanitizedBytes);
        sanitizedBytes = sanitizedResult.bytes;
      } catch (err: any) {
        if (err?.message?.includes("SECURED_LOCKED")) {
          setIsDocumentLocked(true);
          setLoading(false);
          showToast(
            "🔒 Standard secured/locked PDF file detected. Image extraction is restricted. Use the Unlock tool first.",
            "error"
          );
          return;
        }
        throw err;
      }

      const pdfjs = await getPdfJs();
      const loadingTask = pdfjs.getDocument({
        data: sanitizedBytes as any,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const zipDoc = new JSZip();

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          const base64Data = dataUrl.split(",")[1];
          zipDoc.file(`page_sequence_${i}.jpg`, base64Data, { base64: true });
        }

        setProcessingProgress(Math.round((i / totalPages) * 100));
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      const contentBlob = await zipDoc.generateAsync({ type: "blob" });
      const dlLink = document.createElement("a");
      const zipUrl = URL.createObjectURL(contentBlob);
      dlLink.href = zipUrl;
      dlLink.download = "pdf_converted_images.zip";
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);

      setCompletedResult({
        url: zipUrl,
        filename: "pdf_converted_images.zip",
        type: "application/zip"
      });

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.85 },
      });
      showToast("Document conversion successful! ZIP downloaded.", "success");
    } catch (err: any) {
      showToast(`Conversion to image failed: ${err.message}`, "error");
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
          {/* Form Side */}
          <div className="lg:col-span-12 p-6 md:p-8 flex flex-col justify-between border-slate-100 dark:border-slate-800 border-r">
            <div className="space-y-6">
              <div className="text-left">
                <h2 className="text-lg font-black text-slate-905 dark:text-slate-50 leading-tight">
                  Convert PDF Document into PNG/JPG Images
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Directly render pages at standard high-contrast density (2.0 scale) and capture sequence offsets packed into a simple downloadable ZIP container.
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
                <div className="space-y-4 animate-fadein">
                  <div className="flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100/50 dark:border-emerald-800/40 text-xs">
                    <span className="font-semibold truncate text-slate-700 dark:text-slate-350 max-w-[240px]">
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

                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                    💡 Click the button below to start page extraction. All rendering operations are run completely locally utilizing your standard hardware capabilities offline.
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
            </div>

            {!loading && !completedResult && selectedFiles.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
                <button
                  type="button"
                  onClick={executePdfToImg}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <Image className="w-4 h-4 mr-1 animate-none" />
                  <span>Extract Sequence & ZIP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
