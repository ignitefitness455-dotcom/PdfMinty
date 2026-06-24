import { Sparkles } from 'lucide-react';
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16 relative pt-4">
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-surface-container-low border border-border-muted rounded-full text-security-green text-xs font-bold mb-6 tracking-wide select-none shadow-lg">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-security-green" aria-hidden="true" /> WebAssembly Client
        Sandbox Active
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight leading-none mb-6 font-sans">
        Local PDF Utilities <span className="text-primary-fixed font-black">Zero Uploads</span>
      </h1>
      <p className="text-on-surface-variant text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
        Merge, split, and compress your critical files entirely in your browser. PDFMinty runs
        100% client-side, meaning your highly confidential files never leave your device’s sandbox
        memory. No signups, no accounts—just immediate offline processing for ultimate peace of
        mind.
      </p>
    </div>
  );
};
