import { ArrowLeft, FilePlus, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';

export const AddBlankPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [positionType, setPositionType] = useState<'start' | 'end' | 'custom'>('end');
  const [customIndex, setCustomIndex] = useState<number>(2);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setSelectedFile(files[0]);
    setError(null);
    try {
      const bytes = new Uint8Array(await files[0].arrayBuffer());
      const count = await WorkerManager.getInstance().runOperation<number>('getPageCount', { bytes });
      setTotalPages(count);
      if (customIndex > count + 1) setCustomIndex(count + 1);
    } catch {
      setError('Failed to read PDF. It may be corrupted.');
    }
  };

  const handleInsert = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const targetPos = positionType === 'custom' ? customIndex : positionType;
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const updatedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'addBlankPagePDF',
        { bytes: fileBytes, position: targetPos },
        [fileBytes.buffer]
      );
      const blob = new Blob([updatedBytes as any], { type: 'application/pdf' });
      await downloadBlob(blob, `pdfminty_padded_${selectedFile.name}`);
    } catch (err: any) {
      console.error('Add blank page error:', err);
      setError(err?.message || 'An unexpected error occurred while adding the blank page.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="add_blank_container">
      <SEO slug="add-blank-page" />

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
            Add Blank Page
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['add-blank-page'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Embed empty canvas spaces into start, middle, or end indices of your document. Files must be under {TOOL_SIZE_LIMITS['add-blank-page'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <FilePlus className="w-5 h-5 text-sky-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to pad"
                subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['add-blank-page'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['add-blank-page'].maxSingleMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_blank_file"
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
                    setTotalPages(0);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-slate-200 py-1 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Change File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Configurations column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Insert Location
            </h3>

            <div className="space-y-3">
              {[
                { type: 'start', label: 'Start', desc: 'Prepend at very beginning of file' },
                { type: 'end', label: 'End', desc: 'Append at final trailing page' },
                { type: 'custom', label: 'Custom Index', desc: 'Insert at specific page offset' },
              ].map((pos) => (
                <button
                  key={pos.type}
                  type="button"
                  onClick={() => setPositionType(pos.type as any)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    positionType === pos.type
                      ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/15'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  disabled={!selectedFile}
                >
                  <span className="font-bold text-sm text-slate-900 block">{pos.label}</span>
                  <span className="text-[11px] text-slate-500 block leading-normal mt-0.5">
                    {pos.desc}
                  </span>
                </button>
              ))}

              {positionType === 'custom' && (
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-fadeIn text-xs">
                  <label htmlFor="custom_pg_index" className="font-bold text-slate-600 block">
                    Insert at page index:
                  </label>
                  <input
                    id="custom_pg_index"
                    type="number"
                    min="1"
                    max={totalPages + 1}
                    value={customIndex}
                    onChange={(e) => {
                      // parseInt('') returns NaN. Math.max(1, NaN) returns NaN (not 1!).
                      // Coerce with || 1 so an empty input always falls back to 1, never NaN.
                      const parsed = parseInt(e.target.value, 10);
                      setCustomIndex(Number.isNaN(parsed) ? 1 : Math.max(1, parsed));
                    }}
                    className="w-full border border-slate-300 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-bold"
                  />
                  <p className="text-xs text-slate-400">
                    Document has {totalPages} pages. Insert position must be between 1 and {totalPages + 1}.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleInsert}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-sky-600/10 ${
                selectedFile && !loading
                  ? 'bg-sky-600 hover:bg-sky-750 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Threading sheets...</span>
                </span>
              ) : (
                <>
                  <FilePlus className="w-4 h-4" />
                  <span>Insert Page</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
