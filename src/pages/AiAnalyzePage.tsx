import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send, FileText, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { ROUTES } from '../config/routes';
import { SEO } from '../components/SEO';

let pdfjsLib: any = null;

const loadPdfjs = async () => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.3.136'}/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
};

export const AiAnalyzePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // AI querying state
  const [query, setQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setIsExtracting(true);
    setExtractedText('');
    setAiResult('');
    setError(null);

    try {
      const pdfjs = await loadPdfjs();
      const bytes = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);

      let textBuffer = '';
      const maxPages = Math.min(pdf.numPages, 12); // Extract first 12 pages to optimize payload
      
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        textBuffer += `--- PAGE ${i} ---\n${pageText}\n\n`;
      }

      setExtractedText(textBuffer);
    } catch (err: any) {
      console.error('Text extraction error:', err);
      setError(err?.message || 'Failed to extract text structures. Make sure document does not contain image-only pages or lock passwords.');
    } finally {
      setIsExtracting(false);
    }
  };

  const submitQuery = async (mode: 'summary' | 'qa') => {
    if (!extractedText) {
      setError('No extracted text structures found to inspect.');
      return;
    }
    if (mode === 'qa' && !query.trim()) {
      setError('Please provide a specific query prompt.');
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textContent: extractedText,
          query: mode === 'qa' ? query : '',
          mode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server rejected request. Please check secret API variables.');
      }

      setAiResult(data.result || 'No response returned.');
    } catch (err: any) {
      console.error('AI Error:', err);
      setError(err?.message || 'An unexpected server error occurred during AI analysis. Verify GEMINI_API_KEY in secrets.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="ai_analyze_page">
      <SEO 
        title="AI PDF Analyze — Free Dynamic Page Assistant" 
        description="Extract PDF metadata and analyze contents with Gemini server AI. Create summaries, ask custom queries, and inspect facts safely."
      />

      <Link to={ROUTES.HOME} className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-100 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">AI Analyze & Assistant</h1>
        </div>
        <p className="text-slate-500 text-sm">Upload standard PDF files, extract context indices offline, and query answers or summaries securely via Gemini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Upload & Inspection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Document Upload</span>
            </h3>

            {!selectedFile ? (
              <FileUploader 
                onFilesSelected={handleFilesSelected} 
                title="Select PDF for AI review"
                subtitle="Load a PDF file here"
              />
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between" id="loaded_ai_file">
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {totalPages} pages</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedFile(null); setExtractedText(''); setAiResult(''); }} 
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-white border border-slate-200 py-1 px-2.5 rounded-lg"
                  >
                    Clear
                  </button>
                </div>

                {isExtracting ? (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 justify-center py-3 bg-slate-50 rounded-xl" id="extraction_spinner">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Extracting PDF text locally...</span>
                  </div>
                ) : extractedText ? (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-1.5 text-xs text-emerald-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Text indexes loaded successfully!</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="bg-slate-100 p-4 rounded-xl space-y-2 border border-slate-200 text-xs text-slate-500 leading-normal">
            <p className="font-bold text-slate-700">Privacy Information:</p>
            <p>
              Your document files are processed locally inside your web browser. Only the extracted raw text of the document is sent securely to our Express server to utilize Gemini APIs. Original PDF binaries never touch the clouds.
            </p>
          </div>
        </div>

        {/* Right Side: AI Console */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[420px] space-y-6">
            <div className="space-y-4 flex-1">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">AI Control Center</h3>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => submitQuery('summary')}
                  disabled={!extractedText || aiLoading}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    extractedText && !aiLoading
                      ? 'bg-amber-100/50 hover:bg-amber-100 border border-amber-200 text-amber-800'
                      : 'bg-slate-100 border border-slate-200 text-slate-400 pointer-events-none'
                  }`}
                >
                  ✨ Summarize Document Complete
                </button>
              </div>

              {/* Chat interaction input */}
              <div className="space-y-2">
                <label htmlFor="ai_query_input" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Ask anything about this document:</label>
                <div className="relative">
                  <input
                    id="ai_query_input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={extractedText ? "e.g., What are the main agreements in section 3?" : "Please load a file on the left first."}
                    className="w-full border border-slate-300 rounded-xl py-2.5 pl-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={!extractedText || aiLoading}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitQuery('qa'); }}
                  />
                  <button
                    onClick={() => submitQuery('qa')}
                    disabled={!extractedText || !query.trim() || aiLoading}
                    className={`absolute right-1.5 top-1.5 p-1.5 rounded-lg text-white transition-colors ${
                      query.trim() && !aiLoading ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' : 'bg-slate-300 pointer-events-none'
                    }`}
                    aria-label="Send query"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3.5 rounded-xl shadow-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Execution Error</p>
                    <p className="mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* AI response panel */}
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-12 border border-dashed border-slate-200 rounded-xl" id="ai_loader">
                  <span className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-xs font-semibold text-slate-500">Letting Gemini think...</span>
                </div>
              ) : aiResult ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-inner" id="ai_response_box">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Gemini Core Insights</span>
                  </div>
                  <div className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap whitespace-pre-line prose max-w-none">
                    {aiResult}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-slate-200 rounded-xl text-slate-400">
                  <Sparkles className="w-7 h-7 text-slate-300 mb-2 animate-bounce" />
                  <p className="text-xs font-medium max-w-sm">No analysis performed yet. Click one of the summary profiles or Ask a question above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
