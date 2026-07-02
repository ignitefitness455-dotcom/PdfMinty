import { ArrowLeft, RefreshCw, AlertCircle, FileText, Download, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

export const FlattenPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleFlatten = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const processedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'flattenPDF',
        { bytes: fileBytes },
        [fileBytes.buffer]
      );
      const blob = new Blob([processedBytes as unknown as BlobPart], { type: 'application/pdf' });
      await downloadBlob(blob, `pdfminty_flattened_${selectedFile.name}`);
      setIsSuccess(true);
    } catch (err: unknown) {
      logger.error('Flatten error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'An unexpected error occurred while flattening the PDF.');
    } finally {
      setLoading(false);
    }
  };

  const limitMB = TOOL_SIZE_LIMITS['flatten-pdf']?.maxSingleMB || 50;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="flatten_page_container">
      <SEO slug="flatten-pdf" />

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
            Flatten PDF Forms
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {limitMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm font-semibold">
          Make fillable form fields and annotations permanent and non-editable. Merges form fields directly into PDF pages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <FileText className="w-5 h-5 text-security-green" />
              <span>Document Workspace</span>
            </div>

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                accept=".pdf,application/pdf"
                title="Select a fillable PDF to flatten"
                subtitle={`Drag and drop your document here or browse (Max: ${limitMB}MB)`}
                maxSizeMB={limitMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_flatten_file"
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
                  <span>Flattening Completed Successfully! Your static PDF has been generated.</span>
                </div>
                <p className="text-slate-500 text-[11px] font-semibold leading-normal">
                  All active electronic form fields, radio buttons, annotations, and text boxes are now rendered as permanent flat page graphics.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Flatten Options
            </h2>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Flattening form fields locks the current values, radio options, checkboxes, and signatures, turning them into a permanent vector layer. This protects against unauthorized edits.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedFile || loading}
                  onClick={handleFlatten}
                  className="w-full py-3.5 px-4 bg-[#00FFC2] hover:bg-[#00E5AE] disabled:bg-slate-100 disabled:text-slate-400 font-sans font-black text-xs text-[#0E0E0E] rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0E0E0E]" />
                      <span>Flattening Document...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-[#0E0E0E]" />
                      <span>Flatten & Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-500 font-semibold leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-security-green" />
              <span>Security & Compliance</span>
            </div>
            <p>
              Many governmental, financial, and legal platforms require PDF forms to be completely flattened before submission to ensure data-record preservation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlattenPdfPage;
