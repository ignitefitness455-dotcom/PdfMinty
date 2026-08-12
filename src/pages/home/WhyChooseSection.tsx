import { Shield, UserX, Gift, Layers, WifiOff, Zap } from 'lucide-react';
import React from 'react';

import { TOOLS } from '../../config/seo-data';

export const WhyChooseSection: React.FC = () => {
  const toolsCount = TOOLS.filter((t) => t.type === 'tool').length;

  return (
    <div className="my-24 relative z-20 -mx-4 px-6 py-20 bg-surface-container-low/40 border-y border-border-muted rounded-[40px]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-black text-primary text-center tracking-tight mb-2">
          Why Choose PDFMinty?
        </h2>
        <p className="text-on-surface-variant text-xs md:text-sm text-center mb-16 max-w-md mx-auto font-medium">
          Professional-grade document tools with zero security compromises.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            id="why-card-privacy"
            className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
              <Shield className="w-6 h-6 text-security-green fill-security-green/10" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-primary mb-2.5">Privacy First</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
              Your standard documents stay on your device. Local PDF operations run in browser memory for privacy-first handling.
            </p>
          </div>

          <div
            id="why-card-account"
            className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
              <UserX className="w-6 h-6 text-critical-red fill-critical-red/10" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-primary mb-2.5">No Account Required</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
              Skip signups and passwords. Access fast, direct tools instantly without creating an account or
              leaving personal data.
            </p>
          </div>

          <div
            id="why-card-free"
            className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
              <Gift className="w-6 h-6 text-warning-amber fill-warning-amber/10" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-primary mb-2.5">Completely Free</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
              Enjoy file editing and organizing with no paywalls, subscriptions, artificial limits, or watermarks.
            </p>
          </div>

          <div
            id="why-card-tools"
            className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
              <Layers className="w-6 h-6 text-primary-fixed fill-primary-fixed/10" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-primary mb-2.5">{toolsCount} Tools</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
              Get comprehensive document tools including Merge, Split, Rotate, Watermark, and opt-in AI PDF Analysis.
            </p>
          </div>

          <div
            id="why-card-offline"
            className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
              <WifiOff className="w-6 h-6 text-[#00FFC2] fill-[#00FFC2]/10" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-primary mb-2.5">Works Offline</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
              Our 22 standard PDF utilities operate without an active internet connection, so you can work off the grid.
            </p>
          </div>

          <div
            id="why-card-speed"
            className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
              <Zap className="w-6 h-6 text-tertiary-fixed-dim fill-tertiary-fixed-dim/10" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-primary mb-2.5">Instant Execution</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
              No waiting for file uploads or downloads. Local browser processing means files convert and save
              in seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
