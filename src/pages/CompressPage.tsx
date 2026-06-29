import { ArrowLeft, Minimize2, Download, AlertCircle, Percent, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

const PROFILES = [
  {
    id: 'maximum' as const,
    label: 'Extreme',
    reduction: '~40% smaller',
    desc: 'Maximum compression, lower quality',
    factor: 0.6,
  },
  {
    id: 'medium' as const,
    label: 'Standard',
    reduction: '~20% smaller',
    desc: 'Optimal balance of size and quality',
    factor: 0.8,
  },
  {
    id: 'basic' as const,
    label: 'Low',
    reduction: '~10% smaller',
    desc: 'Minimal compression, best quality',
    factor: 0.9,
  },
] as const;

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

      const compressedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'compressPDF',
        { bytes: fileBytes, level },
        [fileBytes.buffer]
      );

      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });

      const finalSize = blob.size;
      let ratio: string;
      if (selectedFile.size === 0) {
        ratio = '0%';
      } else {
        ratio = Math.max(0, ((1 - finalSize / selectedFile.size) * 100)).toFixed(0) + '%';
      }

      setStats({
        original: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        compressed: (finalSize / 1024 / 1024).toFixed(2) + ' MB',
        ratio: ratio,
      });

      setCompressedBlob(blob);
      setComplete(true);
    } catch (err: unknown) {
      logger.error('Compress error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'An unexpected failure occurred while compressing the document.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!compressedBlob || !selectedFile) return;
    await downloadBlob(compressedBlob, `pdfminty_compressed_${selectedFile.name}`);
  };

  const getEstimatedSize = () => {
    if (!selectedFile) return '';
    const currentProfile = PROFILES.find((p) => p.id === level);
    const factor = currentProfile ? currentProfile.factor : 0.9;
    return `~${((selectedFile.size * factor) / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleCloseSelection = () => {
    setSelectedFile(null);
    setComplete(false);
    setStats(null);
    setCompressedBlob(null);
    setError(null);
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

      <div className="flex justify-center py-4" id="compress_main_area">
        {!selectedFile ? (
          <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <Minimize2 className="w-6 h-6 text-indigo-600" />
            <FileUploader
              onFilesSelected={handleFilesSelected}
              title="Select a PDF to compress"
              subtitle={`Drag a PDF file here or click to browse (Max limit: ${TOOL_SIZE_LIMITS['compress-pdf'].maxSingleMB}MB)`}
              maxSizeMB={TOOL_SIZE_LIMITS['compress-pdf'].maxSingleMB}
            />
          </div>
        ) : (
          <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-7 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                File compression
              </h2>
              <button
                type="button"
                onClick={handleCloseSelection}
                className="p-1 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                aria-label="Cancel compression selection"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!complete ? (
              <>
                <p className="text-sm font-semibold text-slate-500">
                  Select a compression level to continue:
                </p>

                {/* Selected File Box */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    <div className="flex-shrink-0 bg-red-500 text-white font-black text-[9px] px-1.5 py-1 rounded-md tracking-wider leading-none shadow-sm">
                      PDF
                    </div>
                    <span className="text-sm font-bold text-slate-700 truncate">
                      {selectedFile.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-2">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>

                {/* Estimated Size Progress-like Bar */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50/80 border border-emerald-100/60 rounded-xl text-xs">
                  <span className="font-semibold text-emerald-800">Estimated size:</span>
                  <span className="font-black text-emerald-600">{getEstimatedSize()}</span>
                </div>

                {/* Compression Options List */}
                <div className="space-y-3">
                  {PROFILES.map((profile) => {
                    const isSelected = level === profile.id;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => setLevel(profile.id)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/20'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        {/* Custom Radio Button */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-white">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 bg-white" />
                          )}
                        </div>

                        {/* Labels & Descriptions */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between">
                            <span className={`font-black text-sm md:text-base ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                              {profile.label}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 ml-2">
                              {profile.reduction}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            {profile.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-start space-x-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Action Trigger Button */}
                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-red-600/10 active:scale-[0.98] ${
                    loading
                      ? 'bg-slate-300 pointer-events-none'
                      : 'bg-red-500 hover:bg-red-600 cursor-pointer hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Compressing file...</span>
                    </span>
                  ) : (
                    <span>Compress file</span>
                  )}
                </button>
              </>
            ) : (
              /* Success State Card Layout */
              stats && (
                <div className="space-y-5 py-2 animate-in fade-in-50 duration-300" id="compression_stats">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                    <Percent className="w-6 h-6 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-black text-slate-800">Compression Completed!</h3>
                    <p className="text-xs text-slate-400 mt-1">Your PDF has been successfully optimized.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">
                        Original
                      </span>
                      <span className="font-extrabold text-slate-700 text-xs md:text-sm block mt-0.5">
                        {stats.original}
                      </span>
                    </div>
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-black block">
                        Optimized
                      </span>
                      <span className="font-extrabold text-emerald-700 text-xs md:text-sm block mt-0.5">
                        {stats.compressed}
                      </span>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-blue-600 font-black block">
                        Saved
                      </span>
                      <span className="font-extrabold text-blue-700 text-xs md:text-sm block mt-0.5">
                        {stats.ratio}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Compressed File</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseSelection}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Compress another file
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

