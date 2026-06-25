import type { PDFDocumentProxy } from 'pdfjs-dist';
import React, { useState, useCallback, useRef } from 'react';

import { LazyPDFPage } from './LazyPDFPage';

interface DocumentPreviewProps {
  pdfDoc: PDFDocumentProxy;
  pageCount: number;
  selectedPages?: Set<number>;
  onSelectionChange?: (selected: Set<number>) => void;
  rotations?: Record<number, number>;
  scale?: number;
  label?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  pdfDoc,
  pageCount,
  selectedPages,
  onSelectionChange,
  rotations = {},
  scale = 0.3,
  label,
}) => {
  const [internalSelection, setInternalSelection] = useState<Set<number>>(
    selectedPages ?? new Set()
  );

  const lastSelectedRef = useRef<number | null>(null);

  const isControlled = selectedPages !== undefined && onSelectionChange !== undefined;
  const currentSelection = isControlled ? selectedPages : internalSelection;

  const handleSelect = useCallback(
    (index: number, event?: React.MouseEvent | React.KeyboardEvent) => {
      if (event?.shiftKey && lastSelectedRef.current !== null) {
        const start = Math.min(lastSelectedRef.current, index);
        const end = Math.max(lastSelectedRef.current, index);
        setInternalSelection((prev) => {
          const merged = new Set(prev);
          for (let i = start; i <= end; i++) merged.add(i);
          if (onSelectionChange) onSelectionChange(merged);
          return merged;
        });
      } else {
        setInternalSelection((prev) => {
          const next = new Set(prev);
          if (next.has(index)) next.delete(index);
          else next.add(index);
          if (onSelectionChange) onSelectionChange(next);
          return next;
        });
      }
      lastSelectedRef.current = index;
    },
    [onSelectionChange, setInternalSelection]
  );

  const selectAll = useCallback(() => {
    const all = new Set<number>();
    for (let i = 0; i < pageCount; i++) all.add(i);
    setInternalSelection(all);
    if (onSelectionChange) onSelectionChange(all);
  }, [pageCount, onSelectionChange, setInternalSelection]);

  const clearAll = useCallback(() => {
    setInternalSelection(new Set());
    if (onSelectionChange) onSelectionChange(new Set());
    lastSelectedRef.current = null;
  }, [onSelectionChange, setInternalSelection]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {label ?? `${pageCount} page${pageCount !== 1 ? 's' : ''}`}
          {currentSelection.size > 0 && (
            <span className="ml-2 text-[color:var(--color-security-green)]">
              · {currentSelection.size} selected
            </span>
          )}
        </span>
        {onSelectionChange ? (
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs font-bold text-on-surface-variant hover:text-[color:var(--color-security-green)] transition-colors"
            >
              All
            </button>
            <button
              onClick={clearAll}
              className="text-xs font-bold text-on-surface-variant hover:text-rose-500 transition-colors"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {Array.from({ length: pageCount }, (_, i) => (
          <LazyPDFPage
            key={i}
            pdfDoc={pdfDoc}
            pageNumber={i + 1}
            pageIndex={i}
            rotation={rotations[i] ?? 0}
            isSelected={currentSelection.has(i)}
            onSelect={handleSelect}
            scale={scale}
          />
        ))}
      </div>
      {currentSelection.size > 0 && (
        <p className="text-[10px] text-on-surface-variant">
          Tip: Hold Shift and click to select a range of pages.
        </p>
      )}
    </div>
  );
};

export default DocumentPreview;
