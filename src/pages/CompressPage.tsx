import { ArrowLeft, Minimize2, Download, AlertCircle, Percent } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

export const CompressPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'basic' | 'medium' | 'maximum'>('basic');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    original: string;
    compressed: string;
    ratio: string;
  } | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setComplete(false);
      setStats(null);
      setCompressedBlob(null);
      setError(null);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setComplete(false);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());

      // Pass level to the worker so basic vs maximum actually changes behaviour
      const compressedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'compressPDF',
        { bytes: fileBytes, level },
        [fileBytes.buffer]
      );

      // ✅ Use the REAL compressed bytes — not a fake zeroed Uint8Array
      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });

      const finalSize = blob.size;
      const ratio = Math.max(0, ((1 - finalSize / selectedFile.size) * 100)).toFixed(0);

      setStats({
        original: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        compressed: (finalSize / 1024 / 1024).toFixed(2) + ' MB',
        ratio: ratio + '%',
      });

      setCompressedBlob(blob);
      setComplete(true);
    } catch (err: any) {
      logger.error('Compress error:', err);
      setError(err?.message || 'An unexpected failure occurred while compressing the document.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!compressedBlob || !selectedFile) return;
    await downloadBlob(compressedBlob, `pdfminty_compressed_${selectedFile.name}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="compress_page_container">
      <SEO slug="compress-pdf" />

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
            Compress PDF File
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['compress-pdf'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Shrink document volume for quicker email attachment uploads and portable cloud limits. Files must be under {TOOL_SIZE_LIMITS['compress-pdf'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Minimize2 className="w-5 h-5 text-indigo-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to compress"
                subtitle={`Drag a PDF file here or click to browse (Max limit: ${TOOL_SIZE_LIMITS['compress-pdf'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['compress-pdf'].maxSingleMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_compress_file"
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

          {complete && stats && (
            <div
              className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-2xl space-y-4"
              id="compression_stats"
            >
              <div className="flex items-center space-x-2 font-bold text-emerald-800">
                <Percent className="w-5 h-5" />
                <span>Compression Succeeded!</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Original
                  </span>
                  <span className="font-extrabold text-slate-800 text-base md:text-lg block mt-0.5">
                    {stats.original}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Optimized
                  </span>
                  <span className="font-extrabold text-emerald-700 text-base md:text-lg block mt-0.5">
                    {stats.compressed}
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Reduction
                  </span>
                  <span className="font-extrabold text-emerald-600 text-base md:text-lg block mt-0.5">
                    {stats.ratio}
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed File</span>
              </button>
            </div>
          )}
        </div>

        {/* Compression dials */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Compression Profiles
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setLevel('basic')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  level === 'basic'
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/15'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                disabled={!selectedFile}
              >
                <span className="font-bold text-sm text-slate-900 block">Basic Optimization</span>
                <span className="text-[11px] text-slate-500 block leading-normal mt-0.5">
                  Strips metadata and packs object streams. Lossless — best for text-only PDFs.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('medium')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  level === 'medium'
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/15'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                disabled={!selectedFile}
              >
                <span className="font-bold text-sm text-slate-900 block">Medium Compression</span>
                <span className="text-[11px] text-slate-500 block leading-normal mt-0.5">
                  Re-renders image-heavy pages as JPEG quality 0.7. Best balance of size and clarity.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('maximum')}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  level === 'maximum'
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/15'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                disabled={!selectedFile}
              >
                <span className="font-bold text-sm text-slate-900 block">Maximum Compression</span>
                <span className="text-[11px] text-slate-500 block leading-normal mt-0.5">
                  Re-renders all pages as JPEG quality 0.5. Smallest size, may reduce text clarity.
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!complete && (
              <button
                onClick={handleCompress}
                disabled={!selectedFile || loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/10 ${
                  selectedFile && !loading
                    ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer hover:-translate-y-0.5'
                    : 'bg-slate-300 pointer-events-none shadow-none'
                }`}
              >
                {loading ? (
                  <span className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Optimizing binary streams...</span>
                  </span>
                ) : (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Compress Document</span>
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
