import {
  ArrowLeft,
  Check,
  CheckSquare,
  Square,
  Download,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';

export const ExtractPagesPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderingThumbnails, setRenderingThumbnails] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ page: number; dataUrl: string }[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const urlsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    urlsRef.current = thumbnails.map((t) => t.dataUrl);
  }, [thumbnails]);

  React.useEffect(() => {
    return () => {
      // Clean up all generated URLs when leaving page
      urlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      // Revoke any existing URLs before resetting/rendering new
      thumbnails.forEach((t) => URL.revokeObjectURL(t.dataUrl));
      const file = files[0];
      setSelectedFile(file);
      setError(null);
      setThumbnails([]);
      setSelectedPages([]);

      setRenderingThumbnails(true);
      try {
        const fileBytes = new Uint8Array(await file.arrayBuffer());
        const rendered = await WorkerManager.getInstance().runOperation<
          { page: number; imageBytes: Uint8Array }[]
        >('pdfToImage', { bytes: fileBytes, originalName: file.name, scale: 0.3 }, [
          fileBytes.buffer,
        ]);
        const mapped = rendered.map((item) => {
          const blob = new Blob([item.imageBytes as any], { type: 'image/png' });
          return {
            page: item.page,
            dataUrl: URL.createObjectURL(blob),
          };
        });
        setThumbnails(mapped);
      } catch (err: any) {
        console.error('Failed to render previews:', err);
        setError(
          'Previews could not be rendered, but you can still run extraction using standard page parameters.'
        );
      } finally {
        setRenderingThumbnails(false);
      }
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    if (selectedPages.includes(pageNumber)) {
      setSelectedPages(selectedPages.filter((p) => p !== pageNumber));
    } else {
      setSelectedPages([...selectedPages, pageNumber].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    if (thumbnails.length > 0) {
      setSelectedPages(thumbnails.map((t) => t.page));
    }
  };

  const clearSelection = () => {
    setSelectedPages([]);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    if (selectedPages.length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const extractedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'extractPages',
        { bytes: fileBytes, pageNumbers: selectedPages },
        [fileBytes.buffer]
      );

      const blob = new Blob([extractedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Extract error:', err);
      setError(err?.message || 'Failed to extract selected pages from the document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="extract_pages_page_container">
      <SEO slug="extract-pages-pdf" />

      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Extract PDF Pages
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Selectively extract and export individual pages into a separate, clean PDF document
          instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <CheckSquare className="w-5 h-5 text-emerald-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to extract pages"
                subtitle="Drag a PDF file here or browse"
                accept="application/pdf"
              />
            ) : (
              <div
                className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between"
                id="loaded_extract_file"
              >
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setThumbnails([]);
                    setSelectedPages([]);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Change File
                </button>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                  Select Pages for Extraction
                </h3>
                {thumbnails.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={selectAll}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline bg-slate-50 dark:bg-slate-950/40 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline bg-slate-50 dark:bg-slate-950/40 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {renderingThumbnails ? (
                <div
                  className="flex flex-col items-center justify-center p-12 space-y-3"
                  id="thumbnails_loader"
                >
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-400">
                    Loading document pages structure...
                  </p>
                </div>
              ) : thumbnails.length > 0 ? (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  id="thumbnails_interactive_grid"
                >
                  {thumbnails.map((item) => {
                    const isSelected = selectedPages.includes(item.page);
                    return (
                      <button
                        key={item.page}
                        id={`page-thumbnail-btn-${item.page}`}
                        onClick={() => togglePageSelection(item.page)}
                        className={`group relative aspect-[3/4] bg-slate-50 dark:bg-slate-950/40 border-2 rounded-xl overflow-hidden focus:outline-none transition-all p-1 flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 ring-4 ring-emerald-500/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="absolute top-2 left-2 z-10 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-slate-400" />
                          )}
                        </div>

                        <div className="w-full h-[85%] bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                          <img
                            src={item.dataUrl}
                            alt={`Page ${item.page}`}
                            referrerPolicy="no-referrer"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        <div className="w-full flex items-center justify-center pt-1">
                          <span
                            className={`text-[10px] font-extrabold ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            Page {item.page}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <p className="text-xs text-slate-500">
                    Could not extract individual page views for this document type.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Extraction Config
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Unlike the standard Split tool, this lets you cherry-pick specific pages in any order
              and combine them into a single, light document.
            </p>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium leading-normal flex items-start gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                Select individual thumbnails to extract. Selected order represents their output
                sequence.
              </span>
            </div>

            {selectedPages.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/45 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Target Pages Sequence ({selectedPages.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedPages.map((page, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[10px] rounded"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleExtract}
              disabled={!selectedFile || selectedPages.length === 0 || loading}
              className={`w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-950/20 dark:disabled:text-slate-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors ${
                loading ? 'cursor-not-allowed opacity-80' : ''
              }`}
              id="confirm-extract-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Extracting Pages...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Extract Pages ({selectedPages.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtractPagesPdfPage;
