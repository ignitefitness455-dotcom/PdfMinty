import React, { useState, useEffect } from "react";
import RefreshCw from "lucide-react/icons/refresh-cw";
import ShieldAlert from "lucide-react/icons/shield-alert";
import FileText from "lucide-react/icons/file-text";
import AlertCircle from "lucide-react/icons/alert-circle";
import Eye from "lucide-react/icons/eye";
import { getPdfJs } from "../core/utils";
import { PDFSanitizer } from "../core/PDFSanitizer";

interface DocumentPreviewProps {
  file: File | null;
  onClear?: () => void;
  className?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  file,
  onClear,
  className = "",
}) => {
  const [renderUrl, setRenderUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setRenderUrl("");
      setPageCount(null);
      setIsLocked(false);
      setError(null);
      setPageSize(null);
      return;
    }

    let active = true;
    let loadingTask: any = null;

    const loadAndRenderFirstPage = async () => {
      setLoading(true);
      setError(null);
      setIsLocked(false);
      setRenderUrl("");
      setPageSize(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!active) return;

        let bytes = new Uint8Array(arrayBuffer);
        
        // Use our custom PDF sanitizer check
        try {
          const sanitizedResult = PDFSanitizer.sanitize(bytes);
          bytes = sanitizedResult.bytes as any;
        } catch (sanErr: any) {
          if (sanErr?.message?.includes("SECURED_LOCKED")) {
            if (active) {
              setIsLocked(true);
              setLoading(false);
            }
            return;
          }
          throw sanErr;
        }

        const pdfjs = await getPdfJs();
        if (!active) return;

        loadingTask = pdfjs.getDocument({
          data: bytes as any,
          useSystemFonts: true,
        });

        const pdf = await loadingTask.promise;
        if (!active) return;

        setPageCount(pdf.numPages);

        // Fetch Page 1
        const page = await pdf.getPage(1);
        if (!active) return;

        // Render at a sensible thumbnail scale
        const viewport = page.getViewport({ scale: 0.6 });
        
        // Save viewport original size (unscaled points)
        setPageSize({
          width: Math.round(page.view[2] - page.view[0]),
          height: Math.round(page.view[3] - page.view[1])
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          if (!active) return;

          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          setRenderUrl(dataUrl);
        } else {
          throw new Error("Could not construct 2D context for canvas rendering.");
        }
      } catch (err: any) {
        console.error("DocumentPreview failed:", err);
        if (active) {
          if (err?.message?.includes("password") || err?.name === "PasswordException") {
            setIsLocked(true);
          } else {
            setError(err?.message || "Failed to parse document for preview.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
        if (loadingTask && typeof loadingTask.destroy === "function") {
          try {
            loadingTask.destroy();
          } catch (e) {
            // Safe ignore
          }
        }
      }
    };

    loadAndRenderFirstPage();

    return () => {
      active = false;
      if (loadingTask && typeof loadingTask.destroy === "function") {
        try {
          loadingTask.destroy();
        } catch (e) {
          // Safe ignore
        }
      }
    };
  }, [file]);

  if (!file) return null;

  // Formatting helper for size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      id="document-preview-card"
      className={`bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 font-sans relative transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col md:flex-row gap-5 items-stretch">
        {/* Render Thumbnail viewport */}
        <div className="w-full md:w-36 h-48 md:h-auto min-h-[160px] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner shrink-0 leading-none">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-550">
                Rendering...
              </span>
            </div>
          ) : isLocked ? (
            <div className="p-4 text-center">
              <span className="text-3xl block mb-1">🔒</span>
              <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Secured PDF
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold leading-relaxed">
                Visual preview restricted. Needs decryption key.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <ShieldAlert className="w-8 h-8 mx-auto text-rose-500 mb-2" />
              <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider block">
                Load Failed
              </span>
            </div>
          ) : renderUrl ? (
            <div className="relative group w-full h-full flex items-center justify-center">
              <img
                src={renderUrl}
                alt="Uploaded PDF First Page Preview"
                className="max-h-full max-w-full object-contain p-2 shadow-sm rounded-lg transition-transform duration-300 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1.5 uppercase hover:bg-emerald-600">
                <Eye className="w-3 h-3" />
                <span>Page 1</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-350 dark:text-slate-650">
              <FileText className="w-8 h-8" />
              <span className="text-[10px] font-extrabold tracking-widest uppercase">
                Ready
              </span>
            </div>
          )}
        </div>

        {/* Technical Data & Diagnostics */}
        <div className="flex-1 flex flex-col justify-between py-1 text-left min-w-0">
          <div className="space-y-3">
            <div>
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-emerald-900/30">
                Verified Local Source
              </span>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-50 truncate mt-1.5 leading-snug" title={file.name}>
                {file.name}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <div>
                <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide leading-none mb-1">
                  File Size
                </span>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div>
                <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide leading-none mb-1">
                  Page Estimate
                </span>
                <span>
                  {pageCount !== null ? `${pageCount} page(s)` : "Calculating..."}
                </span>
              </div>
              {pageSize && (
                <div className="col-span-2">
                  <span className="text-[10px] block text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wide leading-none mb-1">
                    First Page Resolution
                  </span>
                  <span>
                    {pageSize.width} × {pageSize.height} points (
                    {Math.round(pageSize.width / 72 * 25.4)} × {Math.round(pageSize.height / 72 * 25.4)} mm)
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[10px] text-rose-500 font-semibold bg-rose-50/50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/40 mt-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-4">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
              🛡️ Private Sandbox Inspection
            </span>
            {onClear && (
              <button
                type="button"
                id="btn-preview-clear"
                onClick={onClear}
                className="text-[10px] font-black text-rose-500 hover:text-rose-750 transition-colors uppercase border-0 bg-transparent cursor-pointer p-0 select-none"
              >
                Prune / Clear Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
