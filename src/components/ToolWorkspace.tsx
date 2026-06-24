import { AlertCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { useToast } from '../contexts/ToastContext';
import { downloadBlob } from '../utils/download';

import { FileUploader } from './FileUploader';

interface ToolWorkspaceProps<TOptions extends Record<string, unknown>> {
  title: string;
  description?: string;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxSizeMB?: number;
  onProcess: (files: File[], options: TOptions) => Promise<Blob | void>;
  renderOptions?: (options: TOptions, setOptions: (o: Partial<TOptions>) => void) => React.ReactNode;
  defaultOptions: TOptions;
  autoDownload?: boolean;
  downloadFilenamePrefix?: string;
}

export function ToolWorkspace<TOptions extends Record<string, unknown>>({
  title,
  description,
  acceptedTypes,
  multiple = false,
  maxSizeMB = 50,
  onProcess,
  renderOptions,
  defaultOptions,
  autoDownload = false,
  downloadFilenamePrefix = 'pdfminty_output',
}: ToolWorkspaceProps<TOptions>) {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<TOptions>(defaultOptions);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleFilesSelected = useCallback((selected: File[]) => {
    setFiles(selected);
    setError(null);
    setResult(null);
  }, []);

  const handleSetOptions = useCallback((partial: Partial<TOptions>) => {
    setOptions((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const output = await onProcess(files, options);
      if (output) {
        setResult(output);
        if (autoDownload) {
          await downloadBlob(output, `${downloadFilenamePrefix}_${Date.now()}.pdf`);
        }
        showToast('Operation completed successfully!', 'success');
      } else {
        showToast('Operation completed.', 'success');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Processing failed.');
      showToast(message || 'Processing failed.', 'error');
    } finally {
      setLoading(false);
    }
  }, [files, options, onProcess, autoDownload, downloadFilenamePrefix, showToast]);

  const handleDownload = useCallback(async () => {
    if (!result) return;
    await downloadBlob(result, `${downloadFilenamePrefix}_${Date.now()}.pdf`);
  }, [result, downloadFilenamePrefix]);

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
      {description && <p className="text-sm text-slate-500">{description}</p>}

      <FileUploader
        onFilesSelected={handleFilesSelected}
        accept={acceptedTypes?.join(',')}
        multiple={multiple}
        maxSizeMB={maxSizeMB}
      />

      {renderOptions && renderOptions(options, handleSetOptions)}

      {error && (
        <div
          className="flex items-start space-x-2 p-3 rounded-xl border border-rose-100 bg-rose-50 text-rose-800 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={files.length === 0 || loading}
        aria-busy={loading}
        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold disabled:bg-slate-300 hover:bg-emerald-700 transition-colors"
      >
        {loading ? 'Processing...' : 'Process'}
      </button>

      {result && !autoDownload && (
        <button
          onClick={handleDownload}
          className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Download Result
        </button>
      )}
    </div>
  );
}

export default ToolWorkspace;
