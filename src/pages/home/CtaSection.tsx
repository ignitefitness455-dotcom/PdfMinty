import { Zap } from 'lucide-react';
import React from 'react';

export const CtaSection: React.FC = () => {
  const handleScrollToTools = () => {
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="mt-24 border border-border-muted rounded-3xl bg-surface-container-low/40 p-10 md:p-14 text-center text-primary relative overflow-hidden z-20 shadow-xl">
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle, var(--custom-security-green) 0%, transparent 70%)' }} aria-hidden="true"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] pointer-events-none opacity-5" style={{ background: 'radial-gradient(circle, var(--custom-primary-fixed-dim) 0%, transparent 70%)' }} aria-hidden="true"></div>
      <div className="relative z-10 max-w-xl mx-auto space-y-5">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight font-sans">
          Ready to secure your PDF workflow?
        </h2>
        <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-semibold">
          Choose any tool from our security workspace to load document files local-first. Instant
          execution, no subscription gates, 100% data integrity.
        </p>
        <div className="pt-4">
          <button
            onClick={handleScrollToTools}
            className="px-6 py-3.5 rounded-xl bg-security-green hover:bg-primary-fixed-dim text-[#131313] font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-security-green/10 active:scale-95 cursor-pointer max-w-xs inline-flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-[#131111] text-[#131111]" aria-hidden="true" />
            <span>Explore All Tools</span>
          </button>
        </div>
      </div>
    </div>
  );
};
