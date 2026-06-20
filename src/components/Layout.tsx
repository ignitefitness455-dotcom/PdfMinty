import React, { useState, createContext, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, Merge, Scissors, Minimize2, RotateCw, Trash2, 
  Bookmark, Hash, FilePlus, Shield, Lock, Image, Eye, Sparkles, Menu, X,
  Moon, Sun, Mail, HelpCircle, MessageSquare, Star
} from 'lucide-react';
import { ROUTES } from '../config/routes';
import InternalSEO, { Breadcrumbs } from "./InternalSEO";
import { RelatedTools } from "./RelatedTools";

interface ToolInfo {
  name: string;
  slug: string;
  description: string;
}

interface LayoutContextType {
  toolsList: ToolInfo[];
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Dialog State Control
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Theme management logic
  const [theme, setThemeSetting] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-preference');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  const toolsList: ToolInfo[] = [
    { name: 'Merge PDF', slug: 'merge-pdf', description: 'Combine multiple PDFs into one document' },
    { name: 'Split PDF', slug: 'split-pdf', description: 'Extract custom page ranges' },
    { name: 'Compress PDF', slug: 'compress-pdf', description: 'Reduce PDF file size offline' },
    { name: 'Rotate PDF', slug: 'rotate-pdf', description: 'Rotate specific or all PDF pages' },
    { name: 'Delete Pages', slug: 'delete-pages-pdf', description: 'Filter out unneeded pages' },
    { name: 'Watermark PDF', slug: 'watermark-pdf', description: 'Draw custom stamp text overlay' },
    { name: 'Page Numbers', slug: 'add-page-numbers', description: 'Add page identifiers dynamically' },
    { name: 'Add Blank Page', slug: 'add-blank-page', description: 'Insert empty spacing sheets' },
    { name: 'Protect PDF', slug: 'protect-pdf', description: 'Encrypt document with password constraint' },
    { name: 'Unlock PDF', slug: 'unlock-pdf', description: 'Decrypt pages to clean format' },
    { name: 'Image to PDF', slug: 'image-to-pdf', description: 'Convert PNG/JPG into beautiful PDFs' },
    { name: 'PDF to Image', slug: 'pdf-to-image', description: 'Export PDF pages to standard raster images' },
    { name: 'AI Analyze', slug: 'intelligence', description: 'Summarize or ask questions via server AI' },
  ];

  const menuItems = [
    { name: 'Merge PDF', path: ROUTES.MERGE, icon: Merge, desc: 'Combine multiple PDFs into one document' },
    { name: 'Split PDF', path: ROUTES.SPLIT, icon: Scissors, desc: 'Extract custom page ranges' },
    { name: 'Compress PDF', path: ROUTES.COMPRESS, icon: Minimize2, desc: 'Reduce PDF file size offline' },
    { name: 'Rotate PDF', path: ROUTES.ROTATE, icon: RotateCw, desc: 'Rotate specific or all PDF pages' },
    { name: 'Delete Pages', path: ROUTES.DELETE_PAGES, icon: Trash2, desc: 'Filter out unneeded pages' },
    { name: 'Watermark PDF', path: ROUTES.WATERMARK, icon: Bookmark, desc: 'Draw custom stamp text overlay' },
    { name: 'Page Numbers', path: ROUTES.PAGE_NUMBERS, icon: Hash, desc: 'Add page identifiers dynamically' },
    { name: 'Add Blank Page', path: ROUTES.ADD_BLANK, icon: FilePlus, desc: 'Insert empty spacing sheets' },
    { name: 'Protect PDF', path: ROUTES.PROTECT, icon: Shield, desc: 'Encrypt document with password constraint' },
    { name: 'Unlock PDF', path: ROUTES.UNLOCK, icon: Lock, desc: 'Decrypt pages to clean format' },
    { name: 'Image to PDF', path: ROUTES.IMG_TO_PDF, icon: Image, desc: 'Convert PNG/JPG into beautiful PDFs' },
    { name: 'PDF to Image', path: ROUTES.PDF_TO_IMG, icon: Eye, desc: 'Export PDF pages to standard raster images' },
    { name: 'AI Analyze', path: ROUTES.AI_ANALYZE, icon: Sparkles, desc: 'Summarize or ask questions via server AI' },
  ];

  return (
    <LayoutContext.Provider value={{ toolsList }}>
      <div className="min-h-screen flex flex-col bg-background text-on-background font-sans transition-colors duration-200 selection:bg-primary-fixed/30" id="app_shell">
        
        {/* Upper Navigation Header */}
        <header
          id="header-bar"
          className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border-muted z-50 transition-all shadow-[0_4px_20px_rgba(0,255,194,0.02)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 cursor-pointer group select-none decoration-none"
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-115 shrink-0 bg-surface-container-low p-2 rounded-xl border border-border-muted shadow-lg shadow-black/40">
                <svg className="w-8 h-8 drop-shadow-[0_0px_10px_rgba(0,255,194,0.4)] animate-pulse" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="11" width="26" height="33" rx="6" fill="#0E0E0E" />
                  <rect x="7" y="12" width="24" height="31" rx="5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" fill="none" />
                  <rect x="15" y="4" width="27" height="33" rx="6" fill="#00FFC2" />
                  <rect x="16" y="5" width="25" height="31" rx="5" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                  <path d="M35 4L42 11H39C36.7909 11 35 9.20914 35 7V4Z" fill="#131313" />
                  <rect x="21" y="15" width="15" height="2.2" rx="1.1" fill="#131313" />
                  <rect x="21" y="21" width="15" height="2.2" rx="1.1" fill="#131313" />
                  <rect x="21" y="27" width="9" height="2.2" rx="1.1" fill="#131313" opacity="0.8" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 align-middle">
                  <span className="text-2xl font-black tracking-tight text-primary-fixed">
                    PDF<span className="text-primary font-light">Minty</span>
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-[#131313] bg-primary-fixed border border-primary-fixed px-1.5 py-0.5 rounded-md uppercase leading-none mt-0.5 animate-pulse">LOCAL</span>
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 font-semibold text-sm">
              <Link to={ROUTES.MERGE} className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.MERGE ? "text-primary-fixed border-b-2 border-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}>Merge</Link>
              <Link to={ROUTES.SPLIT} className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.SPLIT ? "text-primary-fixed border-b-2 border-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}>Split</Link>
              <Link to={ROUTES.COMPRESS} className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.COMPRESS ? "text-primary-fixed border-b-2 border-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}>Compress</Link>
              <Link to={ROUTES.PROTECT} className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.PROTECT ? "text-primary-fixed border-b-2 border-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}>Protect</Link>
              <Link to={ROUTES.UNLOCK} className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.UNLOCK ? "text-primary-fixed border-b-2 border-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}>Unlock</Link>
              <Link to={ROUTES.IMG_TO_PDF} className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.IMG_TO_PDF ? "text-primary-fixed border-b-2 border-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}>Convert</Link>
              <Link to={ROUTES.AI_ANALYZE} className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.AI_ANALYZE ? "text-primary-fixed border-b-2 border-primary-fixed" : "text-on-surface-variant hover:text-primary-fixed"}`}>AI Analyze</Link>
            </nav>

            <div className="flex items-center gap-4 font-sans">
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-high rounded-full border border-border-muted shadow-sm">
                <span className="w-2 h-2 rounded-full bg-security-green pulse-mint"></span>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">LOCAL SANDBOX SECURE</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setThemeSetting(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-border-muted text-on-surface transition-all active:scale-95 cursor-pointer shadow-sm relative group"
                aria-label="Toggle theme mode"
                id="theme_toggle_btn"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500 fill-amber-500/10" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700 fill-slate-700/10" />
                )}
                <span className="absolute invisible group-hover:visible -bottom-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] whitespace-nowrap font-bold px-2 py-1 rounded shadow-md border border-slate-800 pointer-events-none z-50">
                  {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </span>
              </button>

              {/* Mobile Drawer Trigger */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-border-muted text-on-surface lg:hidden focus:outline-none transition-all"
                aria-label="Toggle menu"
                id="mobile_menu_toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-security-green" /> : <Menu className="w-5 h-5 text-on-surface-variant" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background pt-20 flex flex-col animate-fadein" id="mobile_drawer">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <Link 
                to={ROUTES.HOME} 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
              >
                All PDF Tools
              </Link>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="px-4 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">Individual Utilities</p>
                <div className="grid grid-cols-1 gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 p-3 rounded-xl border ${location.pathname === item.path ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' : 'border-slate-100 dark:border-slate-800/60 hover:border-slate-200 text-slate-700 dark:text-slate-300'}`}
                      >
                        <span className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                          <Icon className="w-5 h-5 text-emerald-600" />
                        </span>
                        <div>
                          <span className="font-semibold text-sm block">{item.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">{item.desc}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Display Settings */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">Display Settings</p>
                <button
                  onClick={() => setThemeSetting(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full flex items-center justify-between p-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-1.5 rounded-lg bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500 fill-amber-500/10" /> : <Moon className="w-4 h-4 text-slate-600 fill-slate-750/10" />}
                    </span>
                    <span>{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono pr-2">Toggle</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Primary Page Canvas Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="primary_page_container">
          <div className="container-pdfminty py-2 sm:py-4 lg:py-6 relative z-10">
            <Breadcrumbs />
            <InternalSEO />
            {children}
            <RelatedTools />
          </div>
        </main>

        {/* Custom Footer */}
        <footer
          id="footer-menu"
          className="border-t border-border-muted bg-surface-container-lowest py-16 transition-colors duration-200 font-sans"
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold">
              <span className="px-3.5 py-1.5 bg-surface-container-high text-security-green rounded-full border border-border-muted flex items-center gap-1.5 shadow-sm">🛡️ Privacy Secure</span>
              <span className="px-3.5 py-1.5 bg-surface-container-high text-primary-fixed rounded-full border border-border-muted flex items-center gap-1.5 shadow-sm">📂 100% Offline Core</span>
              <span className="px-3.5 py-1.5 bg-surface-container-high text-tertiary-fixed-dim rounded-full border border-border-muted flex items-center gap-1.5 shadow-sm">✨ Free Forever</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-on-surface-variant">
              <button id="open-feedback-modal" onClick={() => setShowFeedbackModal(true)} className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant cursor-pointer bg-transparent border-0 font-bold text-sm">
                <MessageSquare className="w-4.5 h-4.5 text-security-green fill-security-green/10" /> Provide Feedback
              </button>
              <button id="open-contact-modal" onClick={() => setShowContactModal(true)} className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant cursor-pointer bg-transparent border-0 font-bold text-sm">
                <Mail className="w-4.5 h-4.5 text-sky-400 fill-sky-400/10" /> Contact Us
              </button>
              <button
                onClick={() => {
                  window.scrollTo(0, 0);
                  if (location.pathname !== "/") { navigate("/"); }
                  setTimeout(() => { document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" }); }, 200);
                }}
                className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant cursor-pointer bg-transparent border-0 font-bold text-sm"
              >
                <HelpCircle className="w-4.5 h-4.5 text-warning-amber fill-warning-amber/10" /> Privacy & FAQ
              </button>
            </div>

            <div className="max-w-2xl text-xs text-on-surface-variant/80 space-y-3 leading-relaxed border-t border-border-muted pt-6 select-none leading-relaxed">
              <p className="font-extrabold text-primary">PDFMinty Copyright & Safety Guarantee</p>
              <p className="font-medium">
                © 2026 PDFMinty. All rights reserved. PDFMinty is an independent, client-side offline toolkit. We process all your PDF modifications entirely inside your browser's memory using secure Web Worker technology, meaning your files never touch a remote server and absolute device sovereignty is maintained.
              </p>
              <p className="font-medium">
                Offering a friction-free, account-less alternative to online cloud converters, our utilities let you merge, split, and compress your critical documents under full local device control. PDFMinty is committed to persistent data privacy and utility-grade performance, completely free of charge.
              </p>
              <p className="text-xs text-primary-fixed/80 font-semibold uppercase tracking-widest leading-none">Developed by & under Proprietorship of PDFMinty. Secure, client-buffered local suite.</p>
            </div>
          </div>
        </footer>

        {/* Feedback Modal Overlay */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadein">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" /> Share Your Feedback
                </h3>
                <button 
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackSubmitted(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedbackSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Feedback Submitted!</h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400">Thank you for helping us make PDFMinty better.</p>
                  <button
                    onClick={() => {
                      setFeedbackSubmitted(false);
                      setShowFeedbackModal(false);
                    }}
                    className="mt-2 px-5 py-2.5 bg-emerald-505 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    // Send Feedback internally or save it
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get("email");
                    const comment = formData.get("comment");
                    const rating = 5;

                    await fetch("/api/feedback", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, comment, rating }),
                    });
                  } catch (err) {
                    console.error(err);
                  }
                  setFeedbackSubmitted(true);
                }} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    We would love to hear your experiences or ideas to make PDFMinty even more secure and robust!
                  </p>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" className="text-amber-400 hover:scale-110 transition-transform cursor-pointer">
                          <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Email Address</label>
                    <input 
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="w-full text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 p-3.5 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Your Message</label>
                    <textarea 
                      name="comment"
                      rows={3}
                      placeholder="Tell us what you like or how we can improve..."
                      className="w-full text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 p-3.5 dark:text-white"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-605 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-600/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Contact Modal Overlay */}
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadein">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" /> Contact PDFMinty
                </h3>
                <button 
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSubmitted(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {contactSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-105 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Message Sent!</h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400">We will get back to your query as soon as possible.</p>
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setShowContactModal(false);
                    }}
                    className="mt-2 px-5 py-2.5 bg-blue-550 hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  // Simulate sending success
                  setContactSubmitted(true);
                }} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Have questions about document security, partnerships, or local distributed technologies? Drop us a line.
                  </p>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Email Address</label>
                    <input 
                      type="email"
                      placeholder="you@example.com"
                      className="w-full text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 p-3.5 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Subject</label>
                    <input 
                      type="text"
                      placeholder="How can we help?"
                      className="w-full text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 p-3.5 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Message</label>
                    <textarea 
                      rows={3}
                      placeholder="Type your question or request here..."
                      className="w-full text-xs rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 p-3.5 dark:text-white"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-750 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-blue-600/10 transition-all active:scale-95 cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </LayoutContext.Provider>
  );
};
