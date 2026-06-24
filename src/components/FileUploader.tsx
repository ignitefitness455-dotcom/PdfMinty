import { Upload, File, AlertCircle } from 'lucide-react';
import React, { useState, useRef, useCallback } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  maxSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  accept = 'application/pdf',
  multiple = false,
  title = 'Drag and drop your files here',
  subtitle = 'or click to browse from your device',
  maxSizeMB = 50,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (filesList: FileList | null) => {
      if (!filesList || filesList.length === 0) return;
      setError(null);

      const validFiles: File[] = [];
      const expectedTypes = accept.split(',').map((t) => t.trim());
      const limitBytes = maxSizeMB * 1024 * 1024;

      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];

        // 1. Validate file format
        const matchesType = expectedTypes.some((type) => {
          if (type === 'application/pdf') {
            return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
          }
          if (type.startsWith('image/')) {
            return (
              file.type.startsWith('image/') ||
              /\.(jpg|jpeg|png|webp|gif|bmp|heic|heif|avif)$/i.test(file.name)
            );
          }
          return true;
        });

        if (!matchesType) {
          setError(`Unsupported file format ignored: "${file.name}". Expected: ${accept}`);
          continue;
        }

        // 2. Validate maximum file size limit
        if (file.size > limitBytes) {
          setError(
            `Uploading failed! "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(
              2
            )} MB). The maximum allowed limit for this tool is exactly ${maxSizeMB} MB.`
          );
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        if (!multiple) {
          onFilesSelected([validFiles[0]]);
        } else {
          onFilesSelected(validFiles);
        }
      }
    },
    [accept, maxSizeMB, multiple, onFilesSelected]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      processFiles(e.target.files);
      // Reset value so selecting the same file again (e.g. retry after error)
      // still fires onChange.
      e.target.value = '';
    },
    [processFiles]
  );

  const triggerInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Enter and Space both activate the file picker, matching native button behavior.
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerInputClick();
      }
    },
    [triggerInputClick]
  );

  return (
    <div className="w-full flex flex-col space-y-3" id="file_uploader_wrapper">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${title}. ${subtitle}. Press Enter or Space to browse.`}
        aria-disabled={false}
        id="uploader_dropzone"
        className={`relative w-full border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 ${
          isDragActive
            ? 'border-emerald-500 bg-emerald-50/40 shadow-inner'
            : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="sr-only"
          id="uploader_hidden_input"
          aria-label="File input"
        />

        <div
          className={`p-4 rounded-full mb-4 transition-transform duration-200 ${
            isDragActive
              ? 'bg-emerald-100 text-emerald-600 scale-110'
              : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:scale-105'
          }`}
          aria-hidden="true"
        >
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="font-semibold text-slate-800 text-base md:text-lg mb-1">{title}</h3>
        <p className="text-slate-500 text-sm mb-2">{subtitle}</p>
        <span className="inline-flex py-1 px-3 rounded-md bg-white border border-slate-200 text-xs text-slate-500 font-medium group-hover:border-emerald-200 group-hover:text-emerald-700">
          Max file size: {maxSizeMB}MB
        </span>
      </div>

      {error && (
        <div
          className="flex items-center space-x-2 p-3.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-800 text-xs font-semibold shadow-sm"
          id="uploader_error"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
