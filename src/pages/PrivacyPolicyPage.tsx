import { Shield, Lock, EyeOff, Server, HardDrive, Globe, Database, HelpCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Privacy Policy — 100% Zero-Data Collection | PdfMinty"
        descriptionOverride="Read PdfMinty's Privacy Policy. We do not collect, upload, store, or transmit your PDF files. All processing happens 100% locally inside your web browser. Includes Google AdSense and cookie disclosures."
      />

      <div className="max-w-4xl mx-auto space-y-12" id="privacy-policy-container">
        {/* Header Hero */}
        <div className="text-center space-y-4 border-b border-border-muted pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Shield className="w-4 h-4" />
            <span>Complete Data Sovereignty & Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-on-surface-variant max-w-xl mx-auto">
            Last Updated & Reviewed: September 2026 • Technical Reviewer: Security & Compliance Architecture Team
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
            PdfMinty's standard 22 PDF tools process files 100% locally inside your web browser without uploading your documents to any server. Your document contents never leave your device. If you explicitly choose to use the opt-in AI PDF Assistant (/ai-analyze-pdf), extracted text is sent securely via encrypted API to Google Gemini to fulfill your query, strictly after you give consent. Below you will also find detailed disclosures regarding Google AdSense advertising cookies, analytics, and your international privacy rights.
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
              When you select a PDF file in standard PdfMinty tools (merge, split, rotate, compress, protect, watermark, convert, delete pages, reorder, etc.), it is processed entirely using client-side WebAssembly, JavaScript, and Web Workers in your browser memory on your local machine or mobile device.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" />
              2. Zero Storage & No File Uploads
            </h2>
            <p>
              We do not maintain backend servers or cloud storage buckets that store, cache, or buffer your PDF documents. All binary file transformations execute entirely within your device's RAM. When you close the browser tab or refresh the page, all file data is completely purged from memory.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              3. Opt-In AI Feature Disclosure (/ai-analyze-pdf)
            </h2>
            <p>
              PdfMinty offers an optional AI PDF Assistant. If you select a file and check the explicit consent checkbox in the AI tool, extracted text from up to the first 12 pages is transmitted over an encrypted TLS connection to Google Gemini API to answer your questions or generate summaries. Binary PDF files are never stored, and text is transmitted solely for processing your immediate query.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              4. Google AdSense & Third-Party Advertising Cookies
            </h2>
            <div className="space-y-3">
              <p>
                PdfMinty uses Google AdSense to display advertisements when you visit our website. To comply with Google AdSense policies, please review the following required advertising disclosures:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites on the Internet.
                </li>
                <li>
                  Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visits to PdfMinty and/or other sites on the Internet.
                </li>
                <li>
                  Users may opt out of personalized advertising by visiting Google's{' '}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Ads Settings
                  </a>{' '}
                  or by visiting{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    www.aboutads.info
                  </a>.
                </li>
                <li>
                  For more details on how Google processes data when you visit partner sites, please see Google's policy at{' '}
                  <a
                    href="https://policies.google.com/technologies/partner-sites"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    How Google uses information from sites or apps that use our services
                  </a>.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-emerald-500" />
              5. Web Analytics & Cookie Usage
            </h2>
            <p>
              PdfMinty uses privacy-respecting website performance analytics (such as Google Analytics 4 with IP anonymization and Cloudflare Web Analytics) to understand aggregate traffic trends, pageviews, and browser performance. We do not sell user data, track individual personal identities, or store cookies containing sensitive document data.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              6. GDPR & CCPA/CPRA Privacy Rights
            </h2>
            <div className="space-y-3">
              <p>
                Depending on your geographic location, you possess statutory rights under privacy frameworks such as the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA):
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Right of Access & Deletion:</strong> Because standard PDF operations do not collect or store user accounts, identities, or files, there is no personally identifiable file data retained on our servers to access or delete.</li>
                <li><strong>Do Not Sell My Information:</strong> PdfMinty does not sell, rent, or monetize your personal information or document contents to any third parties.</li>
                <li><strong>Browser Controls:</strong> You may configure your web browser to reject cookies or delete stored browsing traces at any time without impacting the core functionality of our client-side tools.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              7. AI Bots, Crawlers & Search Engines Access Policy
            </h2>
            <p>
              PdfMinty supports open web standards. Search engine crawlers, automated verification bots (including Google AdSense crawlers Mediapartners-Google and Google-Display-Ads-Bot), and benign AI assistant crawlers (such as GPTBot, ClaudeBot, and PerplexityBot) are welcome to access, crawl, and index all public pages, tools, documentation, and tutorials. Automated access to backend API routes (/api/*) is restricted to safeguard operational integrity.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-border-muted">
            <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              8. Contact Us Regarding Privacy
            </h2>
            <p>
              If you have any questions, inquiries, or feedback regarding our privacy practices or cookie policies, please reach out via our{' '}
              <Link to={ROUTES.CONTACT} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Contact Page
              </Link>{' '}
              or by email at <span className="font-semibold text-on-surface">support@pdfminty.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
