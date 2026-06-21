import { ArrowLeft, Shield, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { SEO } from '../components/SEO';
import { ROUTES } from '../config/routes';
import { TOOLS } from '../config/seo-data';

export const IsItSafePage: React.FC = () => {
  const article = TOOLS.find((t) => t.id === 'trust-article');

  if (!article) {
    return (
      <div className="py-20 text-center text-sm text-slate-500 font-semibold">
        Article content could not be located.
      </div>
    );
  }

  return (
    <div
      className="space-y-8 max-w-4xl mx-auto py-6 font-sans text-slate-800 dark:text-slate-200"
      id="trust-article-page-container"
    >
      <SEO slug={article.slug} />

      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-full text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Security Analysis & Trust</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {article.h1}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium">
          {article.metaDescription}
        </p>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>

      <article className="prose prose-slate max-w-none dark:prose-invert leading-relaxed space-y-6">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
            </span>
            Our Privacy Guarantee
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
            PDFMinty is modeled from the ground up on secure local client sandboxing. Your files
            never touch a remote machine, cloud portal, or temporary folder. Everything runs on your
            own processor.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            The Hidden Risks of Server-Side PDF Operations
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            When you upload standard document items to legacy online tools to merge sheets, compress
            drafts, or decrypt layouts, your PDF is stored on their remote machines. This creates
            severe vulnerabilities:
          </p>
          <ul className="space-y-3 pl-5 list-disc text-sm text-slate-600 dark:text-slate-400">
            <li>
              <strong>Document Retention Overrides:</strong> Many cloud tool companies store
              document packets on backup volumes far longer than advertised.
            </li>
            <li>
              <strong>Unrestricted Employee Audits:</strong> Admin accounts can view uploaded
              content files to verify formatting or debug issues, compromising user confidentiality.
            </li>
            <li>
              <strong>Interception Hazards:</strong> Man-in-the-middle network attacks can inspect
              and duplicate PDF streams during transit.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Why Local WebAssembly Pipelines Represent the Future
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            PDFMinty runs powerful document parsers (like <code>pdf-lib</code> and{' '}
            <code>pdfjs-dist</code>) inside modern browser sandboxes using WebAssembly. This
            architecture means:
          </p>
          <ul className="space-y-3 pl-5 list-disc text-sm text-slate-600 dark:text-slate-400">
            <li>
              <strong>True Offline Support:</strong> Once loaded, you can sever your internet
              connection completely, and the tools will still function perfectly.
            </li>
            <li>
              <strong>Immediate Render Speed:</strong> Bypassing network uploads means tasks compile
              in milliseconds.
            </li>
            <li>
              <strong>Permanent Confidentiality:</strong> Your files never cross network ports,
              keeping them completely safe from corporate log files and server errors.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Proactive Steps to Secure Your Daily Documents
          </h2>
          <ol className="space-y-3 pl-5 list-decimal text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li>Verify tool descriptions to confirm client-side execution processes.</li>
            <li>Test tool interactions offline to ensure no hidden backup networks exist.</li>
            <li>
              Use local password tools to encrypt confidential spreadsheets and sensitive customer
              invoices before sharing.
            </li>
          </ol>
        </div>
      </article>
    </div>
  );
};
export default IsItSafePage;
