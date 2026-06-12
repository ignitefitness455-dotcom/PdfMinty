import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { DocumentPreview } from "../components/DocumentPreview";
import { getFriendlyErrorMessage, triggerDownload } from "../core/utils";
import { executePdfWorker } from "../core/pdfRunner";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Unlock from "lucide-react/icons/unlock";
import AlertTriangle from "lucide-react/icons/alert-triangle";
import HelpCircle from "lucide-react/icons/help-circle";
import CheckCircle from "lucide-react/icons/check-circle";
import Download from "lucide-react/icons/download";
import { UPLOAD_LIMITS } from "../config/constants";

type OSType = "mac" | "windows" | "linux" | "mobile";

export default function UnlockPage() {
  const { showToast } = useLayout();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [decryptLoading, setDecryptLoading] = useState(false);
  const [isEncryptedPDF, setIsEncryptedPDF] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [completedResult, setCompletedResult] = useState<{ url: string; filename: string } | null>(null);
  const [selectedOS, setSelectedOS] = useState<OSType>("windows");

  // Detect basic OS on load to pre-select guide for comfortable onboarding
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) {
      setSelectedOS("mac");
    } else if (ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
      setSelectedOS("mobile");
    } else if (ua.includes("linux")) {
      setSelectedOS("linux");
    } else {
      setSelectedOS("windows");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (completedResult?.url) {
        URL.revokeObjectURL(completedResult.url);
      }
    };
  }, [completedResult]);

  const handleFilesSelected = async (files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) {
      showToast("Only PDF documents are supported for security analysis.", "error");
      return;
    }

    const file = pdfs[0];
    if (file.size > UPLOAD_LIMITS.MAX_SINGLE_FILE) {
      showToast(`File '${file.name}' exceeds the ${UPLOAD_LIMITS.MAX_SINGLE_FILE / (1024 * 1024)}MB benchmark limits.`, "error");
      return;
    }

    setSelectedFile(file);
    setLoading(true);
    setIsEncryptedPDF(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Perform low-level binary validation check
      try {
        PDFSanitizer.sanitize(bytes);
        // If it completes successfully, it contains no standard "/Encrypt" object
        setIsEncryptedPDF(false);
        showToast("No encryption layers detected. This PDF is already unlocked!", "success");
      } catch (err: any) {
        if (err?.message?.includes("SECURED_LOCKED")) {
          setIsEncryptedPDF(true);
          showToast("🔒 Standard password-protection discovered inside this document.", "info");
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Pre-flight scanner failed", err), "error");
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const clearWorkspace = () => {
    setSelectedFile(null);
    setIsEncryptedPDF(null);
    setPassword("");
    setCompletedResult(null);
  };

  const executeUnlock = async () => {
    if (!selectedFile) return;
    if (!password) {
      showToast("Please enter the decryption password.", "error");
      return;
    }

    setDecryptLoading(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const fileBytes = new Uint8Array(buffer);

      const { bytes } = await executePdfWorker(
        "unlock",
        {
          fileBytes,
          password: password,
        }
      );

      const defaultName = selectedFile.name.toLowerCase().endsWith(".pdf")
        ? selectedFile.name.replace(/\.pdf$/i, "_unlocked.pdf")
        : `${selectedFile.name}_unlocked.pdf`;

      triggerDownload(bytes, defaultName, setCompletedResult);
      showToast("PDF document successfully unlocked client-side!", "success");
    } catch (err: any) {
      showToast(getFriendlyErrorMessage("Decryption failed", err), "error");
    } finally {
      setDecryptLoading(false);
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
              Analyze & Decrypt Guard
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* File Verification Column */}
          <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between border-slate-100 dark:border-slate-800 border-r">
            <div className="space-y-6">
              <div className="text-left pb-1 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-550/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm shrink-0">
                    <Unlock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-905 dark:text-slate-50 leading-none">
                      Decrypt & Unlock PDF
                    </h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
                      Analyze document status and safely decouple security blocks.
                    </p>
                  </div>
                </div>
              </div>

              {!loading && !selectedFile && (
                <FileUploader
                  placeholder="Drop a PDF file here to check security status"
                  multiple={false}
                  accept="application/pdf"
                  onFilesSelected={handleFilesSelected}
                />
              )}

              {loading && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Inspecting standard bytes structure...
                  </p>
                </div>
              )}

              {selectedFile && !loading && (
                <div className="space-y-6 animate-fadein text-left">
                  <DocumentPreview
                    file={selectedFile}
                    onClear={decryptLoading ? undefined : clearWorkspace}
                  />

                  {isEncryptedPDF === true ? (
                    <div className="space-y-4">
                      <div className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-4.5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-amber-400 leading-none">
                          <AlertTriangle className="w-4 h-4 shrink-0" /> Standard Locked Document
                        </div>
                        <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
                          We scanned the binary data of this PDF and found a standard <strong>ISO 32000 Native Security block</strong> (/Encrypt dictionary).
                        </p>
                        <p className="text-[11px] text-slate-550 dark:text-slate-450 leading-relaxed font-semibold border-t border-amber-505/10 dark:border-amber-850/40 pt-2">
                          🔓 Enter your password code below to unlock and export a completely decrypted copy locally.
                        </p>
                      </div>

                      {!completedResult && !decryptLoading && (
                        <div className="space-y-3.5 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl">
                          <div className="space-y-1.5">
                            <label htmlFor="unlock-pass-input" className="text-[10px] font-extrabold text-slate-605 dark:text-slate-400 uppercase tracking-widest block">
                              PDF Password Code
                            </label>
                            <input
                              id="unlock-pass-input"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Type password..."
                              className="w-full text-xs font-extrabold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={executeUnlock}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 cursor-pointer min-h-[38px] active:scale-[0.98] transition-all border-0"
                          >
                            <Unlock className="w-3.5 h-3.5-unlock" style={{ width: "14px", height: "14px" }} />
                            <span>Unlock & Decrypt PDF</span>
                          </button>
                        </div>
                      )}

                      {decryptLoading && (
                        <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl animate-fadein">
                          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                          <p className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400">
                            Decrypting security layers offline...
                          </p>
                        </div>
                      )}

                      {completedResult && (
                        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3 animate-fadein">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-sm">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-xs font-black text-slate-900 dark:text-slate-50">
                              Decryption Complete!
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[210px] mx-auto select-all">
                              {completedResult.filename}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1.5 pt-1">
                            <a
                              href={completedResult.url}
                              download={completedResult.filename}
                              className="w-full py-2 bg-emerald-555 hover:bg-emerald-600 text-white text-xs font-black rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer decoration-none border-0 text-center"
                              style={{ backgroundColor: "#10b981" }}
                            >
                              <Download className="w-3.5 h-3.5" /> Download PDF
                            </a>
                            <button
                              type="button"
                              onClick={clearWorkspace}
                              className="w-full py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer bg-transparent"
                            >
                              Reset / Load Another
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : isEncryptedPDF === false ? (
                    <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-4.5 space-y-3.5">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 leading-none">
                        <CheckCircle className="w-4 h-4 shrink-0" /> Verified Completely Unlocked
                      </div>
                      <p className="text-[11px] text-slate-650 dark:text-slate-450 leading-relaxed font-semibold">
                        This document was fully analyzed and is **not password-protected**. You do not need to perform any unlocking.
                      </p>
                    </div>
                  ) : null}

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 rounded-2xl">
                    <span className="text-[9px] font-black tracking-wider text-slate-450 dark:text-slate-500 uppercase block mb-1">
                      Privacy-First Pledge
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold leading-relaxed">
                      PdfMinty executes purely inside your high-performance browser sandbox. Your PDF contents are never sent to any server. Security is restored 100% locally.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!loading && !selectedFile && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/80 rounded-2xl mt-10">
                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-1">
                  Did you know?
                </span>
                <p className="text-[11px] text-slate-555 dark:text-slate-450 leading-relaxed font-medium">
                  Standard ISO PDF passwords are designed to protect content at the OS level. Standard web-apps can't bypass this without exposing your keys. Removing standard password security takes under 10 seconds locally.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Guides Column */}
          <div className="lg:col-span-8 p-6 md:p-8 bg-slate-50/20 dark:bg-slate-950/10 flex flex-col justify-start">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850/80 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  Passphrase Removal Guides
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 font-semibold">
                  Select your device category to see the fastest way to save unprotected PDF copies locally.
                </p>
              </div>

              {/* OS Tabs */}
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-950/80 p-1 self-start">
                {[
                  { id: "windows", label: "Windows" },
                  { id: "mac", label: "macOS" },
                  { id: "mobile", label: "Mobile" },
                  { id: "linux", label: "Linux" }
                ].map((os) => (
                  <button
                    key={os.id}
                    type="button"
                    onClick={() => setSelectedOS(os.id as OSType)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer border-0 bg-transparent ${
                      selectedOS === os.id
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-200"
                    }`}
                  >
                    {os.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render selected guide with elegant, scannable layout */}
            <div className="space-y-6">
              {selectedOS === "windows" && (
                <div className="space-y-4 animate-fadein">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                      Recommended: Chrome / Edge Print Engine
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                      Decrypting natively using your favorite Windows Web Browser
                    </h4>
                    <ol className="text-xs text-slate-650 dark:text-slate-350 space-y-3 list-decimal pl-5 font-semibold leading-relaxed">
                      <li>
                        <strong>Drag and open</strong> the password-locked PDF into Google Chrome, Microsoft Edge, or Mozilla Firefox.
                      </li>
                      <li>
                        Type your lock passphrase when standard visual browser prompt asks for it to decrypt.
                      </li>
                      <li>
                        Open the Print dialogue screen (press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">Ctrl+P</kbd>).
                      </li>
                      <li>
                        Under the <strong>Destination</strong> option field, select <strong>Save as PDF</strong> as output.
                      </li>
                      <li>
                        Click the <strong>Save</strong> button, and save! The newly exported copy is 100% unlocked permanently and safely.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {selectedOS === "mac" && (
                <div className="space-y-4 animate-fadein">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg">
                      Recommended: Native Apple Preview Engine
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                      Decrypting cleanly using Preview (Built-in on Safari/macOS)
                    </h4>
                    <ol className="text-xs text-slate-650 dark:text-slate-350 space-y-3 list-decimal pl-5 font-semibold leading-relaxed">
                      <li>
                        Double-click to open your secured PDF document. This automatically boots Apple's <strong>Preview app</strong>.
                      </li>
                      <li>
                        Enter your document security passcode key to view contents.
                      </li>
                      <li>
                        Click on the <strong>File</strong> menu from the top navigation bar, then select <strong>Export...</strong>
                      </li>
                      <li>
                        Ensure the <strong>Encrypt</strong> tick checkbox at the save options panel remains unchecked.
                      </li>
                      <li>
                        Press the <strong>Save</strong> button. Preview outputs a fresh copy without passphrases.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {selectedOS === "mobile" && (
                <div className="space-y-4 animate-fadein">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg">
                      Option: Mobile Safari / Android Chrome print
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                      Decrypting locked PDFs directly on Apple iOS / Google Android
                    </h4>
                    <ol className="text-xs text-slate-650 dark:text-slate-350 space-y-3 list-decimal pl-5 font-semibold leading-relaxed">
                      <li>
                        Open the locked document using your native Files browser app (choose Safari on iOS or Chrome/Files on Android).
                      </li>
                      <li>
                        Submit your lock password to decrypt and view standard visual sections.
                      </li>
                      <li>
                        Tap on the standard <strong>Share</strong> button, and choose <strong>Print</strong> option bounds.
                      </li>
                      <li>
                        Perform a pinch-out gesture on the printed layouts or tap the standard save icon, and choose <strong>Save of file</strong>.
                      </li>
                      <li>
                        The output export file is fully stripped of original security blocks.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {selectedOS === "linux" && (
                <div className="space-y-4 animate-fadein">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <span className="text-xs font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-lg">
                      Option: Chromium Print / pdftoppm CLI
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                      Decrypting password bounds on Linux / GNU environments
                    </h4>
                    <ol className="text-xs text-slate-650 dark:text-slate-350 space-y-3 list-decimal pl-5 font-semibold leading-relaxed">
                      <li>
                        Use your native GTK/QT PDF browser (e.g. <strong>Evince</strong>, <strong>Okular</strong>) or Chromium.
                      </li>
                      <li>
                        Input the user password to correctly grant contents read/render bounds.
                      </li>
                      <li>
                        Select standard <strong>Print to File</strong> destination properties.
                      </li>
                      <li>
                        Alternatively, use standard terminal tools such as:
                        <code className="block mt-1 font-mono text-[11px] bg-slate-150 dark:bg-slate-950 p-2 rounded text-slate-800 dark:text-slate-200 whitespace-pre">
                          qpdf --decrypt input_locked.pdf output_unlocked.pdf
                        </code>
                      </li>
                      <li>
                        The resulting document operates cleanly on any system without locks.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Security Warning Panel */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl flex items-start gap-3">
                <span className="text-base shrink-0">💡</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  <strong>Why choose standard local decryption over random cloud-strippers?</strong> Random online websites that promise to "unlock PDFs online" take your secure files, upload them to remote, un-vetted database clouds, and decrypt them insecurely. PdfMinty advises standard local browser-level operations to protect client privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
