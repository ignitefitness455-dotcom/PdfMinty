import { ArrowLeft, Move, Download, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';

interface PageItem {
  page: number; // Original 1-based page index
  dataUrl: string;
}

export const ReorderPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [renderingThumbnails, setRenderingThumbnails] = useState(false);
  const [items, setItems] = useState<PageItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const urlsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    urlsRef.current = items.map((item) => item.dataUrl);
  }, [items]);

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
      // Revoke any existing URLs before resetting / rendering new
      items.forEach((item) => URL.revokeObjectURL(item.dataUrl));
      const file = files[0];
      setSelectedFile(file);
      setError(null);
      setItems([]);

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
        setItems(mapped);
      } catch (err: any) {
        console.error('Failed to render previews:', err);
        setError(
          'Error generating page layouts. You can still confirm standard sequencing if required.'
        );
      } finally {
        setRenderingThumbnails(false);
      }
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    if (draggedIndex === index) {
      setDraggedIndex(null);
      return;
    }

    const reordered = [...items];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, removed);
    setItems(reordered);
    setDraggedIndex(null);
  };

  const resetOrder = () => {
    const original = [...items].sort((a, b) => a.page - b.page);
    setItems(original);
  };

  const handleReorder = async () => {
    if (!selectedFile) return;
    if (items.length === 0) {
      setError('Please upload a PDF document with valid pages first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const newSequence = items.map((item) => item.page); // Map visual grid to original 1-indexed page bounds

      const parsedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'reorderPDF',
        { bytes: fileBytes, newOrder: newSequence },
        [fileBytes.buffer]
      );

      const blob = new Blob([parsedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordered_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Reorder PDF failed:', err);
      setError(err?.message || 'Failed to reorder document layout. Confirm pages structure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="reorder_page_container">
      <SEO slug="reorder-pdf" />

      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reorder PDF Pages
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['delete-pages-pdf']?.maxSingleMB || 50}MB
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Sort, rearrange, or shuffle PDF pages interactively. Drag and drop any slot to fine-tune your document order. Files must be under {TOOL_SIZE_LIMITS['delete-pages-pdf']?.maxSingleMB || 50} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <Move className="w-5 h-5 text-emerald-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to drag & reorder"
                subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['delete-pages-pdf']?.maxSingleMB || 50}MB)`}
                accept="application/pdf"
                maxSizeMB={TOOL_SIZE_LIMITS['delete-pages-pdf']?.maxSingleMB || 50}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between"
                id="loaded_reorder_file"
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
                    setItems([]);
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
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                    Arrange PDF Page Elements
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Drag thumbnails left or right to re-sequence. Dropping swaps the positions
                    cleanly.
                  </p>
                </div>
                {items.length > 0 && (
                  <button
                    onClick={resetOrder}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline bg-slate-50 dark:bg-slate-950/45 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 self-start sm:self-auto"
                  >
                    Reset Order
                  </button>
                )}
              </div>

              {renderingThumbnails ? (
                <div
                  className="flex flex-col items-center justify-center p-12 space-y-3"
                  id="reorder_thumbnails_loader"
                >
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-400">
                    Rendering pages for workspace drag grids...
                  </p>
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6" id="reorder_draggable_grid">
                  {items.map((item, index) => {
                    const isDragging = draggedIndex === index;
                    return (
                      <div
                        key={`${item.page}-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        id={`draggable-page-${index}`}
                        className={`group relative aspect-[3/4] bg-slate-50 dark:bg-slate-950/40 border-2 rounded-xl p-1.5 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all select-none ${
                          isDragging
                            ? 'opacity-40 border-dashed border-emerald-500 scale-95'
                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md'
                        }`}
                      >
                        {/* Sequence badge & indicator handles */}
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-white font-extrabold text-[10px] rounded shadow-sm">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2 z-10 p-1 rounded-md bg-white border border-slate-200 opacity-0 group-hover:opacity-100 dark:bg-slate-950 dark:border-slate-800 text-slate-400 transition-opacity">
                          <Move className="w-3.5 h-3.5" />
                        </div>

                        <div className="w-full h-[85%] bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-inner pointer-events-none">
                          <img
                            src={item.dataUrl}
                            alt={`Page ${item.page}`}
                            referrerPolicy="no-referrer"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        <div className="w-full flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 px-1 font-semibold pointer-events-none">
                          <span>Original P.{item.page}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <p className="text-xs text-slate-500">Add a file above to begin ordering.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configuration Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Layout Summary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Rearranging pages lets you correct scanner mistakes, adjust slide order, or prepend
              covers before merging or sending.
            </p>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium leading-normal flex items-start gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                Grids run fully offline. Page indices in the top-left indicate the final assembled
                order.
              </span>
            </div>

            {items.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/45 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Output Ordering Matrix
                </p>
                <div className="flex flex-wrap gap-1">
                  {items.map((item, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-mono text-[10px] rounded inline-flex items-center gap-1 shadow-sm"
                    >
                      <span className="text-[9px] text-slate-400">#{index + 1}:</span> P.{item.page}
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
              onClick={handleReorder}
              disabled={!selectedFile || items.length === 0 || loading}
              className={`w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-950/25 dark:disabled:text-slate-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-colors ${
                loading ? 'cursor-not-allowed opacity-80' : ''
              }`}
              id="confirm-reorder-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Reordering Assembling...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Reorder and Save PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReorderPdfPage;
