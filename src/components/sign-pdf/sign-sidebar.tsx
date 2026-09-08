import {
  PenTool,
  Type,
  Calendar,
  Check,
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  CheckCircle2,
  ChevronRight,
  GripHorizontal,
} from 'lucide-react';
import React, { useState } from 'react';

import { FieldType, PlacedField } from './types';

interface SignSidebarProps {
  activePlacementTool: FieldType | null;
  savedSignature: string | null;
  savedInitials: string | null;
  placedFields: PlacedField[];
  numPages: number;
  currentPage: number;
  onSelectPlacementTool: (type: FieldType | null) => void;
  onOpenSignatureDialog: (type: 'signature' | 'initials') => void;
  onScrollToPage: (pageNum: number) => void;
  onClearAllFields: () => void;
}

export const SignSidebar: React.FC<SignSidebarProps> = ({
  activePlacementTool,
  savedSignature,
  savedInitials,
  placedFields,
  numPages,
  currentPage,
  onSelectPlacementTool,
  onOpenSignatureDialog,
  onScrollToPage,
  onClearAllFields,
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'pages'>('tools');

  // Drag start helper
  const handleDragStart = (e: React.DragEvent, type: FieldType) => {
    e.dataTransfer.setData('application/sign-pdf-field-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none z-20">
      {/* Top Sidebar Tabs */}
      <div className="p-3 border-b border-slate-100 flex items-center space-x-1.5">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'tools'
              ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Fields & Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'pages'
              ? 'bg-emerald-50 text-emerald-700 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Pages ({numPages})</span>
        </button>
      </div>

      {/* Sidebar Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'tools' ? (
          <>
            {/* Guide hint */}
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Tip:</span> Click a field or drag it directly onto your document to position it.
            </div>

            {/* Signature Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Signature
                </span>
                {savedSignature && (
                  <button
                    onClick={() => onOpenSignatureDialog('signature')}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {savedSignature ? (
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'signature')}
                  onClick={() =>
                    onSelectPlacementTool(
                      activePlacementTool === 'signature' ? null : 'signature'
                    )
                  }
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer bg-white group flex flex-col items-center justify-center relative ${
                    activePlacementTool === 'signature'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-500 hover:shadow-xs'
                  }`}
                >
                  <img
                    src={savedSignature}
                    alt="Saved Signature"
                    className="max-h-12 max-w-full object-contain pointer-events-none"
                  />
                  <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-medium text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Ready to place</span>
                    </span>
                    <GripHorizontal className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onOpenSignatureDialog('signature')}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-500/80 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Signature</span>
                </button>
              )}
            </div>

            {/* Initials Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Initials
                </span>
                {savedInitials && (
                  <button
                    onClick={() => onOpenSignatureDialog('initials')}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {savedInitials ? (
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'initials')}
                  onClick={() =>
                    onSelectPlacementTool(
                      activePlacementTool === 'initials' ? null : 'initials'
                    )
                  }
                  className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer bg-white group flex items-center justify-between ${
                    activePlacementTool === 'initials'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <img
                    src={savedInitials}
                    alt="Saved Initials"
                    className="max-h-8 max-w-[100px] object-contain"
                  />
                  <span className="text-[10px] text-slate-400">Drag or Click</span>
                </div>
              ) : (
                <button
                  onClick={() => onOpenSignatureDialog('initials')}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Initials</span>
                </button>
              )}
            </div>

            {/* Standard Form Fields Palette */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Standard Fields
              </span>

              <div className="grid grid-cols-1 gap-2">
                {/* Text Field */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'text')}
                  onClick={() =>
                    onSelectPlacementTool(
                      activePlacementTool === 'text' ? null : 'text'
                    )
                  }
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activePlacementTool === 'text'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Type className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Text Field</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Date Field */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'date')}
                  onClick={() =>
                    onSelectPlacementTool(
                      activePlacementTool === 'date' ? null : 'date'
                    )
                  }
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activePlacementTool === 'date'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Date Stamp</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Checkmark Field */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'checkmark')}
                  onClick={() =>
                    onSelectPlacementTool(
                      activePlacementTool === 'checkmark' ? null : 'checkmark'
                    )
                  }
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activePlacementTool === 'checkmark'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Checkmark (✓)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Placed fields summary & clear */}
            {placedFields.length > 0 && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {placedFields.length} {placedFields.length === 1 ? 'field' : 'fields'} placed
                </span>
                <button
                  onClick={onClearAllFields}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </>
        ) : (
          /* Pages Tab */
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Document Pages
            </span>
            <div className="space-y-2">
              {Array.from({ length: numPages }).map((_, i) => {
                const pageNum = i + 1;
                const pageFieldsCount = placedFields.filter(
                  (f) => f.pageNumber === pageNum
                ).length;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onScrollToPage(pageNum)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all text-left ${
                      currentPage === pageNum
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold">Page {pageNum}</span>
                      {pageFieldsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                          {pageFieldsCount}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
