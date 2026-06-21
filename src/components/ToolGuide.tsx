import { HelpCircle, ChevronDown, Check } from 'lucide-react';
import React from 'react';

import { TOOLS } from '../config/seo-data';

interface ToolGuideProps {
  slug: string;
}

export const ToolGuide: React.FC<ToolGuideProps> = ({ slug }) => {
  // Find the matching tool
  const tool = TOOLS.find((t) => t.slug === slug);

  // If no matching tool, or it lacks both howTo and faqs, render nothing
  if (!tool || (!tool.howTo && !tool.faqs)) {
    return null;
  }

  const { name, howTo, faqs } = tool;

  return (
    <div className="mt-16 pt-12 border-t border-slate-200 space-y-16" id="tool-guide-wrapper">
      {/* "How it works" Steps Section */}
      {howTo && howTo.steps && howTo.steps.length > 0 && (
        <section className="space-y-8" id="tool-guide-howto-section">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {howTo.name || `How to Use ${name}`}
            </h2>
            <p className="text-slate-500 text-sm">
              Follow these simple, secure steps to process your documents locally in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howTo.steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
                id={`howto-step-card-${index + 1}`}
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-mono font-black text-slate-700 text-sm group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-colors">
                    0{index + 1}
                  </div>
                  <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                    {step}
                  </p>
                </div>
                <div className="pt-4 flex items-center space-x-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Step Complete</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQs Accordion Section */}
      {faqs && faqs.length > 0 && (
        <section className="space-y-8 max-w-3xl mx-auto" id="tool-guide-faq-section">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-slate-500 text-sm">
              Have questions about privacy, capabilities, or technical details? We have direct answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-slate-200 rounded-2xl bg-white shadow-sm open:border-slate-300 transition-all overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                id={`faq-details-item-${index + 1}`}
              >
                <summary className="flex items-center justify-between p-5 font-bold text-slate-800 text-sm md:text-base cursor-pointer hover:bg-slate-50/50 select-none list-none outline-none focus:ring-2 focus:ring-emerald-500/25">
                  <span className="pr-4 leading-snug">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/20 text-slate-600 text-sm leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ToolGuide;
