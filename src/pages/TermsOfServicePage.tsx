import { FileText, CheckCircle2, Shield, Scale, HelpCircle, Bot, AlertTriangle, Mail } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Terms of Service — PdfMinty"
        descriptionOverride="Read PdfMinty's Terms of Service. Understand our terms of use, privacy guarantee, acceptable use policy, and crawler guidelines."
      />

      <div className="max-w-4xl mx-auto space-y-12" id="terms-of-service-container">
        {/* Header Hero */}
        <div className="text-center space-y-4 border-b border-border-muted pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Scale className="w-4 h-4" />
            <span>Service Terms & Usage Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-on-surface-variant max-w-xl mx-auto">
            Last Updated & Reviewed: September 2026 • Technical Reviewer: Legal & Compliance Team
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
              By accessing, browsing, or using PdfMinty (<a href="https://pdfminty.com" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">https://pdfminty.com</a>) and any of its associated 23 PDF tools, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              2. Nature of Service & Client-Side In-Browser Execution
            </h2>
            <p>
              PdfMinty provides free, browser-based document processing utilities. All standard tools (such as Merge, Split, Rotate, Compress, Protect, Unlock, Watermark, Delete Pages, Image to PDF, etc.) process files 100% locally on your computer or mobile device using WebAssembly and client-side JavaScript. We do not transmit or store your files on external servers for standard operations. For our opt-in AI PDF Assistant (/ai-analyze-pdf), extracted text is sent via encrypted API to Google Gemini only after you grant explicit consent.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-500" />
              3. Permitted Web Crawler, Search Engine & AI Agent Access Policy
            </h2>
            <div className="space-y-3">
              <p>
                PdfMinty encourages open web discovery, transparent indexing, and helpful artificial intelligence integration:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Authorized Crawlers:</strong> Legitimate search engine crawlers (Googlebot, Bingbot, Applebot, etc.), advertising verification bots (including Google AdSense crawlers Mediapartners-Google and Google-Display-Ads-Bot), and benign AI assistant bots (such as GPTBot, ClaudeBot, PerplexityBot, Cohere, and CCBot) are granted explicit permission to crawl, index, and reference all public tool pages, guides, and documentation.
                </li>
                <li>
                  <strong>Direct AI Documentation:</strong> Automated systems may consult <a href="/llms.txt" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">/llms.txt</a> and <a href="/llms-full.txt" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">/llms-full.txt</a> for structured system instructions and endpoint directories.
                </li>
                <li>
                  <strong>Prohibited Activities:</strong> Automated scrapers or bots are strictly prohibited from attempting to access, flood, or exploit backend API routes (/api/*), conducting denial-of-service (DoS) attacks, or bypassing technical security restrictions.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              4. User Responsibilities & Document Intellectual Property
            </h2>
            <p>
              You retain all intellectual property rights and ownership of any documents, text, or images processed using PdfMinty. You represent and warrant that you own or have obtained all necessary licenses, authorizations, and permissions to process, alter, or modify any files submitted to the tools. You agree not to use the service for any unlawful, infringing, or malicious activities.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              5. Advertisements & Third-Party Services
            </h2>
            <p>
              PdfMinty may display advertisements served by Google AdSense and other reputable third-party advertising partners. These networks may use cookies to serve relevant advertisements. Your interactions with third-party advertisers or external websites linked from PdfMinty are solely between you and the respective third party.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-500" />
              6. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p>
              PdfMinty and its tools are provided on an "as is" and "as available" basis, without warranty of any kind, whether express, implied, or statutory. In no event shall PdfMinty, its operators, or contributors be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your access to, use of, or inability to use the site or its tools. Always keep local backup copies of your critical documents.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-500" />
              7. Contact Us & Inquiries
            </h2>
            <p>
              If you have any questions or feedback regarding these Terms of Service, please contact us via our{' '}
              <Link to={ROUTES.CONTACT} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Contact Page
              </Link>{' '}
              or email us at <span className="font-semibold text-on-surface">support@pdfminty.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
