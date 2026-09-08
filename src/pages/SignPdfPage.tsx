import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FileUploader } from '../components/FileUploader';
import { SEO } from '../components/SEO';
import { SignPdfTool } from '../components/sign-pdf/sign-pdf-tool';
import { TOOL_SIZE_LIMITS } from '../config/constants';
import { ROUTES } from '../config/routes';

export const SignPdfPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFilesSelected = (files: FileList | File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col bg-[#f8fafc]" id="pdf_editor_main_suite">
      <SEO slug="sign-pdf" />

      {!selectedFile ? (
        <>
          {/* Top Header / Navigation */}
          <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <Link
                to={ROUTES.HOME}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
                title="Return to Tools"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 tracking-tight leading-tight truncate">
                    Sign & Edit PDF
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    100% Client-Side
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 hidden md:block">
                  Full-featured PDF editor & electronic signature suite with zero server uploads
                </p>
              </div>
            </div>
          </div>

          {/* File Upload View */}
          <div className="max-w-4xl mx-auto w-full p-6 sm:p-10 my-auto">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Online PDF Editor & E-Signature
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
                  Sign, annotate, fill forms, and edit your PDF files with military-grade privacy. Your
                  documents never leave your browser.
                </p>
              </div>

              <FileUploader
                onFilesSelected={handleFilesSelected}
                accept=".pdf,application/pdf"
                title="Upload PDF to Start Editing"
                subtitle={`Drop files here or click to browse (Max limit: ${TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}MB)`}
                maxSizeMB={TOOL_SIZE_LIMITS['sign-pdf'].maxSingleMB}
              />
            </div>
          </div>
        </>
      ) : (
        /* The Sign PDF Tool Suite */
        <SignPdfTool
          file={selectedFile}
          onBack={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};
