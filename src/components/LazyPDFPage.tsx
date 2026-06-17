import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface LazyPDFPageProps {
  pageNumber: number;
  pdfDocument: any;
  scale?: number;
}

export const LazyPDFPage: React.FC<LazyPDFPageProps> = ({
  pageNumber,
  pdfDocument,
  scale = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !rendered && !loading && pdfDocument) {
          setLoading(true);
          renderPage(pdfDocument, pageNumber);
        }
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    async function renderPage(pdf: any, num: number) {
      try {
        const page = await pdf.getPage(num);
        if (!active) return;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (active) {
          setRendered(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to render lazy page:", err);
        if (active) {
          setLoading(false);
        }
      }
    }

    return () => {
      active = false;
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [pageNumber, pdfDocument, scale, rendered, loading]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center border border-slate-205 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-sm"
      style={{ minHeight: "260px" }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full max-h-full block object-contain" />
      {!rendered && !loading && (
        <div className="absolute text-xs text-slate-400 font-bold select-none">
          Scroll to view Page {pageNumber}
        </div>
      )}
    </div>
  );
};

export default LazyPDFPage;
