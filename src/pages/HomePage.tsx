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
  Merge,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  Bookmark,
  Hash,
  FilePlus,
  Lock,
  Image,
  Eye,
  CheckSquare,
  Move,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLayout } from '../components/Layout';
import { SEO } from '../components/SEO';
import { TOOLS } from '../config/seo-data';
import { useDebounce } from '../hooks/useDebounce';

// Translation hook to map translation keys properly
const useTranslation = () => {
  const translations: Record<string, string> = {
    search_placeholder: 'Search PDF tools...',
    not_found_title: 'No tools found',
    not_found_desc:
      "We couldn't find any tools matching your search. Try checking your spelling or search for something else.",
    clear_filter: 'Clear Search',
    popular: 'POPULAR',
    smart_reduction: 'SMART REDUCTION',
    ai_hybrid: 'AI HYBRID',
    offline_aes: 'OFFLINE AES',
    fast_convert: 'FAST CONVERT',
    extractor: 'EXTRACTOR',
    visual_extract: 'VISUAL EXTRACT',
    interactive_order: 'INTERACTIVE ORDER',
    launch_tool: 'Launch Tool',
    how_it_works_title: 'How It Works',
    how_it_works_desc: 'Three simple steps to process your files entirely inside your browser.',
    step_1_title: 'Select Tool',
    step_1_desc: 'Choose one of our free PDF tools to combine, split, or compress files.',
    step_2_title: 'Add Files',
    step_2_desc: 'Upload your documents directly. Your files never touch our servers.',
    step_3_title: 'Download',
    step_3_desc: 'Receive your processed document instantly with maximum privacy.',
  };
  return {
    t: (key: string) => translations[key] || key,
  };
};

