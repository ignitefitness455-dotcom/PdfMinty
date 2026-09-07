import { X, Eraser, Upload, Check, Trash2 } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AddSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSignature: (signatureDataUrl: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Black', value: '#111827' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
];

const SIGNATURE_FONTS = [
  { name: 'Dancing Script', fontFamily: "'Dancing Script', cursive" },
  { name: 'Caveat', fontFamily: "'Caveat', cursive" },
  { name: 'Great Vibes', fontFamily: "'Great Vibes', cursive" },
  { name: 'Classic Script', fontFamily: "Brush Script MT, cursive" },
];

export const AddSignatureModal: React.FC<AddSignatureModalProps> = ({
  isOpen,
  onClose,
  onAddSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'image' | 'type'>('draw');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [saveSignature, setSaveSignature] = useState(true);
  const [savedSignatures, setSavedSignatures] = useState<string[]>([]);

  // Draw state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type state
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].fontFamily);

  // Image state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved signatures from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pdfminty_saved_signatures');
      if (stored) {
        setSavedSignatures(JSON.parse(stored));
      }
    } catch {
      // ignore storage error
    }
  }, []);

  // Load Google Fonts for handwriting
  useEffect(() => {
    const fontId = 'google-fonts-signature-pack';
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Great+Vibes&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Canvas drawing setup
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = selectedColor;
  }, [selectedColor]);

  useEffect(() => {
    if (isOpen && activeTab === 'draw') {
      setTimeout(initCanvas, 50);
    }
  }, [isOpen, activeTab, initCanvas]);

  // Handle color change on draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = selectedColor;
    }
  }, [selectedColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
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
    setHasDrawn(false);
  };

  // Image Upload handler with white background removal
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to process transparency
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Auto remove near-white background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If close to white, make transparent
          if (r > 220 && g > 220 && b > 220) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setUploadedImageUrl(canvas.toDataURL('image/png'));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Generate Typed signature image from text
  const generateTypedSignature = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
    ctx.font = `64px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Signature', 300, 100);

    return canvas.toDataURL('image/png');
  };

  const handleDone = () => {
    let signatureUrl = '';

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      signatureUrl = canvas.toDataURL('image/png');
    } else if (activeTab === 'type') {
      if (!typedName.trim()) return;
      signatureUrl = generateTypedSignature();
    } else if (activeTab === 'image') {
      if (!uploadedImageUrl) return;
      signatureUrl = uploadedImageUrl;
    }

    if (!signatureUrl) return;

    // Save signature if checkbox checked
    if (saveSignature) {
      try {
        const updated = [signatureUrl, ...savedSignatures.filter(s => s !== signatureUrl)].slice(0, 5);
        setSavedSignatures(updated);
        localStorage.setItem('pdfminty_saved_signatures', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    onAddSignature(signatureUrl);
    onClose();
  };

  const handleSelectSaved = (url: string) => {
    onAddSignature(url);
    onClose();
  };

  const handleDeleteSaved = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = savedSignatures.filter((_, i) => i !== index);
    setSavedSignatures(updated);
    try {
      localStorage.setItem('pdfminty_saved_signatures', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const isDoneEnabled =
    (activeTab === 'draw' && hasDrawn) ||
    (activeTab === 'type' && typedName.trim().length > 0) ||
    (activeTab === 'image' && uploadedImageUrl !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#1a1d21] text-white rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-xl font-bold tracking-tight text-white">Add Signature</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Color Palette Row */}
        <div className="flex items-center justify-between px-6 border-b border-slate-800 pb-2">
          {/* Tabs */}
          <div className="flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('draw')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'draw'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Draw
              {activeTab === 'draw' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('image')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'image'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Image
              {activeTab === 'image' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('type')}
              className={`pb-2 transition-colors relative ${
                activeTab === 'type'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Type
              {activeTab === 'type' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Color Dots */}
          <div className="flex items-center space-x-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                className={`w-5 h-5 rounded-full transition-all ${
                  selectedColor === c.value
                    ? 'ring-2 ring-offset-2 ring-offset-[#1a1d21] ring-white scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Main White Drawing / Preview Area */}
          <div className="relative w-full h-56 bg-white rounded-xl border border-slate-300 shadow-inner flex flex-col items-center justify-center overflow-hidden">
            {activeTab === 'draw' && (
              <>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute pointer-events-none text-slate-400 text-sm font-medium tracking-wide">
                    Sign Here
                  </div>
                )}
                {hasDrawn && (
                  <button
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                    title="Clear Signature"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'type' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                {typedName.trim() ? (
                  <div
                    className="text-4xl md:text-5xl select-none text-center px-4"
                    style={{ fontFamily: selectedFont, color: selectedColor }}
                  >
                    {typedName}
                  </div>
                ) : (
                  <span className="text-slate-400 text-sm font-medium">
                    Type your signature below
                  </span>
                )}
              </div>
            )}

            {activeTab === 'image' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                {uploadedImageUrl ? (
                  <div className="relative max-h-full flex items-center justify-center">
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded Signature"
                      className="max-h-44 object-contain"
                    />
                    <button
                      onClick={() => setUploadedImageUrl(null)}
                      className="absolute top-0 right-0 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <span className="text-sm font-semibold">Click to upload signature</span>
                    <span className="text-xs text-slate-400 mt-1">PNG or JPG (auto-removes white background)</span>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            )}
          </div>

          {/* Sub-controls based on tab */}
          {activeTab === 'type' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type your name (e.g. Tanveer)..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />

              {/* Font picker */}
              <div className="grid grid-cols-2 gap-2">
                {SIGNATURE_FONTS.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setSelectedFont(f.fontFamily)}
                    className={`p-2 rounded-lg border text-left text-sm transition-all flex items-center justify-between ${
                      selectedFont === f.fontFamily
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span style={{ fontFamily: f.fontFamily }} className="text-lg">
                      {typedName.trim() || f.name}
                    </span>
                    {selectedFont === f.fontFamily && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Signatures List (if any) */}
          {savedSignatures.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Saved Signatures:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {savedSignatures.map((sig, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSaved(sig)}
                    className="group relative shrink-0 w-24 h-12 bg-white rounded-lg border border-slate-700 p-1 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all flex items-center justify-center"
                    title="Click to insert this saved signature"
                  >
                    <img src={sig} alt="Saved signature" className="max-h-full max-w-full object-contain" />
                    <button
                      onClick={(e) => handleDeleteSaved(e, idx)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer with Save Checkbox and Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                checked={saveSignature}
                onChange={(e) => setSaveSignature(e.target.checked)}
                className="rounded-sm border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Save Signature</span>
            </label>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDone}
                disabled={!isDoneEnabled}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
                  isDoneEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
