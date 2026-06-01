import React, { useState, useRef } from "react";
import FileUp from "lucide-react/icons/file-up";
import AlertCircle from "lucide-react/icons/alert-circle";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  placeholder: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  multiple = false,
  accept = "application/pdf",
  placeholder,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const filtered = filesArray.filter((file) => {
        if (accept === "application/pdf") {
          return file.type === "application/pdf" || file.name.endsWith(".pdf");
        } else if (accept.includes("image/")) {
          return file.type.startsWith("image/") || /\.(jpe?g|png|webp)/i.test(file.name);
        }
        return true;
      });

      if (filtered.length > 0) {
        onFilesSelected(multiple ? filtered : [filtered[0]]);
      } else {
        const expectedType = accept === "application/pdf" ? "PDF format" : "Image formats (JPG, PNG, WEBP)";
        setError(`Invalid file type dropped. Please provide ${expectedType}.`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  return (
    <div className="space-y-3 font-sans w-full">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          Upload Target File(s)
        </span>
        {accept === "application/pdf" ? (
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            PDF Required
          </span>
        ) : (
          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/35">
            Images Welcomed
          </span>
        )}
      </div>

      <input
        aria-label="File upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
      />

      <div
        id="dropzone-area"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ease-out select-none flex flex-col items-center justify-center min-h-[220px] shadow-sm hover:shadow-md ${
          isDragOver
            ? "border-emerald-500 bg-emerald-50/70 scale-[1.01] dark:bg-emerald-950/30 dark:border-emerald-400/80 shadow-emerald-500/5"
            : "border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-slate-50/40 dark:hover:bg-slate-950/20 bg-white/50 dark:bg-slate-900/30"
        }`}
      >
        {/* Animated Ripple ring active on Drag Over */}
        {isDragOver && (
          <div className="absolute inset-0 rounded-3xl border-2 border-emerald-400/50 animate-pulse pointer-events-none" />
        )}

        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
          isDragOver
            ? "bg-emerald-100 dark:bg-emerald-900/60 scale-110 text-emerald-600 dark:text-emerald-410"
            : "bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 group-hover:scale-105"
        }`}>
          <FileUp className={`w-7 h-7 transition-all duration-300 ${isDragOver ? "animate-bounce" : ""}`} />
        </div>

        <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 max-w-[280px] leading-snug">
          {isDragOver ? "Drop file(s) here now!" : placeholder}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
          Drag & drop instantly anywhere in this card or tap choose
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-5 w-full max-w-[210px] inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-500/10 cursor-pointer min-h-[44px] transition-all duration-150 border-0"
        >
          <FileUp className="w-4 h-4" />
          <span>Choose File(s)</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-4.5 border border-rose-100 dark:border-rose-900/40 animate-fadein shadow-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500 dark:text-rose-450" />
          <div>
            <p className="font-extrabold">Requirement Alert</p>
            <p className="mt-0.5 text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
