import { ArrowLeft, RefreshCw, AlertCircle, Printer, Download } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FAQSection } from '../components/FAQSection';
import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

export const GrayscalePdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scale, setScale] = useState<number>(1.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');

  React.useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
      setIsSuccess(false);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
    }
  };

  const handleGrayscale = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setIsSuccess(false);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const processedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'grayscalePDF',
        { bytes: fileBytes, scale },
        [fileBytes.buffer]
      );
      const blob = new Blob([processedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const name = `pdfminty_grayscale_${selectedFile.name}`;
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(name);
      await downloadBlob(blob, name);
      setIsSuccess(true);
    } catch (err: unknown) {
      logger.error('Grayscale error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'An unexpected error occurred while converting the PDF to grayscale.');
    } finally {
      setLoading(false);
    }
  };

  const limitMB = TOOL_SIZE_LIMITS['grayscale-pdf']?.maxSingleMB || 30;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="grayscale_page_container">
      <SEO slug="grayscale-pdf" />

      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">
            Grayscale PDF Free — Convert Color PDF to Black & White
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {limitMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm font-semibold">
          Convert colored PDF documents to beautiful grayscale/monochrome formats locally in-browser to save printer ink.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Printer className="w-5 h-5 text-security-green" />
              <span>Document Workspace</span>
            </div>

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                accept=".pdf,application/pdf"
                title="Select a PDF to convert to Grayscale"
                subtitle={`Drag and drop your document here or browse (Max: ${limitMB}MB)`}
                maxSizeMB={limitMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_grayscale_file"
              >
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setIsSuccess(false);
                    if (downloadUrl) {
                      URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl(null);
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-slate-200 py-1 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3 text-xs text-emerald-800 font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-mint"></span>
                  <span>Conversion Completed Successfully! Your monochrome PDF has been generated.</span>
                </div>
                <p className="text-slate-500 text-[11px] font-semibold leading-normal">
                  The colored pages have been converted to grayscale locally in your browser. Save printer toner easily.
                </p>
                {downloadUrl && (
                  <div className="pt-2">
                    <a
                      href={downloadUrl}
                      download={downloadName}
                      id="manual_download_link"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Download className="w-4 h-4 animate-bounce" />
                      <span>Download Monochrome PDF</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Grayscale Settings
            </h3>
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Render Resolution (DPI Quality)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Normal', value: 1.0, desc: 'Faster / Lighter' },
                  { label: 'High', value: 1.5, desc: 'Sharp text' },
                  { label: 'Ultra', value: 2.0, desc: 'Maximum print' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScale(opt.value)}
                    className={`p-2.5 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      scale === opt.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{opt.label}</span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleGrayscale}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/10 ${
                selectedFile && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Converting Pages...</span>
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Convert & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Deep Content & Comprehensive Guide Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 text-slate-700 leading-relaxed" id="grayscale_guide_section">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Comprehensive Guide to Converting Color PDFs to Grayscale (Black & White)
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Converting high-resolution color PDF documents to pure monochrome (grayscale) is one of the most effective strategies for slashing file byte size, optimizing documents for bulk office printing, and preparing legal or academic filings according to strict publication guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Key Advantages of Grayscale Conversion
            </h3>
            <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4">
              <li><strong>Major File Size Reduction:</strong> Strips redundant 24-bit RGB and 32-bit CMYK color channels, compressing documents by up to 60-80%.</li>
              <li><strong>Save Expensive Printer Toner:</strong> Eliminates color cartridge bleeding and prevents accidental color print billing.</li>
              <li><strong>Institutional Compliance:</strong> Meets official submission criteria for courts, patent registries, and academic libraries that enforce monochrome requirements.</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Luminance-Preserving Conversion Algorithms
            </h3>
            <p className="text-xs text-slate-600 leading-normal">
              PdfMinty uses standard ITU-R BT.601 luminance weighting <code>(Y = 0.299R + 0.587G + 0.114B)</code> during page re-rasterization. This ensures that yellow highlights, subtle charts, and colored contrast text remain perfectly legible without muddying into solid black or washing out into white.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">How to Convert PDFs to Monochrome in 3 Easy Steps</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
            <li><strong>Select File:</strong> Upload or drag-and-drop your target color PDF into the converter above.</li>
            <li><strong>Select Resolution:</strong> Choose from Normal (1.0x for web sharing), High (1.5x for crisp text), or Ultra (2.0x for archival print).</li>
            <li><strong>Process & Download:</strong> Click "Convert & Download" to process each page locally in your browser memory and save your monochrome document.</li>
          </ol>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
          <p className="font-bold">🔒 100% Client-Side Privacy</p>
          <p className="leading-normal text-slate-600">
            All document rasterization, color math, and PDF reconstruction take place locally on your computer using WebAssembly and HTML5 Canvas. Your confidential pages are never uploaded to any cloud server.
          </p>
        </div>
      </section>

      <FAQSection toolId="grayscale-pdf" />
    </div>
  );
};

export default GrayscalePdfPage;
