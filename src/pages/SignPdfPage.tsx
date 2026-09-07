import { fabric } from 'fabric';
import { ArrowLeft, Trash2, Download, AlertCircle, RefreshCw, PenTool, Type, Image as ImageIcon, Square, Circle, MousePointer2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
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

const COLORS = ['#000000', '#2563eb', '#dc2626', '#16a34a'];

const PageCanvas = React.memo(({
  page,
  isActive,
  onActive,
  registerCanvas,
  unregisterCanvas,
}: {
  page: PageData;
  isActive: boolean;
  onActive: (idx: number) => void;
  registerCanvas: (idx: number, canvas: fabric.Canvas) => void;
  unregisterCanvas: (idx: number) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize Fabric Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: page.width,
      height: page.height,
      selection: true,
      preserveObjectStacking: true,
    });
    
    // Premium object styling
    fabric.Object.prototype.set({
      transparentCorners: false,
      cornerColor: '#10b981',
      cornerStrokeColor: '#047857',
      borderColor: '#10b981',
      cornerSize: 10,
      padding: 5,
    });

    // Set background image
    fabric.Image.fromURL(page.dataUrl, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });

    // Handle activation
    canvas.on('mouse:down', () => onActive(page.index));

    registerCanvas(page.index, canvas);

    return () => {
      unregisterCanvas(page.index);
      canvas.dispose();
    };
  }, [page, registerCanvas, unregisterCanvas, onActive]);

  return (
    <div 
      className={`relative shadow-xl transition-all duration-200 bg-white ${isActive ? 'ring-4 ring-emerald-500' : 'ring-1 ring-slate-300'}`}
      style={{ width: page.width, height: page.height }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
});
PageCanvas.displayName = 'PageCanvas';

