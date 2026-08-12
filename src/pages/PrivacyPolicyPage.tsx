import { Shield, Lock, EyeOff, Server, HardDrive } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Privacy Policy — 100% Zero-Data Collection | PdfMinty"
        descriptionOverride="Read PdfMinty's Privacy Policy. We do not collect, upload, store, or transmit your PDF files. All processing happens 100% locally inside your web browser."
      />

      <div className="max-w-4xl mx-auto space-y-12" id="privacy-policy-container">
        {/* Header Hero */}
        <div className="text-center space-y-4 border-b border-border-muted pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Shield className="w-4 h-4" />
            <span>Complete Data Sovereignty</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-on-surface-variant max-w-xl mx-auto">
            Last Reviewed: August 2026 • Technical Reviewer: Security & Compliance Architecture Team
          </p>
        </div>

        {/* Executive Summary */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
              ✓
            </div>
            <h2 className="text-lg font-extrabold text-on-surface">The Short Version</h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
            PdfMinty's standard 22 PDF tools process files 100% locally inside your web browser without uploading your documents to any server. If you explicitly choose to use the opt-in AI PDF Assistant (/ai-analyze-pdf), extracted text is sent securely to Google Gemini API to fulfill your query, strictly after you give consent.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 bg-surface-container-low border border-border-muted p-6 sm:p-10 rounded-3xl shadow-sm text-xs sm:text-sm leading-relaxed text-on-surface-variant font-medium">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-500" />
              1. Local In-Browser Processing (Standard Tools)
            </h2>
            <p>
              When you select a PDF file in standard PdfMinty tools (merge, split, rotate, compress, protect, watermark, convert, etc.), it is processed entirely using client-side WebAssembly and JavaScript in your browser memory on your local device.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" />
              2. Zero Storage & No Uploads for Standard PDF Utilities
            </h2>
            <p>
              We do not maintain backend servers that store or buffer your PDF documents for standard tools. All file transformations execute locally on your device.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              3. Opt-In AI Feature Disclosure (/ai-analyze-pdf)
            </h2>
            <p>
              PdfMinty offers an optional AI PDF Assistant. If you select a file and check the consent box in the AI tool, text extracted from up to the first 12 pages is sent via encrypted API to Google Gemini to answer your questions or generate summaries. Binary PDF files are never stored, and text is transmitted solely for processing your explicit query.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-emerald-500" />
              3. Analytics & Cookies
            </h2>
            <p>
              PdfMinty uses minimal, privacy-focused website performance analytics to monitor overall site health. We do not sell user data, track personal identities, or store cookies containing sensitive information.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              4. Contact Us About Privacy
            </h2>
            <p>
              If you have any questions about our privacy practices, feel free to reach out directly via our{' '}
              <Link to={ROUTES.CONTACT} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Contact Page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
