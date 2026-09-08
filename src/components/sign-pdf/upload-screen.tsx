import { ShieldCheck, Zap, Lock, PenTool } from 'lucide-react';
import React from 'react';

import { TOOL_SIZE_LIMITS } from '../../config/constants';
import { FileUploader } from '../FileUploader';

interface UploadScreenProps {
  onFilesSelected: (files: FileList | File[]) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onFilesSelected }) => {
  const maxMb = TOOL_SIZE_LIMITS['sign-pdf']?.maxSingleMB || 50;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 my-auto">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-8">
        {/* Title & Description */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side Privacy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign PDF Documents Online
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
            Create professional signatures, type initials, and fill PDF fields securely in your browser.
            Your confidential files are processed locally and never stored on any server.
          </p>
        </div>

        {/* Drag & Drop File Uploader */}
        <FileUploader
          onFilesSelected={onFilesSelected}
          accept=".pdf,application/pdf"
          title="Drop your PDF here to sign"
          subtitle={`or browse files from your computer (Max file size: ${maxMb}MB)`}
          maxSizeMB={maxMb}
        />

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-center">
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col items-center space-y-1">
            <Lock className="w-5 h-5 text-emerald-600 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">Zero Server Uploads</h4>
            <p className="text-[11px] text-slate-500">
              Operates 100% in your local browser sandbox
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col items-center space-y-1">
            <PenTool className="w-5 h-5 text-emerald-600 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">Draw, Type, or Upload</h4>
            <p className="text-[11px] text-slate-500">
              Multiple signature styles with auto-transparency
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col items-center space-y-1">
            <Zap className="w-5 h-5 text-emerald-600 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">Pristine Vector Output</h4>
            <p className="text-[11px] text-slate-500">
              Crisp high-resolution PDF export with no quality loss
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
