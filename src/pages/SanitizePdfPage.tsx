import { Download, ShieldBan, AlertCircle, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';

export default function SanitizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
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

  const limitMB = TOOL_SIZE_LIMITS['sanitize-pdf']?.maxSingleMB || 50;

  const handleProcess = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);
      setWarnings([]);
      setIsSuccess(false);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
      
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await WorkerManager.getInstance().runOperation<{ bytes: Uint8Array; warnings: string[] }>(
        'sanitizePDF',
        { bytes }
      );

      setWarnings(result.warnings);

      const blob = new Blob([result.bytes], { type: 'application/pdf' });
      const name = file.name.replace(/\.pdf$/i, '') + '-sanitized.pdf';
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(name);
      await downloadBlob(blob, name);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message || 'Failed to sanitize document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="sanitize_pdf_container">
      <SEO slug="sanitize-pdf" />

      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sanitize PDF
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {limitMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Remove embedded scripts, hidden metadata, and malicious actions from your PDF offline for secure sharing. Files must be under {limitMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldBan className="w-5 h-5 text-emerald-600" />
              <span>Select Document</span>
            </div>

            {!file ? (
              <FileUploader
                onFilesSelected={(files) => {
                  if (files && files.length > 0) {
                    setFile(files[0]);
                    setWarnings([]);
                    setError(null);
                    setIsSuccess(false);
                    if (downloadUrl) {
                      URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl(null);
                    }
                  }
                }}
                accept=".pdf,application/pdf"
                title="Select a PDF to sanitize"
                subtitle={`Drag a PDF file here or browse (Max limit: ${limitMB}MB)`}
                maxSizeMB={limitMB}
                id="sanitize_pdf_uploader"
              />
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between" id="loaded_sanitize_file">
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setWarnings([]);
                    setError(null);
                    setIsSuccess(false);
                    if (downloadUrl) {
                      URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl(null);
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-slate-200 py-1.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3 text-xs text-emerald-800 font-bold" id="sanitize_success_banner">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-mint"></span>
                  <span>Sanitization Completed Successfully! Your clean PDF is ready.</span>
                </div>
                <p className="text-slate-500 text-[11px] font-semibold leading-normal">
                  All scripts, hidden actions, and metadata have been purged from the file.
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
                      <span>Download Sanitized PDF</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {warnings.length > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">Sanitization Results:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-emerald-700 font-medium">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Sanitize Actions
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This process permanently neutralizes embedded JavaScript, OpenAction triggers, and potentially harmful Launch actions hidden inside the PDF structure.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={!file || isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/10 ${
                file && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Sanitizing...</span>
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Sanitize & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
