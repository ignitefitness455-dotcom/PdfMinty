import { Shield, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';

export const IsSafePdfArticlePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Are Online PDF Converters Safe? The Privacy Hazards Explained"
        descriptionOverride="Sending PDFs to remote servers poses real privacy hazards. Learn why in-browser PDF processing is the safest way to edit sensitive documents online."
      />

      <div className="max-w-4xl mx-auto space-y-12" id="is-safe-article-container">
        {/* Navigation back link */}
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All PDF Tools</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-6 border-b border-border-muted pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide uppercase">
            <Shield className="w-4 h-4" />
            <span>Document Security Analysis</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight leading-tight">
            Are Online PDF Converters Safe? The Privacy Hazards Explained
          </h1>

          <p className="text-base sm:text-xl font-medium text-on-surface-variant leading-relaxed">
            Every day, millions of people upload tax forms, bank statements, and legal contracts to free online PDF converters. But where do those files actually go?
          </p>
        </header>

        {/* Section 1: The Cloud Server Problem */}
        <section className="space-y-4 bg-surface-container-low border border-border-muted p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-on-surface">What Happens When You Upload a PDF to the Cloud?</h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
            When you use traditional web tools, your document travels over the internet to a third-party remote server. There, software processes your file before sending the output back to your browser. Even if a site claims to delete files within an hour, your sensitive data temporarily lives on an external machine subject to data leaks, server logs, or employee access.
          </p>
        </section>

        {/* Section 2: In-Browser Safety */}
        <section className="space-y-4 bg-surface-container-low border border-emerald-500/30 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-on-surface">The Safer Alternative: In-Browser Processing</h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
            Modern web browser capabilities allow complex PDF operations—such as merging, splitting, rotating, and password protection—to happen entirely on your computer or phone. Your files are processed inside your browser memory without ever being transmitted over the network or saved on an external server.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="space-y-6 bg-surface-container-low border border-border-muted p-6 sm:p-8 rounded-3xl shadow-sm">
          <h2 className="text-xl font-extrabold text-on-surface">Comparison: Server Uploads vs In-Browser Tools</h2>
          <div className="overflow-x-auto rounded-2xl border border-border-muted bg-surface">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-muted bg-surface-container-high/60">
                  <th className="py-3.5 px-4 font-bold text-on-surface">Feature</th>
                  <th className="py-3.5 px-4 font-bold text-rose-500">Traditional Online Tools</th>
                  <th className="py-3.5 px-4 font-bold text-emerald-500 bg-emerald-500/5">PDFMinty (In-Browser)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-on-surface-variant font-medium">
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">File Upload Required</td>
                  <td className="py-3 px-4 text-rose-500 font-bold">Yes (Sent to remote servers)</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold bg-emerald-500/5">No (Processed locally)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">Data Privacy Guarantee</td>
                  <td className="py-3 px-4">Relies on privacy policy promises</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold bg-emerald-500/5">Guaranteed by architecture</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">Offline Availability</td>
                  <td className="py-3 px-4">No (Requires internet connection)</td>
                  <td className="py-3 px-4 text-emerald-500 font-bold bg-emerald-500/5">Yes (Works offline)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Keep your sensitive documents safe.
          </h2>
          <p className="text-base sm:text-lg font-bold text-emerald-100 max-w-xl mx-auto">
            Process your PDFs 100% locally with PDFMinty. Zero uploads, zero risk.
          </p>
          <div className="pt-2">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-900 font-black text-base rounded-2xl transition-all shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-100"
            >
              <span>Start Using Free Tools</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IsSafePdfArticlePage;
