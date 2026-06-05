import { createContext, useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Moon from "lucide-react/icons/moon";
import Sun from "lucide-react/icons/sun";
import MessageSquare from "lucide-react/icons/message-square";
import Mail from "lucide-react/icons/mail";
import HelpCircle from "lucide-react/icons/help-circle";
import RefreshCw from "lucide-react/icons/refresh-cw";
import ArrowUp from "lucide-react/icons/arrow-up";
import Merge from "lucide-react/icons/merge";
import Scissors from "lucide-react/icons/scissors";
import RotateCw from "lucide-react/icons/rotate-cw";
import Trash2 from "lucide-react/icons/trash-2";
import Stamp from "lucide-react/icons/stamp";
import Hash from "lucide-react/icons/hash";
import Plus from "lucide-react/icons/plus";
import Lock from "lucide-react/icons/lock";
import Unlock from "lucide-react/icons/unlock";
import ImageIcon from "lucide-react/icons/image";
import Layers from "lucide-react/icons/layers";
import Minimize2 from "lucide-react/icons/minimize-2";
import Brain from "lucide-react/icons/brain";
import { Toast, ToolType } from "../types";
import { Toast as ToastUI } from "./Toast";
import confetti from "canvas-confetti";
import { Breadcrumbs, RelatedTools } from "./InternalSEO";

interface LayoutContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  toolsList: typeof toolsList;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

const toolsList = [
  {
    id: "merge" as ToolType,
    name: "Merge PDFs",
    slug: "merge-pdf",
    description: "Combine multiple PDF files into a single master document sequentially.",
    icon: Merge,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300",
  },
  {
    id: "split" as ToolType,
    name: "Extract Pages",
    slug: "split-pdf",
    description: "Extract specific page ranges to form a brand new light document.",
    icon: Scissors,
    color: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300",
  },
  {
    id: "rotate" as ToolType,
    name: "Rotate Pages",
    slug: "rotate-pdf",
    description: "Rotate individual or all pages of your PDF document physically.",
    icon: RotateCw,
    color: "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300",
  },
  {
    id: "delete-pages" as ToolType,
    name: "Delete Pages",
    slug: "organize",
    description: "Review rendered page previews and prune unneeded pages interactively.",
    icon: Trash2,
    color: "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300",
  },
  {
    id: "watermark" as ToolType,
    name: "Add Watermark",
    slug: "watermark-pdf",
    description: "Stamp customized overlay text with precision tilt and opacity control.",
    icon: Stamp,
    color: "bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300",
  },
  {
    id: "page-numbers" as ToolType,
    name: "Page Numbers",
    slug: "add-page-numbers",
    description: "Stamp sequential page count strings cleanly atop or below pages.",
    icon: Hash,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300",
  },
  {
    id: "add-blank" as ToolType,
    name: "Add Blank Page",
    slug: "add-blank-page",
    description: "Insert standard blank empty canvas sheets anywhere in the document.",
    icon: Plus,
    color: "bg-violet-50 text-violet-600 border-violet-100 hover:border-violet-300",
  },
  {
    id: "protect" as ToolType,
    name: "Secure Private Vault",
    slug: "protect-pdf",
    description: "Encrypt document bytes client-side with a strong secret offline key derived from password using AES-GCM.",
    icon: Lock,
    color: "bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-300",
  },
  {
    id: "unlock" as ToolType,
    name: "Unlock Private Vault",
    slug: "unlock-pdf",
    description: "Decrypt and restore AES-GCM encrypted documents locally inside your browser cache.",
    icon: Unlock,
    color: "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300",
  },
  {
    id: "img-to-pdf" as ToolType,
    name: "Image to PDF",
    slug: "image-to-pdf",
    description: "Stitch standard images (JPG/PNG) into beautiful, page-synchronized PDFs.",
    icon: ImageIcon,
    color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100 hover:border-fuchsia-300",
  },
  {
    id: "pdf-to-img" as ToolType,
    name: "PDF to Image",
    slug: "pdf-to-image",
    description: "Render PDF page content client-side to export individual sharp JPEGs in ZIP.",
    icon: Layers,
    color: "bg-sky-50 text-sky-600 border-sky-100 hover:border-sky-300",
  },
  {
    id: "compress" as ToolType,
    name: "Compress PDF",
    slug: "compress-pdf",
    description: "Perform advanced, non-destructive file size reductions completely offline.",
    icon: Minimize2,
    color: "bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300",
  },
  {
    id: "ai-analyze" as ToolType,
    name: "AI Analyze Document",
    slug: "intelligence",
    description: "Generate high-fidelity executive summaries, key action points, tags using Gemini.",
    icon: Brain,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300",
  },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Theme State (Dark mode toggle support)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("pdfminty-theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem("pdfminty-theme", theme);
    } catch (e) {}
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Scroll to Top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Modals
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Notification Toast Helper
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackRating) {
      showToast("Please pick a rating to submit your feedback.", "error");
      return;
    }
    setFeedbackSubmitting(true);
    try {
      const apiBase = "";
      const response = await fetch(`${apiBase}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": window.location.origin
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment,
          email: feedbackEmail,
        }),
      });

      if (response.ok) {
        showToast("Thank you! Your feedback has been secured.", "success");
        setFeedbackComment("");
        setFeedbackEmail("");
        setFeedbackRating(null);
        setShowFeedbackModal(false);

        try {
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (_) {}
      } else {
        const errTxt = await response.text();
        console.error("Cloudflare API feedback submission error:", response.status, errTxt);
        showToast(`Could not send feedback (${response.status}). Please try again.`, "error");
      }
    } catch (err) {
      console.error("Cloudflare API feedback connection error:", err);
      showToast("Network error. Please try again later.", "error");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const submitContactUs = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const apiBase = "";
      const response = await fetch(`${apiBase}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": window.location.origin
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage,
        }),
      });

      if (response.ok) {
        showToast("Your inquiry message has been delivered.", "success");
        setContactName("");
        setContactEmail("");
        setContactSubject("");
        setContactMessage("");
        setShowContactModal(false);
      } else {
        const errTxt = await response.text();
        console.error("Cloudflare API contact submission error:", response.status, errTxt);
        showToast("Failed to deliver message. Please try again.", "error");
      }
    } catch (err) {
      console.error("Cloudflare API contact connection error:", err);
      showToast("Network failure. Please try again later.", "error");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <LayoutContext.Provider value={{ showToast, theme, setTheme, toolsList }}>
      <div
        id="pdfminty-root"
        className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 antialiased overflow-x-hidden w-full"
      >
        {/* Skip to Content Link for Keyboard Accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to Content
        </a>

        {/* Dynamic Toast Notifications */}
        <div
          id="toast-deck"
          className="fixed top-5 right-5 left-5 md:left-auto md:right-6 z-55 flex flex-col gap-3 max-w-sm ml-auto pointer-events-none"
          aria-live="polite"
          aria-atomic="true"
        >
          {toasts.map((toast) => (
            <ToastUI
              key={toast.id}
              toast={toast}
              onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
            />
          ))}
        </div>

        {/* Header */}
        <header
          id="header-bar"
          className="sticky top-0 bg-white/80 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-900/80 z-20 transition-all shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)]"
        >
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 cursor-pointer group select-none decoration-none"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
                <svg
                  className="w-10 h-10 md:w-11 md:h-11 drop-shadow-[0_4px_12px_rgba(16,185,129,0.22)]"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="6"
                    y="11"
                    width="26"
                    height="33"
                    rx="6"
                    fill="#0F172A"
                    className="dark:fill-slate-950"
                  />
                  <rect
                    x="7"
                    y="12"
                    width="24"
                    height="31"
                    rx="5"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeOpacity="0.3"
                    fill="none"
                  />
                  <rect
                    x="15"
                    y="4"
                    width="27"
                    height="33"
                    rx="6"
                    fill="#10B981"
                  />
                  <rect
                    x="16"
                    y="5"
                    width="25"
                    height="31"
                    rx="5"
                    stroke="#34D399"
                    strokeWidth="1.2"
                    strokeOpacity="0.4"
                    fill="none"
                  />
                  <path
                    d="M35 4L42 11H39C36.7909 11 35 9.20914 35 7V4Z"
                    fill="#A7F3D0"
                  />
                  <rect
                    x="21"
                    y="15"
                    width="15"
                    height="2.2"
                    rx="1.1"
                    fill="#FFFFFF"
                  />
                  <rect
                    x="21"
                    y="21"
                    width="15"
                    height="2.2"
                    rx="1.1"
                    fill="#FFFFFF"
                  />
                  <rect
                    x="21"
                    y="27"
                    width="9"
                    height="2.2"
                    rx="1.1"
                    fill="#FFFFFF"
                    opacity="0.8"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5 align-middle">
                  <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-emerald-600 to-teal-500 dark:from-white dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    PDF
                    <span className="text-emerald-500 font-extrabold">
                      Minty
                    </span>
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100/80 dark:border-emerald-800/80 px-1.5 py-0.5 rounded-full uppercase leading-none mt-0.5">
                    V2
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider leading-none mt-1">
                  100% Secure Offline Studio
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4 md:gap-5 font-sans">
              <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-bold animate-fadein">
                <Link
                  to="/"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer decoration-none"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Tools Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (location.pathname !== "/") {
                      navigate("/", { replace: false });
                    }
                    setTimeout(() => {
                      document
                        .getElementById("faq-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 200);
                  }}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-0"
                >
                  Why Offline?
                </button>
                <span className="text-slate-200 dark:text-slate-800">|</span>
              </div>

              {/* Pulsing Sandbox Integrity Indicator */}
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-full text-xs font-bold tracking-wide border border-slate-800 dark:border-slate-700 shadow-lg shadow-slate-950/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">🔒 Sandbox Active</span>
                <span className="sm:hidden">🔒 Secure</span>
              </span>

              {/* Theme Toggle Button */}
              <button
                type="button"
                id="theme-toggler"
                onClick={() =>
                  setTheme((prev) => (prev === "light" ? "dark" : "light"))
                }
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5 font-bold"
                aria-label="Toggle Dark / Light Mode"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-4 h-4 text-slate-700" />
                    <span className="text-[11px] hidden md:inline">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-[11px] hidden md:inline">Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Primary Workspace Space with Floating Background Glows */}
        <main
          id="main-content"
          className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 relative overflow-x-hidden min-h-[60vh]"
        >
          {/* Decorative Ambient Glows */}
          <div className="absolute top-0 left-10 w-96 h-96 bg-emerald-100/30 dark:bg-emerald-950/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] pointer-events-none z-0" />
          <div className="absolute top-20 right-10 w-80 h-80 bg-teal-100/20 dark:bg-teal-950/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter filter blur-[80px] pointer-events-none z-0 animate-pulse duration-10000" />
          <div className="absolute bottom-40 left-1/3 w-96 h-96 bg-indigo-100/10 dark:bg-indigo-950/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter filter blur-[120px] pointer-events-none z-0" />

          <div className="container-pdfminty py-2 sm:py-4 lg:py-6 relative z-10">
            <Breadcrumbs />
            {children}
            <RelatedTools />
          </div>

          {/* Secure lock alert footer block */}
          <div className="max-w-7xl mx-auto px-4 mt-12 mb-2 font-sans relative z-10">
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex items-center justify-center gap-3 max-w-2xl mx-auto shadow-sm text-center">
              <span className="text-lg">🔒</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-snug">
                <span className="text-emerald-600 dark:text-emerald-400 mr-1 font-extrabold">
                  100% Secure & Private.
                </span>{" "}
                All files are processed locally on your device. No data is ever
                uploaded to our servers.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          id="footer-menu"
          className="border-t border-slate-200/60 dark:border-slate-900/60 bg-white dark:bg-slate-950/40 py-12 transition-colors font-sans"
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1.5 shadow-sm">
                🛡️ Privacy Secure
              </span>
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-1.5 shadow-sm">
                📂 100% Offline Core
              </span>
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800/50 flex items-center gap-1.5 shadow-sm">
                ✨ Free Forever
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-400">
              <button
                id="open-feedback-modal"
                onClick={() => setShowFeedbackModal(true)}
                className="inline-flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-0"
              >
                <MessageSquare className="w-4.5 h-4.5 text-emerald-500" /> Provide Feedback
              </button>
              <button
                id="open-contact-modal"
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-0"
              >
                <Mail className="w-4.5 h-4.5 text-blue-500" /> Contact Us
              </button>
              <button
                onClick={() => {
                  window.scrollTo(0, 0);
                  if (location.pathname !== "/") {
                    navigate("/");
                  }
                  setTimeout(() => {
                    const faqSection = document.getElementById("faq-section");
                    faqSection?.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }}
                className="inline-flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-0"
              >
                <HelpCircle className="w-4.5 h-4.5 text-indigo-500" /> Privacy & FAQ
              </button>
            </div>

            <div className="max-w-2xl text-xs text-slate-500 dark:text-slate-400 space-y-3 leading-relaxed border-t border-slate-100 dark:border-slate-900 pt-6">
              <p className="font-extrabold text-slate-800 dark:text-slate-200">
                PDFMinty Proprietorship & Copyright Information
              </p>
              <p className="font-medium text-slate-500 dark:text-slate-450">
                © 2026 PDFMinty. All rights reserved. PDFMinty is a 100% secure,
                independent, and open-source client-side offline distributed
                studio. No files or user data processed here are ever uploaded
                to remote servers. All calculations and file generations are
                performed securely inside the user's browser using local Web
                Worker technology.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 font-semibold uppercase tracking-widest">
                Developed by & under Proprietorship of PDFMinty. Strictly safe & distributed.
              </p>
            </div>
          </div>
        </footer>

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadein">
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 animate-slideup relative text-left"
              id="feedback-modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
            >
              <button
                aria-label="Close dialog"
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors text-xl font-bold cursor-pointer bg-transparent border-0"
              >
                ✕
              </button>

              <h2
                id="feedback-title"
                className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 mb-2"
              >
                Provide Feedback
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Let us know your thoughts or any issues you have faced with our browser tools.
              </p>

              <form onSubmit={submitFeedback} className="space-y-5 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Rate your experience *
                  </label>
                  <div className="flex justify-between items-center gap-2 py-2">
                    {[
                      { val: 1, label: "😩", name: "Very Bad" },
                      { val: 2, label: "🙁", name: "Poor" },
                      { val: 3, label: "😐", name: "Average" },
                      { val: 4, label: "🙂", name: "Good" },
                      { val: 5, label: "😄", name: "Excellent" },
                    ].map((r) => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setFeedbackRating(r.val)}
                        className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center border transition-all cursor-pointer ${
                          feedbackRating === r.val
                            ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/50 scale-105"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950"
                        }`}
                      >
                        <span className="text-2xl mb-1">{r.label}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                          {r.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Feedback Message *
                  </label>
                  <textarea
                    aria-label="Text area"
                    required
                    rows={4}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share details about what you liked, or where we can improve..."
                    className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    aria-label="Input field"
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSubmitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] min-w-[48px] p-2"
                  >
                    {feedbackSubmitting && (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadein">
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 animate-slideup relative text-left"
              id="contact-modal-content"
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-title"
            >
              <button
                aria-label="Close dialog"
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 transition-colors text-xl font-bold cursor-pointer bg-transparent border-0"
              >
                ✕
              </button>

              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 mb-2">
                Contact Us
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Drop us an inquiry and our team will get back to you as soon as possible.
              </p>

              <form
                onSubmit={submitContactUs}
                className="space-y-4 text-left font-sans"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Your Name *
                    </label>
                    <input
                      aria-label="Input field"
                      required
                      autoFocus
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Your Email *
                    </label>
                    <input
                      aria-label="Input field"
                      required
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject *
                  </label>
                  <input
                    aria-label="Input field"
                    required
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Inquiry or partnership topic"
                    className="w-full text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Message *
                  </label>
                  <textarea
                    aria-label="Message text"
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Type details of your message..."
                    className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px] min-w-[48px] p-2"
                  >
                    {contactSubmitting && (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Back scroll */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl hover:translate-y-[-2px] hover:scale-105 active:scale-95 transition-all cursor-pointer z-50 group border-0 animate-fadein"
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:translate-y-[-1px] transition-transform animate-none" />
          </button>
        )}
      </div>
    </LayoutContext.Provider>
  );
};
