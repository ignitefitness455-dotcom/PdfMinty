import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLayout } from "../components/Layout";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Shield,
  ChevronUp,
  ChevronDown,
  UserX,
  Gift,
  Layers,
  WifiOff,
  Zap,
  Star,
  MessageSquare,
} from "lucide-react";
import { prefetchToolChunk } from "../core/utils";
import { useDebounce } from "../hooks/useDebounce";
import { SearchComponent } from "../components/SearchComponent";
import { ToolWorkspace } from "../components/ToolWorkspace";
import { ToolExplanation } from "../components/ToolExplanation";

export default function HomePage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toolsList } = useLayout();
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentTool = useMemo(() => {
    const segments = pathname.toLowerCase().split("/").filter(Boolean);
    return toolsList.find((t) => segments.includes(t.slug.toLowerCase()));
  }, [toolsList, pathname]);

  const [testimonials, setTestimonials] = useState<Array<{
    rating: number;
    comment: string;
    displayEmail: string | null;
    timestamp: string;
  }>>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && Array.isArray(data.reviews)) {
          setTestimonials(data.reviews);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTestimonialsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const getAvatarColor = (char: string): string => {
    const colors = [
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
      "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-305",
      "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
      "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
      "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    ];
    const code = char.toUpperCase().charCodeAt(0) || 65;
    return colors[code % colors.length];
  };

  const formatRelativeTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return "";
    }
  };

  const debouncedValue = useDebounce(searchQuery, 300);
  const isDebouncing = false;

  const rankedOrder = useMemo(() => [
    "merge",
    "compress",
    "split",
    "reorder",
    "extract",
    "img-to-pdf",
    "pdf-to-img",
    "delete-pages",
    "rotate",
    "watermark",
    "page-numbers",
    "protect",
    "unlock",
    "add-blank",
    "ai-analyze"
  ], []);

  const sortedTools = useMemo(() => {
    return [...toolsList].sort((a, b) => {
      const indexA = rankedOrder.indexOf(a.id);
      const indexB = rankedOrder.indexOf(b.id);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }, [toolsList, rankedOrder]);

  const filteredTools = useMemo(() => {
    const cleanQuery = debouncedValue.toLowerCase().trim();
    if (!cleanQuery) return sortedTools;
    return sortedTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery)
    );
  }, [sortedTools, debouncedValue]);

  if (currentTool) {
    return (
      <div className="space-y-12">
        <ToolWorkspace tool={currentTool} />
        <ToolExplanation />
      </div>
    );
  }

  return (
    <div className="animate-fadein relative z-10 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-5 leading-none">
          <Sparkles className="w-3 h-3 animate-pulse text-emerald-500" />{" "}
          WebAssembly & Client-Side Sandbox Active
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-4 font-sans">
          Free PDF Tools{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-extrabold">
            No Upload
          </span>
        </h1>
        <p className="text-slate-550 dark:text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
          PDFMinty is the best free client side pdf compressor and organizer that runs fully inside your browser. Here is how to combine pdf files offline free, how to make pdf file size smaller without losing quality, and extract pages from pdf file locally. Our package of free online pdf tools that don't upload files keeps your highly confidential contracts, worksheets, and invoices 100% secure with no accounts required.
        </p>
      </div>

      <div className="mb-12 max-w-md mx-auto">
        <SearchComponent
          value={searchQuery}
          onChange={setSearchQuery}
          isDebouncing={isDebouncing}
          placeholder={t("search_placeholder")}
        />
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg mx-auto bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-slate-600 dark:text-slate-300 font-extrabold text-base mb-2">{t("not_found_title")}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed font-semibold">
            {t("not_found_desc")}
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-xs text-white rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/15 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {t("clear_filter")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;

            let badge = null;
            if (tool.id === "merge")
              badge = {
                text: t("popular"),
                color:
                  "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60",
              };
            else if (tool.id === "compress")
              badge = {
                text: t("smart_reduction"),
                color:
                  "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-800/60",
              };
            else if (tool.id === "ai-analyze")
              badge = {
                text: t("ai_hybrid"),
                color:
                  "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/60",
              };
            else if (tool.id === "protect")
              badge = {
                text: t("offline_aes"),
                color:
                  "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-303 border-rose-100 dark:border-rose-800/60",
              };
            else if (tool.id === "img-to-pdf")
              badge = {
                text: t("fast_convert"),
                color:
                  "bg-amber-50 dark:bg-amber-955/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800/60",
              };
            else if (tool.id === "delete-pages")
              badge = {
                text: t("extractor"),
                color:
                  "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-303 border-blue-105 dark:border-blue-800/60",
              };
            else if (tool.id === "reorder")
              badge = {
                text: "ORGANIZER",
                color:
                  "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/60",
              };
            else if (tool.id === "extract")
              badge = {
                text: "VISUAL",
                color:
                  "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-800/60",
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
                className="p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-emerald-500/30 dark:hover:border-emerald-500/50 hover:ring-4 hover:ring-emerald-500/5 dark:hover:ring-emerald-500/10 cursor-pointer hover:shadow-[0_12px_30px_rgba(16,185,129,0.06)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 group text-start relative overflow-hidden flex flex-col justify-between animate-fadein focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500"
              >
                <div>
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
                  <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-transparent group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all font-bold">
                  {t("launch_tool")}{" "}
                  <span className="translate-x-0 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-20 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900/40 relative overflow-hidden z-20 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black tracking-widest uppercase">
            Performance-Optimized Rendering
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
            Privacy-First Desktop Workspace Interface
          </h2>
          <p className="text-xs md:text-sm text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
            Experience flawless speed. PDFMinty deploys responsive inline SVGs alongside our modular OptimizedImage component. By delivering highly compressed WebP graphics with traditional PNG fallbacks, we guarantee zero load layout shifts and perfect viewport adaptiveness across mobile and desktop displays.
          </p>
        </div>
        <div className="w-full md:w-80 shrink-0 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg bg-slate-950 p-4 aspect-square flex flex-col justify-between font-mono text-[10px] text-slate-400 select-none relative group transition-transform duration-500 hover:scale-102">
          {/* Mock Browser/Workspace UI */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-400 font-extrabold tracking-wider shrink-0 uppercase">
              100% PRIVATE
            </span>
          </div>
          
          {/* Main workspace container */}
          <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden mb-2">
            {/* Mock Sidebar */}
            <div className="col-span-3 border-e border-slate-900 pe-1 flex flex-col gap-1.5 opacity-80 pt-1">
              <div className="h-1.5 bg-slate-800 rounded w-full"></div>
              <div className="h-1.5 bg-slate-800/60 rounded w-5/6"></div>
              <div className="h-1.5 bg-slate-800/60 rounded w-3/4"></div>
              <div className="h-1.5 bg-slate-800/30 rounded w-5/6"></div>
              <div className="mt-auto h-5 bg-emerald-500/10 border border-emerald-500/35 rounded-md flex items-center justify-center text-[7px] text-emerald-400 font-black animate-pulse hover:bg-emerald-500/20 transition-all">
                MINT PDF
              </div>
            </div>
            {/* Mock Canvas/Previews */}
            <div className="col-span-9 bg-slate-900/40 rounded-xl p-2 flex flex-col gap-2 relative overflow-hidden border border-slate-900">
              <div className="text-[8px] text-slate-500 font-bold flex items-center justify-between">
                <span>document_work.pdf</span>
                <span className="text-[7px] text-slate-400 bg-slate-800/80 px-1 py-0.5 rounded font-mono">3 Pages</span>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-1.5 items-center">
                {/* Page 1 */}
                <div className="border border-emerald-500/45 bg-emerald-500/5 rounded-lg p-1 flex flex-col justify-between aspect-[3/4] shadow-[0_4px_12px_rgba(16,185,129,0.06)] cursor-pointer hover:border-emerald-400 hover:scale-105 transition-all">
                  <div className="h-1 bg-emerald-500/20 rounded w-2/3"></div>
                  <div className="h-1 bg-emerald-500/10 rounded w-full"></div>
                  <div className="h-1 bg-emerald-500/10 rounded w-1/2"></div>
                  <div className="text-[7px] text-emerald-400 font-black text-center mt-1">PAGE 1</div>
                </div>
                {/* Page 2 */}
                <div className="border border-slate-800/80 bg-slate-900/60 rounded-lg p-1 flex flex-col justify-between aspect-[3/4] cursor-pointer hover:border-slate-700 hover:scale-105 transition-all">
                  <div className="h-1 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-1 bg-slate-800 rounded w-4/5"></div>
                  <div className="h-1 bg-slate-800 rounded w-1/3"></div>
                  <div className="text-[7px] text-slate-500 font-bold text-center mt-1">PAGE 2</div>
                </div>
                {/* Page 3 */}
                <div className="border border-slate-800/80 bg-slate-900/60 rounded-lg p-1 flex flex-col justify-between aspect-[3/4] cursor-pointer hover:border-slate-700 hover:scale-105 transition-all">
                  <div className="h-1 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-1 bg-slate-800/70 rounded w-1/2"></div>
                  <div className="h-1 bg-slate-800/70 rounded w-2/3"></div>
                  <div className="text-[7px] text-slate-500 font-bold text-center mt-1 flex items-center justify-between px-0.5">
                    <span>PAGE 3</span>
                    <span className="text-[6px] text-emerald-400">↻</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between border-t border-slate-900 pt-2.5 text-[8px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Secure local computation (CPU & Wasm)
            </span>
            <span>v1.0.0</span>
          </div>

          {/* Decorative glowing gradient sphere in backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
        </div>
      </div>

      <div className="mt-20 relative z-20">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight mb-2">
          {t("how_it_works_title")}
        </h2>
        <p className="text-slate-505 dark:text-slate-400 text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">
          {t("how_it_works_desc")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div
            id="step-1-card"
            className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">
              1
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              {t("step_1_title")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-semibold">
              {t("step_1_desc")}
            </p>
          </div>

          <div
            id="step-2-card"
            className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">
              2
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              {t("step_2_title")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-semibold">
              {t("step_2_desc")}
            </p>
          </div>

          <div
            id="step-3-card"
            className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-indigo-600/10">
              3
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">
              {t("step_3_title")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-semibold">
              {t("step_3_desc")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20 relative z-20">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight mb-2">
          Why Choose PDFMinty?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">
          Professional grade tools without the premium price tag.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            id="why-card-privacy"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-955/40 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center mb-5 shadow-sm">
              <Shield className="w-6 h-6 text-sky-500 dark:text-sky-400 fill-sky-500/10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              Privacy First
            </h3>
            <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              All calculations run inside your browser cache so that none of your personal information, corporate ledgers, or private documents are leaked.
            </p>
          </div>

          <div
            id="why-card-account"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 flex items-center justify-center mb-5 shadow-sm">
              <UserX className="w-6 h-6 text-rose-500 dark:text-rose-455 fill-rose-500/10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              No Account
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Skip tedious signup screens and subscriptions—enjoy our full-featured toolkit with absolutely no email addresses, logins, or accounts needed.
            </p>
          </div>

          <div
            id="why-card-free"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-955/40 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center mb-5 shadow-sm">
              <Gift className="w-6 h-6 text-amber-505 dark:text-amber-450 fill-amber-550/10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              Completely Free
            </h3>
            <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Enjoy unlimited editing, compression, and division with no paywalls, hidden monthly fees, restricted trial counts, or watermarks.
            </p>
          </div>

          <div
            id="why-card-tools"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center mb-5 shadow-sm">
              <Layers className="w-6 h-6 text-indigo-500 dark:text-indigo-400 fill-indigo-500/10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              15 Tools
            </h3>
            <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Get complete document coverage with 15 local tools including Merge, Split, Reorder Pages, Extract Pages, Compress, Rotate, Watermark, and even private AI PDF Analysis.
            </p>
          </div>

          <div
            id="why-card-offline"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center mb-5 shadow-sm">
              <WifiOff className="w-6 h-6 text-emerald-555 dark:text-emerald-400 fill-emerald-500/10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              Works Offline
            </h3>
            <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Once loaded, our WebAssembly-powered engines operate without internet capability, enabling complete workflow independence on the go.
            </p>
          </div>

          <div
            id="why-card-processing"
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-sm text-center flex flex-col items-center hover:shadow-md dark:hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-955/40 flex items-center justify-center mb-5 shadow-sm">
              <Zap className="w-6 h-6 text-violet-505 dark:text-violet-400 fill-violet-500/10" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              Fast Processing
            </h3>
            <p className="text-slate-555 dark:text-slate-400 text-xs leading-relaxed font-semibold">
              Decode and compile large documents in milliseconds utilizing your native device's CPU instead of waiting for slow network queues.
            </p>
          </div>
        </div>

        <div className="mt-14 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 p-8 md:p-10 rounded-3xl relative overflow-hidden text-center z-20">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black tracking-widest uppercase">
              🛡️ Air-Gapped Sandbox Integrity
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              Why PDFMinty Is 100% Safe For Your Sensitive Data
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              PDFMinty is built on cutting-edge WebAssembly (Wasm) and local browser-side libraries to decode and construct PDFs directly in your device's memory. When you choose our online pdf tools privacy is guaranteed because your sensitive files never travel across the internet or touch remote servers. All text extractions, coordinate translations, and cryptographic protections run locally, delivering a seamless and 100% airtight document workspace on your native browser sandbox.
            </p>
          </div>
        </div>
      </div>

      {!testimonialsLoading && testimonials.length > 0 && (
        <div className="mt-20 relative z-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50/80 dark:bg-amber-955/40 border border-amber-100 dark:border-amber-800/40 rounded-full text-amber-600 dark:text-amber-450 text-xs font-semibold mb-4 leading-none">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              Real User Reviews
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-2">
              What Our Users Say
            </h2>
            <p className="text-slate-505 dark:text-slate-400 text-xs md:text-sm max-w-md mx-auto font-medium">
              Genuine feedback from people who use PDFMinty every day.
            </p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map((review, idx) => {
              const displayName = review.displayEmail
                ? review.displayEmail.split("@")[0]
                : "Anonymous";
              const avatarChar = displayName[0]?.toUpperCase() || "A";
              const avatarColor = getAvatarColor(avatarChar);
              const relativeTime = formatRelativeTime(review.timestamp);

              return (
                <div
                  key={idx}
                  className="break-inside-avoid bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300"
                >
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-start gap-2 mb-4">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                    <p className="text-slate-605 dark:text-slate-300 text-xs leading-relaxed font-semibold">
                      {review.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}
                    >
                      {avatarChar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-750 dark:text-slate-205 text-xs font-semibold truncate">
                        {review.displayEmail || "Anonymous User"}
                      </p>
                      {relativeTime && (
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">
                          {relativeTime}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div
        id="faq-section"
        className="mt-20 max-w-4xl mx-auto relative z-20"
      >
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-50 text-center tracking-tight mb-8 font-sans">
          {t("faq_title")}
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "Are online PDF tools safe to use?",
              a: "Most cloud services require you to upload personal worksheets, financial invoices, or legal contracts to remote databases, exposing you to dangerous hacks and data leaks. PDFMinty entirely redefines this model by processing files locally inside your browser sandbox. Your data remains fully encapsulated inside your personal device, making it the safest document utility online.",
            },
            {
              q: "Does PdfMinty upload my files?",
              a: "Never. PDFMinty operates 100% offline-first. When you compile, organize, compress, or crop pages, our client-side Web Workers execute every calculation directly in your browser cache. We do not host server storage or upload pathways for your raw files, guaranteeing absolute data confidentiality.",
            },
            {
              q: "Is PdfMinty completely free?",
              a: "Yes. Every single tool—including our state-of-the-art AI PDF Analyzer—is 100% free with no premium gatekeepers, mandatory subscription cycles, trial volume limits, or watermarks embedded on your outputs.",
            },
            {
              q: "Do I need to create an account?",
              a: "No. Since no processing takes place on external cloud servers, there is never a need to register, verify email addresses, or log into user accounts. You can access all professional features instantly from any device.",
            },
            {
              q: "Does PdfMinty work without internet?",
              a: "Yes, absolutely! Thanks to browser-level Service Workers and local script caching, you can open, reload, and fully operate all our offline tools even when disconnected from cellular or Wi-Fi network systems.",
            },
            {
              q: "What PDF tools does PdfMinty offer?",
              a: "PDFMinty is a comprehensive, client-side suite hosting 15 advanced tools. This includes PDF Merging, PDF Splitting, PDF Page Reordering, Page Extraction, Smart Compression, Rotation, Deleting Pages, Watermarking, Adding Blank Pages, Password Protection, Password Removal (Unlock), Image-to-PDF Conversion, PDF-to-Image Extraction, and our secure, local AI PDF Document Analyzer.",
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
                  className="w-full px-6 py-4 flex items-center justify-between text-start hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-slate-705 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-emerald-400 font-sans border-0 font-bold bg-transparent focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ms-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ms-4" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-56 border-t border-slate-100 dark:border-slate-800" : "max-h-0"}`}
                >
                  <p className="p-6 text-xs text-slate-505 dark:text-slate-400 leading-relaxed bg-slate-50/30 dark:bg-slate-950/30 font-medium select-text">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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