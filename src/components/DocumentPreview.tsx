import React from "react";
import PdfPreview from "./PdfPreview";
import { FileImage } from "lucide-react";

interface DocumentPreviewProps {
  files: File[];
  toolId: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  files,
  toolId,
}) => {
  if (files.length === 0) return null;

  const isImageOnly = toolId === "img-to-pdf";

  if (isImageOnly) {
    return (
      <div className="space-y-4 font-sans">
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Compiled Images ({files.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-90 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-850 rounded-2xl select-none">
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={i} className="space-y-1.5 text-center group">
                <div className="relative border border-slate-205 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-sm aspect-square flex items-center justify-center">
                  <img
                    src={url}
                    alt={file.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full block object-cover group-hover:scale-105 transition-all duration-300"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white">
                    <FileImage className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold truncate block px-2 leading-tight">
                  {file.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Previews only the very first selected PDF file for premium rendering
  return <PdfPreview file={files[0]} />;
};

export default DocumentPreview;
