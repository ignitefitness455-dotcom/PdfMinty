import { ArrowLeft, RotateCw, Download, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';

export const RotatePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [degrees, setDegrees] = useState<number>(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleRotate = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const rotatedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'rotatePDF',
        { bytes: fileBytes, degreesValue: degrees },
        [fileBytes.buffer]
      );
      const blob = new Blob([rotatedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdfminty_rotated_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Rotate error:', err);
      setError(err?.message || 'An unexpected error occurred while rotating the PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="rotate_page_container">
      <SEO slug="rotate-pdf" />

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
            Rotate PDF Pages
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['rotate-pdf'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Correct orientation or re-align horizontally skewed page plates offline instantly. Files must be under {TOOL_SIZE_LIMITS['rotate-pdf'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <RotateCw className="w-5 h-5 text-blue-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to rotate"
                subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['rotate-pdf'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['rotate-pdf'].maxSingleMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_rotate_file"
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
              Rotation Angle
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setDegrees(deg)}
                  className={`py-3.5 rounded-xl border font-bold text-sm transition-all ${
                    degrees === deg
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/15'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                  disabled={!selectedFile}
                >
                  +{deg}°
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Clockwise rotation applied unconditionally across all page grids.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleRotate}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/10 ${
                selectedFile && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Rotating sheets...</span>
                </span>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>Rotate PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
