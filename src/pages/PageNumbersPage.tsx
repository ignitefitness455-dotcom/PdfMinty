import { ArrowLeft, Hash, AlertCircle, Download } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

export const PageNumbersPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pattern, setPattern] = useState<string>('Page {n} of {total}');
  const [patternWarning, setPatternWarning] = useState<string | null>(null);
  const [position, setPosition] = useState<string>('bottom-right');
  const [startFrom, setStartFrom] = useState<number>(1);
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('');

  // Live preview states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [renderingPreview, setRenderingPreview] = useState<boolean>(false);
  const operationTokenRef = React.useRef<number>(0);

  // Clean up Object URL on unmount to prevent memory leaks
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
        logger.error('Failed to generate page numbers preview:', err);
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

  const handleApply = async () => {
    if (!selectedFile) return;
    if (!pattern.trim()) {
      setError('Please provide a pattern config string.');
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
      const updatedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'addPageNumbersPDF',
        { bytes: fileBytes, options: { format: pattern, position, startFrom, skipFirstPage } },
        [fileBytes.buffer]
      );
      const blob = new Blob([updatedBytes as unknown as BlobPart], { type: 'application/pdf' });
      const name = `pdfminty_numbered_${selectedFile.name}`;
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(name);

      // Attempt automatic download
      await downloadBlob(blob, name);
      setIsSuccess(true);
    } catch (err: unknown) {
      logger.error('Page numbers error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'An unexpected failure occurred while numbering pages.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="page_numbers_container">
      <SEO slug="add-page-numbers" />

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
            Add PDF Page Numbers
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['add-page-numbers'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Overlay sequential pagination logs across all page footers securely. Files must be under {TOOL_SIZE_LIMITS['add-page-numbers'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Hash className="w-5 h-5 text-cyan-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to paginate"
                subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['add-page-numbers'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['add-page-numbers'].maxSingleMB}
              />
            ) : (
              <div className="space-y-4">
                <div
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  id="loaded_number_file"
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
                    Change File
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                      <span>Real-time Placement Preview</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                      Page 1 of 12
                    </span>
                  </div>

                  <div className="relative w-full aspect-[1/1.4] max-w-sm mx-auto bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center">
                    {renderingPreview ? (
                      <div className="flex flex-col items-center gap-2.5 text-slate-400">
                        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold tracking-wider uppercase animate-pulse">Loading Document...</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center bg-white">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="PDF Page 1 Preview"
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : (
                          // Exquisite mock page overlay if PDF.js is unavailable
                          <div className="relative w-full h-full bg-white flex flex-col justify-between p-6">
                            <div className="space-y-3 opacity-[0.08] w-full">
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
                            <div className="text-[9px] text-slate-400 font-bold self-center text-center mt-auto bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              Template View
                            </div>
                          </div>
                        )}

                        {/* Pagination Text Overlay based on selected Position */}
                        {skipFirstPage ? (
                          <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] flex items-center justify-center p-4">
                            <div className="bg-slate-800/90 text-white text-[10px] font-bold tracking-wide py-1.5 px-3 rounded shadow-lg text-center leading-normal max-w-[200px]">
                              Title Page (Skipped)
                              <span className="block text-[8px] text-slate-300 font-medium mt-0.5">
                                Pagination starts on page 2
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`absolute font-mono font-bold text-[10px] md:text-xs text-slate-800 bg-cyan-150 border border-cyan-300/40 px-2 py-0.5 rounded shadow-sm flex items-center justify-center select-none ${
                              position === 'top-left' ? 'top-3 left-3' :
                              position === 'top-center' ? 'top-3 left-1/2 -translate-x-1/2' :
                              position === 'top-right' ? 'top-3 right-3' :
                              position === 'bottom-left' ? 'bottom-3 left-3' :
                              position === 'bottom-center' ? 'bottom-3 left-1/2 -translate-x-1/2' :
                              'bottom-3 right-3'
                            }`}
                          >
                            {pattern
                              .replace(/{n}/g, String(startFrom))
                              .replace(/{total}/g, '12') || `${startFrom}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3 text-xs text-emerald-800 font-bold" id="page_numbers_success_banner">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-mint"></span>
                  <span>Page Numbering Completed Successfully! Your numbered PDF has been generated.</span>
                </div>
                <p className="text-slate-500 text-[11px] font-semibold leading-normal">
                  Sequential page numbers have been overlayed on your document pages.
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
                      <span>Download Numbered PDF</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Configurations column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Layout Format
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="pattern_input"
                className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
              >
                Sequence Pattern:
              </label>
              <input
                id="pattern_input"
                type="text"
                value={pattern}
                onChange={(e) => {
                  const value = e.target.value;
                  setPattern(value);
                  if (value && !value.includes('{n}')) {
                    setPatternWarning('Pattern does not include {n}. Every page will show identical text.');
                  } else {
                    setPatternWarning(null);
                  }
                }}
                placeholder="Page {n} of {total}"
                className="w-full border border-slate-300 rounded-xl py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!selectedFile}
              />
            </div>

            {patternWarning && (
              <div className="flex items-start space-x-1.5 p-2.5 rounded-lg border border-amber-100 bg-amber-50 text-amber-800 text-xs" role="status">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{patternWarning}</span>
              </div>
            )}

            <p className="text-xs text-slate-400 leading-normal">
              Use{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-semibold">
                {'{n}'}
              </code>{' '}
              for current index, and{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-semibold">
                {'{total}'}
              </code>{' '}
              for overall sheet count bounds.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="position_select"
                className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
              >
                Placement Position:
              </label>
              <select
                id="position_select"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                disabled={!selectedFile}
              >
                <option value="bottom-right">Bottom Right (Standard)</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-center">Top Center</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="start_from_input"
                className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
              >
                First Index Value:
              </label>
              <input
                id="start_from_input"
                type="number"
                min="0"
                max="10000"
                value={startFrom}
                onChange={(e) => setStartFrom(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full border border-slate-300 rounded-xl py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!selectedFile}
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                id="skip_first_checkbox"
                type="checkbox"
                checked={skipFirstPage}
                onChange={(e) => setSkipFirstPage(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!selectedFile}
              />
              <label
                htmlFor="skip_first_checkbox"
                className="text-xs font-bold text-slate-600 uppercase tracking-wider block cursor-pointer select-none"
              >
                Skip Title/First Page
              </label>
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
              onClick={handleApply}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/10 ${
                selectedFile && !loading
                  ? 'bg-cyan-600 hover:bg-cyan-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Rendering footers...</span>
                </span>
              ) : (
                <>
                  <Hash className="w-4 h-4" />
                  <span>Number All Pages</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
