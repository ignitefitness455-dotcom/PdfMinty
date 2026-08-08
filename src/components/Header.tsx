import { Moon, Sun, ShieldCheck, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  theme?: 'light' | 'dark';
  setThemeSetting?: (theme: 'light' | 'dark') => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mobileMenuOpen = false,
  setMobileMenuOpen,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [logoLoaded, setLogoLoaded] = useState(true);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border-muted transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-1 -ml-1 transition-all"
          id="header-logo-link"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
            {logoLoaded ? (
              <img
                src="/logo.svg"
                alt="PdfMinty Logo"
                width="36"
                height="36"
                className="w-full h-full object-contain p-0.5"
                onError={() => setLogoLoaded(false)}
              />
            ) : (
              <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                PM
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl tracking-tight text-on-surface group-hover:text-emerald-500 transition-colors font-sans">
              PdfMinty
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant/70 tracking-widest uppercase -mt-1 hidden sm:inline-block">
              Privacy-First PDF Tools
            </span>
          </div>
        </Link>

        {/* Navigation Links for Desktop */}
        <nav className="hidden lg:flex items-center gap-6 font-semibold text-sm text-on-surface-variant">
          <Link to="/" className="hover:text-emerald-500 transition-colors">
            Home
          </Link>
          <a
            href="/#all-tools"
            className="hover:text-emerald-500 transition-colors"
          >
            Tools
          </a>
          <Link to="/blog" className="hover:text-emerald-500 transition-colors">
            Blog
          </Link>
          <Link to="/about" className="hover:text-emerald-500 transition-colors">
            About
          </Link>
          <Link to="/contact" className="hover:text-emerald-500 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Security Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% PRIVATE & OFFLINE</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-border-muted text-on-surface transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Toggle dark mode"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Side Menu / Mobile Menu Toggle Button */}
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-border-muted text-on-surface transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              title={mobileMenuOpen ? "Close menu" : "Open menu"}
              id="menu-toggle-btn"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-500" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
