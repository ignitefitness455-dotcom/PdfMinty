import { Shield, Lock, Cpu, HeartHandshake, Mail, Globe, Code2, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { NORD_AFFILIATE_LINKS } from '../config/constants';
import { ROUTES } from '../config/routes';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride="About Us | PdfMinty — Free Online PDF Tools"
        descriptionOverride="Discover the story behind PdfMinty, a privacy-first, 100% client-side PDF toolkit. Learn about our mission, 22+ free online tools, zero server uploads, and independent developer story."
      />

      <div className="max-w-4xl mx-auto space-y-12" id="about-us-container">
        {/* Header Hero */}
        <div className="text-center space-y-4 border-b border-border-muted pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Shield className="w-4 h-4" />
            <span>Privacy-First & Client-Side Engine</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight">
            About PdfMinty
          </h1>
          <p className="text-base sm:text-lg font-medium text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            A 100% client-side, zero-upload PDF toolkit crafted for absolute privacy, speed, and document sovereignty.
          </p>
        </div>

        {/* Section 1: Why We Created PdfMinty */}
        <section className="bg-surface-container-low border border-border-muted rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface">
              Why We Created PdfMinty
            </h2>
          </div>
          
          <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
            <p>
              Every day, millions of students, freelancers, legal professionals, and business owners rely on web-based PDF converters to handle routine document tasks—merging contracts, splitting reports, encrypting tax forms, or stripping hidden author metadata. Unfortunately, standard online PDF editors operate on a risky premise: <strong className="text-on-surface">they force you to upload your personal files to remote third-party cloud servers.</strong>
            </p>
            <p>
              When you upload a confidential document to a remote server, control over your personal data vanishes. The document travels across public networks, gets stored on unfamiliar cloud storage, and becomes exposed to unexpected data breaches, unauthorized server logging, or vague retention policies.
            </p>
            <div className="p-4 rounded-xl bg-emerald-500/5 border-l-4 border-emerald-500 text-on-surface text-sm font-medium leading-relaxed">
              <strong>The Local Solution:</strong> We engineered PdfMinty from the ground up as a zero-upload PDF platform. Utilizing WebAssembly (Wasm), Web Workers, and local browser memory buffers, PdfMinty executes every document operation locally inside your web browser. <strong>Your files never touch a remote server, never cross the internet, and never leave your device.</strong>
            </div>
          </div>
        </section>

        {/* Section 2: What We Offer (22+ Tools) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-on-surface">
                What We Offer
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                A complete suite of 22 free, utility-grade PDF tools running 100% client-side
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500">📂</span>
                PDF Organization
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Combine, segment, and rearrange your PDF files with ease:
              </p>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
                <li><Link to={ROUTES.MERGE} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Merge PDF</Link> & <Link to={ROUTES.SPLIT} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Split PDF</Link></li>
                <li><Link to={ROUTES.ROTATE} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Rotate Pages</Link> & <Link to={ROUTES.REORDER} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Reorder PDF</Link></li>
                <li><Link to={ROUTES.DELETE_PAGES} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Delete Pages</Link> & <Link to={ROUTES.EXTRACT_PAGES} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Extract Pages</Link></li>
                <li><Link to={ROUTES.ADD_BLANK} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Add Blank Page</Link></li>
              </ul>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="p-1 rounded-lg bg-sky-500/10 text-sky-500">🛡️</span>
                Privacy & Security
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Scrub sensitive data and protect files with encryption:
              </p>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
                <li><Link to={ROUTES.SANITIZE_PDF} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Sanitize PDF</Link> (Strip author, GPS & XMP)</li>
                <li><Link to={ROUTES.EDIT_METADATA} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Edit PDF Metadata</Link></li>
                <li><Link to={ROUTES.PROTECT} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Protect PDF</Link> & <Link to={ROUTES.UNLOCK} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Unlock PDF</Link></li>
                <li><Link to={ROUTES.SIGN_PDF} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Free PDF e-Signatures</Link></li>
              </ul>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-500/10 text-purple-500">🔄</span>
                Conversion & Styling
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Transform formats and stamp custom graphics:
              </p>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
                <li><Link to={ROUTES.IMG_TO_PDF} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Image to PDF</Link> & <Link to={ROUTES.PDF_TO_IMG} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">PDF to Image</Link></li>
                <li><Link to={ROUTES.PDF_TO_MARKDOWN} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">PDF to Markdown</Link></li>
                <li><Link to={ROUTES.WATERMARK} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Watermark PDF</Link> & <Link to={ROUTES.PAGE_NUMBERS} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Page Numbers</Link></li>
                <li><Link to={ROUTES.GRAYSCALE} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Grayscale PDF</Link> & <Link to={ROUTES.FLATTEN} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Flatten PDF</Link></li>
              </ul>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-6 rounded-2xl space-y-3 shadow-sm">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500">⚡</span>
                OCR & Intelligence
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Extract text and analyze contents privately:
              </p>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside">
                <li><Link to={ROUTES.OCR_PDF} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">OCR PDF Text Extractor</Link></li>
                <li><Link to={ROUTES.AI_ANALYZE} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">AI Analyze PDF</Link> (Local Document Insights)</li>
                <li><Link to={ROUTES.REPAIR} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Repair PDF Structure</Link></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Who Runs PdfMinty */}
        <section className="bg-surface-container-low border border-border-muted p-6 sm:p-8 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <Code2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface">
              Who Runs PdfMinty
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            PdfMinty is designed, built, and maintained by an <strong className="text-on-surface">independent software developer</strong> passionate about web security, browser technology, and digital privacy rights.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Unlike large corporate SaaS providers driven by aggressive monthly subscriptions, venture capital demands, or invasive tracking scripts, PdfMinty is operated independently with a lean, user-centric approach. Being an independent developer allows full focus on what truly matters: absolute privacy, zero network latency, clean design, and 100% free accessibility.
          </p>
        </section>

        {/* Section 4: Our Mission & Core Values */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-on-surface">
                Our Mission & Core Values
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                The core principles that guide every feature we build
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-low border border-border-muted p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Client-Side Privacy</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Zero server uploads. Your documents remain securely buffered inside your browser's local memory at all times.
              </p>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-sky-500 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Free & Unlimited Access</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                All 22+ utilities are completely free without hidden paywalls, subscription traps, or mandatory account creation.
              </p>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-purple-500 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>WebAssembly Performance</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Powered by modern browser technology to process files in seconds without internet upload bottlenecks.
              </p>
            </div>

            <div className="bg-surface-container-low border border-border-muted p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>Transparency & Trust</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Clear policies, straightforward tools, and open communication with our global user community.
              </p>
            </div>
          </div>
        </section>

        {/* Location 3: Tools We Trust & Recommend */}
        <section className="bg-surface-container-low border border-border-muted p-6 sm:p-8 rounded-2xl space-y-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface">
              Tools We Trust & Recommend
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
            At PdfMinty, we believe in privacy-first tools. Here are services we personally use and recommend to our community:
          </p>
          <ul className="space-y-3.5 pt-1">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <a
                  href={NORD_AFFILIATE_LINKS.NORDVPN}
                  target="_blank"
                  rel="nofollow sponsored"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  NordVPN
                </a>
                <span className="text-on-surface-variant font-medium">: For secure browsing and online privacy</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <a
                  href={NORD_AFFILIATE_LINKS.NORDPASS}
                  target="_blank"
                  rel="nofollow sponsored"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  NordPass
                </a>
                <span className="text-on-surface-variant font-medium">: For password management and security</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <a
                  href={NORD_AFFILIATE_LINKS.NORDVPN_ARABIA}
                  target="_blank"
                  rel="nofollow sponsored"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  NordVPN Arabia
                </a>
                <span className="text-on-surface-variant font-medium">: For users in the Middle East region</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <a
                  href={NORD_AFFILIATE_LINKS.THREAT_PROTECTION}
                  target="_blank"
                  rel="nofollow sponsored"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Threat Protection
                </a>
                <span className="text-on-surface-variant font-medium">: For complete online security</span>
              </div>
            </li>
          </ul>
        </section>

        {/* Section 5: Get in Touch & Support */}
        <section className="bg-surface-container-high border border-border-muted p-6 sm:p-8 rounded-2xl space-y-5 shadow-sm text-center">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl font-extrabold text-on-surface">
              Have Questions or Feedback?
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              We are constantly refining PdfMinty and adding new browser-based utilities. If you have questions, feedback, security inquiries, or feature suggestions, we'd love to hear from you.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md"
            >
              <Mail className="w-4.5 h-4.5" />
              <span>Contact Us</span>
            </Link>
            <a
              href="mailto:pdfminty@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-low border border-border-muted hover:border-emerald-500/40 text-on-surface font-bold text-sm transition-all shadow-sm"
            >
              <Mail className="w-4.5 h-4.5 text-emerald-500" />
              <span>pdfminty@gmail.com</span>
            </a>
            <a
              href="https://pdfminty.com"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-lowest border border-border-muted text-on-surface hover:border-emerald-500/50 font-bold text-sm transition-all shadow-sm"
            >
              <Globe className="w-4.5 h-4.5 text-emerald-500" />
              <span>https://pdfminty.com</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
