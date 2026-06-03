import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { triggerDownload, getFriendlyErrorMessage } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Unlock from "lucide-react/icons/unlock";
import Download from "lucide-react/icons/download";
import Check from "lucide-react/icons/check";

export default function UnlockPage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string; type: string } | null>(null);

  const [password, setPassword] = useState("");

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
      showToast("Only PDF files are supported for decryption.", "error");
      return;
    }

    const file = pdfs[0];
    if (file.size > 50 * 1024 * 1024) {
      showToast(`File '${file.name}' exceeds the 50MB limit.`, "error");
      return;
    }

    setCompletedResult(null);
    setSelectedFiles([file]);
    showToast(`Loaded secured document: ${file.name}`, "success");
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setCompletedResult(null);
    setPassword("");
  };

  const executeUnlock = async () => {
    if (selectedFiles.length === 0) return;
    if (!password) {
      showToast("Decryption passphrase required.", "error");
      return;
    }

    setLoading(true);
    try {
      const primaryFile = selectedFiles[0];
      const arrayBuffer = await primaryFile.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);

      const { createDedicatedWorker } = await import("../core/WorkerManager");
      const worker = createDedicatedWorker("unlock");

      worker.onmessage = (e: MessageEvent) => {
        const { success, bytes, error } = e.data;
        if (success && bytes) {
          // Validate decrypted result byte-integrity
          try {
            const sanitized = PDFSanitizer.sanitize(bytes);
            const defaultName = primaryFile.name.toLowerCase().endsWith(".pdf")
              ? primaryFile.name.replace(/\.pdf$/i, "_unlocked.pdf")
              : `${primaryFile.name}_unlocked.pdf`;

            triggerDownload(sanitized.bytes, defaultName, setCompletedResult);
            showToast("Password matches! Document decrypted successfully.", "success");
          } catch (loaderErr) {
            showToast("Incorrect password or corrupted secure file decryption.", "error");
          }
        } else {
          if (error === "NOT_MINTY_SECURED_LOCK") {
            showToast("🔒 Standard secure-locked PDF detected. Standard Acrobat password locks must be decrypted with standard readers. Only PdfMinty AES-256 secure envelopes are unlocked here.", "error");
          } else {
            showToast(getFriendlyErrorMessage("Decryption failed", error || "Incorrect password"), "error");
          }
        }
        setLoading(false);
        worker.terminate();
      };

      worker.onerror = (err) => {
        console.error("Unlock Worker Error:", err);
        showToast("Worker connection error occurred during decryption.", "error");
        setLoading(false);
        worker.terminate();
      };

      worker.postMessage(
        {
          type: "unlock",
          fileBytes,
          password,
        },
        [fileBytes.buffer]
      );
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Failed to unlock PDF", err), "error");
      setLoading(false);
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
              Unlock PDF Tool Panel
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
                  Decrypt & Unlock Secured PDFs
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                  Provide your decryption passphrase to decrypt standard AES-GCM secure envelope files entirely locally.
                </p>
              </div>

              {!completedResult && selectedFiles.length === 0 && (
                <FileUploader
                  placeholder="Drop a secured PDF file here or click to choose"
                  multiple={false}
                  accept="application/pdf"
                  onFilesSelected={handleFilesSelected}
                />
              )}

              {selectedFiles.length > 0 && !completedResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-amber-50/40 dark:bg-amber-955/20 p-3.5 rounded-xl border border-amber-100/50 dark:border-amber-800/40 text-xs">
                    <span className="font-semibold truncate text-slate-705 dark:text-slate-350 max-w-[240px]">
                      🔒 {selectedFiles[0].name}
                    </span>
                    <button
                      type="button"
                      onClick={clearWorkspace}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-700 font-sans border-0 bg-transparent"
                    >
                      Clear File
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label htmlFor="decrypt-pass" className="text-xs font-bold text-slate-705 dark:text-slate-300 block">
                      Decryption Passphrase
                    </label>
                    <input
                      id="decrypt-pass"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter decryption password"
                      className="w-full text-xs font-extrabold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 animate-pulse-subtle"
                    />
                    <div className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-normal">
                      💡 Decryption happens strictly in-browser via standard Web Cryptography API. Passwords never travel over the wire.
                    </div>
                  </div>
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      Decrypting document contents...
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
                      Decrypted Successfully!
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
                      <Download className="w-4 h-4" /> Download Decrypted PDF
                    </a>
                  </div>
                </div>
              )}
            </div>

            {!loading && !completedResult && selectedFiles.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
                <button
                  type="button"
                  onClick={executeUnlock}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
                >
                  <Unlock className="w-4 h-4 mr-1" />
                  <span>Decrypt & Unlock PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
