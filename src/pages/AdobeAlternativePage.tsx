import {
  ArrowRight,
  Lock,
  Layers,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Scissors,
  RotateCw,
  Trash2,
  Stamp,
  Hash,
  PlusSquare,
  KeyRound,
  Image,
  FileImage,
  Bot,
  Minimize2,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';

export const AdobeAlternativePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const tasks = [
    {
      title: 'Merging files before you send them',
      href: ROUTES.MERGE,
      icon: Layers,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Splitting a large PDF into sections',
      href: ROUTES.SPLIT,
      icon: Scissors,
      color: 'text-sky-500 bg-sky-500/10',
    },
    {
      title: 'Shrinking a file for an email attachment limit',
      href: ROUTES.GRAYSCALE,
      icon: Minimize2,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      title: 'Fixing page orientation',
      href: ROUTES.ROTATE,
      icon: RotateCw,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: "Removing a page you don't need",
      href: ROUTES.DELETE_PAGES,
      icon: Trash2,
      color: 'text-rose-500 bg-rose-500/10',
    },
    {
      title: 'Adding a watermark or stamp',
      href: ROUTES.WATERMARK,
      icon: Stamp,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      title: 'Numbering pages',
      href: ROUTES.PAGE_NUMBERS,
      icon: Hash,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Inserting a blank page',
      href: ROUTES.ADD_BLANK,
      icon: PlusSquare,
      color: 'text-teal-500 bg-teal-500/10',
    },
    {
      title: 'Password-protecting a sensitive file',
      href: ROUTES.PROTECT,
      icon: Lock,
      color: 'text-emerald-600 bg-emerald-600/10',
    },
    {
      title: 'Removing a password you own',
      href: ROUTES.UNLOCK,
      icon: KeyRound,
      color: 'text-cyan-500 bg-cyan-500/10',
    },
    {
      title: 'Turning images into a PDF',
      href: ROUTES.IMG_TO_PDF,
      icon: Image,
      color: 'text-orange-500 bg-orange-500/10',
    },
    {
      title: 'Turning PDF pages into images',
      href: ROUTES.PDF_TO_IMG,
      icon: FileImage,
      color: 'text-pink-500 bg-pink-500/10',
    },
    {
      title: "Asking questions about a PDF's content",
      href: ROUTES.AI_ANALYZE,
      icon: Bot,
      color: 'text-violet-500 bg-violet-500/10',
    },
  ];

  const faqs = [
    {
      q: 'Is PDFMinty really free, or is there a paid tier later?',
      a: "Every tool on PDFMinty is free with no account and no watermark. There's no hidden upgrade wall, monthly subscription, or credit-card required.",
    },
    {
      q: 'Do I need to sign up or install anything?',
      a: 'No. Open the tool in your browser and use it. Nothing to download, nothing to register, and no background software daemons running on your machine.',
    },
    {
      q: 'Where do my files go when I use PDFMinty?',
      a: 'Nowhere but your own device for standard PDF tools. Processing happens locally in your browser memory via WebAssembly without cloud file uploads.',
    },
    {
      q: 'Can PDFMinty fully replace Adobe Acrobat?',
      a: "For merging, splitting, compressing, rotating, watermarking, password protection, metadata sanitization, and image/PDF conversion — yes, for virtually all everyday office tasks. If you strictly require commercial prepress CMYK color separations, legacy XFA dynamic forms, or hardware PKI smartcards, retain Acrobat.",
    },
    {
      q: 'Is a browser-based tool as safe as a desktop app?',
      a: "Since your file never leaves your device, there's no upload step and no server storing a copy of your document — see our related post on PDF tool security for the full picture, including the limits of that claim.",
    },
    {
      q: 'Does PDFMinty work when offline or on an airplane?',
      a: 'Yes! PDFMinty is built as a Progressive Web App (PWA). Once loaded in your browser, its WebAssembly engine and scripts are cached by the browser Service Worker, allowing full offline execution without Wi-Fi.',
    },
    {
      q: 'Are electronic signatures made on PDFMinty legally valid?',
      a: 'Yes. Under the US ESIGN Act and EU eIDAS regulations for Simple Electronic Signatures (SES), signatures drawn and flattened directly into documents carry full legal enforceability for standard agreements and NDAs.',
    },
    {
      q: 'How does client-side compression achieve up to 80% file size reduction?',
      a: 'By converting heavy color profiles to grayscale, resampling raster images to high-density screen resolutions, and applying lossless Flate stream compression entirely in local browser memory.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        slug="adobe-acrobat-alternative"
        titleOverride="Free Adobe Acrobat Alternative — No Signup, No Upload"
        descriptionOverride="Adobe Acrobat costs ~$240/year. PDFMinty does merge, compress, split, protect, and more — 100% free, no account, no file uploads, ever."
      />

      <div className="max-w-4xl mx-auto space-y-16" id="adobe_alternative_container">
        {/* Navigation back link */}
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All PDF Tools</span>
        </Link>

        {/* Hero Section */}
        <header className="text-center space-y-6 pt-2 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Free Adobe Acrobat Alternative</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-tight max-w-3xl mx-auto">
            Adobe Acrobat costs <span className="text-rose-500 line-through">$240/year</span>. PDFMinty costs <span className="text-emerald-500">$0 — forever</span>.
          </h1>

          <p className="text-base sm:text-xl font-medium text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Merge, split, compress, protect, and convert PDFs without an Adobe account, without a subscription, and without your files ever leaving your device.
          </p>

          <div className="pt-4 flex flex-col items-center gap-4">
            <a
              href="#pick-your-task"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Start with any tool</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <div className="text-xs sm:text-sm font-semibold text-on-surface-variant/80 flex flex-wrap justify-center items-center gap-2 sm:gap-3 pt-2">
              <span>No account required</span>
              <span className="text-border-muted">•</span>
              <span>No file uploads</span>
              <span className="text-border-muted">•</span>
              <span>No watermarks</span>
              <span className="text-border-muted">•</span>
              <span>No subscription</span>
            </div>
          </div>
        </header>

        {/* Section 1 — The honest comparison */}
        <section className="space-y-6 bg-surface-container-low border border-border-muted rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              The Honest Comparison: Adobe Acrobat Pro vs. PDFMinty
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
              "Honest" is the operative word — a table that overclaims will get called out in a review or a Reddit thread, and that costs more trust than it gains.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-border-muted bg-surface">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-muted bg-surface-container-high/60">
                  <th className="py-4 px-4 sm:px-6 font-bold text-on-surface">Feature</th>
                  <th className="py-4 px-4 sm:px-6 font-bold text-on-surface w-1/3">Adobe Acrobat Pro</th>
                  <th className="py-4 px-4 sm:px-6 font-bold text-emerald-600 dark:text-emerald-400 w-1/3 bg-emerald-500/5">
                    PDFMinty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-on-surface-variant font-medium">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Annual Price</td>
                  <td className="py-3.5 px-4 sm:px-6 text-rose-500 font-bold">~$19.99/mo ($239.88/yr)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/5">
                    $0 — 100% Free Forever
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Account Required</td>
                  <td className="py-3.5 px-4 sm:px-6">Mandatory Adobe ID</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5">
                    No Signups or Logins Required
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Files Leave Your Device</td>
                  <td className="py-3.5 px-4 sm:px-6">Yes (Cloud sync & telemetry)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5">
                    No — 100% in-browser memory sandbox
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Setup / Installation</td>
                  <td className="py-3.5 px-4 sm:px-6">2+ GB desktop app + Creative Cloud daemon</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5">
                    Zero install — instant WebAssembly
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Merge Multiple PDFs</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅ Combine Files</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅ Visual Page Reordering</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Split & Page Range Extraction</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅ Organize Pages</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅ Visual Page Selection</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Grayscale & Compression</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅ Raster Resampling</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅ Stream Deflate + B&W (50-80% shrink)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Rotate & Delete Pages</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Watermark, Page Numbers, Blank Pages</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Password Protect & Unlock</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅ AES-128 / AES-256</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5">
                    ✅ Client-Side AES Encryption & Unlock
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Metadata Scrubbing & Sanitization</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅ Sanitize Document</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5">
                    ✅ Scrubs Authors, GPS & Printers
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Image ↔ PDF Conversion</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅ High-DPI Canvas Rendering</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Electronic Signature Stamping</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅ Adobe Acrobat Sign</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅ Draw, Type, Stamp & Flatten</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">Offline Capability</td>
                  <td className="py-3.5 px-4 sm:px-6 text-amber-500">Requires 30-day online check</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500 bg-emerald-500/5">✅ 100% Offline (PWA Service Worker)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-on-surface">
                    Commercial Prepress CMYK Trapping & XFA Dynamic XML Forms
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-500">✅</td>
                  <td className="py-3.5 px-4 sm:px-6 text-on-surface-variant font-medium bg-emerald-500/5">
                    Not supported — use Acrobat for offset printing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Total Cost of Ownership (TCO) Breakdown */}
        <section className="space-y-6 bg-surface-container-low border border-border-muted rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Total Cost of Ownership (TCO): Adobe Acrobat vs. PDFMinty
            </h2>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
              When evaluated across multi-year operating horizons, paying recurring SaaS fees for routine PDF administrative tasks creates massive financial waste:
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border-muted bg-surface">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-muted bg-surface-container-high/60">
                  <th className="py-3.5 px-4 font-bold text-on-surface">Team Size</th>
                  <th className="py-3.5 px-4 font-bold text-on-surface">1 Year (Adobe Pro)</th>
                  <th className="py-3.5 px-4 font-bold text-on-surface">3 Years (Adobe Pro)</th>
                  <th className="py-3.5 px-4 font-bold text-on-surface">5 Years (Adobe Pro)</th>
                  <th className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    5 Years (PDFMinty)
                  </th>
                  <th className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">Total Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-on-surface-variant font-medium">
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">1 Solo User / Freelancer</td>
                  <td className="py-3 px-4">$239.88</td>
                  <td className="py-3 px-4">$719.64</td>
                  <td className="py-3 px-4 text-rose-500 font-bold">$1,199.40</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/5">$0.00</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">+$1,199.40</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">5-Person Small Office</td>
                  <td className="py-3 px-4">$1,439.40</td>
                  <td className="py-3 px-4">$4,318.20</td>
                  <td className="py-3 px-4 text-rose-500 font-bold">$7,197.00</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/5">$0.00</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">+$7,197.00</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">20-Person Department</td>
                  <td className="py-3 px-4">$5,757.60</td>
                  <td className="py-3 px-4">$17,272.80</td>
                  <td className="py-3 px-4 text-rose-500 font-bold">$28,788.00</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/5">$0.00</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">+$28,788.00</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-on-surface">50-Person Company</td>
                  <td className="py-3 px-4">$14,394.00</td>
                  <td className="py-3 px-4">$43,182.00</td>
                  <td className="py-3 px-4 text-rose-500 font-bold">$71,970.00</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/5">$0.00</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">+$71,970.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium leading-relaxed">
            * Plus Adobe's 50% early termination fee on remaining contracts and the sunset of perpetual licenses like Acrobat 2020. With PDFMinty, you get zero contracts, zero recurring invoices, and zero upgrade walls.
          </p>
        </section>

        {/* Section 2 — Why people are switching right now */}
        <section className="space-y-6 bg-surface-container-low border border-border-muted rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Why people are switching right now
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-on-surface-variant leading-relaxed font-medium">
            <p>
              Adobe Acrobat's subscription price has been a recurring complaint for years, and it hasn't gotten cheaper. If you only need the PDF tasks most people actually do — combining files before sending them, shrinking a file to fit an email limit, pulling out a few pages, adding a signature or a password — a full Creative Cloud subscription is a lot of tool for a small job.
            </p>
            <p>
              PDFMinty covers the tasks that make up the bulk of everyday PDF work, and does it entirely in your browser: nothing is uploaded to a server, so there's nothing to wait on and nothing to worry about later.
            </p>
          </div>
        </section>

        {/* Section 3 — Pick your task */}
        <section id="pick-your-task" className="space-y-6 scroll-mt-20">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Pick your task
            </h2>
            <p className="text-sm text-on-surface-variant font-medium">
              Click any tool below to launch it instantly in your browser:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {tasks.map((t, idx) => {
              const IconComp = t.icon;
              return (
                <Link
                  key={idx}
                  to={t.href}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-border-muted hover:border-emerald-500/50 hover:shadow-md transition-all decoration-none"
                >
                  <div className="flex items-center gap-3.5 pr-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-on-surface group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {t.title}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Deep Analysis: Architectural and Economic Comparison */}
        <section className="bg-surface-container-low border border-border-muted rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-on-surface" id="adobe_in_depth_comparison">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Professionals & Teams Are Moving Away From Subscription PDF Suites
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              For decades, Adobe Acrobat Pro has remained the enterprise default for PDF manipulation. However, annual subscription costs exceeding $240/year per user, heavy background telemetry processes, and forced cloud synchronizations have prompted businesses, researchers, and individuals to adopt lightweight, client-side alternatives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-border-muted space-y-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                The Hidden Cost of Legacy PDF Software
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Standard desktop PDF editors require multi-gigabyte installations, continuous licensing verification checks, and mandatory document uploading for basic tasks like document compression or mobile sharing. For teams that only require standard merge, split, annotate, and sanitize capabilities, this creates substantial recurring overhead.
              </p>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-border-muted space-y-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                The WebAssembly Privacy Revolution
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                PdfMinty utilizes compiled WebAssembly binaries (`pdf-lib`, `pdfjs-dist`) that execute locally inside your web browser sandbox. You achieve near-native execution speed without installing desktop binaries or risking document confidentiality across external cloud servers.
              </p>
            </div>
          </div>

          {/* Architectural 3 Generations */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-on-surface">The 3 Generations of PDF Tools: Why WebAssembly Changes Everything</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-surface border border-border-muted space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500">Gen 1: Desktop Monoliths</span>
                <h4 className="font-bold text-sm text-on-surface">Adobe Acrobat, Foxit, Nitro</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  2GB+ desktop installers, persistent background licensing daemons, OS privilege elevation, and frequent security vulnerabilities requiring emergency patching.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border-muted space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500">Gen 2: Cloud Converters</span>
                <h4 className="font-bold text-sm text-on-surface">Smallpdf, iLovePDF, Soda</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Zero install, but forces uploading sensitive bank records, contracts, and tax filings to remote multi-tenant servers, violating GDPR Art. 28 and HIPAA compliance rules.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Gen 3: Client WebAssembly</span>
                <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-300">PDFMinty</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Instant in-browser execution with zero uploads. Byte manipulation occurs in your device's memory sandbox via compiled WebAssembly with full offline PWA support.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">When Is Acrobat Still Necessary?</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              We believe in honest technology recommendations. You should retain Adobe Acrobat Pro if your workflow strictly requires:
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-on-surface-variant space-y-1.5">
              <li>Complex dynamic XML Forms Architecture (XFA) processing.</li>
              <li>Enterprise-level multi-signer routing workflows with strict cryptographic hardware token authentication.</li>
              <li>High-end prepress color separation and commercial print offset calibrations.</li>
            </ul>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              For everyday document handling—such as merging reports, extracting confidential pages, redacting metadata, or adding signatures—PdfMinty provides an instant, zero-cost, and private solution.
            </p>
          </div>
        </section>

        {/* Section 4 — FAQ */}
        <section className="space-y-6 bg-surface-container-low border border-border-muted rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
                Everything you need to know about switching from Adobe Acrobat to PDFMinty
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border-muted bg-surface overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-on-surface hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-on-surface-variant transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium border-t border-border-muted/50">
                      {i === 4 ? (
                        <p>
                          Since your file never leaves your device, there's no upload step and no server storing a copy of your document — see our related post on{' '}
                          <Link
                            to={ROUTES.ADOBE_SECURITY_ARTICLE}
                            className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-500"
                          >
                            PDF tool security
                          </Link>{' '}
                          for the full picture, including the limits of that claim.
                        </p>
                      ) : (
                        <p>{faq.a}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="text-center bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Stop paying to move pages around.
          </h2>
          <p className="text-base sm:text-lg font-bold text-emerald-100 max-w-xl mx-auto">
            Every tool. No account. No upload. No cost.
          </p>
          <div className="pt-2">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-900 dark:!bg-white dark:!text-emerald-900 hover:dark:!bg-emerald-50 font-black text-base rounded-2xl transition-all shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-100"
            >
              <span>Try PDFMinty →</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdobeAlternativePage;
