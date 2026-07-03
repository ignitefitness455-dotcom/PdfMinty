import { Download, FilePenLine, AlertCircle, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { WorkerManager } from '../core/WorkerManager';
import { downloadBlob } from '../utils/download';

export default function EditMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: ''
  });

  const limitMB = TOOL_SIZE_LIMITS['edit-metadata']?.maxSingleMB || 50;

  const handleProcess = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const resultBytes = await WorkerManager.getInstance().runOperation<Uint8Array>(
        'editMetadataPDF',
        { bytes, metadata }
      );

      const blob = new Blob([resultBytes], { type: 'application/pdf' });
      await downloadBlob(blob, file.name.replace(/\.pdf$/i, '') + '-metadata.pdf');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message || 'Failed to edit metadata.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="edit_metadata_container">
      <SEO slug="edit-metadata" />

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
            Edit PDF Metadata
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {limitMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Change PDF title, author, subject, and keywords offline directly in your browser. Files must be under {limitMB} MB.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <FilePenLine className="w-5 h-5 text-emerald-600" />
              <span>Select Document</span>
            </div>

            {!file ? (
              <FileUploader
                onFilesSelected={(files) => {
                  if (files && files.length > 0) {
                    setFile(files[0]);
                    setError(null);
                  }
                }}
                accept=".pdf,application/pdf"
                title="Select a PDF to edit metadata"
                subtitle={`Drag a PDF file here or browse (Max limit: ${limitMB}MB)`}
                maxSizeMB={limitMB}
                id="edit_metadata_uploader"
              />
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between" id="loaded_metadata_file">
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-slate-200 py-1.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>
            )}

            {file && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Properties</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="meta_title" className="text-xs font-bold text-slate-700">Title</label>
                    <input
                      id="meta_title"
                      type="text"
                      name="title"
                      value={metadata.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      placeholder="Document Title"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="meta_author" className="text-xs font-bold text-slate-700">Author</label>
                    <input
                      id="meta_author"
                      type="text"
                      name="author"
                      value={metadata.author}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      placeholder="Document Author"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="meta_subject" className="text-xs font-bold text-slate-700">Subject</label>
                    <input
                      id="meta_subject"
                      type="text"
                      name="subject"
                      value={metadata.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      placeholder="Document Subject"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="meta_keywords" className="text-xs font-bold text-slate-700">Keywords</label>
                    <input
                      id="meta_keywords"
                      type="text"
                      name="keywords"
                      value={metadata.keywords}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      placeholder="keyword1, keyword2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="meta_creator" className="text-xs font-bold text-slate-700">Creator</label>
                    <input
                      id="meta_creator"
                      type="text"
                      name="creator"
                      value={metadata.creator}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      placeholder="Application Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="meta_producer" className="text-xs font-bold text-slate-700">Producer</label>
                    <input
                      id="meta_producer"
                      type="text"
                      name="producer"
                      value={metadata.producer}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                      placeholder="PDF Producer Tool"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Metadata Update
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Updates your document info tags without modifying page contents or layout quality.
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
              onClick={handleProcess}
              disabled={!file || isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/10 ${
                file && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer hover:-translate-y-0.5'
                  : 'bg-slate-300 pointer-events-none shadow-none'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center space-x-1.5">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Updating...</span>
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Update & Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
