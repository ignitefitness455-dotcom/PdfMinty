import { useState, useCallback } from "react";
import { FileUploader } from "../components/FileUploader";
import LoadingButton from "../components/LoadingButton";
import { SEO } from "../components/SEO";
import { useToast } from "../contexts/ToastContext";
import { PDFJS_WORKER_SRC } from "../config/constants";

export default function AiAnalyzePage() {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const extractText = useCallback(async (pdfFile: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
    const pdf = await pdfjsLib.getDocument({ data: await pdfFile.arrayBuffer() }).promise;
    let text = "";
    // Limit to first 10 pages for analysis to keep prompt sizes healthy
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      showToast("Please select a PDF file", "info");
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const text = await extractText(file);
      if (!text.trim()) {
        throw new Error("No text content found in PDF target.");
      }

      const response = await fetch("/api/gemini-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, name: file.name }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Analysis failed");
      }
      setAnalysis(result.analysis);
      showToast("Document analyzed successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to analyze document", "error");
    } finally {
      setAnalyzing(false);
    }
  }, [file, extractText, showToast]);

  return (
    <>
      <SEO title="AI PDF Analysis" description="Analyze PDF content with AI" canonical="https://pdfminty.com/intelligence" />
      <main id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">AI PDF Analysis</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Upload any PDF file and our intelligence parser will securely read its contents (client-side),
          extract structural elements, identify core concepts, and provide answers or insights. No documents are stored on our servers.
        </p>

        <FileUploader
          onSelectedFiles={(files) => { setFile(files[0]); setAnalysis(null); }}
          toolId="ai-analyze"
        />

        {file && (
          <div className="mt-4 rounded-lg border bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium">{file.name}</p>
          </div>
        )}

        <div className="mt-6">
          <LoadingButton onClick={handleAnalyze} loading={analyzing} disabled={!file}>
            {analyzing ? "Analyzing..." : "Analyze Document"}
          </LoadingButton>
        </div>

        {analysis && (
          <div className="mt-8 rounded-lg border bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold">Analysis Results</h2>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {analysis}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
