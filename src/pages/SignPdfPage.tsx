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
  MoreHorizontal,
  Calendar,
  Copy,
  Layers,
  RotateCw,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { AddSignatureModal } from '../components/pdf-editor/AddSignatureModal';
import { AddTextModal } from '../components/pdf-editor/AddTextModal';
import { FloatingObjectToolbar } from '../components/pdf-editor/FloatingObjectToolbar';
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

const PALETTE_COLORS = ['#111827', '#2563eb', '#1e3a8a', '#dc2626', '#16a34a', '#7c3aed'];

// Custom interactive handle renderers for industry-grade PDF annotations
const renderRotateControl = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: unknown,
  fabricObject: fabric.Object
) => {
  const size = 20;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));

  // Subtle drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  // Background circle
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2, false);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Emerald border ring
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#059669';
  ctx.stroke();

  // Reset shadow for crisp inner icon
  ctx.shadowColor = 'transparent';

  // Circular rotation arc
  ctx.beginPath();
  ctx.arc(0, 0, 5, -Math.PI * 0.7, Math.PI * 0.7, false);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(3.2, 3.8);
  ctx.lineTo(6.5, 4.2);
  ctx.lineTo(4.2, 7);
  ctx.closePath();
  ctx.fillStyle = '#059669';
  ctx.fill();

  ctx.restore();
};

const renderCornerHandle = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: unknown,
  _fabricObject: fabric.Object
) => {
  const size = 12;
  ctx.save();
  ctx.translate(left, top);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;

  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2, false);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#059669';
  ctx.stroke();

  ctx.restore();
};

