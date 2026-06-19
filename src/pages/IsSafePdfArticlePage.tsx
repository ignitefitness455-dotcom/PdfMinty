import React, { useEffect } from "react";
import { ShieldCheck, ArrowLeft, Cpu, Lock, Network, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";

export default function IsSafePdfArticlePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <SEO 
        title="Is It Safe to Upload PDF to Online Tools?" 
        description="Learn why PDFMinty is different — your files never leave your browser." 
      />
      <main id="main-content" className="container mx-auto max-w-4xl px-4 py-12 text-slate-800 dark:text-slate-100 font-sans animate-fadein">
        <header className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors mb-6 text-sm font-semibold group no-underline"
            id="back-home-link"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <span className="inline-block px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 rounded-full text-rose-500 dark:text-rose-400 text-xs font-semibold mb-4 leading-none">
            Privacy & Security Deep-Dive
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Is It Safe to Upload PDFs to Online Tools?
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
            Learn why PDFMinty is structurally different — your files never leave your desktop environment.
          </p>
        </header>

        {/* Hero Visual Block */}
        <div className="bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-indigo-500/5 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-12 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Zero-Trust File Security Architecture
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Most online PDF services silently transfer your sensitive personal data, tax files, and medical forms to distant backend clouds. PDFMinty guarantees absolute local confidentiality by processing everything solely inside your browser's virtual runtime thread.
              </p>
            </div>
          </div>
        </div>

        <article className="prose dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed text-slate-650 dark:text-slate-300 space-y-8">
          <p className="text-xl text-slate-600 dark:text-slate-400 font-light italic border-l-4 border-emerald-500 pl-4 py-1">
            "Most online PDF tools upload your files to their servers for processing. This creates significant privacy and security risks."
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-emerald-500" />
              The Problem with Server-Side Processing
            </h2>
            <p>
              When files are sent out to cloud engines, several vulnerability layers are opened:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
              <li><strong>Data Exposure:</strong> Your files sit on someone else's server, vulnerable to leaks and exposure.</li>
              <li><strong>Retention:</strong> Many services keep your documents for hours or days, even when claiming to delete them.</li>
              <li><strong>Third-Party Access:</strong> Cloud host providers, CDNs, databases, and logging pipelines can all touch your plain content.</li>
              <li><strong>Compliance Issues:</strong> Violations of HIPAA, GDPR, SOC2 regulations can happen if private documents are processed externally.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-500" />
              How PDFMinty is Different
            </h2>
            <p>
              PDFMinty is a <strong>client-side application</strong>. All PDF processing happens directly in your web browser using isolated Web Workers. Your files:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
              <li>Never leave your local computer environment.</li>
              <li>Never touch our servers.</li>
              <li>Are parsed and compiled directly in RAM and immediately discarded.</li>
              <li>Cannot be accessed by us or any third party under any circumstances.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Play className="w-6 h-6 text-teal-500" />
              Technical Verification
            </h2>
            <p>
              You can audit and verify this yourself. Open your browser's Developer Tools (F12 or alternate shortcuts), locate the <strong>Network tab</strong>, and perform any PDF action with our tools. You will observe absolute silence across the network wire — zero upload request packets — because all compilation blocks execute locally on your physical processor.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Network className="w-6 h-6 text-sky-500" />
              When You Might See Network Requests
            </h2>
            <p>
              The only standard scenarios where secure HTTPS requests occur include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
              <li><strong>AI Analysis (/intelligence):</strong> Only the extracted raw text layer is routed via secure TLS proxy tunnels, never the original PDF itself.</li>
              <li><strong>Feedback/Contact Form:</strong> Transmission of custom bug reports or ratings optionally inputted.</li>
              <li><strong>Static Assets:</strong> Fetching HTML, style definitions, and JS client files required to display the UI locally (no document transmission).</li>
            </ul>
          </section>
        </article>

        <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8 flex justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white hover:text-white transition-all shadow-md select-none no-underline flex items-center gap-2 group"
          >
            Explore Free Offline Tools
            <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </footer>
      </main>
    </>
  );
}
