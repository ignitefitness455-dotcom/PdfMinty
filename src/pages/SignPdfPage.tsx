import { ArrowLeft, Edit2, Trash2, Download, AlertCircle, FilePenLine, RefreshCw, Type, Image as ImageIcon, Check } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';
import { getPdfJs } from '../core/index';
import { downloadBlob } from '../utils/download';
import { logger } from '../utils/logger';

interface SignatureOverlay {
  id: string;
  pageIndex: number;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  width: number; // percentage of page width
  height: number; // percentage of page height
  dataUrl: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const SignPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // PDF render states
  const [numPages, setNumPages] = useState<number>(0);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [renderingPreviews, setRenderingPreviews] = useState(false);

  // Signature creation modal states
  const [showSignModal, setShowSignModal] = useState(false);
  const [signMethod, setSignMethod] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [typedFont, setTypedFont] = useState<'font-serif' | 'font-mono' | 'font-cursive'>('font-cursive');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Active signature overlays
  const [overlays, setOverlays] = useState<SignatureOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [savedSignatures, setSavedSignatures] = useState<string[]>([]);

  // Canvas ref for drawing signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#020617');
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Target page container refs to calculate exact client coordinates
  const pageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      pagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [downloadUrl, pagePreviews]);

  // Load PDF document and render previews for editing
  useEffect(() => {
    const loadPdfDoc = async () => {
      if (!selectedFile) {
        setNumPages(0);
        setPagePreviews([]);
        setOverlays([]);
        return;
      }

      setRenderingPreviews(true);
      setError(null);

      try {
        const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
        const pdfjs = await getPdfJs();
        const doc = await pdfjs.getDocument({ data: fileBytes.slice() }).promise;
        setNumPages(doc.numPages);

        const urls: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport }).promise;
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                urls.push(url);
                if (urls.length === doc.numPages) {
                  setPagePreviews([...urls]);
                }
              }
            }, 'image/png');
          }
        }
      } catch (err) {
        logger.error('Failed to load PDF preview in Signature tool:', err);
        setError('Failed to load the PDF preview. The file might be corrupted or password-protected.');
      } finally {
        setRenderingPreviews(false);
      }
    };

    loadPdfDoc();
  }, [selectedFile]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
      setIsSuccess(false);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const handleInsertDateStamp = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const stampText = `SIGNED: ${dateStr}`;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 300;
    tempCanvas.height = 70;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw neat border and text
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, tempCanvas.width - 10, tempCanvas.height - 10);

      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 20px monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(stampText, tempCanvas.width / 2, tempCanvas.height / 2);

      const stampDataUrl = tempCanvas.toDataURL('image/png');
      setSavedSignatures((prev) => [...prev, stampDataUrl]);
      addSignatureToPage(stampDataUrl, 0);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      // Prevent scrolling on mobile while drawing
      if (e.cancelable) e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Upload image handler for signatures
  const handleSignImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save signature to library and add to page
  const handleSaveSignature = () => {
    let finalDataUrl = '';

    if (signMethod === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Check if canvas is empty before saving
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        setError('Please draw a signature first.');
        return;
      }
      finalDataUrl = canvas.toDataURL('image/png');
    } else if (signMethod === 'type') {
      if (!typedName.trim()) {
        setError('Please type your name.');
        return;
      }

      // Render typed name to a canvas to extract as PNG dataUrl
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 400;
      tempCanvas.height = 120;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.fillStyle = '#0f172a'; // slate-900

        if (typedFont === 'font-cursive') {
          ctx.font = 'italic 46px "Playball", "Dancing Script", cursive, sans-serif';
        } else if (typedFont === 'font-serif') {
          ctx.font = 'italic font-semibold 38px Georgia, serif';
        } else {
          ctx.font = 'bold 32px monospace';
        }

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(typedName, tempCanvas.width / 2, tempCanvas.height / 2);
        finalDataUrl = tempCanvas.toDataURL('image/png');
      }
    } else if (signMethod === 'upload') {
      if (!uploadedImage) {
        setError('Please upload a signature image.');
        return;
      }
      finalDataUrl = uploadedImage;
    }

    if (finalDataUrl) {
      setSavedSignatures((prev) => [...prev, finalDataUrl]);
      // Instantly place on first page in center
      addSignatureToPage(finalDataUrl, 0);
      setShowSignModal(false);
      // Reset inputs
      setTypedName('');
      setUploadedImage(null);
    }
  };

  const addSignatureToPage = (dataUrl: string, pageIndex: number) => {
    const newOverlay: SignatureOverlay = {
      id: generateId(),
      pageIndex,
      x: 35, // center horizontally roughly
      y: 40, // center vertically roughly
      width: 30, // 30% of page width
      height: 12, // 12% of page height
      dataUrl,
    };
    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  };

  const removeOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  // Dragging and resizing helpers
  const handleOverlayPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    overlayId: string,
    action: 'drag' | 'resize'
  ) => {
    e.preventDefault();
    setSelectedOverlayId(overlayId);

    const overlay = overlays.find((o) => o.id === overlayId);
    if (!overlay) return;

    const pageDiv = pageContainerRefs.current[overlay.pageIndex];
    if (!pageDiv) return;

    const rect = pageDiv.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = (overlay.x / 100) * rect.width;
    const startTop = (overlay.y / 100) * rect.height;
    const startW = (overlay.width / 100) * rect.width;
    const startH = (overlay.height / 100) * rect.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (action === 'drag') {
        const newLeft = Math.max(0, Math.min(rect.width - startW, startLeft + deltaX));
        const newTop = Math.max(0, Math.min(rect.height - startH, startTop + deltaY));
        setOverlays((prev) =>
          prev.map((o) =>
            o.id === overlayId
              ? {
                  ...o,
                  x: (newLeft / rect.width) * 100,
                  y: (newTop / rect.height) * 100,
                }
              : o
          )
        );
      } else if (action === 'resize') {
        const newW = Math.max(40, Math.min(rect.width - startLeft, startW + deltaX));
        const newH = Math.max(20, Math.min(rect.height - startTop, startH + deltaY));
        setOverlays((prev) =>
          prev.map((o) =>
            o.id === overlayId
              ? {
                  ...o,
                  width: (newW / rect.width) * 100,
                  height: (newH / rect.height) * 100,
                }
              : o
          )
        );
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleApplySignature = async () => {
    if (!selectedFile) return;
    if (overlays.length === 0) {
      setError('Please add at least one signature to the document before applying.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer());
      const pdfDocInstance = await PDFDocument.load(fileBytes);
      const pages = pdfDocInstance.getPages();

      for (const overlay of overlays) {
        if (overlay.pageIndex >= pages.length) continue;

        const targetPage = pages[overlay.pageIndex];
        const { width: pageW, height: pageH } = targetPage.getSize();

        // Convert signature image to embeddable png
        const imageRes = await fetch(overlay.dataUrl);
        const imageBytes = new Uint8Array(await imageRes.arrayBuffer());
        const signatureImg = await pdfDocInstance.embedPng(imageBytes);

        // Convert percentage coordinates to PDF space (y-origin is at the bottom)
        const realX = (overlay.x / 100) * pageW;
        const realW = (overlay.width / 100) * pageW;
        const realH = (overlay.height / 100) * pageH;
        const realY = pageH - ((overlay.y / 100) * pageH) - realH;

        targetPage.drawImage(signatureImg, {
          x: realX,
          y: realY,
          width: realW,
          height: realH,
        });
      }

      const signedBytes = await pdfDocInstance.save();
      const blob = new Blob([signedBytes], { type: 'application/pdf' });
      const name = `pdfminty_signed_${selectedFile.name}`;
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      await downloadBlob(blob, name);
      setIsSuccess(true);
    } catch (err: unknown) {
      logger.error('Failed to burn signatures into PDF:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'An unexpected error occurred while placing signatures.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="sign_pdf_page_container">
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
            Sign PDF Document
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Limit: {TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}MB
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Place secure e-signatures on your documents 100% locally inside your browser. No server uploads.
        </p>
      </div>

      {!selectedFile ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <FileUploader
            onFilesSelected={handleFilesSelected}
            accept=".pdf,application/pdf"
            title="Select a PDF to sign"
            subtitle={`Drag a PDF file here or browse (Max limit: ${TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}MB)`}
            maxSizeMB={TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Document Preview and Interactive Sign Canvas */}
          <div className="lg:col-span-3 space-y-4">
            {renderingPreviews ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-600">Rendering document previews...</p>
              </div>
            ) : (
              <div className="space-y-6 overflow-y-auto max-h-[75vh] p-4 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-inner">
                {pagePreviews.map((preview, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200/60 max-w-2xl w-full">
                      <div className="flex justify-between items-center px-2 pb-2 border-b border-slate-100 mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500">Page {idx + 1} of {numPages}</span>
                        <button
                          onClick={() => {
                            if (savedSignatures.length > 0) {
                              addSignatureToPage(savedSignatures[savedSignatures.length - 1], idx);
                            } else {
                              setShowSignModal(true);
                              setSignMethod('draw');
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded transition-colors"
                        >
                          + Place Signature Here
                        </button>
                      </div>

                      {/* Interactive Target Page Container */}
                      <div
                        ref={(el) => {
                          pageContainerRefs.current[idx] = el;
                        }}
                        className="relative w-full overflow-hidden select-none"
                        style={{ aspectRatio: 'auto' }}
                      >
                        <img src={preview} alt={`Page ${idx + 1}`} className="w-full h-auto pointer-events-none" />

                        {/* Placed signature overlays for this page */}
                        {overlays
                          .filter((o) => o.pageIndex === idx)
                          .map((overlay) => (
                            <div
                              key={overlay.id}
                              style={{
                                left: `${overlay.x}%`,
                                top: `${overlay.y}%`,
                                width: `${overlay.width}%`,
                                height: `${overlay.height}%`,
                              }}
                              className={`absolute border-2 ${
                                selectedOverlayId === overlay.id ? 'border-dashed border-emerald-500' : 'border-transparent hover:border-slate-400'
                              } bg-transparent flex items-center justify-center cursor-move group`}
                              onPointerDown={(e) => {
                                if ((e.target as HTMLElement).closest('.action-btn')) return;
                                handleOverlayPointerDown(e, overlay.id, 'drag');
                              }}
                            >
                              <img src={overlay.dataUrl} alt="Signature overlay" className="w-full h-full object-contain pointer-events-none" />

                              {/* Controls (shown on hover or select) */}
                              <div className="absolute -top-7 right-0 hidden group-hover:flex items-center gap-1 bg-slate-900 text-white p-1 rounded shadow-md z-10">
                                <button
                                  onClick={() => removeOverlay(overlay.id)}
                                  className="action-btn p-0.5 hover:text-rose-400 transition-colors"
                                  title="Delete signature"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Resize handle */}
                              <div
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  handleOverlayPointerDown(e, overlay.id, 'resize');
                                }}
                                className="action-btn absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full cursor-se-resize shadow border border-white"
                                title="Resize signature"
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action sidebar */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FilePenLine className="w-4 h-4 text-emerald-600" />
                <span>Signatures Tool</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowSignModal(true);
                    setSignMethod('draw');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Create Signature</span>
                </button>

                <button
                  onClick={handleInsertDateStamp}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Insert automatic date stamp with today's date"
                >
                  <span>📅 Add Date Stamp</span>
                </button>
              </div>

              {savedSignatures.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500">Signature Library</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                    {savedSignatures.map((sig, i) => (
                      <button
                        key={i}
                        onClick={() => addSignatureToPage(sig, 0)}
                        className="bg-white p-2 border border-slate-200 hover:border-emerald-500 rounded-lg flex items-center justify-center transition-colors shadow-xs h-16 group relative"
                        title="Click to add signature to page 1"
                      >
                        <img src={sig} alt={`Saved Signature ${i}`} className="max-h-full max-w-full object-contain" />
                        <span className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1 rounded">
                          Add
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={handleApplySignature}
                  disabled={loading || overlays.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Apply & Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPagePreviews([]);
                    setOverlays([]);
                    setIsSuccess(false);
                    setError(null);
                  }}
                  className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Clear File
                </button>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-medium">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Your PDF has been successfully signed and downloaded!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Signature Creation Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Create Electronic Signature</h3>
              <button
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-extrabold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Modal NavigationTabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSignMethod('draw')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  signMethod === 'draw' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Draw Signature</span>
              </button>
              <button
                onClick={() => setSignMethod('type')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  signMethod === 'type' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Type Name</span>
              </button>
              <button
                onClick={() => setSignMethod('upload')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                  signMethod === 'upload' ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Image</span>
              </button>
            </div>

            {/* Modal Content body */}
            <div className="p-6">
              {signMethod === 'draw' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ink:</span>
                      {[
                        { hex: '#020617', name: 'Black' },
                        { hex: '#1e3a8a', name: 'Navy' },
                        { hex: '#14532d', name: 'Forest' },
                        { hex: '#881337', name: 'Burgundy' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setStrokeColor(c.hex)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            strokeColor === c.hex ? 'border-emerald-600 scale-110 shadow-sm' : 'border-slate-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Width:</span>
                      {[
                        { w: 2, label: 'Fine' },
                        { w: 3, label: 'Medium' },
                        { w: 5, label: 'Bold' },
                      ].map((sw) => (
                        <button
                          key={sw.w}
                          type="button"
                          onClick={() => setStrokeWidth(sw.w)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            strokeWidth === sw.w ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {sw.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden relative">
                    <canvas
                      ref={canvasRef}
                      width={450}
                      height={180}
                      className="w-full h-[180px] bg-white cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <button
                      onClick={clearCanvas}
                      className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-500 hover:text-rose-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 shadow-xs"
                    >
                      Clear Pad
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Use your mouse, trackpad, or touchscreen to draw a signature.</p>
                </div>
              )}

              {signMethod === 'type' && (
                <div className="space-y-4">
                  <div>
                    <div className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Enter Your Name</div>
                    <input
                      type="text"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <div className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Choose Handwriting Font Style</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setTypedFont('font-cursive')}
                        className={`py-2 px-3 border rounded-xl text-xs font-medium transition-all ${
                          typedFont === 'font-cursive' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="italic font-serif">Playball Cursive</span>
                      </button>
                      <button
                        onClick={() => setTypedFont('font-serif')}
                        className={`py-2 px-3 border rounded-xl text-xs font-medium transition-all ${
                          typedFont === 'font-serif' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="italic font-serif">Georgia Italic</span>
                      </button>
                      <button
                        onClick={() => setTypedFont('font-mono')}
                        className={`py-2 px-3 border rounded-xl text-xs font-medium transition-all ${
                          typedFont === 'font-mono' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-mono">Monospace bold</span>
                      </button>
                    </div>
                  </div>

                  {typedName.trim() && (
                    <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center font-bold text-2xl h-16 flex items-center justify-center">
                      <span className={
                        typedFont === 'font-cursive' ? 'font-serif italic font-semibold tracking-wider text-slate-800' :
                        typedFont === 'font-serif' ? 'italic font-serif font-bold text-slate-800' : 'font-mono text-slate-800'
                      }>
                        {typedName}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {signMethod === 'upload' && (
                <div className="space-y-4 text-center">
                  {!uploadedImage ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors flex flex-col items-center justify-center relative">
                      <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-600">Select signature image</p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or WebP with a transparent or white background</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 h-[180px] flex items-center justify-center relative">
                        <img src={uploadedImage} alt="Uploaded signature preview" className="max-h-full max-w-full object-contain" />
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-2 right-2 text-[10px] font-bold text-rose-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSignature}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Create Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignPdfPage;
