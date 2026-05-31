import React, { useState, useRef } from "react";
import FileUp from "lucide-react/icons/file-up";

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
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
        Upload Target File(s)
      </span>

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
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all active:scale-[0.99] select-none flex flex-col items-center justify-center min-h-[180px] ${
          isDragOver
            ? "border-emerald-500 bg-emerald-50/50 scale-[0.98] dark:bg-emerald-950/20"
            : "border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-slate-50/30 dark:hover:bg-slate-950/20 bg-transparent"
        }`}
      >
        <FileUp className="w-8 h-8 text-emerald-500 mb-3 animate-pulse" />
        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200 max-w-[240px] leading-tight">
          {placeholder}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Or use the tap upload below
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-4 w-full max-w-[220px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 cursor-pointer min-h-[48px] transition-all duration-75 active:scale-[0.97] border-0"
        >
          <FileUp className="w-4 h-4" />
          <span>Choose File(s)</span>
        </button>
      </div>
    </div>
  );
};
