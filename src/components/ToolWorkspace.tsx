import React, { useState, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import { X } from "lucide-react";
import { FileUploader } from "./FileUploader";
import LoadingButton from "./LoadingButton";

interface ToolWorkspaceProps {
  title: string;
  description: string;
  acceptedTypes?: string[];
  multiple?: boolean;
  onProcess: (files: File[], options?: any) => Promise<Blob | void>;
  renderOptions?: (options: any, setOptions: (o: any) => void) => React.ReactNode;
  downloadFileName?: string;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  title,
  description,
  multiple = true,
  onProcess,
  renderOptions,
  downloadFileName = "output.pdf",
}) => {
  const { showToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState({});
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => (multiple ? [...prev, ...newFiles] : newFiles));
    setResultUrl(null);
  }, [multiple]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!files.length) {
      showToast("Please select at least one file", "error");
      return;
    }
    setProcessing(true);
    try {
      const result = await onProcess(files, options);
      if (result) {
        const url = URL.createObjectURL(result);
        setResultUrl(url);
        showToast("Processing complete!", "success");
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadFileName;
        a.click();
      }
    } catch (err: any) {
      showToast(err.message || "Processing failed", "error");
    } finally {
      setProcessing(false);
    }
  }, [files, options, onProcess, downloadFileName, showToast]);

  return (
    <main id="main-content" className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mb-6 text-slate-600 dark:text-slate-400">{description}</p>

      <FileUploader
        onFilesSelected={handleFiles}
        multiple={multiple}
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center justify-between rounded-lg border bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <span className="truncate text-sm">{file.name}</span>
              <button onClick={() => removeFile(i)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Remove file">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {renderOptions && (
        <div className="mt-6 rounded-lg border bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          {renderOptions(options, setOptions)}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <LoadingButton
          onClick={handleProcess}
          loading={processing}
          disabled={!files.length}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer flex items-center justify-center gap-2"
        >
          {processing ? "Processing..." : title}
        </LoadingButton>
        {resultUrl && (
          <a
            href={resultUrl}
            download={downloadFileName}
            className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center cursor-pointer"
          >
            Download Again
          </a>
        )}
      </div>
    </main>
  );
};

export default ToolWorkspace;
