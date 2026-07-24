import { Sparkles, ShieldCheck } from 'lucide-react';
import React from 'react';

import { HOMEPAGE_H1_PART1, HOMEPAGE_H1_PART2 } from '../../config/homeConfig';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16 relative pt-4">
      <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide select-none shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <span>🔒 100% No Server Upload Guarantee</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-low border border-border-muted rounded-full text-security-green text-xs font-bold tracking-wide select-none shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-security-green" aria-hidden="true" />
          <span>WebAssembly Client Sandbox</span>
        </div>
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight leading-none mb-6 font-sans" id="homepage-main-h1">
        {HOMEPAGE_H1_PART1}<span className="text-primary-fixed font-black">{HOMEPAGE_H1_PART2}</span>
      </h1>
      <p className="text-on-surface-variant text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
        Merge and split your critical files entirely in your browser. PDFMinty runs
        100% client-side, meaning your highly confidential files never leave your device’s sandbox
        memory. No signups, no accounts—just immediate offline processing for ultimate peace of
        mind.
      </p>
    </div>
  );
};

