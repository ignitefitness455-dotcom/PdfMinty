import React, { useEffect, useRef, useState } from 'react';

interface LazyPDFPageProps {
  pdfDoc: any;
  pageIndex: number;
  rotation?: number;
  isSelected?: boolean;
  onSelect?: (index: number) => void;
  scale?: number;
}

export const LazyPDFPage: React.FC<LazyPDFPageProps> = ({
  pdfDoc,
  pageIndex,
  rotation = 0,
  isSelected = false,
  onSelect,
  scale = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);
  const [rendering, setRendering] = useState(false);

  // Use refs to avoid stale closure in IntersectionObserver callback
  const pageIndexRef = useRef(pageIndex);
  const rotationRef = useRef(rotation);
  const scaleRef = useRef(scale);
  useEffect(() => { pageIndexRef.current = pageIndex; }, [pageIndex]);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  const renderPage = async () => {
    if (!canvasRef.current || !pdfDoc || rendering) return;
    setRendering(true);
    try {
      const page = await pdfDoc.getPage(pageIndexRef.current + 1);
      const viewport = page.getViewport({
        scale: scaleRef.current,
        rotation: rotationRef.current,
      });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      setRendered(true);
    } catch (err) {
      console.debug('[LazyPDFPage] render error:', err);
    } finally {
      setRendering(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !rendered && !rendering) {
          renderPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendered, rendering]);

  // Re-render when rotation changes after initial render
  useEffect(() => {
    if (rendered) {
      setRendered(false);
      renderPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation]);

  return (
    <div
      ref={containerRef}
      onClick={() => onSelect?.(pageIndex)}
      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
        isSelected
          ? 'border-[color:var(--color-security-green)] shadow-lg shadow-[color:var(--color-security-green)]/20'
          : 'border-border-muted hover:border-[color:var(--color-security-green)]/50'
      }`}
    >
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-container-low animate-pulse">
          <span className="text-xs text-on-surface-variant">p.{pageIndex + 1}</span>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full block" />
      <div className="absolute bottom-0 inset-x-0 bg-surface-container-high/80 backdrop-blur-sm text-center py-0.5">
        <span className="text-[10px] font-bold text-on-surface-variant">{pageIndex + 1}</span>
      </div>
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[color:var(--color-security-green)] flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default LazyPDFPage;
