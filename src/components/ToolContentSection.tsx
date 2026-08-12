import { HelpCircle, ChevronDown, Check, Shield, Sparkles, ArrowRight, AlertTriangle, Cpu, Laptop, FileCode, ExternalLink, Calendar, Lock } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { NORD_AFFILIATE_LINKS } from '../config/constants';
import { ToolSEOInfo } from '../config/seo-data';

interface ToolContentSectionProps {
  tool: ToolSEOInfo;
}

export const ToolContentSection: React.FC<ToolContentSectionProps> = ({ tool }) => {
  if (!tool) return null;

  const {
    name,
    howTo,
    faqs,
    problemSolved,
    primaryCtaText,
    supportedFormats,
    technicalNotes,
    privacyNote,
    troubleshooting,
    relatedLinks,
    lastReviewedDate = 'August 2026 • Verified by Security & Product Architecture Team',
    longFormBody,
  } = tool;

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const uploaderEl =
      document.getElementById('file-uploader-deck') ||
      document.getElementById('file-uploader-input') ||
      document.getElementById('main-tool-workspace') ||
      document.querySelector('input[type="file"]');

    if (uploaderEl) {
      uploaderEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (uploaderEl instanceof HTMLInputElement) {
        uploaderEl.click();
      } else {
        const inputInside = uploaderEl.querySelector('input[type="file"]') as HTMLInputElement | null;
        if (inputInside) inputInside.click();
      }
    }
  };

  return (
    <div className="mt-16 pt-12 border-t border-border-muted space-y-16" id="tool-content-section">
      {/* 1. Problem Solved & Primary CTA Banner */}
      {problemSolved && (
        <section className="bg-surface-container-low p-6 sm:p-8 rounded-2xl border border-border-muted shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Problem Solved</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
              Why Use {name}?
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed font-medium">
              {problemSolved}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border-muted/60">
            <a
              href="#file-uploader-deck"
              onClick={handleCtaClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer text-sm"
              aria-label={`Primary CTA: ${primaryCtaText || `Start ${name} Now`}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{primaryCtaText || `Start ${name} Now`}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant/80">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Last reviewed: {lastReviewedDate}</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. Step-by-step instructions */}
      {howTo && howTo.steps && howTo.steps.length > 0 && (
        <section className="space-y-8" id="tool-howto-section">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-on-surface tracking-tight">
              {howTo.name || `How to Use ${name}`}
            </h2>
            <p className="text-on-surface-variant text-sm">
              Follow these clear, step-by-step instructions to complete your document task safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howTo.steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-surface-container-low p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-border-muted flex items-center justify-center font-mono font-black text-on-surface text-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
                    0{index + 1}
                  </div>
                  <p className="text-on-surface-variant text-sm font-semibold leading-relaxed">
                    {step}
                  </p>
                </div>
                <div className="pt-4 flex items-center space-x-1 text-[10px] uppercase tracking-wider font-extrabold text-on-surface-variant/80">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Step Complete</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Specifications: Formats & Limitations */}
      {supportedFormats && (
        <section className="space-y-6" id="tool-formats-specs">
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-500" />
            <span>Supported Formats & File Specifications</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-border-muted space-y-2">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Supported Inputs
              </span>
              <ul className="text-xs text-on-surface-variant space-y-1 font-semibold">
                {supportedFormats.input.map((inp, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-border-muted space-y-2">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Output Formats
              </span>
              <ul className="text-xs text-on-surface-variant space-y-1 font-semibold">
                {supportedFormats.output.map((outp, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{outp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-border-muted space-y-2">
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Realistic Limitations
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                {supportedFormats.limits}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Device, Browser, File Size, Memory, and Accessibility Notes */}
      {technicalNotes && (
        <section className="space-y-6" id="tool-technical-notes">
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            <Laptop className="w-5 h-5 text-emerald-500" />
            <span>Device, Browser & Accessibility Compatibility</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-border-muted space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-on-surface uppercase tracking-wider">
                <Laptop className="w-4 h-4 text-emerald-500" />
                <span>Devices & Browsers</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                {technicalNotes.deviceBrowser}
              </p>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-border-muted space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-on-surface uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <span>File Size & Memory</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                {technicalNotes.fileSizeMemory}
              </p>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-border-muted space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-on-surface uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Accessibility</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                {technicalNotes.accessibility}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 5. Verified Privacy Explanation */}
      {privacyNote && (
        <section className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl space-y-3" id="tool-privacy-note">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <span>Verified Technical Privacy Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
            {privacyNote}
          </p>
        </section>
      )}

      {/* 6. Troubleshooting Section */}
      {troubleshooting && troubleshooting.length > 0 && (
        <section className="space-y-6" id="tool-troubleshooting-section">
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Troubleshooting Common Issues</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {troubleshooting.map((item, idx) => (
              <div key={idx} className="bg-surface-container-low p-5 rounded-2xl border border-border-muted space-y-2">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.issue}</span>
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium pt-1 border-t border-border-muted/50">
                  <span className="font-bold text-on-surface">Resolution:</span> {item.resolution}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. FAQs Accordion Section */}
      {faqs && faqs.length > 0 && (
        <section className="space-y-8 max-w-3xl mx-auto" id="tool-faq-section">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-on-surface tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-on-surface-variant text-sm">
              Real questions answered directly with verified technical details.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-border-muted rounded-2xl bg-surface-container-low shadow-sm open:border-emerald-500/40 transition-all overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between p-5 font-bold text-on-surface text-sm md:text-base cursor-pointer hover:bg-surface-container-high/50 select-none list-none outline-none focus:ring-2 focus:ring-emerald-500/25">
                  <span className="pr-4 leading-snug">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-on-surface-variant group-open:rotate-180 transition-transform duration-200 flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 pt-1 border-t border-border-muted/50 bg-surface-container-high/20 text-on-surface-variant text-sm leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Third-party Sponsored / Affiliate Disclosure box below tool experience */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-border-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Recommended Network Security [Sponsored Partner]</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">
                Keep your internet connection encrypted on public Wi-Fi networks when handling PDF documents.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs font-bold">
              <a
                href={NORD_AFFILIATE_LINKS.NORDVPN}
                target="_blank"
                rel="nofollow sponsored noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>NordVPN (Affiliate)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-border-muted">|</span>
              <a
                href={NORD_AFFILIATE_LINKS.NORDPASS}
                target="_blank"
                rel="nofollow sponsored noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>NordPass (Affiliate)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 8. Contextual Links */}
      {relatedLinks && relatedLinks.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-border-muted" id="tool-contextual-links">
          <h3 className="text-xs font-black uppercase tracking-wider text-on-surface-variant">
            Explore Related Tools, Guides & Comparisons
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.url}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-border-muted text-xs font-bold text-on-surface hover:text-emerald-600 transition-colors"
              >
                <span>{link.title}</span>
                <ArrowRight className="w-3 h-3 text-emerald-500" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 9. Long form body if additional explanatory text exists */}
      {longFormBody && (
        <article
          className="max-w-3xl mx-auto pt-8 border-t border-border-muted
            [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-on-surface dark:[&_h2]:text-slate-100 [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 
            [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-on-surface dark:[&_h3]:text-slate-100 [&_h3]:mt-8 [&_h3]:mb-3 
            [&_p]:text-on-surface-variant dark:[&_p]:text-slate-300 [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-6
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-6 [&_ul_li]:text-on-surface-variant dark:[&_ul_li]:text-slate-300 [&_ul_li]:text-base
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-6 [&_ol_li]:text-on-surface-variant dark:[&_ol_li]:text-slate-300 [&_ol_li]:text-base
            [&_strong]:font-semibold [&_strong]:text-on-surface dark:[&_strong]:text-white
            [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_a]:underline hover:[&_a]:opacity-80"
          dangerouslySetInnerHTML={{
            __html: longFormBody.replace(/^\s*<h1>[\s\S]*?<\/h1>/i, ''),
          }}
        />
      )}
    </div>
  );
};

export default ToolContentSection;
