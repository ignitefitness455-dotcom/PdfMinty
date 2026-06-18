import React, { useEffect, useState } from "react";
import PdfPreview from "./PdfPreview";
import { FileImage } from "lucide-react";
import { PDFJS_WORKER_SRC } from "../config/constants";

const renderPageToCanvas = async (
  arrayBuffer: ArrayBuffer,
  pageNumber: number,
  scale = 1.5
): Promise<HTMLCanvasElement> => {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext("2d")!;
  await page.render({ canvasContext: context, viewport } as any).promise;
  return canvas;
};

interface DocumentPreviewProps {
  // Option A (Dynamic workspace preview)
  files?: File[];
  toolId?: string;

  // Option B (Single file preview requested by user)
  file?: File;
  pageNumber?: number;
  scale?: number;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  files,
  toolId,
  file,
  pageNumber = 1,
  scale = 1.5,
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    setLoading(true);
    file.arrayBuffer().then((buffer) => {
      renderPageToCanvas(buffer, pageNumber, scale).then((canvas: HTMLCanvasElement) => {
        if (!cancelled) {
          setThumbnail(canvas.toDataURL("image/png"));
          setLoading(false);
        }
      }).catch(() => {
        if (!cancelled) setLoading(false);
      });
    });
    return () => { cancelled = true; };
  }, [file, pageNumber, scale]);

  // Single preview requested by user
  if (file) {
    if (loading) return <div className="h-48 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />;
    if (!thumbnail) return <div className="flex h-48 w-36 items-center justify-center rounded bg-slate-200 dark:bg-slate-800 text-xs text-slate-500">Preview unavailable</div>;

    return (
      <img
        src={thumbnail}
        alt={`Preview of ${file.name}`}
        className="h-48 w-36 rounded object-cover shadow animate-fadein"
        loading="lazy"
      />
    );
  }

  if (!files || files.length === 0) return null;

  const isImageOnly = toolId === "img-to-pdf";

  if (isImageOnly) {
    return (
      <div className="space-y-4 font-sans">
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Compiled Images ({files.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-90 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-850 rounded-2xl select-none">
          {files.map((f, i) => {
            const url = URL.createObjectURL(f);
            return (
              <div key={i} className="space-y-1.5 text-center group">
                <div className="relative border border-slate-205 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-sm aspect-square flex items-center justify-center">
                  <img
                    src={url}
                    alt={f.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full block object-cover group-hover:scale-105 transition-all duration-300"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white">
                    <FileImage className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold truncate block px-2 leading-tight">
                  {f.name}
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
