import {
  X,
  PenTool,
  Type,
  Upload,
  Eraser,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import {
  trimCanvas,
  removeBackgroundFromImage,
  createTypedSignature,
} from './signature-image';

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
  title?: string;
  initialType?: 'signature' | 'initials';
}

const SIGNATURE_FONTS = [
  { name: 'Dancing Script', label: 'Casual Flow' },
  { name: 'Caveat', label: 'Handwritten' },
  { name: 'Great Vibes', label: 'Formal Script' },
  { name: 'Pacifico', label: 'Brush Script' },
  { name: 'Sacramento', label: 'Monoline Script' },
];

const SIGNATURE_COLORS = [
  { label: 'Black', hex: '#111827' },
  { label: 'Navy Blue', hex: '#1e3a8a' },
  { label: 'Classic Blue', hex: '#2563eb' },
  { label: 'Crimson', hex: '#dc2626' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 3 },
  { label: 'Bold', value: 4.5 },
];

export const SignatureDialog: React.FC<SignatureDialogProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  title = 'Create Your Signature',
  initialType = 'signature',
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [selectedColor, setSelectedColor] = useState(SIGNATURE_COLORS[0].hex);
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(STROKE_WIDTHS[1].value);

  // Type tab state
  const [typedName, setTypedName] = useState(initialType === 'initials' ? 'JD' : 'John Doe');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].name);

  // Upload tab state
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draw tab canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Clear Canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    lastPointRef.current = null;
  };

  // Set up canvas with high DPI for super sharp signature
  useEffect(() => {
    if (!isOpen || activeTab !== 'draw') return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 2;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      setHasDrawn(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, activeTab]);

  // Drawing event handlers
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const coords = getCoordinates(e);
    lastPointRef.current = coords;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedStrokeWidth;
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, selectedStrokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = selectedColor;
    ctx.fill();
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !lastPointRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = getCoordinates(e);

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = selectedStrokeWidth;
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Upload handler with automatic background removal
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsProcessingUpload(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      try {
        const transparentUrl = await removeBackgroundFromImage(dataUrl, 215);
        setUploadedPreview(transparentUrl);
      } catch {
        setUploadedPreview(dataUrl);
      } finally {
        setIsProcessingUpload(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm and Adopt Signature
  const handleAdopt = () => {
    let signatureUrl = '';

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      signatureUrl = trimCanvas(canvas);
    } else if (activeTab === 'type') {
      if (!typedName.trim()) return;
      signatureUrl = createTypedSignature(typedName, selectedFont, selectedColor);
    } else if (activeTab === 'upload') {
      if (!uploadedPreview) return;
      signatureUrl = uploadedPreview;
    }

    if (signatureUrl) {
      try {
        localStorage.setItem(
          initialType === 'initials' ? 'pdfminty_saved_initials' : 'pdfminty_saved_signature',
          signatureUrl
        );
      } catch {
        // Local storage might be blocked or full
      }

      onSaveSignature(signatureUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">{title}</h2>
              <p className="text-xs text-slate-500">
                Choose how you would like to create your {initialType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'draw'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>

          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'type'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB: DRAW */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              {/* Canvas Pad */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-slate-400 transition-colors overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-48 sm:h-56 cursor-crosshair touch-none"
                />

                {/* Signing baseline */}
                <div className="absolute bottom-9 inset-x-8 border-b border-slate-300/80 pointer-events-none flex items-center justify-end">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono select-none pr-1">
                    Sign on line
                  </span>
                </div>

                {/* Clear button inside pad */}
                <button
                  onClick={handleClearCanvas}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-medium shadow-xs flex items-center space-x-1 transition-all"
                  title="Clear drawing"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Controls bar (Color & Stroke Width) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Color Palette */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-600">Ink Color:</span>
                  <div className="flex items-center space-x-1.5">
                    {SIGNATURE_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                          selectedColor === c.hex
                            ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110'
                            : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      >
                        {selectedColor === c.hex && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold text-slate-600">Thickness:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                    {STROKE_WIDTHS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSelectedStrokeWidth(s.value)}
                        className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                          selectedStrokeWidth === s.value
                            ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TYPE */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="signature-typed-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Type your name or initials
                </label>
                <input
                  id="signature-typed-name"
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter full name..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all"
                />
              </div>

              {/* Color Selection for Typed Signature */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Color:</span>
                <div className="flex items-center space-x-2">
                  {SIGNATURE_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c.hex)}
                      className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                        selectedColor === c.hex
                          ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {selectedColor === c.hex && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Style Selection Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600">Select Signature Style:</span>
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                  {SIGNATURE_FONTS.map((font) => (
                    <div
                      key={font.name}
                      onClick={() => setSelectedFont(font.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedFont === font.name
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div
                          className="text-2xl truncate leading-normal"
                          style={{
                            fontFamily: `'${font.name}', cursive, sans-serif`,
                            color: selectedColor,
                          }}
                        >
                          {typedName || 'Your Name'}
                        </div>
                        <span className="text-[11px] text-slate-400">{font.label}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedFont === font.name
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedFont === font.name && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              {!uploadedPreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Drop signature image here, or browse
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PNG, JPG, or WEBP. White background will be automatically converted to transparent.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center relative min-h-[160px]">
                    {isProcessingUpload ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Sparkles className="w-6 h-6 text-emerald-600 animate-spin" />
                        <span className="text-xs text-slate-600 font-medium">
                          Removing background...
                        </span>
                      </div>
                    ) : (
                      <img
                        src={uploadedPreview}
                        alt="Signature Preview"
                        className="max-h-36 max-w-full object-contain"
                      />
                    )}

                    <button
                      onClick={() => setUploadedPreview(null)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors"
                      title="Remove image"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Choose Different Image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-white rounded-xl text-xs font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleAdopt}
            disabled={
              (activeTab === 'draw' && !hasDrawn) ||
              (activeTab === 'type' && !typedName.trim()) ||
              (activeTab === 'upload' && !uploadedPreview) ||
              isProcessingUpload
            }
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Adopt & Use</span>
          </button>
        </div>
      </div>
    </div>
  );
};
