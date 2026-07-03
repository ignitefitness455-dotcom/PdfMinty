import { ArrowLeft, RefreshCw, AlertCircle, Wrench, Download, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

export const RepairPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [repairsList, setRepairsList] = useState<string[]>([]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
      setIsSuccess(false);
      setRepairsList([]);
    }
  };

  const handleRepair = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setIsSuccess(false);
    setRepairsList([]);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const response = await WorkerManager.getInstance().runOperation<{ bytes: Uint8Array; repairs: string[] }>(
        'repairPDF',
        { bytes: fileBytes },
        [fileBytes.buffer]
      );
      
      const blob = new Blob([response.bytes as unknown as BlobPart], { type: 'application/pdf' });
      await downloadBlob(blob, `pdfminty_repaired_${selectedFile.name}`);
      setRepairsList(response.repairs || []);
      setIsSuccess(true);
    } catch (err: unknown) {
      logger.error('Repair error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'An unexpected error occurred while attempting to repair the PDF.');
    } finally {
      setLoading(false);
    }
  };

  const limitMB = TOOL_SIZE_LIMITS['repair-pdf']?.maxSingleMB || 50;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="repair_page_container">
      <SEO slug="repair-pdf" />

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
            Repair PDF
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {limitMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm font-semibold">
          Attempt to fix common structural corruptions, broken cross-reference tables (XREFs), missing trailers, or header alignment issues locally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Wrench className="w-5 h-5 text-security-green" />
              <span>Document Workspace</span>
            </div>

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                accept=".pdf,application/pdf"
                title="Select a corrupted PDF to repair"
                subtitle={`Drag and drop your document here or browse (Max: ${limitMB}MB)`}
                maxSizeMB={limitMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_repair_file"
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
                    setRepairsList([]);
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
                  <span>Repair Completed Successfully! Repaired file downloaded.</span>
                </div>
                {repairsList.length > 0 && (
                  <div className="space-y-1.5 border-t border-emerald-200/50 pt-2.5">
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider font-extrabold">Applied Repairs:</p>
                    <ul className="space-y-1">
                      {repairsList.map((repair, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{repair}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Repair Actions
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This utility performs multi-stage sanitization, including stripping redundant server headers, standardizing EOF offsets, and rebuilding cross-reference metadata tables.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleRepair}
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
                  <span>Repairing PDF...</span>
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Repair & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairPdfPage;