export const SignPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Editor States
  const [pages, setPages] = useState<PageData[]>([]);
  const [renderingPreviews, setRenderingPreviews] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  
  // Toolbar States
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeColor, setActiveColor] = useState(COLORS[0]);

  const canvasMap = useRef<Record<number, fabric.Canvas>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const registerCanvas = useCallback((idx: number, canvas: fabric.Canvas) => {
    canvasMap.current[idx] = canvas;
    // Apply current tools state to new canvas
    canvas.isDrawingMode = isDrawingMode;
    if (isDrawingMode) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = 4;
    }
  }, [isDrawingMode, activeColor]);

  const unregisterCanvas = useCallback((idx: number) => {
    delete canvasMap.current[idx];
  }, []);

  const handleFilesSelected = (files: FileList | File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setIsSuccess(false);
      setPages([]);
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
        // Scale 1.2 provides a good balance between crispness and fitting on desktop screens
        const scale = 1.2;

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
        logger.error('Failed to load PDF preview in Premium Editor:', err);
        setError('Failed to render PDF. It might be corrupted or password protected.');
      } finally {
        setRenderingPreviews(false);
      }
    };

    loadPdfDoc();
  }, [selectedFile]);

  // Toolbar Actions
  const toggleDrawingMode = () => {
    const newMode = !isDrawingMode;
    setIsDrawingMode(newMode);
    Object.values(canvasMap.current).forEach(canvas => {
      if (canvas) {
        canvas.isDrawingMode = newMode;
        if (newMode) {
          canvas.freeDrawingBrush.color = activeColor;
          canvas.freeDrawingBrush.width = 4;
        }
      }
    });
  };

  const handleColorChange = (color: string) => {
    setActiveColor(color);
    Object.values(canvasMap.current).forEach(canvas => {
      if (canvas) {
        if (canvas.isDrawingMode) {
          canvas.freeDrawingBrush.color = color;
        }
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          if (activeObj.type === 'i-text') activeObj.set('fill', color);
          else if (activeObj.type === 'path') activeObj.set('stroke', color);
          else if (activeObj.type === 'rect' || activeObj.type === 'circle') activeObj.set('stroke', color);
          canvas.renderAll();
        }
      }
    });
  };

  const addText = () => {
    const canvas = canvasMap.current[activePageIndex] || canvasMap.current[0];
    if (!canvas) return;
    const text = new fabric.IText('Type here...', {
      left: canvas.width! / 2 - 80,
      top: canvas.height! / 2,
      fontFamily: 'sans-serif',
      fontSize: 24,
      fill: activeColor,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addRect = () => {
    const canvas = canvasMap.current[activePageIndex] || canvasMap.current[0];
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: canvas.width! / 2 - 50,
      top: canvas.height! / 2 - 50,
      width: 100,
      height: 100,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 4,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const addCircle = () => {
    const canvas = canvasMap.current[activePageIndex] || canvasMap.current[0];
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: canvas.width! / 2 - 50,
      top: canvas.height! / 2 - 50,
      radius: 50,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 4,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      fabric.Image.fromURL(data, (img) => {
        const canvas = canvasMap.current[activePageIndex] || canvasMap.current[0];
        if (!canvas) return;
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteSelected = useCallback(() => {
    Object.values(canvasMap.current).forEach(canvas => {
      if (canvas) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          canvas.discardActiveObject();
          activeObjects.forEach(obj => canvas.remove(obj));
        }
      }
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeCanvas = canvasMap.current[activePageIndex];
        if (activeCanvas) {
          const activeObj = activeCanvas.getActiveObject();
          if (activeObj && activeObj.type === 'i-text' && (activeObj as fabric.IText).isEditing) {
            return; // Don't delete if editing text
          }
        }
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePageIndex, deleteSelected]);

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

        // Skip pages with no edits to save processing time
        if (canvas.getObjects().length === 0) continue;

        // Hide background temporarily to capture only the edits
        const bg = canvas.backgroundImage;
        canvas.backgroundImage = undefined; // Fabric expects undefined or fabric.Image, sometimes null works but undefined is safer
        if (bg) canvas.backgroundColor = 'transparent';
        
        // Export to high-res PNG for crisp text and drawings
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
        
        // Restore background
        if (bg) canvas.setBackgroundImage(bg, () => {});

        const img = await pdfDoc.embedPng(dataUrl);
        const page = pdfPages[i];
        const { width, height } = page.getSize();
        
        // Overlay the PNG perfectly over the original PDF page
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
      setError('Failed to save the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto py-4 px-4 sm:px-6 lg:px-8 space-y-6" id="sign_pdf_page_container">
      <SEO slug="sign-pdf" />

      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Premium PDF Editor & E-Signature
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            100% Client-Side
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Edit, sign, annotate, and flatten your documents locally in your browser. Zero server uploads.
        </p>
      </div>

      {!selectedFile ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <FileUploader
            onFilesSelected={handleFilesSelected}
            accept=".pdf,application/pdf"
            title="Select a PDF to edit and sign"
            subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}MB)`}
            maxSizeMB={TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}
          />
        </div>
      ) : (
        <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-lg h-[75vh]">
          {/* Toolbar */}
          <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => { 
                  setIsDrawingMode(false); 
                  Object.values(canvasMap.current).forEach(canvas => {
                    if (canvas) canvas.isDrawingMode = false;
                  });
                }}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${!isDrawingMode ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-500'}`} 
                title="Select Mode"
              >
                <MousePointer2 className="w-5 h-5" /> <span className="text-sm font-medium hidden md:inline">Select</span>
              </button>
              
              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              <button 
                onClick={toggleDrawingMode} 
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${isDrawingMode ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'}`} 
                title="Draw / Sign"
              >
                <PenTool className="w-5 h-5" /> <span className="text-sm font-medium hidden md:inline">Draw</span>
              </button>
              
              <button onClick={addText} className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1" title="Add Text">
                <Type className="w-5 h-5" /> <span className="text-sm font-medium hidden md:inline">Text</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              <button onClick={addRect} className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors" title="Add Rectangle">
                <Square className="w-5 h-5" />
              </button>
              <button onClick={addCircle} className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors" title="Add Circle">
                <Circle className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1" title="Add Image / Stamp">
                <ImageIcon className="w-5 h-5" /> <span className="text-sm font-medium hidden xl:inline">Image Stamp</span>
              </button>

              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              {/* Color Picker */}
              <div className="flex items-center gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${activeColor === color ? 'scale-110 border-slate-400' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                    title={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={deleteSelected} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete Selected Object (Del)">
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleExport} 
                disabled={loading || renderingPreviews}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Save & Export
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          {isSuccess && (
            <div className="p-3 bg-emerald-50 border-b border-emerald-100 text-emerald-700 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Export successful! Your flattened document is ready.
            </div>
          )}

          {/* Canvas Workspace */}
          <div className="flex-1 overflow-auto p-4 lg:p-8 flex flex-col items-center gap-8 bg-slate-200/50">
            {renderingPreviews ? (
              <div className="flex flex-col items-center justify-center h-full">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-600">Initializing Premium Editor...</p>
              </div>
            ) : (
              pages.map((page) => (
                <PageCanvas
                  key={page.index}
                  page={page}
                  isActive={activePageIndex === page.index}
                  onActive={setActivePageIndex}
                  registerCanvas={registerCanvas}
                  unregisterCanvas={unregisterCanvas}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
