import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { PdfPreview } from "../components/PdfPreview";
import { triggerDownload, getFriendlyErrorMessage } from "../core/utils";
import { preprocessAndLoadPdf, executePdfWorker } from "../core/pdfRunner";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Lock from "lucide-react/icons/lock";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";
import { PDFPageInfo } from "../types";
import { UPLOAD_LIMITS } from "../config/constants";

export default function ProtectPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [permissions, setPermissions] = useState({
    printing: true,
    modifying: false,
    copying: false,
    annotating: false,
  });
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
          customLockMessage: "🔒 Standard secured/locked PDF file detected. You can unlock it first inside the Unlock tool."
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
      showToast("Only PDF files are supported for protection.", "error");
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
    setPassword("");
    setConfirmPassword("");
    setPermissions({
      printing: true,
      modifying: false,
      copying: false,
      annotating: false,
    });
  };

  const executeProtect = async () => {
    if (selectedFiles.length === 0) return;
    if (!password) {
      showToast("Please enter an encryption password.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match! Please check again.", "error");
      return;
    }
    if (password.length < 4) {
      showToast("Lock password must be at least 4 characters long.", "error");
      return;
    }

    setLoading(true);
    try {
      const primaryFile = selectedFiles[0];
      const buffer = await primaryFile.arrayBuffer();
      const fileBytes = new Uint8Array(buffer);

      const { bytes } = await executePdfWorker(
        "protect",
        {
          fileBytes,
          userPassword: password,
          permissions,
        },
        [fileBytes.buffer]
      );

      const defaultName = primaryFile.name.toLowerCase().endsWith(".pdf")
        ? primaryFile.name.replace(/\.pdf$/i, "_protected.pdf")
        : `${primaryFile.name}_protected.pdf`;

      triggerDownload(bytes, defaultName, setCompletedResult);
      showToast("Offline sandbox encryption lock applied successfully!", "success");
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Security protection failed", err), "error");
    } finally {
      setLoading(false);
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
              Protect PDF Tool Panel
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Form Side */}
          <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-slate-100 dark:border-slate-800 border-r">
            <div className="space-y-6">
              <div className="text-left">
                <h1 className="text-lg font-black text-slate-905 dark:text-slate-50 leading-tight">
                  AES-256 Secure Envelope
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Pack your PDF inside a secure offline envelope protected with military-grade client-side encryption.
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

                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <label htmlFor="protect-pass-input" className="text-xs font-bold text-slate-705 dark:text-slate-300 block">
                        Lock Password Code
                      </label>
                      <input
                        id="protect-pass-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter strong encryption password"
                        className="w-full text-xs font-extrabold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="protect-confirm-pass-input" className="text-xs font-bold text-slate-750 dark:text-slate-305 block">
                        Confirm Password Code
                      </label>
                      <input
                        id="protect-confirm-pass-input"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Retype password to confirm"
                        className="w-full text-xs font-extrabold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Secure Envelope custom info */}
                    <div className="space-y-2.5 bg-slate-50/65 dark:bg-slate-950/45 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850/60 text-left">
                      <span className="text-[10px] font-black tracking-wider text-slate-600 dark:text-slate-400 uppercase block">
                        AES-256 Envelope Cryptography
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                        Unlike standard PDF passwords which are weak and easily broken, PdfMinty packs your file into an offline <span className="text-emerald-500 font-bold">AES-256-GCM Secure Envelope</span>. 
                      </p>
                      <p className="text-[11px] text-slate-550 dark:text-slate-450 leading-relaxed font-medium">
                        Standard readers can open the PDF output perfectly to show a professional information panel, while the original contents remain safely locked and hidden until decrypted via our offline Unlock tool.
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-normal">
                      🛡️ Uses fully client-side crypto sandbox (PBKDF2 derivative iteration locks). This tool NEVER sends passwords or files to any server!
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
                      Encrypting document...
                    </p>
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
                      Password Locks Applied!
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
                      <Download className="w-4 h-4" /> Download Protected PDF Now
                    </a>
                  </div>
                </div>
              )}
            </div>

            {!loading && !completedResult && selectedFiles.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
                <button
                  type="button"
                  onClick={executeProtect}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <Lock className="w-4 h-4 mr-1" />
                  <span>Lock PDF Document</span>
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
              </div>
            ) : (
              <PdfPreview
                pdfPages={pdfPages}
                pdfDocument={pdfDocument}
                activeTool="protect"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
