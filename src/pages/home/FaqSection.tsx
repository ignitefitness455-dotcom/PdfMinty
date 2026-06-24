import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import { TOOLS } from '../../config/seo-data';

export const FaqSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const toolsCount = TOOLS.filter((t) => t.type === 'tool').length;

  const faqs = [
    {
      q: 'Are my files safe with PDFMinty?',
      a: 'Absolutely! All standard file computations (merge, split, compress, edit) are performed fully client-side inside your browser window. Your private files are never uploaded to our servers, keeping your documents 100% confidential.',
    },
    {
      q: 'How much does it cost to use PDFMinty?',
      a: 'PDFMinty is completely, unconditionally free. There are no payment screens, registration gates, daily execution counts, or premium capabilities hidden behind subscriptions.',
    },
    {
      q: 'Does PDFMinty work offline without an active network?',
      a: `Yes! Since all operations run purely inside your client browser, our core suite of ${toolsCount} tools works flawlessly even if you are entirely disconnected from the internet.`,
    },
    {
      q: 'Can I use PDFMinty on my tablet or mobile device?',
      a: 'Yes, our modern responsive layout is optimized for desktops, tablets, and smartphones alike. No apps to install—just open PDFMinty and edit instantly.',
    },
  ];

  return (
    <div className="mt-24 relative z-20" id="faq-section">
      <h2 className="text-2xl md:text-3xl font-black text-primary text-center tracking-tight mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-on-surface-variant text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">
        Quick clarity on core PDFMinty features, standards, and operations.
      </p>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, i) => {
          const isOpen = openFaqIndex === i;
          return (
            <div
              key={faq.q}
              className="bg-surface-container-low border border-border-muted rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
            >
              <button
                type="button"
                id={`faq-button-${i}`}
                onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-primary text-sm md:text-base hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-security-green shrink-0 transition-transform" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-on-surface-variant/60 shrink-0 transition-transform" aria-hidden="true" />
                )}
              </button>
              {isOpen && (
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  className="p-5 pt-0 border-t border-border-muted text-on-surface-variant text-xs md:text-sm leading-relaxed font-semibold bg-surface-container-lowest/30"
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
