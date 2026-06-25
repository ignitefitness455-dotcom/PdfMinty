import { Sun, Moon, Menu, X } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '../config/routes';

interface HeaderProps {
  theme: 'light' | 'dark';
  setThemeSetting: (theme: 'light' | 'dark') => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setThemeSetting,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const location = useLocation();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only prevent default (and do scroll-to-top) if we're already on the homepage.
    // Otherwise, let the React Router Link navigate to '/'.
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      id="header-bar"
      className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border-muted z-50 transition-all shadow-[0_4px_20px_rgba(0,255,194,0.02)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer group select-none decoration-none"
          onClick={handleLogoClick}
        >
          <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-115 shrink-0 bg-surface-container-low p-2 rounded-xl border border-border-muted shadow-lg shadow-black/40">
            <svg
              className="w-8 h-8 drop-shadow-[0_0px_10px_rgba(0,255,194,0.4)]"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="11" width="26" height="33" rx="6" fill="#0E0E0E" />
              <rect
                x="7"
                y="12"
                width="24"
                height="31"
                rx="5"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.2"
                fill="none"
              />
              <rect x="15" y="4" width="27" height="33" rx="6" fill="#00FFC2" />
              <rect
                x="16"
                y="5"
                width="25"
                height="31"
                rx="5"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeOpacity="0.3"
                fill="none"
              />
              <path d="M35 4L42 11H39C36.7909 11 35 9.20914 35 7V4Z" fill="#131313" />
              <rect x="21" y="15" width="15" height="2.2" rx="1.1" fill="#131313" />
              <rect x="21" y="21" width="15" height="2.2" rx="1.1" fill="#131313" />
              <rect
                x="21"
                y="27"
                width="9"
                height="2.2"
                rx="1.1"
                fill="#131313"
                opacity="0.8"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 align-middle">
              <span className="text-2xl font-black tracking-tight text-primary-fixed">
                PDF<span className="text-primary font-light">Minty</span>
              </span>
              <span className="text-[9px] font-black tracking-widest text-[#131313] bg-primary-fixed border border-primary-fixed px-1.5 py-0.5 rounded-md uppercase leading-none mt-0.5">
                LOCAL
              </span>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-semibold text-sm">
          <Link
            to={ROUTES.MERGE}
            className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.MERGE ? 'text-primary-fixed border-b-2 border-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'}`}
          >
            Merge
          </Link>
          <Link
            to={ROUTES.SPLIT}
            className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.SPLIT ? 'text-primary-fixed border-b-2 border-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'}`}
          >
            Split
          </Link>
          <Link
            to={ROUTES.COMPRESS}
            className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.COMPRESS ? 'text-primary-fixed border-b-2 border-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'}`}
          >
            Compress
          </Link>
          <Link
            to={ROUTES.PROTECT}
            className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.PROTECT ? 'text-primary-fixed border-b-2 border-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'}`}
          >
            Protect
          </Link>
          <Link
            to={ROUTES.UNLOCK}
            className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.UNLOCK ? 'text-primary-fixed border-b-2 border-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'}`}
          >
            Unlock
          </Link>
          <Link
            to={ROUTES.IMG_TO_PDF}
            className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.IMG_TO_PDF ? 'text-primary-fixed border-b-2 border-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'}`}
          >
            Convert
          </Link>
          <Link
            to={ROUTES.AI_ANALYZE}
            className={`pb-1 transition-colors duration-200 ${location.pathname === ROUTES.AI_ANALYZE ? 'text-primary-fixed border-b-2 border-primary-fixed' : 'text-on-surface-variant hover:text-primary-fixed'}`}
          >
            AI Analyze
          </Link>
        </nav>

        <div className="flex items-center gap-4 font-sans">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-surface-container-high rounded-full border border-border-muted shadow-sm">
            <span className="w-2 h-2 rounded-full bg-security-green pulse-mint"></span>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
              LOCAL SANDBOX SECURE
            </span>
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
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile_drawer"
            id="mobile_menu_toggle"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-security-green" />
            ) : (
              <Menu className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
