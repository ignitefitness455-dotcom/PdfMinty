import { FileText, Check, ShieldCheck, AlertOctagon, Scale, Mail, Globe, CheckCircle2 } from 'lucide-react';
import React from 'react';

import SEO from '../components/SEO';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Terms of Service | PdfMinty — Free Online PDF Tools"
        descriptionOverride="Read PdfMinty's Terms of Service. Free, no-sign-up PDF tools with 100% browser-based processing. No file uploads. No watermarks."
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 border-b border-border-muted pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold tracking-wide uppercase">
            <FileText className="w-4 h-4" />
            <span>Terms of Service & Usage Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm font-semibold text-on-surface-variant max-w-2xl mx-auto">
            Effective Date: <span className="text-sky-600 dark:text-sky-400">July 23, 2026</span> &nbsp;|&nbsp; Last Updated: <span className="text-sky-600 dark:text-sky-400">July 23, 2026</span>
          </p>
        </div>

        {/* 1. Agreement to Terms */}
        <section className="bg-surface-container-low border border-border-muted rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
            <Scale className="w-5 h-5 text-sky-500" />
            1. Agreement to Terms
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            By accessing or using <strong className="text-on-surface">PdfMinty</strong> (<a href="https://pdfminty.com" className="text-sky-600 dark:text-sky-400 underline font-semibold">https://pdfminty.com</a>), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, please do not use our service.
          </p>
        </section>

        {/* 2. About PdfMinty */}
        <section className="bg-surface-container-low border border-border-muted rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            2. About PdfMinty
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            PdfMinty is a free online PDF toolkit offering utilities including:
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-xs font-semibold text-on-surface">
            <div className="p-2.5 rounded-xl bg-surface-container-high border border-border-muted flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> PDF Merge & Split
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-high border border-border-muted flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> PDF Compress & Repair
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-high border border-border-muted flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> PDF Protect & Unlock
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-high border border-border-muted flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> PDF Edit & Rotate
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-high border border-border-muted flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> PDF Watermark & Page Numbers
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-high border border-border-muted flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> AI PDF Analysis & OCR
            </div>
          </div>

          <div className="pt-3 border-t border-border-muted space-y-2">
            <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">Key Features:</h3>
            <ul className="text-xs text-on-surface-variant space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>100% Free</strong> — No hidden charges or trial periods</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>No Sign-Up Required</strong> — Use instantly without an account</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>No Watermarks</strong> — Clean, original quality output files</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Privacy-First</strong> — All processing in your web browser</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>No File Uploads</strong> — Your data stays on your local device</li>
            </ul>
          </div>
        </section>

        {/* 3. How Our Service Works */}
        <section className="bg-surface-container-low border border-border-muted rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-extrabold text-on-surface">
            3. How Our Service Works
          </h2>
          <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400">Client-Side Processing</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            All PDF operations are performed locally in your web browser using:
          </p>
          <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside">
            <li>WebAssembly technology</li>
            <li>Modern JavaScript APIs</li>
            <li>Your device's own local processing power</li>
          </ul>
          <p className="text-xs text-on-surface-variant leading-relaxed bg-sky-500/10 border-l-4 border-sky-500 p-3 rounded-r-xl font-medium mt-2">
            <strong>Important:</strong> We do not have access to your files. We cannot view, store, or recover any documents you process.
          </p>
        </section>

        {/* 4. Acceptable Use Policy Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">
            4. Acceptable Use Policy
          </h2>
          <p className="text-xs text-on-surface-variant">
            You agree to use PdfMinty lawfully and responsibly. Specifically, you must NOT engage in any prohibited activity:
          </p>
          <div className="overflow-x-auto border border-border-muted rounded-2xl bg-surface-container-low shadow-sm">
            <table className="w-full text-left text-xs text-on-surface border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-border-muted text-on-surface font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Prohibited Activity</th>
                  <th className="p-4">Consequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-on-surface-variant">
                <tr>
                  <td className="p-4 font-semibold text-on-surface">Upload or process illegal content</td>
                  <td className="p-4 font-bold text-rose-500">Immediate service denial</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-on-surface">Process copyrighted material without permission</td>
                  <td className="p-4 font-bold text-rose-500">Legal liability on user</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-on-surface">Attempt to hack, reverse-engineer, or exploit the service</td>
                  <td className="p-4 font-bold text-rose-500">Permanent ban</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-on-surface">Use automated bots or scrapers</td>
                  <td className="p-4 font-bold text-amber-500">IP blocking</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-on-surface">Distribute malware or harmful files</td>
                  <td className="p-4 font-bold text-rose-600">Report to authorities</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-on-surface">Overload or abuse server resources</td>
                  <td className="p-4 font-bold text-amber-500">Access restriction</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Intellectual Property */}
        <section className="bg-surface-container-low border border-border-muted rounded-2xl p-6 sm:p-8 space-y-3 shadow-sm">
          <h2 className="text-xl font-extrabold text-on-surface">
            5. Intellectual Property
          </h2>
          <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
            <p><strong className="text-on-surface">Our Content:</strong> The PdfMinty website, logo, visual design, and source code are owned by PdfMinty and protected by copyright and intellectual property laws.</p>
            <p><strong className="text-on-surface">Your Content:</strong> You retain full, exclusive ownership of all PDF files you process. We claim no rights or license to your documents.</p>
          </div>
        </section>

        {/* 6. Disclaimer of Warranties & 7. Limitation of Liability */}
        <div className="grid sm:grid-cols-2 gap-4">
          <section className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-500" />
              6. Disclaimer of Warranties
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              PdfMinty is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to merchantability, fitness for a particular purpose, non-infringement, or accuracy of results.
            </p>
          </section>

          <section className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              7. Limitation of Liability
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              To the maximum extent permitted by applicable law, PdfMinty shall not be liable for any data loss, corruption, lost profits, business interruption, or consequential damages. Always keep backups of original files before processing.
            </p>
          </section>
        </div>

        {/* 8 - 10 Sections */}
        <section className="bg-surface-container-low border border-border-muted rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm text-xs text-on-surface-variant leading-relaxed">
          <div>
            <h2 className="text-base font-extrabold text-on-surface">8. Indemnification</h2>
            <p className="mt-1">
              You agree to indemnify and hold harmless PdfMinty, its operators, and affiliates from any claims, damages, or expenses arising from your use of the service or violation of these terms.
            </p>
          </div>
          <div className="border-t border-border-muted pt-3">
            <h2 className="text-base font-extrabold text-on-surface">9. Third-Party Links & Services</h2>
            <p className="mt-1">
              PdfMinty may contain links to third-party websites or use third-party services (such as Google AdSense). We are not responsible for the content, privacy policies, or practices of these third parties.
            </p>
          </div>
          <div className="border-t border-border-muted pt-3">
            <h2 className="text-base font-extrabold text-on-surface">10. Termination</h2>
            <p className="mt-1">
              We reserve the right to suspend or terminate access for violations of these terms, modify or discontinue the service at any time, or block abusive IP addresses.
            </p>
          </div>
          <div className="border-t border-border-muted pt-3">
            <h2 className="text-base font-extrabold text-on-surface">11. Governing Law</h2>
            <p className="mt-1">
              These Terms shall be governed by and construed in accordance with the laws of <strong>Bangladesh</strong>, without regard to its conflict of law provisions.
            </p>
          </div>
          <div className="border-t border-border-muted pt-3">
            <h2 className="text-base font-extrabold text-on-surface">12. Changes to Terms</h2>
            <p className="mt-1">
              We may revise these Terms of Service at any time. The updated version will be posted on this page with a new "Last Updated" date. Continued use of PdfMinty after changes constitutes acceptance.
            </p>
          </div>
        </section>

        {/* 13 & 14. Contact & Entire Agreement */}
        <section className="bg-surface-container-high border border-border-muted p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-on-surface">14. Entire Agreement</h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              These Terms constitute the entire agreement between you and PdfMinty regarding the use of our service.
            </p>
          </div>

          <div className="border-t border-border-muted pt-6 space-y-3">
            <h2 className="text-lg font-bold text-on-surface">13. Contact Information</h2>
            <p className="text-xs text-on-surface-variant">
              For questions, concerns, or legal inquiries regarding these terms:
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold">
              <a href="mailto:pdfminty@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-border-muted text-sky-600 dark:text-sky-400 hover:border-sky-500/50 transition-colors">
                <Mail className="w-4 h-4" /> pdfminty@gmail.com
              </a>
              <a href="https://pdfminty.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-border-muted text-sky-600 dark:text-sky-400 hover:border-sky-500/50 transition-colors">
                <Globe className="w-4 h-4" /> https://pdfminty.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
