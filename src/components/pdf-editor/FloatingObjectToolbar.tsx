import { fabric } from 'fabric';
import {
  Trash2,
  Copy,
  Plus,
  Minus,
  Bold,
  Edit3,
  Palette,
  RotateCw,
  RotateCcw,
  AlignCenter,
  Move,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface FloatingObjectToolbarProps {
  selectedObject: fabric.Object | null;
  onDelete: () => void;
  onDuplicate: () => void;
  onChangeColor: (color: string) => void;
  onChangeFontSize: (delta: number) => void;
  onChangeFontFamily: (font: string) => void;
  onToggleBold: () => void;
  onEditContent: () => void;
  onScale: (scaleMultiplier: number) => void;
  onRotate?: (degreesDelta: number) => void;
  onResetRotation?: () => void;
  onCenter?: () => void;
}

const PRESET_COLORS = [
  { name: 'Black', hex: '#111827' },
  { name: 'Classic Blue', hex: '#2563eb' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Emerald', hex: '#16a34a' },
  { name: 'Purple', hex: '#7c3aed' },
];

const FONT_OPTIONS = [
  { label: 'Modern Sans', value: 'Inter, system-ui, sans-serif' },
  { label: 'Handwriting', value: "'Dancing Script', cursive, sans-serif" },
  { label: 'Classic Serif', value: 'Georgia, serif' },
  { label: 'Monospace', value: 'Courier New, monospace' },
];

export const FloatingObjectToolbar: React.FC<FloatingObjectToolbarProps> = ({
  selectedObject,
  onDelete,
  onDuplicate,
  onChangeColor,
  onChangeFontSize,
  onChangeFontFamily,
  onToggleBold,
  onEditContent,
  onScale,
  onRotate,
  onResetRotation,
  onCenter,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [objectType, setObjectType] = useState<string>('');
  const [currentFontSize, setCurrentFontSize] = useState<number>(22);
  const [currentColor, setCurrentColor] = useState<string>('#111827');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [currentFont, setCurrentFont] = useState<string>('Inter, system-ui, sans-serif');
  const [currentAngle, setCurrentAngle] = useState<number>(0);

  useEffect(() => {
    if (!selectedObject) {
      setObjectType('');
      setShowColorPicker(false);
      setCurrentAngle(0);
      return;
    }

    const type = selectedObject.type || '';
    setObjectType(type);

    const rawAngle = Math.round(selectedObject.angle || 0);
    const normalized = ((rawAngle % 360) + 360) % 360;
    setCurrentAngle(normalized);

    if (type === 'i-text') {
      const itext = selectedObject as fabric.IText;
      setCurrentFontSize(Math.round(itext.fontSize || 22));
      setCurrentColor((itext.fill as string) || '#111827');
      setIsBold(itext.fontWeight === 'bold' || itext.fontWeight === '700');
      setCurrentFont(itext.fontFamily || 'Inter, system-ui, sans-serif');
    } else if (type === 'rect' || type === 'circle' || type === 'path') {
      setCurrentColor((selectedObject.stroke as string) || (selectedObject.fill as string) || '#111827');
    }
  }, [selectedObject]);

  if (!selectedObject) return null;

  const isText = objectType === 'i-text';
  const isImage = objectType === 'image';
  const isShape = objectType === 'rect' || objectType === 'circle' || objectType === 'path';

  return (
    <div
      className="absolute top-3 inset-x-2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between sm:justify-center space-x-1 sm:space-x-2 text-xs select-none max-w-[96vw] overflow-x-auto animate-in fade-in zoom-in-95 duration-100"
      id="floating_object_context_toolbar"
    >
      {/* Type & Drag indicator badge */}
      <div
        className="flex items-center space-x-1 text-emerald-400 font-semibold px-2 py-1 bg-emerald-950/60 rounded-lg text-[11px] tracking-wide border border-emerald-800/40 shrink-0 cursor-move"
        title="Reposition: Click & drag on the PDF, or drag corners to resize, top handle to rotate"
      >
        <Move className="w-3.5 h-3.5 text-emerald-400" />
        <span>{isText ? 'Text' : isImage ? 'Signature' : 'Shape'}</span>
      </div>

      <div className="w-px h-5 bg-slate-700 mx-0.5 shrink-0" />

      {/* Rotation Controls: Rotate 90 deg clockwise & Angle Indicator / Reset */}
      <div className="flex items-center space-x-1 shrink-0 bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
        <button
          onClick={() => onRotate?.(-15)}
          className="p-1 hover:text-emerald-400 text-slate-300 transition-colors"
          title="Rotate -15° Counter-Clockwise"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onResetRotation?.()}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all flex items-center space-x-0.5 ${
            currentAngle !== 0
              ? 'bg-emerald-600/40 text-emerald-300 hover:bg-emerald-600/60 ring-1 ring-emerald-500/50'
              : 'text-slate-400 hover:text-white'
          }`}
          title={currentAngle !== 0 ? `Current angle: ${currentAngle}°. Click to reset to 0° (horizontal)` : 'Angle: 0°'}
        >
          <span>{currentAngle}°</span>
        </button>

        <button
          onClick={() => onRotate?.(15)}
          className="p-1 hover:text-emerald-400 text-slate-300 transition-colors"
          title="Rotate +15° Clockwise"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

        <button
          onClick={() => onRotate?.(90)}
          className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50 rounded transition-colors"
          title="Turn 90° Clockwise"
        >
          +90°
        </button>
      </div>

      {/* Center on page alignment */}
      {onCenter && (
        <button
          onClick={onCenter}
          className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors shrink-0"
          title="Center on Page (Horizontally & Vertically)"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="w-px h-5 bg-slate-700 mx-0.5 shrink-0" />

      {/* Text specific controls */}
      {isText && (
        <>
          {/* Edit content button */}
          <button
            onClick={onEditContent}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Edit Text Content"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium hidden xs:inline">Edit</span>
          </button>

          {/* Font Size controls */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 shrink-0">
            <button
              onClick={() => {
                onChangeFontSize(-2);
                setCurrentFontSize((prev) => Math.max(10, prev - 2));
              }}
              className="p-1 hover:text-emerald-400 text-slate-300 transition-colors"
              title="Decrease Font Size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center font-mono text-[11px] font-bold text-emerald-400">
              {currentFontSize}
            </span>
            <button
              onClick={() => {
                onChangeFontSize(2);
                setCurrentFontSize((prev) => Math.min(90, prev + 2));
              }}
              className="p-1 hover:text-emerald-400 text-slate-300 transition-colors"
              title="Increase Font Size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Bold Toggle */}
          <button
            onClick={() => {
              onToggleBold();
              setIsBold(!isBold);
            }}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              isBold
                ? 'bg-emerald-600 text-white font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Font Family Dropdown */}
          <select
            value={currentFont}
            onChange={(e) => {
              setCurrentFont(e.target.value);
              onChangeFontFamily(e.target.value);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium rounded-lg px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[100px] truncate shrink-0"
            title="Change Font Family"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Resize / Scale Controls for Signatures, Images, or Shapes */}
      {(isImage || isShape) && (
        <div className="flex items-center space-x-1 shrink-0">
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => onScale(0.88)}
              className="flex items-center px-1.5 py-0.5 text-[11px] text-slate-300 hover:text-emerald-400"
              title="Scale Down (Or drag corner handles on canvas)"
            >
              <Minus className="w-3 h-3 mr-0.5" />
              Size
            </button>
            <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
            <button
              onClick={() => onScale(1.15)}
              className="flex items-center px-1.5 py-0.5 text-[11px] text-slate-300 hover:text-emerald-400"
              title="Scale Up (Or drag corner handles on canvas)"
            >
              <Plus className="w-3 h-3 mr-0.5" />
              Size
            </button>
          </div>
        </div>
      )}

      {/* Color Picker for Text and Shapes */}
      {(isText || isShape) && (
        <div className="relative shrink-0">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
            title="Change Color"
          >
            <div
              className="w-3.5 h-3.5 rounded-full ring-1 ring-white/60 shadow-xs"
              style={{ backgroundColor: currentColor }}
            />
            <Palette className="w-3 h-3 text-slate-400" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl flex items-center space-x-1.5 z-40 animate-in fade-in">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    onChangeColor(c.hex);
                    setCurrentColor(c.hex);
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full hover:scale-115 transition-transform ring-1 ring-white/20"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="w-px h-5 bg-slate-700 mx-0.5 shrink-0" />

      {/* Duplicate / Copy Button */}
      <button
        onClick={onDuplicate}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Delete / Trash Button */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 transition-colors shrink-0"
        title="Delete (Backspace / Del)"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

