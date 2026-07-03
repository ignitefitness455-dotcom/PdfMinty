import { ArrowLeft, RefreshCw, AlertCircle, FileText, Download } from 'lucide-react';
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

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Flatten Options
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Flattening form fields locks the current values, radio options, checkboxes, and signatures, turning them into a permanent vector layer. This protects against unauthorized edits.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleFlatten}
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
                  <span>Flattening Document...</span>
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Flatten & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlattenPdfPage;
