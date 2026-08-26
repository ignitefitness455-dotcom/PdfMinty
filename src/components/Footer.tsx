import { ShieldCheck, BookOpen } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '../config/routes';

import { LanguageSwitcher } from './LanguageSwitcher';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-low border-t border-border-muted pt-12 pb-8 font-sans text-on-surface-variant transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Security Statement */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center overflow-hidden">
                <img src="/logo.svg" alt="PdfMinty Logo" className="w-full h-full object-contain p-0.5" />
              </div>
              <span className="font-black text-xl text-on-surface">PdfMinty</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Free, privacy-first PDF utility suite. Core document tools run 100% locally in your browser without uploads. AI and OCR features utilize secure, encrypted API processing.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>In-Browser Privacy First</span>
            </div>
          </div>

          {/* Col 2: Popular Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Popular Tools</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to={ROUTES.MERGE} className="hover:text-emerald-500 transition-colors">
                  Merge PDF Files
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SPLIT} className="hover:text-emerald-500 transition-colors">
                  Split PDF Pages
                </Link>
              </li>
              <li>
                <Link to={ROUTES.GRAYSCALE} className="hover:text-emerald-500 transition-colors">
                  Grayscale PDF
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PROTECT} className="hover:text-emerald-500 transition-colors">
                  Protect & Encrypt PDF
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PDF_TO_IMG} className="hover:text-emerald-500 transition-colors">
                  Convert PDF to Image
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to={ROUTES.BLOG} className="hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-emerald-500" />
                  <span>Knowledge Hub</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.COMPARE_SMALLPDF} className="hover:text-emerald-500 transition-colors">
                  PdfMinty vs SmallPDF
                </Link>
              </li>
              <li>
                <Link to={ROUTES.COMPARE_ILOVEPDF} className="hover:text-emerald-500 transition-colors">
                  PdfMinty vs iLovePDF
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ADOBE_SECURITY_ARTICLE} className="hover:text-emerald-500 transition-colors">
                  Adobe vs Browser Security
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TRUST_ARTICLE} className="hover:text-emerald-500 transition-colors">
                  Is Online PDF Safe?
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Important Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Company & Legal</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to={ROUTES.ABOUT_US} className="hover:text-emerald-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-emerald-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PRIVACY_POLICY} className="hover:text-emerald-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TERMS_OF_SERVICE} className="hover:text-emerald-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} PdfMinty. All rights reserved. Built for 100% file privacy.</p>
          <div className="flex flex-wrap items-center gap-4 text-on-surface-variant/80 font-medium">
            <LanguageSwitcher variant="footer" />
            <span>•</span>
            <span>Client-side PDF Suite</span>
            <span>•</span>
            <span>Zero Data Logs</span>
            <span>•</span>
            <span>Open & Free</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
