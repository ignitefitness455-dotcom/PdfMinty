import {
  Merge,
  Scissors,
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
  HelpCircle,
  CheckSquare,
  Move,
  FileCode2,
  Printer,
  FileText,
  Wrench,
  FilePenLine,
  ShieldBan,
} from 'lucide-react';
import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { TOOLS } from '../config/seo-data';

import { FeedbackModal } from './FeedbackModal';
import { Footer } from './Footer';
import { Header } from './Header';
import InternalSEO, { Breadcrumbs } from './InternalSEO';
import { MobileDrawer } from './MobileDrawer';
import { RelatedBlogs } from './RelatedBlogs';
import { RelatedTools } from './RelatedTools';
import { ToolGuide } from './ToolGuide';
import { ToolLongForm } from './ToolLongForm';

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
    // Provide safe fallback instead of throwing error to prevent crashes during initial render/hydration
    return { toolsList: [] };
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Theme management logic - Default to system preference or stored preference
  const [theme, setThemeSetting] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme-preference');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // localStorage or matchMedia may throw in private browsing mode or old webviews
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('theme-preference', theme);
    } catch {
      // Ignore write errors
    }
  }, [theme]);

  // Listen for OS theme changes if user hasn't explicitly set a preference
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem('theme-preference');
        if (!saved) {
          setThemeSetting(e.matches ? 'dark' : 'light');
        }
      } catch {
        // ignore
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const iconMap = useMemo<Record<string, React.ComponentType<{ className?: string }>>>(() => ({
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
    FileCode2,
    Printer,
    FileText,
    Wrench,
    FilePenLine,
    ShieldBan,
  }), []);

  const toolsList = useMemo<ToolInfo[]>(() => TOOLS
    .filter((t) => t.type === 'tool')
    .map((t) => ({
      name: t.name,
      slug: t.slug,
      description: t.shortDescription,
    })), []);

  const menuItems = useMemo(() => TOOLS
    .filter((t) => t.type === 'tool')
    .map((t) => ({
      name: t.name,
      path: `/${t.slug}`,
      icon: iconMap[t.icon] || HelpCircle,
      desc: t.shortDescription,
    })), [iconMap]);

  return (
    <LayoutContext.Provider value={{ toolsList }}>
      <div
        className="min-h-screen flex flex-col bg-background text-on-background font-sans transition-colors duration-200 selection:bg-primary-fixed/30 overflow-x-hidden w-full"
        id="app_shell"
      >
        <Header
          theme={theme}
          setThemeSetting={setThemeSetting}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <MobileDrawer
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          theme={theme}
          setThemeSetting={setThemeSetting}
          menuItems={menuItems}
        />

        {/* Primary Page Canvas Container */}
        <main
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
          id="main-content"
        >
          <div className="container-pdfminty py-2 sm:py-4 lg:py-6 relative z-10">
            <Breadcrumbs />
            <InternalSEO />
            {children}
            {(() => {
              const activeSlug = location.pathname.replace(/^\//, '').replace(/\/$/, '');
              const activeItem = TOOLS.find((t) => t.slug === activeSlug);
              if (activeItem?.type === 'tool') {
                return (
                  <>
                    <ToolLongForm slug={activeSlug} />
                    <ToolGuide slug={activeSlug} />
                  </>
                );
              }
              return null;
            })()}
            <RelatedTools />
            <RelatedBlogs />
          </div>
        </main>

        <Footer
          setShowFeedbackModal={setShowFeedbackModal}
        />

        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      </div>
    </LayoutContext.Provider>
  );
};
