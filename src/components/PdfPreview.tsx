import React, { useEffect, useState } from 'react';

import { getPdfJs } from '../core/index';

import { DocumentPreview } from './DocumentPreview';

interface PdfPreviewProps {
  file: File;
  selectedPages?: Set<number>;
  onSelectionChange?: (selected: Set<number>) => void;
  rotations?: Record<number, number>;
  scale?: number;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  file,
  selectedPages,
  onSelectionChange,
  rotations,
  scale,
}) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdfjs = await getPdfJs();
        const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setPageCount(doc.numPages);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load PDF preview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [file]);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2 animate-pulse">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 bg-surface-container-low rounded-xl border border-border-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-rose-500 font-medium py-4 text-center">
        Preview unavailable: {error}
      </div>
    );
  }

  return (
    <DocumentPreview
      pdfDoc={pdfDoc}
      pageCount={pageCount}
      selectedPages={selectedPages}
      onSelectionChange={onSelectionChange}
      rotations={rotations}
      scale={scale}
    />
  );
};

export default PdfPreview;