const renderSideHandle = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  _styleOverride: unknown,
  _fabricObject: fabric.Object
) => {
  const w = 12;
  const h = 8;
  ctx.save();
  ctx.translate(left, top);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;

  ctx.beginPath();
  const r = 2;
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.lineTo(w / 2 - r, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  ctx.lineTo(w / 2, h / 2 - r);
  ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  ctx.lineTo(-w / 2 + r, h / 2);
  ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  ctx.lineTo(-w / 2, -h / 2 + r);
  ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  ctx.closePath();

  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#10b981';
  ctx.stroke();

  ctx.restore();
};

// Global interactive handles configuration for all annotations
const applyInteractiveHandles = (obj: fabric.Object) => {
  obj.set({
    transparentCorners: false,
    cornerStyle: 'circle',
    cornerColor: '#ffffff',
    cornerStrokeColor: '#059669',
    borderColor: '#10b981',
    cornerSize: 13,
    touchCornerSize: 24,
    padding: 8,
    borderScaleFactor: 2,
    borderDashArray: [5, 5],
    hasRotatingPoint: true,
    rotatingPointOffset: 32,
    centeredRotation: true,
    centeredScaling: false,
    lockScalingFlip: true,
    lockRotation: false,
    snapAngle: 5,
    snapThreshold: 4,
  });

  if (obj.type === 'i-text') {
    obj.setControlsVisibility({
      tl: true,
      tr: true,
      bl: true,
      br: true,
      ml: true,
      mr: true,
      mt: false,
      mb: false,
      mtr: true,
    });
  } else {
    obj.setControlsVisibility({
      tl: true,
      tr: true,
      bl: true,
      br: true,
      ml: true,
      mr: true,
      mt: true,
      mb: true,
      mtr: true,
    });
  }
};

// Configure Fabric default controls
if (typeof window !== 'undefined' && fabric.Object && fabric.Object.prototype) {
  fabric.Object.prototype.set({
    transparentCorners: false,
    cornerStyle: 'circle',
    cornerColor: '#ffffff',
    cornerStrokeColor: '#059669',
    borderColor: '#10b981',
    cornerSize: 13,
    touchCornerSize: 24,
    padding: 8,
    borderScaleFactor: 2,
    borderDashArray: [5, 5],
    hasRotatingPoint: true,
    rotatingPointOffset: 32,
    centeredRotation: true,
    centeredScaling: false,
    lockScalingFlip: true,
    lockRotation: false,
    snapAngle: 5,
    snapThreshold: 4,
  });

  const ctrl = fabric.Object.prototype.controls as Record<string, fabric.Control>;
  if (ctrl) {
    if (ctrl.mtr) {
      ctrl.mtr.offsetY = -32;
      ctrl.mtr.withConnection = true;
      ctrl.mtr.render = renderRotateControl;
    }
    ['tl', 'tr', 'bl', 'br'].forEach((k) => {
      if (ctrl[k]) ctrl[k].render = renderCornerHandle;
    });
    ['ml', 'mr', 'mt', 'mb'].forEach((k) => {
      if (ctrl[k]) ctrl[k].render = renderSideHandle;
    });
  }
}

interface PageCanvasProps {
  page: PageData;
  isActive: boolean;
  zoom: number;
  activeTool: 'select' | 'pan' | 'pencil' | 'highlight' | 'eraser';
  activeColor: string;
  onActive: (idx: number) => void;
  onSelectionChange: (obj: fabric.Object | null, pageIdx: number) => void;
  onObjectDeleted: (idx: number) => void;
  onObjectModified: (idx: number) => void;
  onDropImage?: (file: File, pageIdx: number, x: number, y: number) => void;
  registerCanvas: (idx: number, canvas: fabric.Canvas) => void;
  unregisterCanvas: (idx: number) => void;
}

const PageCanvas: React.FC<PageCanvasProps> = React.memo(({
  page,
  isActive,
  zoom,
  activeTool,
  activeColor,
  onActive,
  onSelectionChange,
  onObjectDeleted,
  onObjectModified,
  onDropImage,
  registerCanvas,
  unregisterCanvas,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rotatingAngle, setRotatingAngle] = useState<number | null>(null);

  // Store volatile callbacks in refs to prevent canvas recreation
  const onActiveRef = useRef(onActive);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onObjectDeletedRef = useRef(onObjectDeleted);
  const onObjectModifiedRef = useRef(onObjectModified);
  const onDropImageRef = useRef(onDropImage);
  const registerCanvasRef = useRef(registerCanvas);
  const unregisterCanvasRef = useRef(unregisterCanvas);
  const activeToolRef = useRef(activeTool);
  const activeColorRef = useRef(activeColor);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    onActiveRef.current = onActive;
    onSelectionChangeRef.current = onSelectionChange;
    onObjectDeletedRef.current = onObjectDeleted;
    onObjectModifiedRef.current = onObjectModified;
    onDropImageRef.current = onDropImage;
    registerCanvasRef.current = registerCanvas;
    unregisterCanvasRef.current = unregisterCanvas;
    activeToolRef.current = activeTool;
    activeColorRef.current = activeColor;
    zoomRef.current = zoom;
  });

  // Initialize Canvas ONCE per page data
  useEffect(() => {
    if (!canvasRef.current) return;

    const initialZoom = zoomRef.current;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: page.width * initialZoom,
      height: page.height * initialZoom,
      selection: true,
      preserveObjectStacking: true,
      allowTouchScrolling: false,
      stopContextMenu: true,
    });
    canvas.setZoom(initialZoom);
    canvasInstanceRef.current = canvas;

    // Set page background image
    fabric.Image.fromURL(
      page.dataUrl,
      (img) => {
        if (!canvasInstanceRef.current) return;
        img.set({
          originX: 'left',
          originY: 'top',
          selectable: false,
          evented: false,
        });
        canvas.setBackgroundImage(img, () => {
          canvas.renderAll();
        });
      },
      { crossOrigin: 'anonymous' }
    );

    // Event listeners
    canvas.on('mouse:down', (opt) => {
      onActiveRef.current(page.index);
      if (activeToolRef.current === 'eraser') {
        if (opt.target && opt.target !== canvas.backgroundImage) {
          canvas.remove(opt.target);
          canvas.discardActiveObject();
          canvas.renderAll();
          onObjectDeletedRef.current(page.index);
          onSelectionChangeRef.current(null, page.index);
        }
      }
    });

    canvas.on('selection:created', (e) => {
      onActiveRef.current(page.index);
      onSelectionChangeRef.current(e.selected ? e.selected[0] : null, page.index);
    });
    canvas.on('selection:updated', (e) => {
      onSelectionChangeRef.current(e.selected ? e.selected[0] : null, page.index);
    });
    canvas.on('selection:cleared', () => {
      setRotatingAngle(null);
      onSelectionChangeRef.current(null, page.index);
    });

    // Handle drag movement with smooth boundary clamping
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (obj) {
        const bound = obj.getBoundingRect();
        const minVisible = 30;
        if (bound.left < -bound.width + minVisible) obj.left = -bound.width + minVisible;
        if (bound.top < -bound.height + minVisible) obj.top = -bound.height + minVisible;
        if (bound.left > page.width - minVisible) obj.left = page.width - minVisible;
        if (bound.top > page.height - minVisible) obj.top = page.height - minVisible;
      }
    });

    // Live rotation tracking
    canvas.on('object:rotating', (e) => {
      const rawAngle = Math.round(e.target?.angle || 0);
      const normalized = ((rawAngle % 360) + 360) % 360;
      setRotatingAngle(normalized);
      onSelectionChangeRef.current(e.target || null, page.index);
    });

    canvas.on('object:scaling', (e) => {
      onSelectionChangeRef.current(e.target || null, page.index);
    });

    // Save history when user finishes repositioning, resizing, or rotating
    canvas.on('object:modified', (e) => {
      setRotatingAngle(null);
      onObjectModifiedRef.current(page.index);
      onSelectionChangeRef.current(e.target || null, page.index);
    });

    // Prevent browser touch gestures on canvas
    if (canvas.upperCanvasEl) {
      canvas.upperCanvasEl.style.touchAction = 'none';
      canvas.upperCanvasEl.classList.add('pdf-editor-touch-none');
    }
    if (canvas.lowerCanvasEl) {
      canvas.lowerCanvasEl.style.touchAction = 'none';
      canvas.lowerCanvasEl.classList.add('pdf-editor-touch-none');
    }

    registerCanvasRef.current(page.index, canvas);

    return () => {
      unregisterCanvasRef.current(page.index);
      canvas.dispose();
      canvasInstanceRef.current = null;
    };
  }, [page.index, page.dataUrl, page.width, page.height]);

  // Update zoom smoothly WITHOUT recreating canvas
  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.setDimensions({
      width: page.width * zoom,
      height: page.height * zoom,
    });
    canvas.calcOffset();
    canvas.renderAll();
  }, [zoom, page.width, page.height]);

  // Update active tool and cursor states without destroying canvas
  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas) return;

    if (activeTool === 'pencil') {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = 3;
      }
    } else if (activeTool === 'eraser') {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'pointer';
      canvas.discardActiveObject();
      canvas.renderAll();
    } else if (activeTool === 'pan') {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'grab';
      canvas.hoverCursor = 'grab';
      canvas.discardActiveObject();
      canvas.renderAll();
    } else {
      // select tool
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      canvas.forEachObject((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });
      canvas.renderAll();
    }
  }, [activeTool, activeColor]);

  // Recalculate canvas offset whenever page becomes active
  useEffect(() => {
    if (isActive && canvasInstanceRef.current) {
      canvasInstanceRef.current.calcOffset();
    }
  }, [isActive]);

  return (
    <div
      id={`page-wrapper-${page.index}`}
      className={`relative transition-all duration-150 bg-white rounded-xs shadow-md ${
        isActive ? 'ring-2 ring-emerald-500 shadow-xl' : 'ring-1 ring-slate-200 hover:ring-slate-300'
      }`}
      style={{
        width: page.width * zoom,
        height: page.height * zoom,
        touchAction: 'none',
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          if (!isDragOver) setIsDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;
            onDropImageRef.current?.(file, page.index, x, y);
          }
        }
      }}
    >
      {/* Live Rotation Angle Badge when rotating handle is used */}
      {rotatingAngle !== null && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-emerald-400 border border-emerald-500/60 shadow-xl px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-2 pointer-events-none animate-in fade-in">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Angle: {rotatingAngle}°</span>
          {rotatingAngle % 90 === 0 && (
            <span className="text-[10px] text-white bg-emerald-600 px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider">
              Snapped
            </span>
          )}
        </div>
      )}

      {/* Direct Drop Overlay for Signatures and Images */}
      {isDragOver && (
        <div className="absolute inset-0 bg-emerald-500/15 border-2 border-dashed border-emerald-500 rounded-xs z-30 pointer-events-none flex items-center justify-center backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-2 border border-emerald-500/40">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Drop signature or image to place here</span>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ touchAction: 'none' }} />
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
  const [showThumbnails, setShowThumbnails] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [zoom, setZoom] = useState<number>(1.0);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 'continuous' : 'single'
  );

  // Tool selection & selected object state
  const [activeTool, setActiveTool] = useState<
    'select' | 'pan' | 'pencil' | 'highlight' | 'eraser'
  >('select');
  const [activeColor, setActiveColor] = useState(PALETTE_COLORS[0]);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);

  // Modals
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [editTextInitial, setEditTextInitial] = useState<string>('');
  const [showMobileMore, setShowMobileMore] = useState(false);

  // Canvas registry and refs
  const canvasMap = useRef<Record<number, fabric.Canvas>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Undo/Redo history per page
  const historyRef = useRef<Record<number, string[]>>({});
  const historyStepRef = useRef<Record<number, number>>({});

  const saveCanvasHistory = useCallback((pageIdx: number) => {
    const canvas = canvasMap.current[pageIdx];
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON(['selectable', 'evented']));
    if (!historyRef.current[pageIdx]) {
      historyRef.current[pageIdx] = [];
      historyStepRef.current[pageIdx] = -1;
    }

    const currentStep = historyStepRef.current[pageIdx];
    historyRef.current[pageIdx] = historyRef.current[pageIdx].slice(0, currentStep + 1);
    historyRef.current[pageIdx].push(json);
    historyStepRef.current[pageIdx] = historyRef.current[pageIdx].length - 1;
  }, []);

  const registerCanvas = useCallback(
    (idx: number, canvas: fabric.Canvas) => {
      canvasMap.current[idx] = canvas;

      canvas.on('object:added', () => saveCanvasHistory(idx));
      canvas.on('object:modified', () => saveCanvasHistory(idx));
      canvas.on('object:removed', () => saveCanvasHistory(idx));

      // Initial blank history record
      saveCanvasHistory(idx);
    },
    [saveCanvasHistory]
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
      setSelectedObject(null);
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
        const scale = 1.35;

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
        if (loadedPages.length > 0) {
          const containerWidth = window.innerWidth;
          const padding = containerWidth < 640 ? 24 : 64;
          const availableWidth = Math.max(260, containerWidth - padding);
          const initialFit = Math.min(1.1, Math.max(0.35, Number((availableWidth / loadedPages[0].width).toFixed(2))));
          setZoom(initialFit);
        }
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
    setSelectedObject(null);
    const target = document.getElementById(`page-wrapper-${index}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Helper to get active canvas instance
  const getActiveCanvas = useCallback(() => {
    return canvasMap.current[activePageIndex] || canvasMap.current[0];
  }, [activePageIndex]);

  // Tool Switching
  const selectTool = useCallback((tool: 'select' | 'pan' | 'pencil' | 'highlight' | 'eraser') => {
    setActiveTool(tool);
    setIsPanMode(tool === 'pan');

    if (tool !== 'select') {
      setSelectedObject(null);
    }
  }, []);

  // Color change
  const handleColorChange = (color: string) => {
    setActiveColor(color);
    const canvas = getActiveCanvas();
    if (!canvas) return;

    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }

    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      if (activeObj.type === 'i-text') {
        activeObj.set('fill', color);
      } else if (activeObj.type === 'rect' || activeObj.type === 'circle' || activeObj.type === 'path') {
        activeObj.set('stroke', color);
      }
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
    }
  };

  // Font Size change on selected text
  const handleFontSizeChange = (delta: number) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
      const itext = activeObj as fabric.IText;
      const current = itext.fontSize || 22;
      const updated = Math.max(10, Math.min(110, current + delta));
      itext.set('fontSize', updated);
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
    }
  };

  // Font Family change on selected text
  const handleFontFamilyChange = (font: string) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
      (activeObj as fabric.IText).set('fontFamily', font);
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
    }
  };

  // Bold toggle on selected text
  const handleToggleBold = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
      const itext = activeObj as fabric.IText;
      const isBold = itext.fontWeight === 'bold' || itext.fontWeight === '700';
      itext.set('fontWeight', isBold ? 'normal' : 'bold');
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
    }
  };

  // Scale object up or down
  const handleScaleObject = (multiplier: number) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      activeObj.scale((activeObj.scaleX || 1) * multiplier);
      activeObj.setCoords();
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
    }
  };

  // Rotate selected object incrementally with snap
  const handleRotateSelected = useCallback((deltaDeg: number) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const currentAngle = activeObj.angle || 0;
    const targetAngle = Math.round((currentAngle + deltaDeg) / 5) * 5;
    const newAngle = ((targetAngle % 360) + 360) % 360;
    activeObj.rotate(newAngle);
    activeObj.setCoords();
    canvas.requestRenderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(activeObj);
  }, [getActiveCanvas, activePageIndex, saveCanvasHistory]);

  // Reset rotation to 0 degrees
  const handleResetRotation = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    activeObj.rotate(0);
    activeObj.setCoords();
    canvas.requestRenderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(activeObj);
  }, [getActiveCanvas, activePageIndex, saveCanvasHistory]);

  // Center selected object on page
  const handleCenterSelected = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    canvas.centerObject(activeObj);
    activeObj.setCoords();
    canvas.requestRenderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(activeObj);
  }, [getActiveCanvas, activePageIndex, saveCanvasHistory]);

  // Drop image / signature directly onto specific page
  const handleDropImage = useCallback((file: File, pageIdx: number, x: number, y: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const canvas = canvasMap.current[pageIdx];
      if (!canvas) return;

      const pageData = pages[pageIdx];
      const pw = pageData ? pageData.width : 800;

      fabric.Image.fromURL(
        dataUrl,
        (img) => {
          const targetWidth = Math.min(240, pw * 0.4);
          img.scaleToWidth(targetWidth);
          img.set({
            left: Math.max(10, x - img.getScaledWidth() / 2),
            top: Math.max(10, y - img.getScaledHeight() / 2),
          });
          applyInteractiveHandles(img);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          saveCanvasHistory(pageIdx);
          setSelectedObject(img);
          setActivePageIndex(pageIdx);
          selectTool('select');
        },
        { crossOrigin: 'anonymous' }
      );
    };
    reader.readAsDataURL(file);
  }, [pages, saveCanvasHistory, selectTool]);

  // Duplicate selected object
  const handleDuplicateSelected = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    activeObj.clone((cloned: fabric.Object) => {
      canvas.discardActiveObject();
      cloned.set({
        left: (cloned.left || 0) + 24,
        top: (cloned.top || 0) + 24,
        evented: true,
      });
      applyInteractiveHandles(cloned);
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      saveCanvasHistory(activePageIndex);
      setSelectedObject(cloned);
    });
  }, [getActiveCanvas, activePageIndex, saveCanvasHistory]);

  // Delete selected object
  const deleteSelected = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
      setSelectedObject(null);
    }
  }, [getActiveCanvas, saveCanvasHistory, activePageIndex]);

  // Open Edit text modal for selected text
  const handleEditSelectedText = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
      setEditTextInitial((activeObj as fabric.IText).text || '');
      setIsTextModalOpen(true);
    }
  };

  // Confirm Text (Add new or edit existing)
  const handleConfirmText = (content: string, color: string, fontSize: number) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text' && editTextInitial) {
      (activeObj as fabric.IText).set({
        text: content,
        fill: color,
        fontSize: fontSize,
      });
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
      setEditTextInitial('');
      return;
    }

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const text = new fabric.IText(content, {
      left: Math.max(30, pw / 2 - 120),
      top: Math.max(30, ph / 2 - 25),
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: fontSize,
      fill: color,
      editable: true,
    });
    applyInteractiveHandles(text);

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(text);
    selectTool('select');
    setEditTextInitial('');
  };

  // Add Signature to active canvas
  const handleSignatureAdded = (signatureDataUrl: string) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    fabric.Image.fromURL(
      signatureDataUrl,
      (img) => {
        const targetWidth = Math.min(220, pw * 0.38);
        img.scaleToWidth(targetWidth);
        img.set({
          left: Math.max(20, pw / 2 - (img.getScaledWidth() / 2)),
          top: Math.max(20, ph / 2 - (img.getScaledHeight() / 2)),
        });
        applyInteractiveHandles(img);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveCanvasHistory(activePageIndex);
        setSelectedObject(img);
      },
      { crossOrigin: 'anonymous' }
    );

    selectTool('select');
  };

  // 1-Click Date Stamp
  const handleAddDate = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const today = new Date();
    const formatted = today.toISOString().split('T')[0];

    const dateText = new fabric.IText(formatted, {
      left: Math.max(30, pw / 2 - 60),
      top: Math.max(30, ph / 2 - 15),
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 22,
      fill: activeColor || '#111827',
      fontWeight: '500',
    });
    applyInteractiveHandles(dateText);
    canvas.add(dateText);
    canvas.setActiveObject(dateText);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(dateText);
    selectTool('select');
  };

  // 1-Click Initials
  const handleAddInitials = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const initialsText = new fabric.IText('MB', {
      left: Math.max(30, pw / 2 - 30),
      top: Math.max(30, ph / 2 - 20),
      fontFamily: "'Dancing Script', cursive, sans-serif",
      fontSize: 38,
      fill: activeColor || '#2563eb',
      fontWeight: 'bold',
    });
    applyInteractiveHandles(initialsText);
    canvas.add(initialsText);
    canvas.setActiveObject(initialsText);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(initialsText);
    selectTool('select');
  };

  // Highlight bar
  const handleAddHighlight = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const rect = new fabric.Rect({
      left: Math.max(30, pw / 2 - 120),
      top: Math.max(30, ph / 2 - 18),
      width: 240,
      height: 36,
      fill: 'rgba(253, 224, 71, 0.45)',
      stroke: 'transparent',
      strokeWidth: 0,
      rx: 3,
      ry: 3,
    });
    applyInteractiveHandles(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(rect);
    selectTool('select');
  };

  // Checkmark (✓)
  const handleAddCheckmark = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const check = new fabric.IText('✓', {
      left: Math.max(30, pw / 2 - 20),
      top: Math.max(30, ph / 2 - 30),
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#16a34a',
    });
    applyInteractiveHandles(check);
    canvas.add(check);
    canvas.setActiveObject(check);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(check);
    selectTool('select');
  };

  // Crossmark (✕)
  const handleAddCrossmark = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const cross = new fabric.IText('✕', {
      left: Math.max(30, pw / 2 - 20),
      top: Math.max(30, ph / 2 - 30),
      fontSize: 46,
      fontWeight: 'bold',
      fill: '#dc2626',
    });
    applyInteractiveHandles(cross);
    canvas.add(cross);
    canvas.setActiveObject(cross);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(cross);
    selectTool('select');
  };

  // Circle / Ellipse
  const handleAddEllipse = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const circle = new fabric.Circle({
      left: Math.max(30, pw / 2 - 50),
      top: Math.max(30, ph / 2 - 50),
      radius: 50,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 3,
    });
    applyInteractiveHandles(circle);
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(circle);
    selectTool('select');
  };

  // Rectangle
  const handleAddRectangle = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activePage = pages[activePageIndex] || pages[0];
    const pw = activePage ? activePage.width : 800;
    const ph = activePage ? activePage.height : 1100;

    const rect = new fabric.Rect({
      left: Math.max(30, pw / 2 - 80),
      top: Math.max(30, ph / 2 - 50),
      width: 160,
      height: 100,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 3,
    });
    applyInteractiveHandles(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    saveCanvasHistory(activePageIndex);
    setSelectedObject(rect);
    selectTool('select');
  };

  // Image / Stamp upload
  const handleImageFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const canvas = getActiveCanvas();
      if (!canvas) return;

      const activePage = pages[activePageIndex] || pages[0];
      const pw = activePage ? activePage.width : 800;
      const ph = activePage ? activePage.height : 1100;

      fabric.Image.fromURL(data, (img) => {
        img.scaleToWidth(Math.min(220, pw * 0.4));
        img.set({
          left: Math.max(20, pw / 2 - (img.getScaledWidth() / 2)),
          top: Math.max(20, ph / 2 - (img.getScaledHeight() / 2)),
        });
        applyInteractiveHandles(img);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveCanvasHistory(activePageIndex);
        setSelectedObject(img);
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    selectTool('select');
  };

  // Eraser tool action
  const handleEraserClick = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      canvas.discardActiveObject();
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.renderAll();
      saveCanvasHistory(activePageIndex);
      setSelectedObject(null);
    } else {
      selectTool(activeTool === 'eraser' ? 'select' : 'eraser');
    }
  }, [getActiveCanvas, activeTool, selectTool, saveCanvasHistory, activePageIndex]);

  // Clear all annotations on page
  const handleClearPage = useCallback((pageIdx: number) => {
    const canvas = canvasMap.current[pageIdx];
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length === 0) return;
    canvas.discardActiveObject();
    objects.forEach((obj) => canvas.remove(obj));
    canvas.renderAll();
    saveCanvasHistory(pageIdx);
    setSelectedObject(null);
  }, [saveCanvasHistory]);

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

    const bg = canvas.backgroundImage;
    canvas.loadFromJSON(JSON.parse(state), () => {
      if (bg) canvas.setBackgroundImage(bg, () => {});
      canvas.renderAll();
    });
    setSelectedObject(null);
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

    const bg = canvas.backgroundImage;
    canvas.loadFromJSON(JSON.parse(state), () => {
      if (bg) canvas.setBackgroundImage(bg, () => {});
      canvas.renderAll();
    });
    setSelectedObject(null);
  }, [activePageIndex]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const canvas = getActiveCanvas();
      if (canvas) {
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'i-text' && (activeObj as fabric.IText).isEditing) {
          return;
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if (e.key === 'Escape') {
        if (canvas) {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        setSelectedObject(null);
        selectTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, handleUndo, handleRedo, handleDuplicateSelected, getActiveCanvas, selectTool]);

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

        // Discard any active selection so interactive handles/borders are not rendered into the exported PDF
        canvas.discardActiveObject();
        canvas.renderAll();

        const bg = canvas.backgroundImage;
        canvas.backgroundImage = undefined;
        if (bg) canvas.backgroundColor = 'transparent';

        const originalZoom = canvas.getZoom();
        const pageData = pages[i];
        if (pageData) {
          canvas.setZoom(1);
          canvas.setDimensions({ width: pageData.width, height: pageData.height });
        }

        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });

        if (pageData) {
          canvas.setZoom(originalZoom);
          canvas.setDimensions({ width: pageData.width * originalZoom, height: pageData.height * originalZoom });
        }

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
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <Link
            to={ROUTES.HOME}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            title="Return to Tools"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 tracking-tight leading-tight truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs">
                {selectedFile ? selectedFile.name : 'Sign & Edit PDF'}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
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
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* View Mode Switcher */}
            <button
              onClick={() => setViewMode(viewMode === 'continuous' ? 'single' : 'continuous')}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors"
              title="Toggle View Mode"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{viewMode === 'continuous' ? 'Continuous' : 'Single Page'}</span>
            </button>

            {/* Undo / Redo */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={handleUndo}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleRedo}
                className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Trash button */}
            <button
              onClick={deleteSelected}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Selected Item (Del)"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Done / Download Button */}
            <button
              onClick={handleExport}
              disabled={loading || renderingPreviews}
              className="px-3 sm:px-5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs flex items-center space-x-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export and Download Flattened PDF"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
          {/* Main Top Toolbar (Desktop only) */}
          <div className="hidden md:flex bg-white border-b border-slate-200/90 px-3 py-1.5 items-center justify-between overflow-x-auto shadow-xs z-20 shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              {/* Thumbnails Toggle */}
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-lg transition-all text-center min-w-[54px] ${
                  showThumbnails
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Toggle Thumbnails Panel"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Pages</span>
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
                <span className="text-[10px] mt-0.5">Select</span>
              </button>

              {/* SIGN (Opens Add Signature Modal) */}
              <button
                onClick={() => setIsSignModalOpen(true)}
                className="flex flex-col items-center justify-center px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-center min-w-[54px] shadow-xs"
                title="Sign Document (Draw, Type, or Upload Signature)"
              >
                <PenTool className="w-4 h-4 text-white" />
                <span className="text-[10px] mt-0.5 font-bold">Sign</span>
              </button>

              {/* Add Text */}
              <button
                onClick={() => {
                  setEditTextInitial('');
                  setIsTextModalOpen(true);
                }}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[54px]"
                title="Add New Text"
              >
                <Type className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Add Text</span>
              </button>

              {/* Date Stamp */}
              <button
                onClick={handleAddDate}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Stamp Today's Date"
              >
                <Calendar className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Date</span>
              </button>

              {/* Initials */}
              <button
                onClick={handleAddInitials}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Initials Stamp"
              >
                <span className="text-xs font-serif font-black text-slate-800 leading-none">Init</span>
                <span className="text-[10px] mt-0.5">Initials</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

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
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Insert Image Stamp"
              >
                <ImageIcon className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Image</span>
              </button>

              {/* Shapes */}
              <button
                onClick={handleAddRectangle}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Rectangle"
              >
                <Square className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Rectangle</span>
              </button>

              <button
                onClick={handleAddEllipse}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Ellipse / Circle"
              >
                <Circle className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Circle</span>
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

              {/* Crossmark (✕) */}
              <button
                onClick={handleAddCrossmark}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Add Crossmark (✕)"
              >
                <CrossIcon className="w-4 h-4 text-red-600 font-bold" />
                <span className="text-[10px] mt-0.5">Cross</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

              {/* Duplicate */}
              <button
                onClick={handleDuplicateSelected}
                className="flex flex-col items-center justify-center px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-all text-center min-w-[48px]"
                title="Duplicate Selected (Ctrl+D)"
              >
                <Copy className="w-4 h-4 text-slate-800" />
                <span className="text-[10px] mt-0.5">Duplicate</span>
              </button>

              {/* Eraser Tool */}
              <button
                onClick={handleEraserClick}
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-lg transition-all text-center min-w-[48px] ${
                  activeTool === 'eraser'
                    ? 'bg-rose-50 text-rose-700 font-semibold ring-1 ring-rose-300'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Eraser: Click any object to remove it"
              >
                <Eraser className="w-4 h-4" />
                <span className="text-[10px] mt-0.5">Eraser</span>
              </button>
            </div>

            {/* Right side color palette */}
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
              className="flex-1 overflow-auto bg-[#f1f3f6] p-3 sm:p-8 pb-28 md:pb-12 flex flex-col items-center relative no-overscroll"
              id="pdf_viewport_canvas_container"
            >
              {/* Floating Context Toolbar for Selected Object */}
              <FloatingObjectToolbar
                selectedObject={selectedObject}
                onDelete={deleteSelected}
                onDuplicate={handleDuplicateSelected}
                onChangeColor={handleColorChange}
                onChangeFontSize={handleFontSizeChange}
                onChangeFontFamily={handleFontFamilyChange}
                onToggleBold={handleToggleBold}
                onEditContent={handleEditSelectedText}
                onScale={handleScaleObject}
                onRotate={handleRotateSelected}
                onResetRotation={handleResetRotation}
                onCenter={handleCenterSelected}
              />

              {/* Eraser Floating Mode Banner */}
              {activeTool === 'eraser' && (
                <div className="absolute top-3 inset-x-4 max-w-sm mx-auto bg-rose-600/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl shadow-lg z-20 flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center space-x-2">
                    <Eraser className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>Tap any item to erase</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleClearPage(activePageIndex)}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-md text-[11px] font-semibold transition-colors"
                      title="Clear all annotations on this page"
                    >
                      Clear Page
                    </button>
                    <button
                      onClick={() => selectTool('select')}
                      className="px-2.5 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-md text-[11px] font-bold transition-colors shadow-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {renderingPreviews ? (
                <div className="my-auto flex flex-col items-center justify-center space-y-3 py-16">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">
                    Rendering PDF pages in high resolution...
                  </p>
                </div>
              ) : (
                pages.map((page) => {
                  const isCurrent = activePageIndex === page.index;
                  const isVisibleInSingle = isCurrent;

                  if (viewMode === 'single' && !isVisibleInSingle) {
                    return null;
                  }

                  return (
                    <div
                      key={page.index}
                      id={`page-wrapper-${page.index}`}
                      className="flex flex-col items-center my-3 sm:my-5 group transition-all"
                    >
                      {/* Page number badge */}
                      {viewMode === 'continuous' && pages.length > 1 && (
                        <div className="flex items-center justify-between w-full max-w-sm mb-1.5 px-1 text-xs font-semibold text-slate-500">
                          <span>Page {page.index + 1} of {pages.length}</span>
                          {isCurrent && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full ring-1 ring-emerald-300">
                              Active
                            </span>
                          )}
                        </div>
                      )}

                      <PageCanvas
                        page={page}
                        isActive={isCurrent}
                        zoom={zoom}
                        activeTool={activeTool}
                        activeColor={activeColor}
                        onActive={setActivePageIndex}
                        onSelectionChange={(obj, idx) => {
                          setSelectedObject(obj);
                          setActivePageIndex(idx);
                        }}
                        onObjectDeleted={() => saveCanvasHistory(page.index)}
                        onObjectModified={() => saveCanvasHistory(page.index)}
                        onDropImage={handleDropImage}
                        registerCanvas={registerCanvas}
                        unregisterCanvas={unregisterCanvas}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* Floating Bottom Navigation & Zoom Controls */}
            {pages.length > 0 && (
              <FloatingPageControls
                currentPage={activePageIndex + 1}
                totalPages={pages.length}
                zoom={zoom}
                isPanMode={isPanMode}
                onPrevPage={() => handleSelectPage(Math.max(0, activePageIndex - 1))}
                onNextPage={() => handleSelectPage(Math.min(pages.length - 1, activePageIndex + 1))}
                onZoomIn={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                onZoomOut={() => setZoom((z) => Math.max(0.35, z - 0.15))}
                onResetZoom={() => {
                  const w = pages[0]?.width || 800;
                  const containerWidth = scrollContainerRef.current?.clientWidth || window.innerWidth;
                  const padding = window.innerWidth < 640 ? 20 : 64;
                  const fit = (containerWidth - padding) / w;
                  setZoom(Math.min(1.1, Math.max(0.35, Number(fit.toFixed(2)))));
                }}
                onTogglePanMode={() => selectTool(isPanMode ? 'select' : 'pan')}
              />
            )}
          </div>

          {/* Mobile Bottom Toolbar */}
          <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 h-16 flex items-center justify-around px-1 shadow-lg select-none">
            {/* Pages / Thumbnails */}
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
                showThumbnails ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Pages</span>
              {pages.length > 0 && (
                <span className="absolute top-1 right-1 px-1 bg-slate-200 text-slate-700 text-[9px] font-bold rounded-full">
                  {pages.length}
                </span>
              )}
            </button>

            {/* Add Text */}
            <button
              onClick={() => {
                setEditTextInitial('');
                setIsTextModalOpen(true);
              }}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all"
            >
              <Type className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Text</span>
            </button>

            {/* Signature Button (Prominent Center Action) */}
            <button
              onClick={() => setIsSignModalOpen(true)}
              className="flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl bg-emerald-600 text-white shadow-md active:scale-95 transition-all"
            >
              <PenTool className="w-5 h-5 text-white" />
              <span className="text-[10px] font-bold mt-0.5">Sign</span>
            </button>

            {/* Freehand Draw */}
            <button
              onClick={() => selectTool(activeTool === 'pencil' ? 'select' : 'pencil')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                activeTool === 'pencil'
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Draw</span>
            </button>

            {/* Eraser Tool */}
            <button
              onClick={handleEraserClick}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                activeTool === 'eraser'
                  ? 'text-rose-600 bg-rose-50 ring-1 ring-rose-300 font-semibold'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Erase</span>
            </button>

            {/* More Tools */}
            <button
              onClick={() => setShowMobileMore(!showMobileMore)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                showMobileMore ? 'text-emerald-600 font-semibold bg-emerald-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">More</span>
            </button>
          </div>

          {/* Mobile "More Tools" Bottom Sheet */}
          {showMobileMore && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-2xs"
                onClick={() => setShowMobileMore(false)}
              />
              <div className="fixed bottom-16 inset-x-0 z-40 bg-white border-t border-slate-200 rounded-t-2xl p-4 shadow-2xl space-y-3.5 md:hidden animate-in slide-in-from-bottom duration-200 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tools & Annotations
                  </span>
                  <button
                    onClick={() => setShowMobileMore(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Secondary tools grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <button
                    onClick={() => {
                      handleAddDate();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <Calendar className="w-5 h-5 text-slate-700 mb-1" />
                    Date
                  </button>

                  <button
                    onClick={() => {
                      handleAddInitials();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <span className="text-xs font-serif font-black text-slate-700 mb-1">Init</span>
                    Initials
                  </button>

                  <button
                    onClick={() => {
                      handleAddHighlight();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <Highlighter className="w-5 h-5 text-amber-500 mb-1" />
                    Highlight
                  </button>

                  <button
                    onClick={() => {
                      setShowMobileMore(false);
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-slate-700 mb-1" />
                    Image
                  </button>

                  <button
                    onClick={() => {
                      handleAddRectangle();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <Square className="w-5 h-5 text-slate-700 mb-1" />
                    Rectangle
                  </button>

                  <button
                    onClick={() => {
                      handleAddEllipse();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <Circle className="w-5 h-5 text-slate-700 mb-1" />
                    Circle
                  </button>

                  <button
                    onClick={() => {
                      handleAddCheckmark();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <CheckIcon className="w-5 h-5 text-emerald-600 font-bold mb-1" />
                    Check (✓)
                  </button>

                  <button
                    onClick={() => {
                      handleAddCrossmark();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <CrossIcon className="w-5 h-5 text-red-600 font-bold mb-1" />
                    Cross (✕)
                  </button>

                  <button
                    onClick={() => {
                      handleDuplicateSelected();
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <Copy className="w-5 h-5 text-slate-700 mb-1" />
                    Duplicate
                  </button>

                  <button
                    onClick={() => {
                      setViewMode(viewMode === 'continuous' ? 'single' : 'continuous');
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <Layers className="w-5 h-5 text-slate-700 mb-1" />
                    {viewMode === 'continuous' ? 'Single Pg' : 'Continuous'}
                  </button>

                  <button
                    onClick={() => {
                      handleClearPage(activePageIndex);
                      setShowMobileMore(false);
                    }}
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 flex flex-col items-center justify-center text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-rose-600 mb-1" />
                    Clear Page
                  </button>

                  <button
                    onClick={() => {
                      selectTool(isPanMode ? 'select' : 'pan');
                      setShowMobileMore(false);
                    }}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-colors ${
                      isPanMode ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <Hand className="w-5 h-5 mb-1" />
                    Pan Hand
                  </button>
                </div>

                {/* Color Palette */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Color:</span>
                  <div className="flex items-center space-x-2.5">
                    {PALETTE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-7 h-7 rounded-full transition-all ${
                          activeColor === color
                            ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-sm'
                            : 'opacity-80'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Global Image Picker Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFilePicked}
        accept="image/*"
        className="hidden"
      />

      {/* Signature Modal (Draw, Type, Upload, Saved signatures) */}
      <AddSignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onAddSignature={handleSignatureAdded}
      />

      {/* Add / Edit Text Modal */}
      <AddTextModal
        isOpen={isTextModalOpen}
        onClose={() => {
          setIsTextModalOpen(false);
          setEditTextInitial('');
        }}
        onConfirm={handleConfirmText}
        initialText={editTextInitial}
        initialColor={activeColor}
      />
    </div>
  );
};
