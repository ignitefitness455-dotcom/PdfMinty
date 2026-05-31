import React from "react";
import Check from "lucide-react/icons/check";
import RotateCw from "lucide-react/icons/rotate-cw";
import { PDFPageInfo, ToolType } from "../types";
import { LazyPDFPage } from "./LazyPDFPage";

interface PdfPreviewProps {
  pdfPages: PDFPageInfo[];
  pdfDocument: any;
  activeTool: ToolType | null;
  pagesToDelete?: number[];
  togglePageDeletion?: (index: number) => void;
  handleThumbnailRotate?: (index: number) => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  pdfPages,
  pdfDocument,
  activeTool,
  pagesToDelete = [],
  togglePageDeletion,
  handleThumbnailRotate,
}) => {
  if (pdfPages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 text-center rounded-2xl border border-slate-100 dark:border-slate-800">
        <Check className="w-12 h-12 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-full mb-3" />
        <p className="text-xs font-extrabold text-slate-700 dark:text-slate-250">
          Document ready for export
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Previews aren't available for this safe-encrypt target, proceed with parameters in the configuration panel.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {pdfPages.map((page) => {
        const isPageDeleted = pagesToDelete.includes(page.index);
        return (
          <div
            key={page.index}
            id={`page-card-${page.index}`}
            onClick={() => {
              if (activeTool === "delete-pages" && togglePageDeletion) {
                togglePageDeletion(page.index);
              } else if (activeTool === "rotate" && handleThumbnailRotate) {
                handleThumbnailRotate(page.index);
              }
            }}
            className={`group relative border rounded-xl bg-slate-50/50 dark:bg-slate-950/40 p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
              activeTool === "delete-pages" || activeTool === "rotate"
                ? "cursor-pointer active:scale-[0.98]"
                : ""
            } ${
              isPageDeleted
                ? "border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/40"
                : "border-slate-200 dark:border-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-950/60"
            }`}
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                PAGE {page.index + 1}
              </span>

              {activeTool === "delete-pages" && (
                <input
                  aria-label="Toggle page deletion"
                  type="checkbox"
                  checked={isPageDeleted}
                  readOnly
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded text-rose-500 focus:ring-rose-400 cursor-pointer border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                />
              )}

              {activeTool === "rotate" && handleThumbnailRotate && (
                <button
                  type="button"
                  aria-label="Rotate page"
                  id={`rotate-${page.index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailRotate(page.index);
                  }}
                  className="p-1 px-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded border border-emerald-100 dark:border-emerald-900/60 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 focus:outline-none transition-all cursor-pointer flex items-center gap-1 font-sans text-[10px] sm:text-xs font-bold"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="w-3 h-3 transition-transform hover:rotate-90" />
                  <span>Rotate</span>
                </button>
              )}
            </div>

            <div className="my-2 flex-grow h-32 flex items-center justify-center overflow-hidden rounded-md bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm relative">
              <LazyPDFPage
                pdfDoc={pdfDocument}
                pageIndex={page.index}
                rotation={page.rotation}
              />
              {isPageDeleted && (
                <div className="absolute inset-0 bg-rose-100/40 backdrop-blur-[1px] flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-black text-rose-600 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 py-1 px-2.5 rounded-full shadow-sm tracking-wide uppercase">
                    Omit Page
                  </span>
                </div>
              )}
            </div>

            {activeTool === "rotate" && page.rotation > 0 ? (
              <div className="text-[10px] sm:text-xs font-bold text-center text-amber-600 dark:text-amber-400 mt-2 leading-none uppercase">
                Rotation +{page.rotation}°
              </div>
            ) : (
              (activeTool === "delete-pages" || activeTool === "rotate") && (
                <div className="text-[10px] sm:text-xs font-semibold text-center text-slate-500 dark:text-slate-400 mt-1 leading-none uppercase">
                  {activeTool === "delete-pages"
                    ? "Tap to toggle omit"
                    : "Tap card to rotate"}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};
