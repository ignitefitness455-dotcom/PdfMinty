import { ArrowLeft, Eye, Download, AlertCircle, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';

export const PdfToImgPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ page: number; dataUrl: string; format: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [maxPagesLimit, setMaxPagesLimit] = useState<string>('15');
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg'>('image/png');

  const urlsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    urlsRef.current = imageUrls.map((item) => item.dataUrl);
  }, [imageUrls]);

  React.useEffect(() => {
    return () => {
      // Clean up all generated URLs when leaving page
      urlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      imageUrls.forEach((item) => URL.revokeObjectURL(item.dataUrl));
      setSelectedFile(files[0]);
      setImageUrls([]);
      setError(null);
    }
  };

  const handleExport = async () => {
    if (!selectedFile) return;

    imageUrls.forEach((item) => URL.revokeObjectURL(item.dataUrl));
    setLoading(true);
    setError(null);
    setImageUrls([]);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const maxPagesVal = maxPagesLimit === 'all' ? undefined : parseInt(maxPagesLimit, 10);

      const rendered = await WorkerManager.getInstance().runOperation<
        { page: number; imageBytes: Uint8Array }[]
      >('pdfToImage', { bytes: fileBytes, originalName: selectedFile.name, scale: 1.5, maxPages: maxPagesVal, format: exportFormat }, [
        fileBytes.buffer,
      ]);

      const convertedToDataUrls = rendered.map((item) => {
        // Blob from Uint8Array
        const blob = new Blob([item.imageBytes as any], { type: exportFormat });
        return {
          page: item.page,
          dataUrl: URL.createObjectURL(blob),
          format: exportFormat,
        };
      });

      setImageUrls(convertedToDataUrls);
    } catch (err: any) {
      console.error('Export images failed:', err);
      // Fallback: If pdfjs-dist gets worker loading issue in local environment, provide simple guide
      setError(
        err?.message ||
          'Error occurred during PDF parsing. Encrypted documents are not supported for canvas extraction.'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (dataUrl: string, page: number, format: string) => {
    if (!selectedFile) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    const ext = format === 'image/jpeg' ? 'jpeg' : 'png';
    link.download = `pdfminty_page_${page}_${selectedFile.name.replace(/\.pdf$/i, '')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="pdf_to_img_container">
      <SEO slug="pdf-to-image" />

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
            Convert PDF to Images
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['pdf-to-image'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Extract PDF layouts and export each page into high-definition raster PNG files offline. Files must be under {TOOL_SIZE_LIMITS['pdf-to-image'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Eye className="w-5 h-5 text-violet-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to convert"
                subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['pdf-to-image'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['pdf-to-image'].maxSingleMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_to_img_file"
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

          {imageUrls.length > 0 && (
            <div
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              id="rendered_img_deck"
            >
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Rendered Pages Decodes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageUrls.map((item) => (
                  <div
                    key={item.page}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div className="aspect-[3/4] relative w-full bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                      <img
                        src={item.dataUrl}
                        alt={`Page ${item.page}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Page {item.page}</span>
                      <button
                        onClick={() => downloadImage(item.dataUrl, item.page, item.format)}
                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="uppercase">{item.format.replace('image/', '')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configurations column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Image Export
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export is performed entirely using client hardware. No document info gets sent out.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="export_format_select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Export Format:
                </label>
                <select
                  id="export_format_select"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'image/png' | 'image/jpeg')}
                  className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="image/png">PNG (Lossless, higher quality)</option>
                  <option value="image/jpeg">JPEG (Smaller file size, fast sharing)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="max_pages_limit_select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Max pages to convert:
                </label>
              <select
                id="max_pages_limit_select"
                value={maxPagesLimit}
                onChange={(e) => setMaxPagesLimit(e.target.value)}
                className="w-full border border-slate-300 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="5">First 5 Pages</option>
                <option value="10">First 10 Pages</option>
                <option value="15">First 15 Pages</option>
                <option value="30">First 30 Pages</option>
                <option value="all">All Pages (Unlimited)</option>
              </select>
            </div>
          </div>

            {maxPagesLimit === 'all' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-800 leading-normal">
                <span className="font-bold block mb-0.5">⚠️ Memory warning:</span>
                Rendering all pages at high-definition scales (1.5x) uses significant browser memory and CPU locally. For very large PDF files, this might cause your browser tab to temporarily freeze.
              </div>
            )}

            <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-[11px] text-violet-800 font-medium leading-normal flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span>Converts PDF plates locally to raw PNG grids</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {imageUrls.length === 0 && (
              <button
                onClick={handleExport}
                disabled={!selectedFile || loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-violet-600/10 ${
                  selectedFile && !loading
                    ? 'bg-violet-600 hover:bg-violet-700 cursor-pointer hover:-translate-y-0.5'
                    : 'bg-slate-300 pointer-events-none shadow-none'
                }`}
              >
                {loading ? (
                  <span className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Extracting layers...</span>
                  </span>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Render Pages</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
