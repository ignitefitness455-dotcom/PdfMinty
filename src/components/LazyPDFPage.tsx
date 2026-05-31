import React, { useState, useEffect, useRef } from "react";
import RefreshCw from "lucide-react/icons/refresh-cw";

interface LazyPDFPageProps {
  pdfDoc: any;
  pageIndex: number;
  rotation: number;
}

export const LazyPDFPage: React.FC<LazyPDFPageProps> = ({
  pdfDoc,
  pageIndex,
  rotation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [rendering, setRendering] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !imgUrl && !rendering && pdfDoc) {
          setRendering(true);
          pdfDoc.getPage(pageIndex + 1).then(async (page: any) => {
            if (!active) return;
            const viewport = page.getViewport({ scale: 0.4 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (context) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              try {
                await page.render({
                  canvasContext: context,
                  viewport: viewport,
                  canvas: canvas,
                }).promise;

                if (!active) return;
                const localUrl = canvas.toDataURL("image/jpeg", 0.85);
                setImgUrl(localUrl);
              } catch (err) {
                console.error("Lazy render page failed:", err);
              } finally {
                if (active) setRendering(false);
              }
            }
          });
        }
      },
      {
        rootMargin: "120px",
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [pdfDoc, pageIndex, imgUrl, rendering]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative bg-slate-50 overflow-hidden rounded"
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          className={`max-h-full max-w-full object-contain shadow-sm rounded transition-all duration-300 ${rotation === 90 ? "rotate-90" : rotation === 180 ? "rotate-180" : rotation === 270 ? "-rotate-90" : ""}`}
          alt={`page ${pageIndex}`}
          referrerPolicy="no-referrer"
          loading={pageIndex < 2 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={pageIndex === 0 ? "high" : "auto"}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500/80" />
          <span className="text-xs font-bold text-slate-500">
            Loading page...
          </span>
        </div>
      )}
    </div>
  );
};
