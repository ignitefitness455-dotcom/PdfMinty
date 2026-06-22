import { ArrowLeft, Scissors, Download, AlertCircle, Info } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { ROUTES } from '../config/routes';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { WorkerManager } from '../core/WorkerManager';

export const SplitPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleSplit = async () => {
    if (!selectedFile) return;
    if (!ranges.trim()) {
      setError('Please provide a valid range. Examples: "1-2, 3, 4"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const results = await WorkerManager.getInstance().runOperation<Uint8Array[]>(
        'splitPDF',
        { bytes: fileBytes, ranges },
        [fileBytes.buffer]
      );

      // Batch download sequentially
      results.forEach((bytes, idx) => {
        const url = URL.createObjectURL(new Blob([bytes as any], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedFile.name.replace(/\.pdf$/i, '')}_part_${idx + 1}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (err: any) {
      console.error('Split error:', err);
      setError(
        err?.message ||
          'An unexpected failure occurred while splitting the document. Verify bounds or password locks.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="split_page_container">
      <SEO slug="split-pdf" />

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
            Split PDF Document
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['split-pdf'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Partition a PDF file into custom constituent sections and download each part independently. Files must be under {TOOL_SIZE_LIMITS['split-pdf'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Scissors className="w-5 h-5 text-amber-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select a PDF to split"
                subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['split-pdf'].maxSingleMB}MB)`}
                accept="application/pdf"
                maxSizeMB={TOOL_SIZE_LIMITS['split-pdf'].maxSingleMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_split_file"
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

          <div className="bg-slate-100 p-4 rounded-xl flex items-start space-x-2 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">How ranges work:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>
                  Use single numbers to extract single pages:{' '}
                  <code className="bg-white px-1 py-0.5 rounded border">5</code>
                </li>
                <li>
                  Use spans with en-dashes to extract page blocks:{' '}
                  <code className="bg-white px-1 py-0.5 rounded border">1-3</code>
                </li>
                <li>
                  Separate segments with comma lists:{' '}
                  <code className="bg-white px-1 py-0.5 rounded border">1-2, 4, 6-8</code> parses
                  into 3 separate file outputs.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Configurations menu */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Split Directives
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="range_directives"
                className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
              >
                Page ranges:
              </label>
              <input
                id="range_directives"
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-2, 4, 6-10"
                className="w-full border border-slate-300 rounded-xl py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!selectedFile}
              />
            </div>

            <p className="text-xs text-slate-400">
              Each comma block triggers a separate download containing those precise indices.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div
                className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg"
                id="split_error_box"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSplit}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-600/10 ${
                selectedFile && !loading
                  ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Splitting PDF...</span>
                </span>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  <span>Split Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
