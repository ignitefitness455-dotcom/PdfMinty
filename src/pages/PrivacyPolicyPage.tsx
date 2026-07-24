import { Shield, Lock, FileCheck, CheckCircle2, XCircle, AlertTriangle, Mail, Globe, Sparkles } from 'lucide-react';
import React from 'react';

import SEO from '../components/SEO';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="Privacy Policy | PdfMinty — 100% Client-Side PDF Tools"
        descriptionOverride="PdfMinty never collects, stores, or uploads your files. All PDF processing happens in your browser. Learn about our zero-data privacy policy."
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 border-b border-border-muted pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Shield className="w-4 h-4" />
            <span>Zero Data Collection Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm font-semibold text-on-surface-variant max-w-2xl mx-auto">
            Effective Date: <span className="text-emerald-600 dark:text-emerald-400">July 23, 2026</span> &nbsp;|&nbsp; Last Updated: <span className="text-emerald-600 dark:text-emerald-400">July 23, 2026</span>
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-surface-container-low border border-border-muted rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-xl font-extrabold text-on-surface flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            Introduction
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Welcome to <strong className="text-on-surface">PdfMinty</strong> (<a href="https://pdfminty.com" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">https://pdfminty.com</a>). Your privacy is our absolute top priority. This Privacy Policy explains how we handle your data when you use our free online PDF tools.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed bg-emerald-500/5 border-l-4 border-emerald-500 p-4 rounded-r-xl">
            Unlike most online PDF converters, PdfMinty processes everything directly in your browser. <strong>Your files never leave your computer or device.</strong>
          </p>
        </section>

        {/* What Makes PdfMinty Different */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">
            What Makes PdfMinty Different
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-on-surface">🛡️ 100% Client-Side Processing</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                All PDF operations — merge, split, protect, edit, rotate, watermark, sign, OCR, and AI analysis — happen entirely in your web browser. We use modern WebAssembly and JavaScript technologies to ensure zero server uploads.
              </p>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-on-surface">🔒 Zero Data Collection</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                We do <strong>NOT</strong> collect, store, or transmit:
              </p>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside pt-1">
                <li>Your PDF files or document contents</li>
                <li>Your name, email, or personal information</li>
                <li>Your IP address or location data</li>
                <li>Your browser history or device information</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Information We Do NOT Collect Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-on-surface">
            Information We Do NOT Collect
          </h2>
          <div className="overflow-x-auto border border-border-muted rounded-2xl bg-surface-container-low shadow-sm">
            <table className="w-full text-left text-xs text-on-surface border-collapse">
              <thead>
                <tr className="bg-surface-container-high border-b border-border-muted text-on-surface font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Data Type</th>
                  <th className="p-4">Collected?</th>
                  <th className="p-4">Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-on-surface-variant">
                <tr>
                  <td className="p-4 font-bold text-on-surface">PDF Files</td>
                  <td className="p-4 font-bold text-rose-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> No
                  </td>
                  <td className="p-4">Processed locally in your browser memory</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-on-surface">Personal Information</td>
                  <td className="p-4 font-bold text-rose-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> No
                  </td>
                  <td className="p-4">No account creation or sign-up required</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-on-surface">IP Address</td>
                  <td className="p-4 font-bold text-rose-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> No
                  </td>
                  <td className="p-4">Not logged or tracked on server databases</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-on-surface">Cookies (Functional)</td>
                  <td className="p-4 font-bold text-rose-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> No
                  </td>
                  <td className="p-4">No user login session system exists</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-on-surface">Cookies (Advertising)</td>
                  <td className="p-4 font-bold text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Yes
                  </td>
                  <td className="p-4">Google AdSense only — see details below</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-on-surface-variant italic">
            *Third-party advertising cookies are used solely for displaying relevant ads to keep PdfMinty free.
          </p>
        </section>

        {/* Google AdSense & Advertising */}
        <section className="bg-surface-container-low border border-border-muted p-6 sm:p-8 rounded-2xl space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Google AdSense & Advertising
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To keep PdfMinty completely free without subscription fees, we display advertisements through Google AdSense.
          </p>
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">How Google Uses Data:</h3>
            <ul className="text-xs text-on-surface-variant space-y-2 list-disc list-inside">
              <li>Google may use cookies to serve personalized or non-personalized ads</li>
              <li>Google may collect anonymized browsing data through its advertising network</li>
              <li>You can control your ad preferences anytime at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">Google Ad Settings</a></li>
            </ul>
          </div>
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Your Choices:</h3>
            <ul className="text-xs text-on-surface-variant space-y-2 list-disc list-inside">
              <li>Use browser ad-blockers if you prefer</li>
              <li>Manage cookie preferences through your browser settings</li>
              <li>Visit <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">Google's Privacy Policy</a> for more details</li>
            </ul>
          </div>
        </section>

        {/* Your Privacy Rights */}
        <section className="bg-surface-container-low border border-border-muted p-6 sm:p-8 rounded-2xl space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-sky-500" />
            Your Privacy Rights
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Since PdfMinty collects zero personal data, there is no remote user data to access, correct, delete, or port to another service.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            However, you retain full control over your browser data and can:
          </p>
          <ul className="text-xs text-on-surface-variant space-y-2 list-disc list-inside">
            <li>Clear browser cookies and cached site data anytime</li>
            <li>Use private / incognito browsing mode</li>
            <li>Disable third-party cookies in browser settings</li>
          </ul>
        </section>

        {/* Data Security & Children's Privacy */}
        <div className="grid sm:grid-cols-2 gap-4">
          <section className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Data Security
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Even though we don't store your data on servers, we implement strict client security best practices:
            </p>
            <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
              <li>HTTPS TLS encryption for all connections</li>
              <li>Zero server-side file handling or upload pipelines</li>
              <li>Regular security audits of our client-side code</li>
            </ul>
          </section>

          <section className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Children's Privacy
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              PdfMinty is not directed at children under 13 years of age. We do not knowingly collect any personal information from children or any other users.
            </p>
          </section>
        </div>

        {/* Changes to This Policy & Contact */}
        <section className="bg-surface-container-high border border-border-muted p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Changes to This Policy</h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              We may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated "Last Updated" date.
            </p>
          </div>

          <div className="border-t border-border-muted pt-6 space-y-3">
            <h2 className="text-lg font-bold text-on-surface">Contact Us</h2>
            <p className="text-xs text-on-surface-variant">
              If you have any questions or concerns about your privacy, reach out to us:
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold">
              <a href="mailto:pdfminty@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-border-muted text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50 transition-colors">
                <Mail className="w-4 h-4" /> pdfminty@gmail.com
              </a>
              <a href="https://pdfminty.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-border-muted text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50 transition-colors">
                <Globe className="w-4 h-4" /> https://pdfminty.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
