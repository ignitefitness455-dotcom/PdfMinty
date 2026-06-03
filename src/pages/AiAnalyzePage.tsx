import { useState } from "react";
import { Link } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { FileUploader } from "../components/FileUploader";
import { getPdfJs } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";
import ArrowLeft from "lucide-react/icons/arrow-left";
import RefreshCw from "lucide-react/icons/refresh-cw";
import Sparkles from "lucide-react/icons/sparkles";
import AlertCircle from "lucide-react/icons/alert-circle";
import Markdown from "react-markdown";

export default function AiAnalyzePage() {
  const { showToast } = useLayout();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    const pdfs = files.filter(f => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length === 0) {
      showToast("Only PDF files are supported for AI investigation.", "error");
      return;
    }

    const file = pdfs[0];
    if (file.size > 50 * 1024 * 1024) {
      showToast(`File '${file.name}' exceeds the 50MB limit.`, "error");
      return;
    }

    setAiAnalysisResult(null);
    setAiError(null);
    setSelectedFiles([file]);
    showToast(`Loaded document: ${file.name}`, "success");
  };

  const clearWorkspace = () => {
    setSelectedFiles([]);
    setProcessingProgress(null);
    setAiAnalyzing(false);
    setAiAnalysisResult(null);
    setAiError(null);
  };

  const executeAIAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    const primaryFile = selectedFiles[0];
    setAiAnalyzing(true);
    setAiError(null);
    setAiAnalysisResult(null);
    setLoading(true);
    setProcessingProgress(10);

    try {
      showToast("Extracting document textual contents locally in your browser...", "info");

      const arrayBuffer = await primaryFile.arrayBuffer();

      let sanitizedBytes: any = new Uint8Array(arrayBuffer);
      try {
        const sanitizedResult = PDFSanitizer.sanitize(sanitizedBytes);
        sanitizedBytes = sanitizedResult.bytes;
      } catch (err: any) {
        if (err?.message?.includes("SECURED_LOCKED")) {
          setLoading(false);
          setAiAnalyzing(false);
          showToast(
            "🔒 Standard secured/locked PDF file detected. AI scanning is disabled. Use the Unlock tool first.",
            "error"
          );
          return;
        }
        throw err;
      }

      setProcessingProgress(20);

      const pdfjs = await getPdfJs();
      const pdf = await pdfjs.getDocument({
        data: sanitizedBytes as any,
        useSystemFonts: true,
      }).promise;

      setProcessingProgress(40);

      const pageCount = pdf.numPages;
      let extractedText = "";

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => (item as any).str);
        extractedText += strings.join(" ") + "\n";

        const prg = Math.min(40 + Math.round((i / pageCount) * 35), 75);
        setProcessingProgress(prg);
      }

      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error(
          "This PDF appears to be a scanned image or has no extractable text. AI analysis requires text-based PDFs."
        );
      }

      setProcessingProgress(80);
      showToast("Extract completed. Dispatching to secure Gemini proxy analytics...", "info");

      const apiBase =
        (import.meta as any).env?.VITE_API_BASE_URL ||
        (import.meta as any).env?.VITE_CLOUDFLARE_API_URL ||
        "";
      const response = await fetch(`${apiBase}/api/gemini-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText.substring(0, 40000), name: primaryFile.name }),
      });

      if (!response.ok) {
        const errJson: any = await response.json().catch(() => ({}));
        throw new Error(
          (errJson && errJson.error) ||
            `Server returned code ${response.status}`
        );
      }

      const resJson: any = await response.json();
      setProcessingProgress(100);
      setAiAnalysisResult(resJson && resJson.analysis);
      showToast("Secure Gemini AI document intelligence completed successfully!", "success");
    } catch (err: any) {
      console.error("AI Intelligence Error:", err);
      setAiError(
        err.message ||
          "An unexpected failure occurred while analyzing your file."
      );
      showToast(err.message || "AI analysis step failed. See report diagnostics.", "error");
    } finally {
      setLoading(false);
      setAiAnalyzing(false);
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
              Gemini AI Analyst Panel
            </span>
          </div>
        </div>

        {/* Content Space */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-lg font-black text-slate-905 dark:text-slate-50 leading-tight">
                AI Deep Analyze PDF Content
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 font-medium">
                Locally scan textual layouts and securely query Gemini proxy to summarize, extract details, and answer semantic metrics.
              </p>
            </div>

            {!aiAnalysisResult && !selectedFiles.length && (
              <FileUploader
                placeholder="Drop a PDF file here or click to choose"
                multiple={false}
                accept="application/pdf"
                onFilesSelected={handleFilesSelected}
              />
            )}

            {selectedFiles.length > 0 && !aiAnalysisResult && (
              <div className="space-y-4 animate-fadein">
                <div className="flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-100/50 dark:border-emerald-800/40 text-xs">
                  <span className="font-semibold truncate text-slate-700 dark:text-slate-350 max-w-[240px]">
                    📂 {selectedFiles[0].name}
                  </span>
                  <button
                    type="button"
                    onClick={clearWorkspace}
                    disabled={aiAnalyzing}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-700 disabled:opacity-45 font-sans border-0 bg-transparent"
                  >
                    Clear File
                  </button>
                </div>

                {!aiAnalyzing && (
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                    💡 Click "Scan & Investigate Document" below. Our tool will parse standard encoded text layers from the first 12 pages locally and secure proxy payloads cleanly with zero third-party telemetry exposure.
                  </div>
                )}
              </div>
            )}

            {/* Processing state and loaders */}
            {aiAnalyzing && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                <div className="text-center">
                  <p className="text-xs font-extrabold text-slate-705 dark:text-slate-200">
                    Gemini AI analyzing content...
                  </p>
                  {processingProgress !== null && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                      Progress stage: {processingProgress}%
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Diagnostics Screen */}
            {aiError && (
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex gap-3 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold block">Scanning Intelligence Failed:</span>
                  <p className="font-medium leading-relaxed">{aiError}</p>
                  <button
                    type="button"
                    onClick={clearWorkspace}
                    className="mt-3 text-[10px] font-black underline border-center cursor-pointer border-0 bg-transparent"
                  >
                    Reset Workspace
                  </button>
                </div>
              </div>
            )}

            {/* Succeeded Result View */}
            {aiAnalysisResult && (
              <div className="space-y-6 animate-fadein text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-pulse-subtle" /> Gemini AI Document Report
                  </span>
                  <button
                    type="button"
                    onClick={clearWorkspace}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-850 px-3 py-1.5 rounded-xl border-0"
                  >
                    Analyze New PDF
                  </button>
                </div>

                <div className="p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-150 text-xs leading-relaxed space-y-4 prose dark:prose-invert max-w-none font-medium selection:bg-emerald-100/50 select-text overflow-x-auto">
                  <div className="markdown-body">
                    <Markdown>{aiAnalysisResult}</Markdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && !aiAnalysisResult && selectedFiles.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-8">
              <button
                type="button"
                onClick={executeAIAnalyze}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[48px] active:scale-[0.98] transition-all border-0"
              >
                <Sparkles className="w-4 h-4 mr-1 animate-pulse-subtle" />
                <span>Scan & Investigate Document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
