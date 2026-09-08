import {
  ArrowLeft,
  Download,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React from 'react';

interface ToolHeaderProps {
  fileName: string;
  currentPage: number;
  numPages: number;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isExporting: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onExport: () => void;
  onBack: () => void;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  fileName,
  currentPage,
  numPages,
  zoom,
  canUndo,
  canRedo,
  isExporting,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onPrevPage,
  onNextPage,
  onExport,
  onBack,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between z-30 shrink-0 select-none shadow-2xs">
      {/* Left: Back & File Name */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
          title="Return or Change PDF"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
              {fileName}
            </h1>
            <span className="hidden sm:inline-block text-[11px] text-emerald-600 font-medium">
              Ready for signing
            </span>
          </div>
        </div>
      </div>

      {/* Center: Page Controls & Zoom Controls (Hidden on narrow mobile) */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Page Switcher */}
        {numPages > 1 && (
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage >= numPages}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.4}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold px-1.5 sm:px-2 text-slate-700 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 2.5}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={onZoomFit}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors hidden xs:block"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1 sm:p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Export & Download Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onExport}
          disabled={isExporting}
          className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-1.5 sm:space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save & Download Signed PDF"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{isExporting ? 'Generating...' : 'Finish & Sign'}</span>
        </button>
      </div>
    </header>
  );
};
