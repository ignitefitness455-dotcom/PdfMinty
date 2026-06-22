import { ArrowLeft, Lock, Download, AlertCircle, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';

export const UnlockPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleUnlock = async () => {
    if (!selectedFile) return;
    if (!password.trim()) {
      setError('Please provide the corresponding encryption key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const unlockedBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'unlockPDF',
        { fileBytes, password },
        [fileBytes.buffer]
      );
      const blob = new Blob([unlockedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdfminty_unlocked_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Unlock error:', err);
      setError(
        err?.message || 'Decryption failed. Please verify the keys match target structures.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="unlock_page_container">
      <SEO slug="unlock-pdf" />

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
            Unlock PDF File
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['unlock-pdf'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Strip password credentials from secure documents offline to acquire clean, unlocked copies. Files must be under {TOOL_SIZE_LIMITS['unlock-pdf'].maxSingleMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Lock className="w-5 h-5 text-teal-600" />

            {!selectedFile ? (
              <FileUploader
                onFilesSelected={handleFilesSelected}
                title="Select locked PDF to decrypt"
                subtitle={`Drag secure PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['unlock-pdf'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['unlock-pdf'].maxSingleMB}
              />
            ) : (
              <div
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                id="loaded_unlock_file"
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
              Provide Credentials
            </h3>

            <div className="space-y-2">
              <label
                htmlFor="sec_phrase"
                className="text-xs font-bold text-slate-600 uppercase tracking-wider block"
              >
                Password key:
              </label>
              <div className="relative">
                <input
                  id="sec_phrase"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter standard password phrase"
                  className="w-full border border-slate-300 rounded-xl py-2 pl-9 pr-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={!selectedFile}
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <p className="text-xs text-slate-400">
              You must already possess editing or viewing credentials to unlock encrypted
              structures.
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
              onClick={handleUnlock}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-teal-600/10 ${
                selectedFile && !loading
                  ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Stripping locks...</span>
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
