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

import { ContactModal } from './ContactModal';
import { FeedbackModal } from './FeedbackModal';
import { Footer } from './Footer';
import { Header } from './Header';
import InternalSEO, { Breadcrumbs } from './InternalSEO';
import { MobileDrawer } from './MobileDrawer';
import { RelatedTools } from './RelatedTools';
import { ToolGuide } from './ToolGuide';

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

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Theme management logic
  const [theme, setThemeSetting] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme-preference');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // localStorage may throw in Safari private mode or when cookies are blocked.
    }
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme-preference', theme);
    } catch {
      // Ignore write errors in private browsing/blocked cookies.
    }
  }, [theme]);

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
            <ToolGuide slug={location.pathname.replace(/^\//, '').replace(/\/$/, '')} />
            <RelatedTools />
          </div>
        </main>

        <Footer
          setShowFeedbackModal={setShowFeedbackModal}
          setShowContactModal={setShowContactModal}
        />

        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />

        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      </div>
    </LayoutContext.Provider>
  );
};
