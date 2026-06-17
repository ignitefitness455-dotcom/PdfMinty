import React, { useEffect, useState } from "react";
import { preprocessAndLoadPdf } from "../core/pdfRunner";
import { useToast } from "../contexts/ToastContext";
import LazyPDFPage from "./LazyPDFPage";
import { Loader2 } from "lucide-react";

interface PdfPreviewProps {
  file: File;
  scale?: number;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  file,
  scale = 0.6,
}) => {
  const { showToast } = useToast();
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pagesCount, setPagesCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function loadPdf() {
      try {
        const res = await preprocessAndLoadPdf(file, {
          showToast,
          customLockMessage: "Password needed to generate preview thumbnails.",
        });
        if (active) {
          setPdfDocument(res.pdf);
          setPagesCount(res.pdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load PDF in PdfPreview component:", err);
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      active = false;
    };
  }, [file, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/20 text-slate-400 gap-2 min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="text-xs font-bold font-sans">Generating document thumbnails...</span>
      </div>
    );
  }

  if (!pdfDocument) {
    return (
      <div className="flex items-center justify-center p-12 border border-slate-200 dark:border-slate-800 rounded-2xl bg-red-50/10 dark:bg-red-950/10 text-red-500 text-xs font-bold">
        Preview unavailable for this document.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
        Document Previews ({pagesCount} Pages)
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-850 rounded-2xl">
        {Array.from({ length: pagesCount }, (_, i) => i + 1).map((pageNum) => (
          <div key={pageNum} className="space-y-1 text-center select-none group">
            <LazyPDFPage pageNumber={pageNum} pdfDocument={pdfDocument} scale={scale} />
            <span className="text-[10px] text-slate-450 font-bold dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
              Page {pageNum}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfPreview;