const SearchComponent: React.FC<{
  value: string;
  onChange: (v: string) => void;
  isDebouncing: boolean;
  placeholder: string;
}> = ({ value, onChange, isDebouncing, placeholder }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border-muted bg-surface-container-low/50 backdrop-blur-md px-5 py-4 pr-12 text-sm text-primary placeholder-on-surface-variant/50 focus:border-security-green focus:outline-none focus:ring-4 focus:ring-security-green/10 transition-all duration-300"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isDebouncing && (
          <svg
            className="animate-spin h-4 w-4 text-security-green"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        <svg
          className="h-5 w-5 text-on-surface-variant/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

const prefetchMap: Record<string, () => Promise<any>> = {
  'merge-pdf': () => import('../pages/MergePage'),
  'split-pdf': () => import('../pages/SplitPage'),
  'compress-pdf': () => import('../pages/CompressPage'),
  'rotate-pdf': () => import('../pages/RotatePage'),
  'delete-pages-pdf': () => import('../pages/DeletePagesPage'),
  'extract-pages-pdf': () => import('../pages/ExtractPagesPdfPage'),
  'reorder-pdf': () => import('../pages/ReorderPdfPage'),
  'watermark-pdf': () => import('../pages/WatermarkPage'),
  'add-page-numbers': () => import('../pages/PageNumbersPage'),
  'add-blank-page': () => import('../pages/AddBlankPage'),
  'protect-pdf': () => import('../pages/ProtectPage'),
  'unlock-pdf': () => import('../pages/UnlockPage'),
  'image-to-pdf': () => import('../pages/ImgToPdfPage'),
  'pdf-to-image': () => import('../pages/PdfToImgPage'),
  'intelligence': () => import('../pages/AiAnalyzePage'),
};

const prefetchedSet = new Set<string>();

const prefetchToolChunk = (slug: string) => {
  const key = slug.toLowerCase();
  if (prefetchedSet.has(key)) return;
  prefetchedSet.add(key);
  const loader = prefetchMap[key];
  if (loader) {
    loader().catch((err) => console.debug('[prefetch] chunk error:', err));
  }
};

const iconMap: Record<string, React.ComponentType<any>> = {
  Merge,
  Scissors,
  CheckSquare,
  Move,
  Minimize2,
  RotateCw,
  Trash2,
  Bookmark,
  Hash,
  FilePlus,
  Shield,
  Lock,
  Image,
  Eye,
  Sparkles,
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { toolsList } = useLayout();
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { debouncedValue, isDebouncing } = useDebounce(searchQuery, 300);

  const sortedTools = useMemo(() => {
    return [...toolsList].sort((a, b) => {
      const toolA = TOOLS.find((t) => t.slug === a.slug);
      const toolB = TOOLS.find((t) => t.slug === b.slug);
      const rankA = toolA?.homeRank ?? 999;
      const rankB = toolB?.homeRank ?? 999;
      return rankA - rankB;
    });
  }, [toolsList]);

  const filteredTools = useMemo(() => {
    const cleanQuery = debouncedValue.toLowerCase().trim();
    if (!cleanQuery) return sortedTools;
    return sortedTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery)
    );
  }, [sortedTools, debouncedValue]);

  return (
    <div className="animate-fadein relative z-10 font-sans text-on-background bg-background pb-12 select-none overflow-x-hidden">
      <SEO />

      {/* Decorative Glow Elements */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[450px] bg-gradient-to-r from-security-green/10 via-primary-fixed/5 to-tertiary-fixed-dim/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto mb-16 relative pt-4">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-surface-container-low border border-border-muted rounded-full text-security-green text-xs font-bold mb-6 tracking-wide select-none shadow-lg">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-security-green" /> WebAssembly Client
          Sandbox Active
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight leading-none mb-6 font-sans">
          Local PDF Utilities <span className="text-primary-fixed font-black">Zero Uploads</span>
        </h1>
        <p className="text-on-surface-variant text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
          Merge, split, and compress your critical files entirely in your browser. PDFMinty runs
          100% client-side, meaning your highly confidential files never leave your device’s sandbox
          memory. No signups, no accounts—just immediate offline processing for ultimate peace of
          mind.
        </p>
      </div>

      <div className="mb-14 max-w-lg mx-auto">
        <SearchComponent
          value={searchQuery}
          onChange={setSearchQuery}
          isDebouncing={isDebouncing}
          placeholder={t('search_placeholder')}
        />
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border-muted rounded-[32px] max-w-lg mx-auto bg-surface-container-low shadow-xl">
          <p className="text-primary font-black text-lg mb-2">{t('not_found_title')}</p>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed font-semibold">
            {t('not_found_desc')}
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-6 px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest border border-border-muted font-extrabold text-xs text-primary-fixed rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-security-green"
          >
            {t('clear_filter')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const toolSEO = TOOLS.find((t) => t.slug === tool.slug)!;
            const Icon = iconMap[toolSEO.icon] || Sparkles;
            const toolId = toolSEO.id;

            let badge = null;
            if (toolSEO.badge) {
              const badgeColors: Record<string, string> = {
                popular: 'bg-security-green/10 text-security-green border-security-green/20',
                smart_reduction: 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim border-tertiary-fixed-dim/20',
                ai_hybrid: 'bg-primary-fixed/10 text-primary-fixed border-primary-fixed/20',
                offline_aes: 'bg-critical-red/10 text-critical-red border-critical-red/20',
                fast_convert: 'bg-warning-amber/10 text-warning-amber border-warning-amber/20',
                extractor: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
                visual_extract: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
                interactive_order: 'bg-fuchsia-400/10 text-fuchsia-400 border-fuchsia-400/20',
              };
              badge = {
                text: t(toolSEO.badge),
                color: badgeColors[toolSEO.badge] || 'bg-slate-400/10 text-slate-400 border-slate-400/20',
              };
            }

            return (
              <button
                type="button"
                key={tool.slug}
                id={`tool-card-${toolId}`}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/${tool.slug}`);
                }}
                onMouseEnter={() => prefetchToolChunk(tool.slug)}
                onFocus={() => prefetchToolChunk(tool.slug)}
                className="page-card glass-panel rounded-[24px] p-6 border border-border-muted hover:border-security-green shadow-lg hover:shadow-security-green/5 flex flex-col justify-between text-left group transition-all duration-300 transform hover:-translate-y-1 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-security-green"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-border-muted flex items-center justify-center transition-transform group-hover:scale-110 shadow-md">
                      <Icon className="w-5.5 h-5.5 text-security-green" />
                    </div>
                    {badge && (
                      <span
                        className={`text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded-full border ${badge.color}`}
                      >
                        {badge.text}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-primary leading-snug mb-2 group-hover:text-security-green transition-colors font-sans">
                    {tool.name}
                  </h3>
                  <p className="text-on-surface-variant text-xs leading-relaxed font-semibold line-clamp-2 min-h-[2.5rem]">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs text-on-surface-variant group-hover:text-security-green transition-all font-bold">
                  {t('launch_tool')}{' '}
                  <span className="translate-x-0 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Visual Workspace Feature Section */}
      <div className="mt-24 border border-border-muted rounded-[32px] p-8 md:p-12 bg-surface-container-low/50 backdrop-blur-md relative overflow-hidden z-20 shadow-xl flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-5">
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-security-green/10 text-security-green border border-security-green/20 px-3.5 py-1.5 rounded-full font-black tracking-widest uppercase animate-pulse">
            Local Dev-Sandbox Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-primary tracking-tight leading-tight">
            Fast, Private Interactive Workspace
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-medium">
            PDFMinty processes all your documents locally within your device's memory. With secure
            WebAssembly integrations, operations happen instantly without transmission queues, file
            upload limits, or cloud exposures. Experience absolute control over your contract
            agreements, confidential datasheets, and forms with a distraction-free desktop
            environment.
          </p>
        </div>
        <div className="w-full md:w-80 shrink-0 border border-border-muted rounded-[24px] overflow-hidden shadow-2xl bg-surface-container-low p-5">
          <div className="w-full h-44 bg-surface-container-lowest rounded-xl p-3.5 flex flex-col gap-3 border border-border-muted shadow-inner relative overflow-hidden select-none">
            {/* Workspace header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-1.5 whitespace-nowrap">
              <div className="flex items-center gap-1">
                <div className="w-2.5.5 h-2.5 rounded-full bg-critical-red"></div>
                <div className="w-2.5.5 h-2.5 rounded-full bg-warning-amber"></div>
                <div className="w-2.5.5 h-2.5 rounded-full bg-security-green"></div>
                <span className="text-[9px] text-on-surface-variant font-mono ml-2">
                  client-workspace.pdf
                </span>
              </div>
              <div className="px-1.5 py-0.5 rounded bg-security-green/10 text-security-green text-[8px] font-black uppercase">
                100% Offline
              </div>
            </div>
            {/* Workspace body / dropzone representation */}
            <div className="flex-1 border border-dashed border-border-muted rounded-lg flex flex-col items-center justify-center p-2 text-center bg-surface-container-low/10">
              <Merge className="w-5 h-5 text-security-green mb-1 animate-bounce" />
              <span className="text-[10px] font-bold text-primary">Drag & Drop PDF here</span>
              <span className="text-[8px] text-on-surface-variant/70 mt-0.5">
                or click to browse locally
              </span>
            </div>
            {/* Mini active items list */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <div className="flex-1 bg-surface-container-lowest p-2 rounded-md border border-border-muted flex items-center justify-between shadow-sm">
                <span className="text-[8px] text-on-surface-variant font-bold max-w-[120px] truncate">
                  client_contract.pdf
                </span>
                <span className="text-[7px] text-on-surface-variant/60 font-mono">1.2 MB</span>
              </div>
              <div className="w-6 h-6 rounded-md bg-security-green flex items-center justify-center text-background font-bold text-[10px] shadow-sm shrink-0 hover:bg-primary-fixed-dim transition-colors cursor-pointer">
                →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-24 relative z-20">
        <h2 className="text-2xl md:text-4xl font-black text-primary text-center tracking-tight mb-2 font-sans">
          {t('how_it_works_title')}
        </h2>
        <p className="text-on-surface-variant text-xs md:text-sm text-center mb-16 max-w-md mx-auto font-medium">
          {t('how_it_works_desc')}
        </p>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Timeline Connector Line */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-security-green/5 via-security-green/20 to-security-green/5 -z-10" />

          <div
            id="step-1-card"
            className="flex flex-col items-center p-8 rounded-3xl bg-surface-container-low border border-border-muted shadow-lg hover:border-security-green transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-security-green border border-border-muted flex items-center justify-center font-bold text-lg mb-4 shadow-md z-10 font-mono">
              1
            </div>
            <h3 className="text-base font-bold text-primary mb-2">{t('step_1_title')}</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs font-semibold">
              {t('step_1_desc')}
            </p>
          </div>
          <div
            id="step-2-card"
            className="flex flex-col items-center p-8 rounded-3xl bg-surface-container-low border border-border-muted shadow-lg hover:border-security-green transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-security-green border border-border-muted flex items-center justify-center font-bold text-lg mb-4 shadow-md z-10 font-mono">
              2
            </div>
            <h3 className="text-base font-bold text-primary mb-2">{t('step_2_title')}</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs font-semibold">
              {t('step_2_desc')}
            </p>
          </div>
          <div
            id="step-3-card"
            className="flex flex-col items-center p-8 rounded-3xl bg-surface-container-low border border-border-muted shadow-lg hover:border-security-green transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-security-green border border-border-muted flex items-center justify-center font-bold text-lg mb-4 shadow-md z-10 font-mono">
              3
            </div>
            <h3 className="text-base font-bold text-primary mb-2">{t('step_3_title')}</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs font-semibold">
              {t('step_3_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Section with visual rhythm surface tint */}
      <div className="my-24 relative z-20 -mx-4 px-6 py-20 bg-surface-container-low/40 border-y border-border-muted rounded-[40px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black text-primary text-center tracking-tight mb-2">
            Why Choose PDFMinty?
          </h2>
          <p className="text-on-surface-variant text-xs md:text-sm text-center mb-16 max-w-md mx-auto font-medium">
            Professional grade web tools with zero security compromises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              id="why-card-privacy"
              className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
                <Shield className="w-6 h-6 text-security-green fill-security-green/10" />
              </div>
              <h3 className="text-base font-bold text-primary mb-2.5">Privacy First</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
                Your documents never leave your computer. All operations run strictly inside your
                local browser memory to maintain absolute file confidentiality.
              </p>
            </div>
            <div
              id="why-card-account"
              className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
                <UserX className="w-6 h-6 text-critical-red fill-critical-red/10" />
              </div>
              <h3 className="text-base font-bold text-primary mb-2.5">No Account</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
                Skip tedious signups. Enjoy high-performance, direct tools without credentials,
                subscription gates, or trackable identifiers.
              </p>
            </div>
            <div
              id="why-card-free"
              className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
                <Gift className="w-6 h-6 text-warning-amber fill-warning-amber/10" />
              </div>
              <h3 className="text-base font-bold text-primary mb-2.5">Completely Free</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
                Enjoy unlimited editing, compression, and division with no paywalls, hidden monthly
                fees, restricted trial counts, or watermarks.
              </p>
            </div>
            <div
              id="why-card-tools"
              className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
                <Layers className="w-6 h-6 text-primary-fixed fill-primary-fixed/10" />
              </div>
              <h3 className="text-base font-bold text-primary mb-2.5">{TOOLS.filter((t) => t.type === 'tool').length} Tools</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
                Get complete document coverage with {TOOLS.filter((t) => t.type === 'tool').length} local tools including Merge, Split, Compress,
                Rotate, Watermark, and even private AI PDF Analysis.
              </p>
            </div>
            <div
              id="why-card-offline"
              className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
                <WifiOff className="w-6 h-6 text-[#00FFC2] fill-[#00FFC2]/10" />
              </div>
              <h3 className="text-base font-bold text-primary mb-2.5">100% Offline</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
                Our core toolkit operates entirely without an active network connection. Complete
                heavy conversions on commutes or in air-gapped security cleanrooms.
              </p>
            </div>
            <div
              id="why-card-speed"
              className="bg-surface-container-lowest border border-border-muted p-8 rounded-3xl shadow-lg text-center flex flex-col items-center hover:border-security-green transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-high border border-border-muted flex items-center justify-center mb-5 shadow-inner">
                <Zap className="w-6 h-6 text-tertiary-fixed-dim fill-tertiary-fixed-dim/10" />
              </div>
              <h3 className="text-base font-bold text-primary mb-2.5">Instant Execution</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed font-semibold">
                Skip upload buffers and long queues. WebAssembly compiling means files process
                instantly inside your browser memory for immediate download.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 relative z-20" id="faq-section">
        <h2 className="text-2xl md:text-3xl font-black text-primary text-center tracking-tight mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-on-surface-variant text-xs md:text-sm text-center mb-12 max-w-md mx-auto font-medium">
          Quick clarity on core PDFMinty features, standards, and operations.
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: 'Are my files safe with PDFMinty?',
              a: 'Absolutely! All standard file computations (merge, split, compress, edit) are performed fully client-side inside your browser window. Your private files are never uploaded to our servers, keeping your documents 100% confidential.',
            },
            {
              q: 'How much does it cost to use PDFMinty?',
              a: 'PDFMinty is completely, unconditionally free. There are no payment screens, registration gates, daily execution counts, or premium capabilities hidden behind subscriptions.',
            },
            {
              q: 'Does PDFMinty work offline without an active network?',
              a: `Yes! Since all operations run purely inside your client browser, our core suite of ${TOOLS.filter((t) => t.type === 'tool').length} tools works flawlessly even if you are entirely disconnected from the internet.`,
            },
            {
              q: 'Can I use PDFMinty on my tablet or mobile device?',
              a: 'Yes, our modern responsive layout is optimized for desktops, tablets, and smartphones alike. No apps to install—just open PDFMinty and edit instantly.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-surface-container-low border border-border-muted rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-primary text-sm md:text-base hover:bg-surface-container-high transition-colors"
                id={`faq-toggle-${i}`}
              >
                <span>{faq.q}</span>
                {openFaqIndex === i ? (
                  <ChevronUp className="w-5 h-5 text-security-green shrink-0 transition-transform" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-on-surface-variant/60 shrink-0 transition-transform" />
                )}
              </button>
              {openFaqIndex === i && (
                <div className="p-5 pt-0 border-t border-border-muted text-on-surface-variant text-xs md:text-sm leading-relaxed font-semibold bg-surface-container-lowest/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 border border-border-muted rounded-3xl bg-surface-container-low/40 p-10 md:p-14 text-center text-primary relative overflow-hidden z-20 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-security-green/10 rounded-full filter blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary-fixed-dim/5 rounded-full filter blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight font-sans">
            Ready to secure your PDF workflow?
          </h2>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-semibold">
            Choose any tool from our security workspace to load document files local-first. Instant
            execution, no subscription gates, 100% data integrity.
          </p>
          <div className="pt-4">
            <button
              onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
              className="px-6 py-3.5 rounded-xl bg-security-green hover:bg-primary-fixed-dim text-[#131313] font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-security-green/10 active:scale-95 cursor-pointer max-w-xs inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-[#131111] text-[#131111]" />
              <span>Explore All Tools</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
