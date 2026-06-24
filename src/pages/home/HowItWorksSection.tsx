import { Merge } from 'lucide-react';
import React from 'react';

export const HowItWorksSection: React.FC = () => {
  return (
    <>
      {/* Visual Workspace Feature Section */}
      <div className="mt-24 border border-border-muted rounded-[32px] p-8 md:p-12 bg-surface-container-low/50 backdrop-blur-md relative overflow-hidden z-20 shadow-xl flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-5">
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-security-green/10 text-security-green border border-security-green/20 px-3.5 py-1.5 rounded-full font-black tracking-widest uppercase animate-pulse">
            Local Dev-Sandbox Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight leading-tight">
            Fast, Private Interactive Workspace
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-medium">
            PDFMinty processes all your documents locally within your device's memory. With secure
            WebAssembly integrations, operations happen instantly without transmission queues, file
            upload limits, or cloud exposures. Experience absolute control over your contract
            agreements, confidential datasheets, and forms with a distraction-free desktop
            environment.
          </p>
        </div>
        <div className="w-full md:w-80 shrink-0 border border-border-muted rounded-[24px] overflow-hidden shadow-2xl bg-surface-container-low p-5">
          <div className="w-full h-44 bg-surface-container-lowest rounded-xl p-3.5 flex flex-col gap-3 border border-border-muted shadow-inner relative overflow-hidden select-none">
            {/* Workspace header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-1.5 whitespace-nowrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-critical-red"></div>
                <div className="w-2 h-2 rounded-full bg-warning-amber"></div>
                <div className="w-2 h-2 rounded-full bg-security-green"></div>
                <span className="text-[9px] text-on-surface-variant font-mono ml-2">
                  client-workspace.pdf
                </span>
              </div>
              <div className="px-1.5 py-0.5 rounded bg-security-green/10 text-security-green text-[8px] font-black uppercase">
                100% Offline
              </div>
            </div>
            {/* Workspace body / dropzone representation */}
            <div className="flex-1 border border-dashed border-border-muted rounded-lg flex flex-col items-center justify-center p-2 text-center bg-surface-container-low/10">
              <Merge className="w-5 h-5 text-security-green mb-1 animate-bounce" aria-hidden="true" />
              <span className="text-[10px] font-bold text-primary">Drag & Drop PDF here</span>
              <span className="text-[8px] text-on-surface-variant/70 mt-0.5">
                or click to browse locally
              </span>
            </div>
            {/* Mini active items list */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="flex-1 bg-surface-container-lowest p-2 rounded-md border border-border-muted flex items-center justify-between shadow-sm">
                <span className="text-[8px] text-on-surface-variant font-bold max-w-[120px] truncate">
                  client_contract.pdf
                </span>
                <span className="text-[7px] text-on-surface-variant/60 font-mono">1.2 MB</span>
              </div>
              <div className="w-6 h-6 rounded-md bg-security-green flex items-center justify-center text-background font-bold text-[10px] shadow-sm shrink-0 hover:bg-primary-fixed-dim transition-colors cursor-pointer">
                →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-24 relative z-20">
        <h2 className="text-2xl md:text-4xl font-black text-primary text-center tracking-tight mb-2 font-sans">
          How It Works
        </h2>
        <p className="text-on-surface-variant text-xs md:text-sm text-center mb-16 max-w-md mx-auto font-medium">
          Three simple steps to process your files entirely inside your browser.
        </p>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Timeline Connector Line */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-security-green/5 via-security-green/20 to-security-green/5 -z-10" />

          <div
            id="step-1-card"
            className="flex flex-col items-center p-8 rounded-3xl bg-surface-container-low border border-border-muted shadow-lg hover:border-security-green transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-security-green border border-border-muted flex items-center justify-center font-bold text-lg mb-4 shadow-md z-10 font-mono">
              1
            </div>
            <h3 className="text-base font-bold text-primary mb-2">Select Tool</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs font-semibold">
              Choose one of our free PDF tools to combine, split, or compress files.
            </p>
          </div>
          <div
            id="step-2-card"
            className="flex flex-col items-center p-8 rounded-3xl bg-surface-container-low border border-border-muted shadow-lg hover:border-security-green transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-security-green border border-border-muted flex items-center justify-center font-bold text-lg mb-4 shadow-md z-10 font-mono">
              2
            </div>
            <h3 className="text-base font-bold text-primary mb-2">Add Files</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs font-semibold">
              Upload your documents directly. Your files never touch our servers.
            </p>
          </div>
          <div
            id="step-3-card"
            className="flex flex-col items-center p-8 rounded-3xl bg-surface-container-low border border-border-muted shadow-lg hover:border-security-green transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-security-green border border-border-muted flex items-center justify-center font-bold text-lg mb-4 shadow-md z-10 font-mono">
              3
            </div>
            <h3 className="text-base font-bold text-primary mb-2">Download</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs font-semibold">
              Receive your processed document instantly with maximum privacy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
