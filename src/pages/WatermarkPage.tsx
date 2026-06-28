import { ArrowLeft, Bookmark, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

export const WatermarkPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [size, setSize] = useState<number>(45);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [color, setColor] = useState<string>('#94a3b8'); // Slate-400
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleWatermark = async () => {
    if (!selectedFile) return;
    if (!text.trim()) {
      setError('Please enter watermark text.');
      return;
    }
    if (text.length > 60) {
      setError('Watermark text is too long. Maximum 60 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const watermarkedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'watermarkPDF',
        { bytes: fileBytes, text, options: { size, opacity, colorHex: color } },
        [fileBytes.buffer]
      );

      const blob = new Blob([watermarkedBytes as unknown as BlobPart], { type: 'application/pdf' });
      await downloadBlob(blob, `pdfminty_stamped_${selectedFile.name}`);
    } catch (err: unknown) {
       logger.error('Watermark error:', err);
       const message = err instanceof Error ? err.message : String(err);
       setError(message || 'An unexpected error occurred while adding the watermark.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="watermark_page_container">
      <SEO slug="watermark-pdf" />

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
            Watermark PDF
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['watermark-pdf'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Overlay diagonal text blocks onto pages to label status or prevent data leaks. Files must be under {TOOL_SIZE_LIMITS['watermark-pdf'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Bookmark className="w-5 h-5 text-purple-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to watermark"
                subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['watermark-pdf'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['watermark-pdf'].maxSingleMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_watermark_file"
              >
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
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
              Watermark Config
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="watermark_text"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
                >
                  Stamp Text:
                </label>
                <input
                  id="watermark_text"
                  type="text"
                  maxLength={60}
                  aria-label="Watermark text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. DRAFT"
                  className="w-full border border-slate-300 rounded-xl py-2 px-3.5 text-sm font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={!selectedFile}
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">
                  {text.length} / 60
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stamp_size"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
                >
                  Font Size: {size}px
                </label>
                <input
                  id="stamp_size"
                  type="range"
                  min="20"
                  max="100"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                  disabled={!selectedFile}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="stamp_opacity"
                  className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
                >
                  Opacity: {(opacity * 100).toFixed(0)}%
                </label>
                <input
                  id="stamp_opacity"
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                  disabled={!selectedFile}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Stamp Color:
                </label>
                <div className="flex items-center space-x-2">
                  {[
                    { hex: '#94a3b8', label: 'Gray' },
                    { hex: '#ef4444', label: 'Red' },
                    { hex: '#22c55e', label: 'Green' },
                    { hex: '#3b82f6', label: 'Blue' },
                    { hex: '#f59e0b', label: 'Amber' },
                  ].map((item) => (
                    <button
                      key={item.hex}
                      type="button"
                      onClick={() => setColor(item.hex)}
                      aria-label={`Watermark color: ${item.label}`}
                      aria-pressed={color === item.hex}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        color === item.hex
                          ? 'border-slate-800 scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: item.hex }}
                      disabled={!selectedFile}
                    />
                  ))}
                </div>
              </div>
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
              onClick={handleWatermark}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-600/10 ${
                selectedFile && !loading
                  ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Superimposing stamp...</span>
                </span>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Apply Watermark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
