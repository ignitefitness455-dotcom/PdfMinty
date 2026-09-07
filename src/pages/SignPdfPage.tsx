import { fabric } from 'fabric';
import {
  ArrowLeft,
  Trash2,
  Download,
  AlertCircle,
  RefreshCw,
  PenTool,
  Type,
  Image as ImageIcon,
  Circle,
  Eraser,
  Highlighter,
  Undo2,
  Redo2,
  LayoutGrid,
  Hand,
  Check as CheckIcon,
  X as CrossIcon,
  CheckCircle2,
  Square,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { AddSignatureModal } from '../components/pdf-editor/AddSignatureModal';
import { FloatingPageControls } from '../components/pdf-editor/FloatingPageControls';
import { ThumbnailsSidebar } from '../components/pdf-editor/ThumbnailsSidebar';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { getPdfJs } from '../core/index';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

interface PageData {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
}

const PALETTE_COLORS = ['#111827', '#2563eb', '#dc2626', '#16a34a', '#7c3aed'];

const PageCanvas = React.memo(({
  page,
  isActive,
  zoom,
  onActive,
  registerCanvas,
  unregisterCanvas,
}: {
  page: PageData;
  isActive: boolean;
  zoom: number;
  onActive: (idx: number) => void;
  registerCanvas: (idx: number, canvas: fabric.Canvas) => void;
  unregisterCanvas: (idx: number) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: page.width,
      height: page.height,
      selection: true,
      preserveObjectStacking: true,
    });

    // Custom styling for active fabric objects
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#2563eb',
      cornerStrokeColor: '#1d4ed8',
      borderColor: '#3b82f6',
      cornerSize: 9,
      padding: 4,
    });

    fabric.Image.fromURL(page.dataUrl, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });

    canvas.on('mouse:down', () => onActive(page.index));

    registerCanvas(page.index, canvas);

    return () => {
      unregisterCanvas(page.index);
      canvas.dispose();
    };
  }, [page, registerCanvas, unregisterCanvas, onActive]);

  const displayWidth = page.width * zoom;
  const displayHeight = page.height * zoom;

  return (
    <div
      id={`page-wrapper-${page.index}`}
      className={`relative transition-shadow duration-200 bg-white rounded-sm shadow-md ${
        isActive ? 'ring-2 ring-indigo-600 shadow-xl' : 'ring-1 ring-slate-300'
      }`}
      style={{
        width: displayWidth,
        height: displayHeight,
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: page.width,
          height: page.height,
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
});
PageCanvas.displayName = 'PageCanvas';

export const SignPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Editor layout states
  const [pages, setPages] = useState<PageData[]>([]);
  const [renderingPreviews, setRenderingPreviews] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);

  // Tool selection
  const [activeTool, setActiveTool] = useState<
    'select' | 'pan' | 'pencil' | 'highlight' | 'eraser'
  >('select');
  const [activeColor, setActiveColor] = useState(PALETTE_COLORS[0]);

  // Signature modal state
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // Canvases map and refs
  const canvasMap = useRef<Record<number, fabric.Canvas>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Undo/Redo history per page
  const historyRef = useRef<Record<number, string[]>>({});
  const historyStepRef = useRef<Record<number, number>>({});

  const saveCanvasHistory = useCallback((pageIdx: number) => {
    const canvas = canvasMap.current[pageIdx];
    if (!canvas) return;

    // Serialize canvas objects
    const json = JSON.stringify(canvas.toJSON(['selectable', 'evented']));
    if (!historyRef.current[pageIdx]) {
      historyRef.current[pageIdx] = [];
      historyStepRef.current[pageIdx] = -1;
    }

    const currentStep = historyStepRef.current[pageIdx];
    // Truncate redo states
    historyRef.current[pageIdx] = historyRef.current[pageIdx].slice(0, currentStep + 1);
    historyRef.current[pageIdx].push(json);
    historyStepRef.current[pageIdx] = historyRef.current[pageIdx].length - 1;
  }, []);

  const registerCanvas = useCallback(
    (idx: number, canvas: fabric.Canvas) => {
      canvasMap.current[idx] = canvas;

      // Set tool state
      canvas.isDrawingMode = activeTool === 'pencil';
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = 3;
      }

      canvas.on('object:added', () => saveCanvasHistory(idx));
      canvas.on('object:modified', () => saveCanvasHistory(idx));
      canvas.on('object:removed', () => saveCanvasHistory(idx));

      // Record initial blank state
      saveCanvasHistory(idx);
    },
    [activeTool, activeColor, saveCanvasHistory]
  );

  const unregisterCanvas = useCallback((idx: number) => {
    delete canvasMap.current[idx];
  }, []);

  // PDF Document Loading
  const handleFilesSelected = (files: FileList | File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setIsSuccess(false);
      setPages([]);
      historyRef.current = {};
      historyStepRef.current = {};
      setActivePageIndex(0);
    }
  };

  useEffect(() => {
    const loadPdfDoc = async () => {
      if (!selectedFile) return;

      setRenderingPreviews(true);
      setError(null);

      try {
        const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
        const pdfjs = await getPdfJs();
        const doc = await pdfjs.getDocument({ data: fileBytes.slice() }).promise;

        const loadedPages: PageData[] = [];
        // Crisp rendering scale
        const scale = 1.3;

        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL('image/png');
            loadedPages.push({
              index: i - 1,
              dataUrl,
              width: viewport.width,
              height: viewport.height,
            });
          }
        }
        setPages(loadedPages);
      } catch (err) {
        logger.error('Failed to load PDF preview:', err);
        setError('Failed to render PDF. It might be password protected or corrupted.');
      } finally {
        setRenderingPreviews(false);
      }
    };

    loadPdfDoc();
  }, [selectedFile]);

  // Page selection and scroll
  const handleSelectPage = (index: number) => {
    setActivePageIndex(index);
    const target = document.getElementById(`page-wrapper-${index}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Tool Switching
  const selectTool = (tool: 'select' | 'pan' | 'pencil' | 'highlight' | 'eraser') => {
    setActiveTool(tool);
    setIsPanMode(tool === 'pan');

    Object.values(canvasMap.current).forEach((canvas) => {
      if (!canvas) return;

      if (tool === 'pencil') {
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = activeColor;
          canvas.freeDrawingBrush.width = 3;
        }
      } else {
        canvas.isDrawingMode = false;
      }

      if (tool === 'select') {
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
          obj.evented = true;
        });
      } else if (tool === 'pan') {
        canvas.selection = false;
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    });
  };

  // Color change
  const handleColorChange = (color: string) => {
    setActiveColor(color);
    Object.values(canvasMap.current).forEach((canvas) => {
      if (!canvas) return;
      if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color;
      }
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        if (activeObj.type === 'i-text') activeObj.set('fill', color);
        else if (activeObj.type === 'path') activeObj.set('stroke', color);
        else if (activeObj.type === 'rect' || activeObj.type === 'circle') activeObj.set('stroke', color);
        canvas.renderAll();
      }
    });
  };

  // Helper to add object to active canvas
  const getActiveCanvas = useCallback(() => {
    return canvasMap.current[activePageIndex] || canvasMap.current[0];
  }, [activePageIndex]);

  // Actions
  const handleAddText = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    selectTool('select');

    const text = new fabric.IText('Type text here', {
      left: (canvas.width || 600) / 2 - 80,
      top: (canvas.height || 800) / 2 - 20,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 22,
      fill: activeColor,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleAddHighlight = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    selectTool('select');

    const rect = new fabric.Rect({
      left: (canvas.width || 600) / 2 - 100,
      top: (canvas.height || 800) / 2 - 15,
      width: 200,
      height: 30,
      fill: 'rgba(253, 224, 71, 0.45)', // Translucent yellow
      stroke: 'transparent',
      strokeWidth: 0,
      rx: 2,
      ry: 2,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const handleAddCheckmark = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    selectTool('select');

    const check = new fabric.IText('✓', {
      left: (canvas.width || 600) / 2 - 15,
      top: (canvas.height || 800) / 2 - 25,
      fontSize: 38,
      fontWeight: 'bold',
      fill: '#16a34a',
    });
    canvas.add(check);
    canvas.setActiveObject(check);
    canvas.renderAll();
  };

  const handleAddCrossmark = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    selectTool('select');

    const cross = new fabric.IText('✕', {
      left: (canvas.width || 600) / 2 - 15,
      top: (canvas.height || 800) / 2 - 25,
      fontSize: 36,
      fontWeight: 'bold',
      fill: '#dc2626',
    });
    canvas.add(cross);
    canvas.setActiveObject(cross);
    canvas.renderAll();
  };

  const handleAddEllipse = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    selectTool('select');

    const circle = new fabric.Circle({
      left: (canvas.width || 600) / 2 - 45,
      top: (canvas.height || 800) / 2 - 45,
      radius: 45,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 3,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const handleAddRectangle = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    selectTool('select');

    const rect = new fabric.Rect({
      left: (canvas.width || 600) / 2 - 60,
      top: (canvas.height || 800) / 2 - 40,
      width: 120,
      height: 80,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 3,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const handleSignatureAdded = (signatureDataUrl: string) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    selectTool('select');

    fabric.Image.fromURL(signatureDataUrl, (img) => {
      img.scaleToWidth(180);
      img.set({
        left: (canvas.width || 600) / 2 - 90,
        top: (canvas.height || 800) / 2 - 40,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const handleImageFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const canvas = getActiveCanvas();
      if (!canvas) return;
      selectTool('select');

      fabric.Image.fromURL(data, (img) => {
        img.scaleToWidth(180);
        img.set({
          left: (canvas.width || 600) / 2 - 90,
          top: (canvas.height || 800) / 2 - 50,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteSelected = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.renderAll();
    }
  }, [getActiveCanvas]);

  // Undo & Redo
  const handleUndo = useCallback(() => {
    const pageIdx = activePageIndex;
    const canvas = canvasMap.current[pageIdx];
    const history = historyRef.current[pageIdx];
    const step = historyStepRef.current[pageIdx];

    if (!canvas || !history || step <= 0) return;

    const prevStep = step - 1;
    historyStepRef.current[pageIdx] = prevStep;
    const state = history[prevStep];

    canvas.loadFromJSON(JSON.parse(state), () => {
      canvas.renderAll();
    });
  }, [activePageIndex]);

  const handleRedo = useCallback(() => {
    const pageIdx = activePageIndex;
    const canvas = canvasMap.current[pageIdx];
    const history = historyRef.current[pageIdx];
    const step = historyStepRef.current[pageIdx];

    if (!canvas || !history || step >= history.length - 1) return;

    const nextStep = step + 1;
    historyStepRef.current[pageIdx] = nextStep;
    const state = history[nextStep];

    canvas.loadFromJSON(JSON.parse(state), () => {
      canvas.renderAll();
    });
  }, [activePageIndex]);

  // Keyboard shortcut listener (Delete, Backspace, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = getActiveCanvas();
        if (canvas) {
          const activeObj = canvas.getActiveObject();
          if (activeObj && activeObj.type === 'i-text' && (activeObj as fabric.IText).isEditing) {
            return;
          }
        }
        deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, handleUndo, handleRedo, getActiveCanvas]);

  // Export & Flatten PDF
  const handleExport = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pdfPages = pdfDoc.getPages();

      for (let i = 0; i < pdfPages.length; i++) {
        const canvas = canvasMap.current[i];
        if (!canvas) continue;

        if (canvas.getObjects().length === 0) continue;

        // Hide background temporarily to capture only the edits
        const bg = canvas.backgroundImage;
        canvas.backgroundImage = undefined;
        if (bg) canvas.backgroundColor = 'transparent';

        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });

        // Restore background
        if (bg) canvas.setBackgroundImage(bg, () => {});

        const img = await pdfDoc.embedPng(dataUrl);
        const page = pdfPages[i];
        const { width, height } = page.getSize();

        page.drawImage(img, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      downloadBlob(blob, `Signed_${selectedFile.name}`);
      setIsSuccess(true);
    } catch (err) {
      logger.error('Failed to export PDF:', err);
      setError('Failed to save document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col bg-[#f8fafc]" id="pdf_editor_main_suite">
      <SEO slug="sign-pdf" />

      {/* Top Header / Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            to={ROUTES.HOME}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Return to Tools"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
                {selectedFile ? selectedFile.name : 'Sign & Edit PDF'}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Client-Side
              </span>
            </div>
            <p className="text-[12px] text-slate-500 hidden md:block">
              Full-featured PDF editor & electronic signature suite with zero server uploads
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        {selectedFile && (
          <div className="flex items-center space-x-2">
            {/* Undo / Redo for quick access */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 mr-2">
              <button
                onClick={handleUndo}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Trash button */}
            <button
              onClick={deleteSelected}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Selected Item (Del)"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Done / Download Button (matching the user's PDFGuru Done style in brand emerald) */}
            <button
              onClick={handleExport}
              disabled={loading || renderingPreviews}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export and Download Flattened PDF"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Done</span>
            </button>
          </div>
        )}
      </div>

      {!selectedFile ? (
        /* File Upload View */
        <div className="max-w-4xl mx-auto w-full p-6 sm:p-10 my-auto">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Online PDF Editor & E-Signature
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
                Sign, annotate, fill forms, and edit your PDF files with military-grade privacy. Your
                documents never leave your browser.
              </p>
            </div>

            <FileUploader
              onFilesSelected={handleFilesSelected}
              accept=".pdf,application/pdf"
              title="Upload PDF to Start Editing"
              subtitle={`Drop files here or click to browse (Max limit: ${TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}MB)`}
              maxSizeMB={TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}
            />
          </div>
        </div>
      ) : (
        /* Main Workspace */
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Main Top Toolbar (Exact layout from PDFGuru Screenshot 1!) */}
          <div className="bg-white border-b border-slate-200/90 px-3 py-1.5 flex items-center justify-between overflow-x-auto shadow-xs z-20 shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              {/* Thumbnails Toggle */}
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-lg transition-all text-center min-w-[54px] ${
                  showThumbnails
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Toggle Thumbnails Panel"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Thumbnails</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

              {/* Move / Pan */}
              <button
                onClick={() => selectTool('select')}
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-lg transition-all text-center min-w-[48px] ${
                  activeTool === 'select'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Select & Move Objects"
              >
                <Hand className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Move</span>
              </button>

              {/* Undo / Redo */}
              <button
                onClick={handleUndo}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Undo</span>
              </button>
              <button
                onClick={handleRedo}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Redo</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

              {/* Add Text */}
              <button
                onClick={handleAddText}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[54px]"
                title="Add New Text"
              >
                <Type className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Add Text</span>
              </button>

              {/* Eraser */}
              <button
                onClick={deleteSelected}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Eraser / Delete Selected"
              >
                <Eraser className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Eraser</span>
              </button>

              {/* Highlight */}
              <button
                onClick={handleAddHighlight}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[52px]"
                title="Add Text Highlight"
              >
                <Highlighter className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] mt-0.5">Highlight</span>
              </button>

              {/* Pencil / Freehand Draw */}
              <button
                onClick={() => selectTool(activeTool === 'pencil' ? 'select' : 'pencil')}
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-lg transition-all text-center min-w-[48px] ${
                  activeTool === 'pencil'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Freehand Drawing Pencil"
              >
                <PenTool className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Pencil</span>
              </button>

              {/* Image / Stamp */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFilePicked}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Insert Image Stamp"
              >
                <ImageIcon className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Image</span>
              </button>

              {/* Ellipse */}
              <button
                onClick={handleAddEllipse}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Ellipse / Circle"
              >
                <Circle className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Ellipse</span>
              </button>

              {/* Rectangle */}
              <button
                onClick={handleAddRectangle}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Rectangle"
              >
                <Square className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Rectangle</span>
              </button>

              {/* Cross (X) */}
              <button
                onClick={handleAddCrossmark}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Crossmark (✕)"
              >
                <CrossIcon className="w-4 h-4 text-red-600 font-bold" />
                <span className="text-[10px] mt-0.5">Cross</span>
              </button>

              {/* Checkmark (✓) */}
              <button
                onClick={handleAddCheckmark}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Checkmark (✓)"
              >
                <CheckIcon className="w-4 h-4 text-emerald-600 font-bold" />
                <span className="text-[10px] mt-0.5">Check</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

              {/* SIGN (Opens Add Signature Modal!) */}
              <button
                onClick={() => setIsSignModalOpen(true)}
                className="flex flex-col items-center justify-center px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all text-center min-w-[54px] shadow-xs"
                title="Sign Document (Draw, Type, or Upload Signature)"
              >
                <PenTool className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] mt-0.5 font-bold">Sign</span>
              </button>
            </div>

            {/* Right side color picker */}
            <div className="hidden lg:flex items-center space-x-1.5 pl-3 border-l border-slate-200">
              {PALETTE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    activeColor === color
                      ? 'scale-125 ring-2 ring-offset-1 ring-slate-400'
                      : 'hover:scale-110 opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select Color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs font-semibold text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-700 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Document exported successfully! Check your downloads folder.</span>
            </div>
          )}

          {/* Workspace Body: Sidebar + Main Canvas */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Thumbnails Sidebar */}
            <ThumbnailsSidebar
              pages={pages}
              activePageIndex={activePageIndex}
              isOpen={showThumbnails}
              onClose={() => setShowThumbnails(false)}
              onSelectPage={handleSelectPage}
            />

            {/* Main Center Canvas Viewport */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-auto bg-[#f1f3f6] p-4 sm:p-8 flex flex-col items-center gap-6 relative"
              id="pdf_viewport_canvas_container"
            >
              {renderingPreviews ? (
                <div className="my-auto flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">
                    Rendering PDF pages in high resolution...
                  </p>
                </div>
              ) : (
                pages.map((page) => (
                  <PageCanvas
                    key={page.index}
                    page={page}
                    isActive={activePageIndex === page.index}
                    zoom={zoom}
                    onActive={setActivePageIndex}
                    registerCanvas={registerCanvas}
                    unregisterCanvas={unregisterCanvas}
                  />
                ))
              )}
            </div>

            {/* Floating Bottom Navigation & Zoom Controls (like in Screenshot 1!) */}
            {pages.length > 0 && (
              <FloatingPageControls
                currentPage={activePageIndex + 1}
                totalPages={pages.length}
                zoom={zoom}
                isPanMode={isPanMode}
                onPrevPage={() => handleSelectPage(Math.max(0, activePageIndex - 1))}
                onNextPage={() => handleSelectPage(Math.min(pages.length - 1, activePageIndex + 1))}
                onZoomIn={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                onZoomOut={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                onResetZoom={() => setZoom(1.0)}
                onTogglePanMode={() => selectTool(isPanMode ? 'select' : 'pan')}
              />
            )}
          </div>
        </div>
      )}

      {/* Signature Modal (Draw, Type, Image - exactly like Screenshots 2 & 3!) */}
      <AddSignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onAddSignature={handleSignatureAdded}
      />
    </div>
  );
};
