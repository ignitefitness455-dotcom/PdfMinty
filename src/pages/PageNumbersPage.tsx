import React, { useState } from 'react';
import { ArrowLeft, Hash, Download, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { addPageNumbersToPdf } from '../utils/pdfProcessor';
import { ROUTES } from '../config/routes';
import { SEO } from '../components/SEO';

export const PageNumbersPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pattern, setPattern] = useState<string>('Page {n} of {total}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
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

    try {
      const updatedBytes = await addPageNumbersToPdf(selectedFile, pattern);
      const blob = new Blob([updatedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdfminty_numbered_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Page numbers error:', err);
      setError(err?.message || 'An unexpected failure occurred while numbering pages.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="page_numbers_container">
      <SEO 
        title="Add PDF Page Numbers — Free Offline Pager" 
        description="Add clean sequential page numbers dynamically overlaying your PDF footers offline. Customize format style instantly in browser."
      />

      <Link to={ROUTES.HOME} className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Add PDF Page Numbers</h1>
        <p className="text-slate-500 text-sm">Overlay sequential pagination logs across all page footers securely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Hash className="w-5 h-5 text-cyan-600" />
            
            {!selectedFile ? (
              <FileUploader 
                onFilesSelected={handleFilesSelected} 
                title="Select a PDF to paginate"
                subtitle="Drag a PDF file here or browse"
              />
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between" id="loaded_number_file">
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
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
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Layout Format</h3>
            
            <div className="space-y-2">
              <label htmlFor="pattern_input" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Sequence Pattern:</label>
              <input
                id="pattern_input"
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Page {n} of {total}"
                className="w-full border border-slate-300 rounded-xl py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!selectedFile}
              />
            </div>
            
            <p className="text-xs text-slate-400 leading-normal">
              Use <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-semibold">{"{n}"}</code> for current index, and <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-semibold">{"{total}"}</code> for overall sheet count bounds.
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
              onClick={handleApply}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/10 ${
                selectedFile && !loading
                  ? 'bg-cyan-600 hover:bg-cyan-750 cursor-pointer hover:-translate-y-0.5'
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
