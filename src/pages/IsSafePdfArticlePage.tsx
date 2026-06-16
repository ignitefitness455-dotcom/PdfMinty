import React, { useEffect } from "react";
import { ShieldCheck, Lock, Cpu, ServerCrash, ExternalLink, ArrowLeft, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function IsSafePdfArticlePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16 text-slate-800 dark:text-slate-100 font-sans" id="safe-article-container">
      <header className="mb-10 text-center sm:text-left">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors mb-6 text-sm font-semibold no-underline group"
          id="back-home-link"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Tool Dashboard
        </Link>
        <span className="inline-block px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-full text-rose-500 dark:text-rose-400 text-xs font-semibold mb-4 leading-none">
          Security & Engineering Analysis
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight" id="article-title">
          Is It Safe to Upload PDFs to Online Tools?
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 font-medium">
          An engineering deep dive into browser-side sandboxing, data sovereignty, and WebAssembly cryptography.
        </p>
      </header>

      {/* Hero Visual Card */}
      <div className="bg-gradient-to-br from-emerald-555/5 via-teal-500/5 to-indigo-500/5 border border-slate-200/60 dark:border-slate-850/65 rounded-3xl p-6 sm:p-8 mb-12 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Guaranteed Zero-Server Processing
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlike legacy PDF engines which silently upload your business logs, proprietary financial ledgers, and government templates to external database nodes, <strong>PDFMinty executes 100% of all processing directly inside your browser</strong>. Your documents never leave your physical device.
            </p>
          </div>
        </div>
      </div>

      {/* Core Body Content */}
      <div className="space-y-10 prose prose-slate dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-slate-650 dark:text-slate-300">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-emerald-500 shrink-0" />
            1. Client-Side Sandboxing (WebAssembly)
          </h2>
          <p>
            PDFMinty employs modern **WebAssembly (Wasm)** binaries and client-only compiled javascript structures (via <code>@cantoo/pdf-lib</code> and <code>pdfjs-dist</code>) to rebuild your PDFs right in the context of your browser's execution stack. This is the exact same secure execution sandbox that powers browser tabs, isolated from your native file system and computer processes.
          </p>
          <p>
            When you load a file:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
            <li>The files are processed as fully local <code>ArrayBuffers</code>, existing only in your device's random access memory (RAM).</li>
            <li>No cloud network upload socket is ever open for your assets. You can literally disconnect your Wi-Fi router entirely, and PDFMinty will compile, merge, split, watermark, and lock your files completely offline.</li>
            <li>Your sensitive business variables, digital signatures, and metadata remain uncompromised.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-indigo-500 shrink-0" />
            2. The In-Browser PDF Sanitization Layer
          </h2>
          <p>
            Malicious PDFs can carry harmful payloads, including embedded attachments, external command launch triggers, and executable JavaScript macros that start running upon open in reader software. PDFMinty addresses this with our built-in <strong>PDFSanitizer</strong>.
          </p>
          <p>
            Every document loaded into PDFMinty undergoes an automated security clean sequence that strips:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mb-1">Active Scripts (/JavaScript, /JS)</span>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Prunes any embedded automatic JS files and macro actions to prevent active scripting from launching.
              </p>
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mb-1">OS Launch Commands (/Launch)</span>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Neutralizes instructions that try to force external client applications, attachments, or scripts to start.
              </p>
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mb-1">Hidden Malware Nodes (/EmbeddedFiles)</span>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Locks out and strips remote file nodes nestled inside secondary document collections.
              </p>
            </div>
            <div className="bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block mb-1">Form Data Leaks (/SubmitForm)</span>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Inerts form endpoints that might silently ping data back to a tracking service.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ServerCrash className="w-6 h-6 text-rose-500 shrink-0" />
            3. Verification & Compliance
          </h2>
          <p>
            PDFMinty aligns with the most stringent data-sovereignty regulations worldwide, such as **GDPR (EU)**, **CCPA (CA)**, and **HIPAA (USA)**. Because we do not upload, gather, inspect, index, database, serialize, or transmit any documents to any database, there is zero risk of third-party data breaches, compliance violations, or leakage of personal identifiable information (PII).
          </p>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 text-sm text-emerald-800 dark:text-emerald-300 mt-4">
            <BookmarkCheck className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <p className="margin-0 leading-relaxed">
              <strong>Compliance Verdict:</strong> Fullycompliant. Since no asset files leave your device, there is literally no data processor transfer vector to compile, report, audit, or fail security thresholds on.
            </p>
          </div>
        </section>
      </div>

      <footer className="mt-16 border-t border-slate-200 dark:border-slate-900 pt-8 flex justify-center">
        <Link
          to="/"
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white hover:text-white transition-all shadow-md select-none no-underline flex items-center gap-2 group"
          id="go-back-btn"
        >
          Explore Web Tools
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </footer>
    </article>
  );
}
