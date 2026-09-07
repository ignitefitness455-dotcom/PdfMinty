import { Type, X, Check } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface AddTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string, color: string, fontSize: number) => void;
  initialText?: string;
  initialColor?: string;
  initialFontSize?: number;
}

const COLOR_PRESETS = [
  { name: 'Black', value: '#111827' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Purple', value: '#7c3aed' },
];

const SIZE_PRESETS = [
  { label: 'Small', value: 16 },
  { label: 'Normal', value: 22 },
  { label: 'Large', value: 30 },
  { label: 'Header', value: 40 },
];

export const AddTextModal: React.FC<AddTextModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialText = '',
  initialColor = '#111827',
  initialFontSize = 22,
}) => {
  const [text, setText] = useState(initialText);
  const [color, setColor] = useState(initialColor);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setColor(initialColor);
      setFontSize(initialFontSize);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, initialText, initialColor, initialFontSize]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (text.trim()) {
      onConfirm(text.trim(), color, fontSize);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        id="pdf_add_text_modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Type className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {initialText ? 'Edit Text' : 'Add Text to Document'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="pdf-text-input-field" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Text Content
            </label>
            <input
              id="pdf-text-input-field"
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to place on PDF..."
              // 16px font size avoids mobile browser auto-zoom!
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Color Selection */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 mb-1.5">
              Text Color
            </span>
            <div className="flex items-center space-x-3">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110 shadow-sm'
                      : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 mb-1.5">
              Font Size
            </span>
            <div className="grid grid-cols-4 gap-2">
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFontSize(s.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                    fontSize === s.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Box */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-medium text-slate-400 mb-1">Preview</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[50px] flex items-center justify-center overflow-hidden">
              <span
                style={{
                  color,
                  fontSize: `${fontSize}px`,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                className="font-medium truncate max-w-full"
              >
                {text || 'Sample Text'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
            >
              {initialText ? 'Update Text' : 'Insert Text'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
