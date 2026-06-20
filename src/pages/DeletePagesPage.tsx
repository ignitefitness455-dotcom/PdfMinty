import React, { useState } from 'react';
import { ArrowLeft, Trash2, Download, AlertCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { deletePagesFromPdf } from '../utils/pdfProcessor';
import { ROUTES } from '../config/routes';
import { SEO } from '../components/SEO';

export const DeletePagesPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pagesStr, setPagesStr] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    if (!pagesStr.trim()) {
      setError('Please provide page indices to delete. Examples: "2, 4, 6"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse list of integers (e.g. "1, 2, 4")
      const pagesArray = pagesStr.split(',')
        .map(p => parseInt(p.trim(), 10))
        .filter(p => !isNaN(p));

      if (pagesArray.length === 0) {
        throw new Error('Please specify a comma-separated list of valid page numbers.');
      }

      const parsedBytes = await deletePagesFromPdf(selectedFile, pagesArray);
      const blob = new Blob([parsedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdfminty_stripped_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Delete pages error:', err);
      setError(err?.message || 'An unexpected failure occurred. Verify indices match document dimensions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="delete_pages_container">
      <SEO 
        title="Delete PDF Pages — Free Offline Page Organizer" 
        description="Selectively remove specific pages from a PDF. Enter target page numbers offline and download the trimmed file instantly without server database uploads."
      />

      <Link to={ROUTES.HOME} className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Delete PDF Pages</h1>
        <p className="text-slate-500 text-sm">Strip unwanted pages, sections, or trailing indexes from your PDF document.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <Trash2 className="w-5 h-5 text-rose-600" />
            
            {!selectedFile ? (
              <FileUploader 
                onFilesSelected={handleFilesSelected} 
                title="Select a PDF to organize"
                subtitle="Drag a PDF file here or browse"
              />
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between" id="loaded_delete_file">
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

          <div className="bg-amber-50 p-4 rounded-xl flex items-start space-x-2 border border-amber-200 text-xs text-amber-800 leading-normal">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Cautionary notice:</p>
              <p className="mt-0.5">Deleting pages is an irreversible destructive operation. Make sure to retain copy backups of the source document prior to conversion.</p>
            </div>
          </div>
        </div>

        {/* Configurations column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Target Pages</h3>
            
            <div className="space-y-2">
              <label htmlFor="pages_csv" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Pages to delete:</label>
              <input
                id="pages_csv"
                type="text"
                value={pagesStr}
                onChange={(e) => setPagesStr(e.target.value)}
                placeholder="e.g. 2, 5, 8"
                className="w-full border border-slate-300 rounded-xl py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={!selectedFile}
              />
            </div>
            
            <p className="text-xs text-slate-400">Specify precise, 1-based index numbers divided by commas to trim.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {error && (
              <div className="flex items-start space-x-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-rose-600/10 ${
                selectedFile && !loading
                  ? 'bg-rose-600 hover:bg-rose-750 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Stripping pages...</span>
                </span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Pages</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
