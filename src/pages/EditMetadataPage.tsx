import { Download, FilePenLine, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

import { FileUploader } from '../components/FileUploader';
import LoadingButton from '../components/LoadingButton';
import SEO from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
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

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
          Edit PDF Metadata
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Change PDF title, author, subject, and keywords offline. Files must be under {TOOL_SIZE_LIMITS['edit-metadata'].maxSingleMB} MB.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <FileUploader
            onFilesSelected={(files) => {
              if (files && files.length > 0) {
                setFile(files[0]);
                setError(null);
              }
            }}
            accept=".pdf,application/pdf"
            title="Select a PDF to edit metadata"
            subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['edit-metadata'].maxSingleMB}MB)`}
            icon={FilePenLine}
            maxSizeMB={TOOL_SIZE_LIMITS['edit-metadata'].maxSingleMB}
            id="edit_metadata_uploader"
          />
        </div>
      ) : (
        <div className="space-y-6" id="loaded_metadata_file">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
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
              Remove
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-800">Document Properties</h3>
              <p className="text-sm text-slate-500 mt-1">Enter the new metadata values for your PDF.</p>
            </div>
            
            <div className="p-4 sm:p-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="meta_title" className="text-sm font-medium text-slate-700">Title</label>
                <input
                  id="meta_title"
                  type="text"
                  name="title"
                  value={metadata.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="Document Title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_author" className="text-sm font-medium text-slate-700">Author</label>
                <input
                  id="meta_author"
                  type="text"
                  name="author"
                  value={metadata.author}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="Document Author"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_subject" className="text-sm font-medium text-slate-700">Subject</label>
                <input
                  id="meta_subject"
                  type="text"
                  name="subject"
                  value={metadata.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="Document Subject"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_keywords" className="text-sm font-medium text-slate-700">Keywords (comma separated)</label>
                <input
                  id="meta_keywords"
                  type="text"
                  name="keywords"
                  value={metadata.keywords}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="keyword1, keyword2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_creator" className="text-sm font-medium text-slate-700">Creator</label>
                <input
                  id="meta_creator"
                  type="text"
                  name="creator"
                  value={metadata.creator}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="Application Name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_producer" className="text-sm font-medium text-slate-700">Producer</label>
                <input
                  id="meta_producer"
                  type="text"
                  name="producer"
                  value={metadata.producer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                  placeholder="PDF Producer Tool"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <LoadingButton
                onClick={handleProcess}
                isLoading={isProcessing}
                loadingText="Updating metadata..."
                icon={Download}
                id="apply-metadata-btn"
              >
                Update & Download
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
