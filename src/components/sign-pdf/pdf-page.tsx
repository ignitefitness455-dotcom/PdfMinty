import type { PDFDocumentProxy } from 'pdfjs-dist';
import React, { useEffect, useRef, useState } from 'react';

import { PlacedFieldComponent } from './placed-field';
import { PlacedField, FieldType } from './types';

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number; // 1-indexed
  zoom: number;
  placedFields: PlacedField[];
  selectedFieldId: string | null;
  activePlacementTool: FieldType | null;
  onSelectField: (id: string | null) => void;
  onUpdateField: (id: string, updated: Partial<PlacedField>) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (id: string) => void;
  onRequestSignField: (id: string) => void;
  onPlaceNewField: (
    type: FieldType,
    pageNumber: number,
    percentX: number,
    percentY: number
  ) => void;
}

export const PdfPage: React.FC<PdfPageProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
  placedFields,
  selectedFieldId,
  activePlacementTool,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onRequestSignField,
  onPlaceNewField,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  // Render PDF Page with PDF.js
  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      try {
        setIsRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        // Cancel previous in-flight render task if zoom changed quickly
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const viewport = page.getViewport({ scale: zoom * 1.5 }); // 1.5x crisp DPR rendering

        setPageSize({
          width: unscaledViewport.width,
          height: unscaledViewport.height,
        });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'RenderingCancelledException') {
          console.error(`Failed to render PDF page ${pageNumber}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, zoom]);

  // Handle clicking on page to place active tool
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on an existing placed field, ignore
    if ((e.target as HTMLElement).closest('.group')) return;

    if (activePlacementTool && pageSize) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const percentX = Math.max(2, Math.min(85, (clickX / rect.width) * 100));
      const percentY = Math.max(2, Math.min(90, (clickY / rect.height) * 100));

      onPlaceNewField(activePlacementTool, pageNumber, percentX, percentY);
    } else {
      onSelectField(null);
    }
  };

  // Handle Drag & Drop of fields from sidebar onto page
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/sign-pdf-field-type') as FieldType;
    if (!type || !pageSize) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    const percentX = Math.max(2, Math.min(85, (dropX / rect.width) * 100));
    const percentY = Math.max(2, Math.min(90, (dropY / rect.height) * 100));

    onPlaceNewField(type, pageNumber, percentX, percentY);
  };

  // Filter fields for this page
  const pageFields = placedFields.filter((f) => f.pageNumber === pageNumber);

  const displayWidth = pageSize ? pageSize.width * zoom : 600;
  const displayHeight = pageSize ? pageSize.height * zoom : 800;

  return (
    <div className="flex flex-col items-center mb-8 relative select-none">
      {/* Page Container Wrapper */}
      <div
        id={`pdf-page-${pageNumber}`}
        ref={containerRef}
        onClick={handlePageClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
        className={`relative bg-white shadow-xl rounded-sm transition-shadow duration-150 ${
          activePlacementTool ? 'cursor-crosshair ring-2 ring-emerald-400 ring-offset-2' : ''
        }`}
      >
        {/* PDF Page Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
          }}
          className="block pointer-events-none"
        />

        {/* Loading Spinner */}
        {isRendering && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-2xs flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Overlay for Placed Fields */}
        {pageSize && (
          <div className="absolute inset-0 z-20">
            {pageFields.map((field) => (
              <PlacedFieldComponent
                key={field.id}
                field={field}
                isSelected={selectedFieldId === field.id}
                scale={zoom}
                pageWidth={pageSize.width}
                pageHeight={pageSize.height}
                onSelect={() => onSelectField(field.id)}
                onUpdate={(updated) => onUpdateField(field.id, updated)}
                onDelete={() => onDeleteField(field.id)}
                onDuplicate={() => onDuplicateField(field.id)}
                onRequestSign={() => onRequestSignField(field.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Page Number Label */}
      <span className="text-[11px] font-semibold text-slate-500 mt-2">
        Page {pageNumber} of {pdfDoc.numPages}
      </span>
    </div>
  );
};
