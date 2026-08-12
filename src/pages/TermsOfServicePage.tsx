import { FileText, CheckCircle2, Shield, Scale, HelpCircle } from 'lucide-react';
import React from 'react';

import SEO from '../components/SEO';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Terms of Service — PdfMinty"
        descriptionOverride="Read PdfMinty's Terms of Service. Understand our terms of use, privacy guarantee, and service guidelines."
      />

      <div className="max-w-4xl mx-auto space-y-12" id="terms-of-service-container">
        {/* Header Hero */}
        <div className="text-center space-y-4 border-b border-border-muted pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Scale className="w-4 h-4" />
            <span>Service Terms & Usage</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-on-surface-variant max-w-xl mx-auto">
            Last Reviewed: August 2026 • Technical Reviewer: Legal & Product Architecture Team
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 bg-surface-container-low border border-border-muted p-6 sm:p-10 rounded-3xl shadow-sm text-xs sm:text-sm leading-relaxed text-on-surface-variant font-medium">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using PdfMinty (<a href="https://pdfminty.com" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">https://pdfminty.com</a>), you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue using the service.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              2. Nature of Service & In-Browser Processing
            </h2>
            <p>
              PdfMinty provides free PDF tools designed to operate locally within your web browser for standard PDF utilities. For opt-in AI features (/ai-analyze-pdf), extracted text content is transmitted securely via API to Google Gemini only after explicit user consent. Standard PDF utilities do not transmit or store your documents on remote servers.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              3. User Responsibilities & Data Ownership
            </h2>
            <p>
              You retain full ownership and responsibility for all documents processed using PdfMinty. You are responsible for ensuring that you have legal rights to process any files you select.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              4. Disclaimer of Warranties
            </h2>
            <p>
              PdfMinty is provided on an "as is" and "as available" basis without warranties of any kind. While we aim for maximum compatibility and performance, you use the software at your own discretion.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
