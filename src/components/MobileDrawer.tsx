import { Sun, Moon } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '../config/routes';
import { useModal } from '../hooks/useModal';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

interface MobileDrawerProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setThemeSetting: (theme: 'light' | 'dark') => void;
  menuItems: MenuItem[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  theme,
  setThemeSetting,
  menuItems,
}) => {
  const location = useLocation();
  const { modalRef, onKeyDown } = useModal(mobileMenuOpen, () => {
    setMobileMenuOpen(false);
  });

  if (!mobileMenuOpen) return null;

  return (
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      onKeyDown={onKeyDown}
      tabIndex={-1}
      className="lg:hidden fixed inset-0 z-40 bg-background pt-20 flex flex-col animate-fadein outline-none"
      id="mobile_drawer"
    >
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <Link
          to={ROUTES.HOME}
          onClick={() => setMobileMenuOpen(false)}
          className="block px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
        >
          All PDF Tools
        </Link>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="px-4 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
            Individual Utilities
          </p>
          <div className="grid grid-cols-1 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-xl border ${
                    location.pathname === item.path
                      ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-100 dark:border-slate-800/60 hover:border-slate-200 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                    <Icon className="w-5 h-5 text-emerald-600" />
                  </span>
                  <div>
                    <span className="font-semibold text-sm block">{item.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                      {item.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Display Settings */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
            Display Settings
          </p>
          <button
            onClick={() => setThemeSetting(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between p-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="p-1.5 rounded-lg bg-white dark:bg-slate-950 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 fill-slate-750/10" />
                )}
              </span>
              <span>
                {theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono pr-2">
              Toggle
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
