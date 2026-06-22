import React, { useState, useCallback } from 'react';

import { LazyPDFPage } from './LazyPDFPage';

interface DocumentPreviewProps {
  pdfDoc: any;
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

  const isControlled = selectedPages !== undefined && onSelectionChange !== undefined;
  const currentSelection = isControlled ? selectedPages : internalSelection;

  const handleSelect = useCallback(
    (index: number, event?: React.MouseEvent) => {
      if (!onSelectionChange && !setInternalSelection) return;

      const newSet = new Set(currentSelection);
      // Shift+click = range select
      if (event?.shiftKey && currentSelection.size > 0) {
        const last = Math.max(...Array.from(currentSelection));
        const [from, to] = [Math.min(last, index), Math.max(last, index)];
        for (let i = from; i <= to; i++) newSet.add(i);
      } else {
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
      }

      if (isControlled) {
        onSelectionChange(newSet);
      } else {
        setInternalSelection(newSet);
      }
    },
    [currentSelection, isControlled, onSelectionChange]
  );

  const selectAll = () => {
    const all = new Set(Array.from({ length: pageCount }, (_, i) => i));
    if (isControlled) {
      onSelectionChange!(all);
    } else {
      setInternalSelection(all);
    }
  };

  const clearAll = () => {
    const empty = new Set<number>();
    if (isControlled) {
      onSelectionChange!(empty);
    } else {
      setInternalSelection(empty);
    }
  };

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
        {onSelectionChange || setInternalSelection ? (
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
            pageIndex={i}
            rotation={rotations[i] ?? 0}
            isSelected={currentSelection.has(i)}
            onSelect={(idx) => handleSelect(idx)}
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
