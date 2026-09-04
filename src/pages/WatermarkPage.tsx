import { ArrowLeft, Bookmark, AlertCircle, Download } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { TOOLS } from '../config/seo-data';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

export const WatermarkPage: React.FC = () => {
  const toolInfo = TOOLS.find((t) => t.id === 'watermark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [size, setSize] = useState<number>(45);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [color, setColor] = useState<string>('#94a3b8'); // Slate-400
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');

  // Live preview states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renderingPreview, setRenderingPreview] = useState<boolean>(false);
  const operationTokenRef = React.useRef<number>(0);

  React.useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [downloadUrl, previewUrl]);

  // Extract first page preview image
  React.useEffect(() => {
    const generatePreview = async () => {
      if (!selectedFile) {
        setPreviewUrl(null);
        return;
      }

      const myToken = ++operationTokenRef.current;
      setRenderingPreview(true);

      try {
        const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
        if (myToken !== operationTokenRef.current) return;

        // Render first page as PNG image using the worker operation
        const rendered = await WorkerManager.getInstance().runOperation<
          { page: number; imageBytes: Uint8Array }[]
        >('pdfToImage', { bytes: fileBytes, originalName: selectedFile.name, scale: 0.4 }, [
          fileBytes.buffer,
        ]);

        if (myToken !== operationTokenRef.current) return;

        if (rendered && rendered.length > 0) {
          const blob = new Blob([rendered[0].imageBytes as unknown as BlobPart], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (err) {
        logger.error('Failed to generate watermark page preview:', err);
      } finally {
        if (myToken === operationTokenRef.current) {
          setRenderingPreview(false);
        }
      }
    };

    generatePreview();
  }, [selectedFile]);

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
    setIsSuccess(false);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const watermarkedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'watermarkPDF',
        { bytes: fileBytes, text, options: { size, opacity, colorHex: color } },
        [fileBytes.buffer]
      );

      const blob = new Blob([watermarkedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const name = `pdfminty_stamped_${selectedFile.name}`;
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(name);
      await downloadBlob(blob, name);
      setIsSuccess(true);
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
            {toolInfo?.h1 || 'Watermark PDF'}
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
              <div className="space-y-4">
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
                    onClick={() => {
                      setSelectedFile(null);
                      setIsSuccess(false);
                      if (downloadUrl) {
                        URL.revokeObjectURL(downloadUrl);
                        setDownloadUrl(null);
                      }
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-slate-200 py-1 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Change File
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                      <span>Real-time Visual Preview</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                      Page 1
                    </span>
                  </div>

                  <div className="relative w-full aspect-[1/1.4] max-w-sm mx-auto bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center">
                    {renderingPreview ? (
                      <div className="flex flex-col items-center gap-2.5 text-slate-400">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold tracking-wider uppercase animate-pulse">Loading Document...</span>
                      </div>
                    ) : previewUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-50">
                        {/* Rendered PDF Page Background */}
                        <img
                          src={previewUrl}
                          alt="PDF Page 1 Preview"
                          className="w-full h-full object-contain pointer-events-none"
                        />

                        {/* Real-time Watermark Overlay */}
                        {text.trim() && (
                          <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
                            style={{ opacity: opacity }}
                          >
                            <div
                              className="font-extrabold uppercase whitespace-nowrap tracking-widest transition-all duration-150 transform -rotate-45"
                              style={{
                                fontSize: `${size * 0.4}px`, // scaled down for layout spacing
                                color: color,
                                textShadow: `0 0 1px ${color}44`,
                              }}
                            >
                              {text}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Exquisite mock page overlay if PDF.js is unavailable
                      <div className="relative w-full h-full bg-white flex flex-col justify-between p-6">
                        {/* Skeletal document lines */}
                        <div className="space-y-3 opacity-[0.08]">
                          <div className="h-4 w-1/2 bg-slate-900 rounded"></div>
                          <div className="space-y-1.5 pt-2">
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-5/6 bg-slate-800 rounded"></div>
                          </div>
                          <div className="space-y-1.5 pt-4">
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-4/5 bg-slate-800 rounded"></div>
                          </div>
                          <div className="space-y-1.5 pt-4">
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                          </div>
                        </div>

                        {/* Stamped text */}
                        {text.trim() && (
                          <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
                            style={{ opacity: opacity }}
                          >
                            <div
                              className="font-extrabold uppercase whitespace-nowrap tracking-widest transition-all duration-150 transform -rotate-45"
                              style={{
                                fontSize: `${size * 0.45}px`,
                                color: color,
                              }}
                            >
                              {text}
                            </div>
                          </div>
                        )}

                        <div className="text-[9px] text-slate-400 font-bold self-center text-center mt-auto bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          Template View
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3 text-xs text-emerald-800 font-bold" id="watermark_success_banner">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-mint"></span>
                <span>Watermark Applied Successfully! Your stamped PDF has been generated.</span>
              </div>
              <p className="text-slate-500 text-[11px] font-semibold leading-normal">
                The watermark text has been overlayed onto your document pages locally in your browser.
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
                    <span>Download Stamped PDF</span>
                  </a>
                </div>
              )}
            </div>
          )}
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
                
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'APPROVED', 'FINAL'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setText(preset)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 transition-colors"
                      disabled={!selectedFile}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

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
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Stamp Color:
                </span>
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
