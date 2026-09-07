import { X } from 'lucide-react';
import React from 'react';

interface ThumbnailPage {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
}

interface ThumbnailsSidebarProps {
  pages: ThumbnailPage[];
  activePageIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (index: number) => void;
}

export const ThumbnailsSidebar: React.FC<ThumbnailsSidebarProps> = ({
  pages,
  activePageIndex,
  isOpen,
  onClose,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  const handleSelect = (idx: number) => {
    onSelectPage(idx);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar / Drawer */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-56 sm:w-64 md:relative md:inset-auto md:z-10 md:w-48 bg-slate-100/95 border-r border-slate-200 flex flex-col shrink-0 h-full select-none shadow-xl md:shadow-none transition-all"
        id="pdf_editor_thumbnails_sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 bg-white/80">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pages ({pages.length})
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
            title="Close Thumbnails"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnails Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {pages.map((page) => {
            const isActive = activePageIndex === page.index;
            return (
              <div
                key={page.index}
                onClick={() => handleSelect(page.index)}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Thumbnail Container */}
                <div
                  className={`w-full bg-white rounded-md shadow-xs transition-all overflow-hidden border ${
                    isActive
                      ? 'border-emerald-600 ring-2 ring-emerald-500/50 shadow-md'
                      : 'border-slate-300 group-hover:border-slate-400'
                  }`}
                  style={{
                    aspectRatio: `${page.width} / ${page.height}`,
                  }}
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.index + 1}`}
                    className="w-full h-full object-contain pointer-events-none"
                    loading="lazy"
                  />
                </div>

                {/* Page Number Badge */}
                <div
                  className={`mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                  }`}
                >
                  {page.index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
