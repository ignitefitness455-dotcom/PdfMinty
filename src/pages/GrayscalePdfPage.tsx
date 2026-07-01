import { ArrowLeft, RefreshCw, AlertCircle, Printer, Download, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
      setIsSuccess(false);
    }
  };

  const handleGrayscale = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const processedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'grayscalePDF',
        { bytes: fileBytes, scale },
        [fileBytes.buffer]
      );
      const blob = new Blob([processedBytes as unknown as BlobPart], { type: 'application/pdf' });
      await downloadBlob(blob, `pdfminty_grayscale_${selectedFile.name}`);
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
            Grayscale PDF (B&W)
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
                  The colored plates have been converted using local WebAssembly pixel mapping. Save printer toner easily.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Grayscale Settings
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">
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
                          ? 'border-security-green bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold">{opt.label}</span>
                      <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedFile || loading}
                  onClick={handleGrayscale}
                  className="w-full py-3.5 px-4 bg-[#00FFC2] hover:bg-[#00E5AE] disabled:bg-slate-100 disabled:text-slate-400 font-sans font-black text-xs text-[#0E0E0E] rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0E0E0E]" />
                      <span>Converting Pages...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#0E0E0E]" />
                      <span>Convert & Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-500 font-semibold leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-security-green" />
              <span>Eco-friendly Printing</span>
            </div>
            <p>
              By translating all text channels, images, vectors, and layouts to monochrome gradients, you save up to 70% of colored print cartridge volume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrayscalePdfPage;
