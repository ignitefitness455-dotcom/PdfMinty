import confetti from 'canvas-confetti';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { getPdfJs } from '../../core/index';
import { downloadBlob } from '../../utils/download';

import { exportSignedPdf } from './export';
import { PdfPage } from './pdf-page';
import { SignSidebar } from './sign-sidebar';
import { SignatureDialog } from './signature-dialog';
import { ToolHeader } from './tool-header';
import { PlacedField, FieldType } from './types';

interface SignPdfToolProps {
  file: File;
  onBack: () => void;
}

export const SignPdfTool: React.FC<SignPdfToolProps> = ({ file, onBack }) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Viewport & Navigation
  const [zoom, setZoom] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Field Placement and Selection
  const [placedFields, setPlacedFields] = useState<PlacedField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activePlacementTool, setActivePlacementTool] = useState<FieldType | null>(null);

  // Saved Signatures from LocalStorage
  const [savedSignature, setSavedSignature] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pdfminty_saved_signature');
    } catch {
      return null;
    }
  });

  const [savedInitials, setSavedInitials] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pdfminty_saved_initials');
    } catch {
      return null;
    }
  });

  // Signature Modal state
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [signDialogType, setSignDialogType] = useState<'signature' | 'initials'>('signature');
  const pendingFieldIdRef = useRef<string | null>(null);

  // Exporting state
  const [isExporting, setIsExporting] = useState(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<PlacedField[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newFields: PlacedField[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newFields];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Load PDF with PDF.js
  useEffect(() => {
    let isCancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        setFileBytes(bytes);

        const pdfjs = await getPdfJs();
        const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;

        if (isCancelled) return;
        setPdfDoc(doc);

        // Calculate initial zoom fit
        const firstPage = await doc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.0 });
        const screenWidth = window.innerWidth;
        const availableWidth = screenWidth >= 1024 ? screenWidth - 340 : screenWidth - 32;
        const fit = Math.min(1.2, Math.max(0.4, Number((availableWidth / viewport.width).toFixed(2))));
        setZoom(fit);
      } catch (err: unknown) {
        console.error('Failed to load PDF document:', err);
        setError('Failed to open PDF document. It may be password-protected or corrupted.');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  // Track currently visible page during scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !pdfDoc) return;

    const handleScroll = () => {
      const containerTop = container.scrollTop;
      const pages = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);

      for (const pageNum of pages) {
        const el = document.getElementById(`pdf-page-${pageNum}`);
        if (el) {
          const top = el.offsetTop - container.offsetTop;
          const bottom = top + el.offsetHeight;
          if (containerTop + 200 >= top && containerTop + 200 <= bottom) {
            setCurrentPage(pageNum);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [pdfDoc]);

  // Place a new field on document
  const handlePlaceNewField = (
    type: FieldType,
    pageNumber: number,
    percentX: number,
    percentY: number
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let width = 140;
    let height = 40;
    let value = '';

    if (type === 'signature') {
      width = 170;
      height = 65;
      value = savedSignature || '';
    } else if (type === 'initials') {
      width = 90;
      height = 50;
      value = savedInitials || '';
    } else if (type === 'text') {
      width = 150;
      height = 36;
      value = 'Click to edit text';
    } else if (type === 'date') {
      width = 120;
      height = 32;
      value = todayStr;
    } else if (type === 'checkmark') {
      width = 36;
      height = 36;
      value = '✓';
    }

    const newField: PlacedField = {
      id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      pageNumber,
      x: percentX,
      y: percentY,
      width,
      height,
      value,
      fontSize: 14,
      color: '#111827',
      isSigned: Boolean(value),
    };

    const nextFields = [...placedFields, newField];
    setPlacedFields(nextFields);
    setSelectedFieldId(newField.id);
    setActivePlacementTool(null);
    pushHistory(nextFields);

    // If signature or initials has no value yet, open signature dialog
    if ((type === 'signature' && !savedSignature) || (type === 'initials' && !savedInitials)) {
      pendingFieldIdRef.current = newField.id;
      setSignDialogType(type);
      setIsSignDialogOpen(true);
    }
  };

  // Update an existing field
  const handleUpdateField = (id: string, updated: Partial<PlacedField>) => {
    setPlacedFields((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...updated } : f));
      pushHistory(next);
      return next;
    });
  };

  // Delete a field
  const handleDeleteField = useCallback((id: string) => {
    setPlacedFields((prev) => {
      const next = prev.filter((f) => f.id !== id);
      pushHistory(next);
      return next;
    });
    setSelectedFieldId((prev) => (prev === id ? null : prev));
  }, [pushHistory]);

  // Duplicate a field
  const handleDuplicateField = useCallback((id: string) => {
    setPlacedFields((prev) => {
      const target = prev.find((f) => f.id === id);
      if (!target) return prev;

      const duplicated: PlacedField = {
        ...target,
        id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        x: Math.min(85, target.x + 3),
        y: Math.min(88, target.y + 3),
      };

      const next = [...prev, duplicated];
      setSelectedFieldId(duplicated.id);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Request to sign a specific field
  const handleRequestSignField = (id: string) => {
    const target = placedFields.find((f) => f.id === id);
    if (!target) return;
    pendingFieldIdRef.current = id;
    setSignDialogType(target.type === 'initials' ? 'initials' : 'signature');
    setIsSignDialogOpen(true);
  };

  // Handle signature dialog save
  const handleSaveSignature = (dataUrl: string) => {
    if (signDialogType === 'signature') {
      setSavedSignature(dataUrl);
    } else {
      setSavedInitials(dataUrl);
    }

    if (pendingFieldIdRef.current) {
      handleUpdateField(pendingFieldIdRef.current, {
        value: dataUrl,
        isSigned: true,
      });
      pendingFieldIdRef.current = null;
    }
  };

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPlacedFields(history[newIndex]);
      setSelectedFieldId(null);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPlacedFields(history[newIndex]);
      setSelectedFieldId(null);
    }
  }, [historyIndex, history]);

  // Scroll to page
  const handleScrollToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    const target = document.getElementById(`pdf-page-${pageNum}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Clear all fields
  const handleClearAllFields = () => {
    if (placedFields.length === 0) return;
    if (window.confirm('Are you sure you want to remove all placed fields from this document?')) {
      setPlacedFields([]);
      setSelectedFieldId(null);
      pushHistory([]);
    }
  };

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))));
  const handleZoomFit = () => {
    if (!pdfDoc) return;
    setZoom(1.0);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFieldId) {
        e.preventDefault();
        handleDeleteField(selectedFieldId);
      } else if (e.key === 'Escape') {
        setSelectedFieldId(null);
        setActivePlacementTool(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedFieldId) {
        e.preventDefault();
        handleDuplicateField(selectedFieldId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, handleDeleteField, handleDuplicateField, handleUndo, handleRedo]);

  // Export PDF
  const handleExport = async () => {
    if (!fileBytes || isExporting) return;

    try {
      setIsExporting(true);
      const signedBlob = await exportSignedPdf(fileBytes, placedFields);

      // Clean file name
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const downloadName = `${baseName}-signed.pdf`;

      downloadBlob(signedBlob, downloadName);

      // Celebrate with confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('An error occurred while generating the signed PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-100">
      {/* Tool Navigation Header */}
      <ToolHeader
        fileName={file.name}
        currentPage={currentPage}
        numPages={pdfDoc?.numPages || 1}
        zoom={zoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isExporting={isExporting}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onPrevPage={() => handleScrollToPage(Math.max(1, currentPage - 1))}
        onNextPage={() => handleScrollToPage(Math.min(pdfDoc?.numPages || 1, currentPage + 1))}
        onExport={handleExport}
        onBack={onBack}
      />

      {/* Main Workspace (Sidebar + Canvas Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Interactive Sidebar */}
        <SignSidebar
          activePlacementTool={activePlacementTool}
          savedSignature={savedSignature}
          savedInitials={savedInitials}
          placedFields={placedFields}
          numPages={pdfDoc?.numPages || 1}
          currentPage={currentPage}
          onSelectPlacementTool={(tool) => setActivePlacementTool(tool)}
          onOpenSignatureDialog={(type) => {
            setSignDialogType(type);
            setIsSignDialogOpen(true);
          }}
          onScrollToPage={handleScrollToPage}
          onClearAllFields={handleClearAllFields}
        />

        {/* Center Document Viewport */}
        <div
          ref={scrollContainerRef}
          onClick={() => setSelectedFieldId(null)}
          className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col items-center relative bg-[#eceef2]"
        >
          {isLoading && (
            <div className="my-auto flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-700">Loading document...</p>
            </div>
          )}

          {error && (
            <div className="my-auto max-w-md p-6 bg-white rounded-2xl border border-red-200 shadow-md text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                ✕
              </div>
              <h3 className="text-sm font-bold text-slate-800">Error Opening PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Choose Another File
              </button>
            </div>
          )}

          {!isLoading && !error && pdfDoc && (
            <div className="flex flex-col items-center w-full max-w-5xl">
              {Array.from({ length: pdfDoc.numPages }).map((_, idx) => (
                <PdfPage
                  key={idx + 1}
                  pdfDoc={pdfDoc}
                  pageNumber={idx + 1}
                  zoom={zoom}
                  placedFields={placedFields}
                  selectedFieldId={selectedFieldId}
                  activePlacementTool={activePlacementTool}
                  onSelectField={(id) => setSelectedFieldId(id)}
                  onUpdateField={handleUpdateField}
                  onDeleteField={handleDeleteField}
                  onDuplicateField={handleDuplicateField}
                  onRequestSignField={handleRequestSignField}
                  onPlaceNewField={handlePlaceNewField}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Signature Creation Modal */}
      <SignatureDialog
        isOpen={isSignDialogOpen}
        title={signDialogType === 'initials' ? 'Create Your Initials' : 'Create Your Signature'}
        initialType={signDialogType}
        onClose={() => {
          setIsSignDialogOpen(false);
          pendingFieldIdRef.current = null;
        }}
        onSaveSignature={handleSaveSignature}
      />
    </div>
  );
};
