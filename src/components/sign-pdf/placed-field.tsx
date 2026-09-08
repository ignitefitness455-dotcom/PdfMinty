import {
  Trash2,
  Copy,
  PenTool,
  Check,
  Calendar,
  Type,
  GripVertical,
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';

import { PlacedField } from './types';

interface PlacedFieldComponentProps {
  field: PlacedField;
  isSelected: boolean;
  scale: number;
  pageWidth: number; // unscaled page points
  pageHeight: number; // unscaled page points
  onSelect: () => void;
  onUpdate: (updated: Partial<PlacedField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRequestSign: () => void;
}

export const PlacedFieldComponent: React.FC<PlacedFieldComponentProps> = ({
  field,
  isSelected,
  scale,
  pageWidth,
  pageHeight,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onRequestSign,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [tempText, setTempText] = useState(field.value);

  // Sync temp text when field.value changes
  useEffect(() => {
    setTempText(field.value);
  }, [field.value]);

  useEffect(() => {
    if (isEditingText) {
      textInputRef.current?.focus();
    }
  }, [isEditingText]);

  // Scaled dimensions in pixels on current screen viewport
  const pixelWidth = field.width * scale;
  const pixelHeight = field.height * scale;

  // Pixel coordinates relative to page container
  const pixelX = (field.x / 100) * pageWidth * scale;
  const pixelY = (field.y / 100) * pageHeight * scale;

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only drag if not interacting with resize handle or action buttons
    if ((e.target as HTMLElement).closest('.field-action-button') || (e.target as HTMLElement).closest('.resize-handle')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsDragging(true);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startX = pixelX;
    const startY = pixelY;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentX - clientX;
      const deltaY = currentY - clientY;

      const newPixelX = Math.max(0, Math.min(pageWidth * scale - pixelWidth, startX + deltaX));
      const newPixelY = Math.max(0, Math.min(pageHeight * scale - pixelHeight, startY + deltaY));

      const newPercentX = Number(((newPixelX / (pageWidth * scale)) * 100).toFixed(3));
      const newPercentY = Number(((newPixelY / (pageHeight * scale)) * 100).toFixed(3));

      onUpdate({ x: newPercentX, y: newPercentY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
  };

  // Resizing logic from bottom-right handle
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const startWidth = field.width;
    const startHeight = field.height;
    const aspectRatio = startWidth / startHeight;

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault();
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = (currentX - clientX) / scale;
      const deltaY = (currentY - clientY) / scale;

      const newWidth = Math.max(30, startWidth + deltaX);
      let newHeight = Math.max(20, startHeight + deltaY);

      // Lock aspect ratio for signatures, initials, and checkmarks
      if (field.type === 'signature' || field.type === 'initials' || field.type === 'checkmark') {
        newHeight = newWidth / aspectRatio;
      }

      onUpdate({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
  };

  // Text edit commit
  const handleTextCommit = useCallback(() => {
    setIsEditingText(false);
    if (tempText.trim() !== field.value) {
      onUpdate({ value: tempText.trim() || 'Text' });
    }
  }, [field.value, onUpdate, tempText]);

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      style={{
        position: 'absolute',
        left: `${pixelX}px`,
        top: `${pixelY}px`,
        width: `${pixelWidth}px`,
        height: `${pixelHeight}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 30 : 20,
      }}
      className={`group select-none touch-none ${
        isSelected
          ? 'ring-2 ring-emerald-500 bg-emerald-500/5 shadow-md'
          : 'hover:ring-1 hover:ring-slate-400'
      }`}
    >
      {/* Floating Action Bar on top of field when selected */}
      {isSelected && (
        <div
          className="field-action-button absolute -top-10 left-0 bg-white border border-slate-200 rounded-lg shadow-lg px-1.5 py-1 flex items-center space-x-1 z-40 animate-in fade-in zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Sign / Edit Button */}
          {(field.type === 'signature' || field.type === 'initials') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRequestSign();
              }}
              className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Change Signature"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
          )}

          {field.type === 'text' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingText(true);
              }}
              className="p-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Edit Text"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Duplicate Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Field Content Rendering */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden pointer-events-none">
        {/* SIGNATURE OR INITIALS */}
        {(field.type === 'signature' || field.type === 'initials') && (
          <>
            {field.value ? (
              <img
                src={field.value}
                alt={field.type}
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestSign();
                }}
                className="pointer-events-auto w-full h-full border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors rounded flex flex-col items-center justify-center p-1 cursor-pointer"
              >
                <PenTool className="w-4 h-4 text-emerald-600 mb-0.5" />
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider text-center">
                  Click to {field.type === 'initials' ? 'Initials' : 'Sign'}
                </span>
              </div>
            )}
          </>
        )}

        {/* TEXT FIELD */}
        {field.type === 'text' && (
          <>
            {isEditingText ? (
              <input
                ref={textInputRef}
                type="text"
                value={tempText}
                onChange={(e) => setTempText(e.target.value)}
                onBlur={handleTextCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTextCommit();
                  if (e.key === 'Escape') {
                    setTempText(field.value);
                    setIsEditingText(false);
                  }
                }}
                className="pointer-events-auto w-full h-full px-2 text-sm bg-white border border-emerald-500 rounded outline-hidden shadow-inner text-slate-900"
                style={{
                  fontSize: `${(field.fontSize || 14) * scale}px`,
                  color: field.color || '#111827',
                }}
              />
            ) : (
              <div
                onDoubleClick={() => setIsEditingText(true)}
                className="w-full h-full px-1.5 flex items-center select-none truncate"
                style={{
                  fontSize: `${(field.fontSize || 14) * scale}px`,
                  color: field.color || '#111827',
                  fontFamily: field.fontFamily || 'sans-serif',
                }}
              >
                {field.value || 'Click to enter text'}
              </div>
            )}
          </>
        )}

        {/* DATE FIELD */}
        {field.type === 'date' && (
          <div
            className="w-full h-full px-1.5 flex items-center space-x-1 select-none font-mono"
            style={{
              fontSize: `${(field.fontSize || 13) * scale}px`,
              color: field.color || '#111827',
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{field.value}</span>
          </div>
        )}

        {/* CHECKMARK FIELD */}
        {field.type === 'checkmark' && (
          <div className="w-full h-full flex items-center justify-center text-emerald-600 font-bold">
            <Check className="w-full h-full max-w-[80%] max-h-[80%] stroke-[3]" />
          </div>
        )}
      </div>

      {/* Resize Handle (Bottom-Right Corner) */}
      {isSelected && (
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className="resize-handle absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-md cursor-se-resize flex items-center justify-center z-40 transition-transform hover:scale-125"
          title="Resize"
        >
          <GripVertical className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
};
