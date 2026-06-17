import React, { useState, useRef } from "react";
import { Upload, FileImage } from "lucide-react";

interface FileUploaderProps {
  onSelectedFiles: (files: File[]) => void;
  toolId: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onSelectedFiles,
  toolId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelectedFiles(Array.from(e.target.files));
    }
  };

  const isImageOnly = toolId === "img-to-pdf";

  return (
    <div
      role="button"
      tabIndex={0}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={triggerInput}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerInput();
        }
      }}
      aria-label={
        isImageOnly
          ? "Upload image files. Drag & drop files here, or click to browse."
          : "Upload PDF documents. Drag & drop files here, or click to browse."
      }
      className={`border-2 border-dashed rounded-3xl p-12 md:p-18 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 group relative ${
        dragActive
          ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20"
          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:border-emerald-500/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/20"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={toolId === "merge" || toolId === "img-to-pdf"}
        accept={isImageOnly ? "image/png,image/jpeg" : "application/pdf"}
        onChange={onFileInputChange}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
      />
      <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
        {isImageOnly ? (
          <FileImage className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
        ) : (
          <Upload className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-base font-extrabold text-slate-705 dark:text-slate-250">
          Drop files here or <span className="text-emerald-500 dark:text-emerald-400 underline">click to choose</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Drag & drop anywhere in this card, or click to select files.
        </p>
      </div>
      <div className="mt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerInput();
          }}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-full transition-all flex items-center gap-1.5 shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:scale-105 cursor-pointer"
        >
          Choose File(s)
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
