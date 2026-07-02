import { Download, ShieldBan } from 'lucide-react';
import React, { useState } from 'react';

import { FileUploader } from '../components/FileUploader';
import LoadingButton from '../components/LoadingButton';
import SEO from '../components/SEO';
import ToolWorkspace from '../components/ToolWorkspace';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { WorkerManager } from '../core/WorkerManager';

export default function SanitizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleProcess = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);
      setWarnings([]);
      
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await WorkerManager.getInstance().runOperation<{ bytes: Uint8Array; warnings: string[] }>(
        'sanitizePDF',
        { bytes }
      );

      setWarnings(result.warnings);

      const blob = new Blob([result.bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '-sanitized.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message || 'Failed to sanitize document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadein" id="sanitize_pdf_container">
      <SEO slug="sanitize-pdf" />

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
          Sanitize PDF
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Remove embedded scripts, hidden metadata, and malicious actions from your PDF for secure sharing. Files must be under {TOOL_SIZE_LIMITS['sanitize-pdf'].maxSingleMB} MB.
        </p>
      </div>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <FileUploader
            onFilesSelected={(files) => {
              if (files && files.length > 0) {
                setFile(files[0]);
                setWarnings([]);
                setError(null);
              }
            }}
            accept="application/pdf"
            title="Select a PDF to sanitize"
            subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['sanitize-pdf'].maxSingleMB}MB)`}
            icon={ShieldBan}
            maxSizeMB={TOOL_SIZE_LIMITS['sanitize-pdf'].maxSingleMB}
            id="sanitize_pdf_uploader"
          />
        </div>
      ) : (
        <ToolWorkspace
          file={file}
          onReset={() => {
            setFile(null);
            setWarnings([]);
          }}
          error={error}
          id="loaded_sanitize_file"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-800">Ready to Sanitize</h3>
              <p className="text-sm text-slate-500 mt-1">This will permanently neutralize JavaScript and potentially harmful Launch actions hidden inside the document.</p>
            </div>
            
            {warnings.length > 0 && (
              <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                <h4 className="text-sm font-semibold text-emerald-800 mb-2">Sanitization Results:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-sm text-emerald-700">{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 sm:p-6 bg-white flex justify-end">
              <LoadingButton
                onClick={handleProcess}
                isLoading={isProcessing}
                loadingText="Sanitizing..."
                icon={Download}
                id="sanitize-btn"
              >
                Sanitize & Download
              </LoadingButton>
            </div>
          </div>
        </ToolWorkspace>
      )}
    </div>
  );
}
