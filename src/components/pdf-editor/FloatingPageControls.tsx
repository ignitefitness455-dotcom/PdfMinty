import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Hand } from 'lucide-react';
import React from 'react';

interface FloatingPageControlsProps {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isPanMode: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onTogglePanMode: () => void;
}

export const FloatingPageControls: React.FC<FloatingPageControlsProps> = ({
  currentPage,
  totalPages,
  zoom,
  isPanMode,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onTogglePanMode,
}) => {
  return (
    <div 
      className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white px-2.5 sm:px-3 py-1.5 rounded-full shadow-2xl border border-slate-700/60 flex items-center space-x-1.5 sm:space-x-2 text-xs font-medium select-none max-w-[95vw] overflow-x-auto"
      id="pdf_floating_page_controls"
    >
      {/* Page Navigation */}
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-700">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="p-1 hover:text-emerald-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="font-semibold text-white px-0.5 whitespace-nowrap">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="p-1 hover:text-emerald-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center space-x-1 pr-2 border-r border-slate-700">
        <button
          onClick={onZoomOut}
          disabled={zoom <= 0.35}
          className="p-1 hover:text-emerald-400 disabled:text-slate-600 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="w-11 text-center font-mono text-slate-300">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          disabled={zoom >= 2.0}
          className="p-1 hover:text-emerald-400 disabled:text-slate-600 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fit to Screen */}
      <button
        onClick={onResetZoom}
        className="p-1 hover:text-emerald-400 transition-colors text-slate-300"
        title="Fit Page / Reset Zoom"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {/* Pan / Hand Mode */}
      <button
        onClick={onTogglePanMode}
        className={`p-1 rounded-sm transition-colors ${
          isPanMode ? 'text-emerald-400 bg-slate-800' : 'text-slate-300 hover:text-emerald-400'
        }`}
        title="Toggle Pan Hand Tool"
      >
        <Hand className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
