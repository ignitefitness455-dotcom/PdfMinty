import { ArrowLeft, Shield, CheckCircle, HelpCircle, Key, Lock, AlertTriangle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { SEO } from '../components/SEO';
import { ROUTES } from '../config/routes';
import { TOOLS } from '../config/seo-data';

export const IsSafePdfArticlePage: React.FC = () => {
  const article = TOOLS.find((t) => t.id === 'trust-article');

  if (!article) {
    return (
      <div className="py-20 text-center text-sm font-bold text-slate-500">
        Article metadata could not be fetched.
      </div>
    );
  }

  return (
    <div
      className="space-y-8 max-w-4xl mx-auto py-6 font-sans text-slate-800 dark:text-slate-200"
      id="trust_article_container"
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <Shield className="w-4 h-4" />
          <span>Security Analysis & Trust Insights</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {article.h1}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed font-medium">
          {article.metaDescription}
        </p>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 my-4" />

      <article
        className="prose prose-slate max-w-none dark:prose-invert space-y-8"
        id="editorial_body"
      >
        {/* Highlight Banner */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 m-0">
            <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4.5 h-4.5" />
            </span>
            Our Privacy Imperative
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium m-0 leading-relaxed">
            Many traditional online web software utilities force users to upload PDFs to a remote
            cloud machine to compile basic operations. At PDFMinty, we believe this presents serious
            unnecessary server risks. Our entire suite operates 100% inside your local tab sandbox.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            The Hidden Risks of Server-Side Cloud PDF Processors
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            When you submit a text script, tax spreadsheet, or company invoice to standard free
            online tools, your files are transfered across network ports to third-party databases.
            These systems present massive security vectors:
          </p>
          <ul className="space-y-3 pl-5 list-disc text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li>
              <strong>Uncontrolled File Retention Cycles:</strong> Although portals advertise
              immediate file wiping, files can often sit indefinitely inside caching filesystems,
              backups, or system bug logs.
            </li>
            <li>
              <strong>Internal Administrative Leakage:</strong> Support personnel often maintain
              unrestricted capabilities to look into cached databases to optimize parser accuracy.
            </li>
            <li>
              <strong>Interception Exploits:</strong> Encryption keys are decrypted on the web
              server, enabling third-party inspectors to tap into the document streams.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            How Client-Side WebAssembly Solves This Paradox
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            Modern browser sandboxes feature lightning-fast processors capable of executing compiled
            desktop software natively using WebAssembly (Wasm). When utilizing PDFMinty tools like
            our offline{' '}
            <Link to={ROUTES.MERGE} className="text-emerald-600 font-bold hover:underline">
              PDF Merger
            </Link>{' '}
            or the{' '}
            <Link to={ROUTES.COMPRESS} className="text-emerald-600 font-bold hover:underline">
              PDF Compressor
            </Link>
            , the parsing algorithms run strictly within your memory buffer.
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium animate-pulse">
            💡 <strong>Offline Verification Test:</strong> You can load this web portal, pull your
            WiFi plug or engage Airplane Mode on your phone, and continue to compress drafts, delete
            pages, or rotate layouts perfectly. No packets are sent, keeping your files completely
            secluded.
          </p>
        </section>

        <section className="space-y-4 bg-slate-50 dark:bg-slate-950/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 leading-none">
            <Key className="w-4.5 h-4.5 text-amber-500" />
            Owner Passwords vs. User Passwords: What's the Real Difference?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Understanding PDF cryptography is key to keeping documents safe. Standard files support
            two separate structural passwords:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block uppercase tracking-wider">
                User Password (Open Key)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Restricts the opening of the PDF itself. Unless the viewer provides this secret key,
                the raw document remains fully encrypted on disc, protecting it from visual
                inspection. You can implement this using our{' '}
                <Link
                  to={ROUTES.PROTECT}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Protect PDF Tool
                </Link>
                .
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-300 block uppercase tracking-wider">
                Owner Password (Permissions Key)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Restricts printing, cloning paragraphs, layout changes, or editing. Viewers can open
                and read the page text fine, but software blocks editing. If you need to lift
                permissions constraints, use our offline{' '}
                <Link to={ROUTES.UNLOCK} className="text-emerald-600 font-semibold hover:underline">
                  Unlock PDF Decryptor
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Evaluation Checklist: Spotting Privacy-First Online Tools
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
            When you find yourself on a web portal to edit spreadsheets, crop videos, or convert
            draft files, do not blindly trust the page layout. Check for these indicators:
          </p>
          <ol className="space-y-3 pl-5 list-decimal text-sm text-slate-600 dark:text-slate-400 font-semibold">
            <li>
              <span className="text-slate-800 dark:text-slate-200">Network Telemetry Test:</span>{' '}
              Bring up the Browser Developer Console (F12), click the "Network" tab, drag in a
              document, and check if standard cloud upload payloads are triggered. Done right, no
              file transfer streams should show up.
            </li>
            <li>
              <span className="text-slate-800 dark:text-slate-200">WebAssembly / Wasm Assets:</span>{' '}
              Locate references to local wasm files or js worker assets loaded inside your browser.
              This signals local execution.
            </li>
            <li>
              <span className="text-slate-800 dark:text-slate-200">
                Strict Offline Portability:
              </span>{' '}
              Unplug your network interface and verify if the compiling operations execute
              correctly. If the tool demands an internet handshake to complete a basic merge, your
              code is likely leaving your machine.
            </li>
          </ol>
        </section>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs flex gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="m-0 leading-normal font-semibold">
            Remember: Your document is your digital currency. Avoid processing highly confidential
            bank papers, private clinical logs, or copyright protected patents on unvetted servers.
            Always favor local local sandboxing tools when dealing with private customer records.
          </p>
        </div>
      </article>
    </div>
  );
};

export default IsSafePdfArticlePage;
