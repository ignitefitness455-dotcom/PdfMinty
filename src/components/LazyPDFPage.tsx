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

  // Use refs to track current state inside the observer callback
  // This avoids stale closures without adding them to the dependency array
  const imgUrlRef = useRef(imgUrl);
  const renderingRef = useRef(rendering);

  useEffect(() => {
    imgUrlRef.current = imgUrl;
  }, [imgUrl]);

  useEffect(() => {
    renderingRef.current = rendering;
  }, [rendering]);

  useEffect(() => {
    // Reset on new document/page
    setImgUrl("");
    setRendering(false);
    imgUrlRef.current = "";
    renderingRef.current = false;

    if (!pdfDoc) return;

    let active = true;
    let canvasElement: HTMLCanvasElement | null = null;

    const renderPage = async () => {
      if (renderingRef.current || imgUrlRef.current) return;

      setRendering(true);
      renderingRef.current = true;

      try {
        const page = await pdfDoc.getPage(pageIndex + 1);
        if (!active) return;

        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement("canvas");
        canvasElement = canvas;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
          canvas,
        }).promise;

        if (!active) return;

        const localUrl = canvas.toDataURL("image/jpeg", 0.85);
        setImgUrl(localUrl);
        imgUrlRef.current = localUrl;
      } catch (err) {
        console.error("LazyPDFPage render failed:", err);
      } finally {
        if (active) {
          setRendering(false);
          renderingRef.current = false;
        }
        if (canvasElement) {
          canvasElement.width = 0;
          canvasElement.height = 0;
        }
      }
    };

    // Observer fires once when element enters viewport
    // Dependencies do NOT include imgUrl/rendering — use refs instead
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Disconnect immediately — we only need to trigger once
          observer.disconnect();
          renderPage();
        }
      },
      { rootMargin: "120px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      active = false;
      observer.disconnect();
      if (canvasElement) {
        canvasElement.width = 0;
        canvasElement.height = 0;
      }
    };
  }, [pdfDoc, pageIndex]); // ← Only pdfDoc and pageIndex — NOT imgUrl or rendering

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative bg-slate-50 overflow-hidden rounded"
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          className={`max-h-full max-w-full object-contain shadow-sm rounded transition-all duration-300 ${
            rotation === 90
              ? "rotate-90"
              : rotation === 180
              ? "rotate-180"
              : rotation === 270
              ? "-rotate-90"
              : ""
          }`}
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
