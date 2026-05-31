import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayout } from "../components/Layout";
import Sparkles from "lucide-react/icons/sparkles";
import Shield from "lucide-react/icons/shield";
import ChevronUp from "lucide-react/icons/chevron-up";
import ChevronDown from "lucide-react/icons/chevron-down";
import { prefetchToolChunk } from "../core/utils";

export default function HomePage() {
  const navigate = useNavigate();
  const { toolsList } = useLayout();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="animate-fadein relative z-10 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-5 leading-none">
          <Sparkles className="w-3 h-3 animate-pulse text-emerald-500" />{" "}
          WebAssembly & Client-Side Sandbox Active
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4 font-sans">
          Full-Featured Professional{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-extrabold">
            PDF Studio
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
          Modify, protect, transform, and number your confidential
          papers with professional visual previews completely
          in-browser. Zero servers. Zero CORS/CSP timeouts. Complete
          offline independence.
        </p>
      </div>

      {/* Grid of Modular Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsList.map((tool) => {
          const Icon = tool.icon;

          // Beautiful badges for high-conversion realistic look
          let badge = null;
          if (tool.id === "merge")
            badge = {
              text: "POPULAR",
              color:
                "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60",
            };
          else if (tool.id === "compress")
            badge = {
              text: "SMART REDUCTION",
              color:
                "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-800/60",
            };
          else if (tool.id === "ai-analyze")
            badge = {
              text: "AI HYBRID",
              color:
                "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/60",
            };
          else if (tool.id === "protect")
            badge = {
              text: "OFFLINE AES",
              color:
                "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800/60",
            };
          else if (tool.id === "img-to-pdf")
            badge = {
              text: "FAST CONVERT",
              color:
                "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800/60",
            };
          else if (tool.id === "delete-pages")
            badge = {
              text: "EXTRACTOR",
              color:
                "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800/60",
            };

          return (
            <button
              type="button"
              key={tool.id}
              id={`tool-card-${tool.id}`}
              onClick={() => {
                window.scrollTo(0, 0);
                navigate(`/${tool.slug}`);
              }}
              onMouseEnter={() => prefetchToolChunk(tool.slug)}
              onFocus={() => prefetchToolChunk(tool.slug)}
              className="p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-emerald-500/30 dark:hover:border-emerald-500/50 hover:ring-4 hover:ring-emerald-500/5 dark:hover:ring-emerald-500/10 cursor-pointer hover:shadow-[0_12px_30px_rgba(16,185,129,0.06)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 group text-left relative overflow-hidden flex flex-col justify-between animate-fadein focus:outline-none"
            >
              <div>
                {/* Top bar with icon and dynamic badge */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border ${tool.color}`}
                  >
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  {badge && (
                    <span
                      className={`text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded-full border ${badge.color}`}
                    >
                      {badge.text}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 leading-snug mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                  {tool.description}
                </p>
              </div>

              {/* Launch tool tag */}
              <div className="mt-4 flex items-center gap-1.5 text-xs text-transparent group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all font-bold">
                Launch tool{" "}
                <span className="translate-x-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* How PDFMinty Works */}
      <div className="mt-20 relative z-20">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight mb-2">
          How PDFMinty Works
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">
          Three simple steps to manage your documents
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div
            id="step-1-card"
            className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">
              1
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              Select Files
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
              Choose your PDF files from your computer or mobile device.
              Files are stored entirely temporarily in your browser's
              IndexedDB storage.
            </p>
          </div>

          <div
            id="step-2-card"
            className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">
              2
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              Process Locally
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
              Our browser-based engine handles the work. They are never
              sent to any external server or third-party service.
            </p>
          </div>

          <div
            id="step-3-card"
            className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">
              3
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              Download & Clean
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
              Get your processed PDF instantly. All temporary data is
              cleared automatically when you close the browser tab.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose PDFMinty? */}
      <div className="mt-20 relative z-20">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight mb-2">
          Why Choose PDFMinty?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">
          Professional grade tools without the premium price tag.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            id="why-card-1"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center mb-5 shadow-sm">
              <Shield className="w-6 h-6 text-sky-500 dark:text-sky-400 fill-sky-500/10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              100% Private
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
              Your files never leave your device. All processing happens
              locally in your browser.
            </p>
          </div>

          <div
            id="why-card-2"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center mb-5 shadow-sm">
              <span className="text-amber-500 font-bold text-xl leading-none">
                ⚡
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              Lightning Fast
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
              No waiting for uploads or downloads. Get your results
              instantly.
            </p>
          </div>

          <div
            id="why-card-3"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center mb-5 shadow-sm">
              <span className="bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-black tracking-widest px-2.5 py-1 rounded shadow-sm">
                FREE
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              Completely Free
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
              No hidden fees, no subscriptions, and no watermarks on
              your documents.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div
        id="faq-section"
        className="mt-20 max-w-4xl mx-auto relative z-20"
      >
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight mb-8 font-sans">
          Frequently Asked Questions / Privacy & Security
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "Privacy & Security: Are my files safe?",
              a: "Yes, completely! PDFMinty operates 100% client-side. Your files are processed local to your browser using safe WebAssembly and JavaScript compilation. They are never transmitted to any external server or stored anywhere online.",
            },
            {
              q: "Is it really free?",
              a: "Yes, PDFMinty is 100% free with no premium subscriptions, no lockouts, and no watermarks. We believe professional formatting utilities should be accessible to everyone.",
            },
            {
              q: "Do I need to install anything?",
              a: "No installation is required. PDFMinty runs directly in any modern device browser (Chrome, Safari, Firefox, Edge) both on desktop and mobile platforms.",
            },
            {
              q: "Does it work offline?",
              a: "Yes! Because the application uses persistent client-side caching of workers and libraries, you can continue loading and processing your documents even without an active internet connection.",
            },
          ].map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className="border border-slate-200/85 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-slate-705 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-emerald-400 font-sans border-0 font-bold bg-transparent focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-48 border-t border-slate-100 dark:border-slate-800" : "max-h-0"}`}
                >
                  <p className="p-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/30 dark:bg-slate-950/30 font-medium select-text">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Banner */}
      <div
        id="cta-banner"
        className="mt-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 text-white rounded-3xl p-8 md:p-12 text-center shadow-xl relative z-20 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Ready to Mint Your PDF?
          </h2>
          <p className="text-indigo-100 text-sm md:text-base font-normal mb-8">
            Experience the fastest and most secure PDF tools today.
          </p>
          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="bg-white text-indigo-700 hover:bg-slate-100 px-8 py-3.5 rounded-full text-sm font-extrabold tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-0"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
}
