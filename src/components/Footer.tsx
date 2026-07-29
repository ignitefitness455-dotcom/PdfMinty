import { Mail, Shield, FileText } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '../config/routes';

interface FooterProps {
  setShowFeedbackModal?: (show: boolean) => void;
}

export const Footer: React.FC<FooterProps> = () => {

  return (
    <footer
      id="footer-menu"
      className="border-t border-border-muted bg-surface-container-lowest py-16 transition-colors duration-200 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold">
          <span className="px-3.5 py-1.5 bg-surface-container-high text-security-green rounded-full border border-border-muted flex items-center gap-1.5 shadow-sm">
            🛡️ Privacy Secure
          </span>
          <span className="px-3.5 py-1.5 bg-surface-container-high text-primary-fixed rounded-full border border-border-muted flex items-center gap-1.5 shadow-sm">
            📂 100% Offline Core
          </span>
          <span className="px-3.5 py-1.5 bg-surface-container-high text-tertiary-fixed-dim rounded-full border border-border-muted flex items-center gap-1.5 shadow-sm">
            ✨ Free Forever
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm font-bold text-on-surface-variant">
          <Link
            to={ROUTES.ABOUT_US}
            className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant decoration-none font-bold text-sm"
          >
            <Shield className="w-4.5 h-4.5 text-emerald-400 fill-emerald-400/10" /> About Us
          </Link>
          <Link
            to={ROUTES.CONTACT}
            className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant decoration-none font-bold text-sm"
          >
            <Mail className="w-4.5 h-4.5 text-sky-400 fill-sky-400/10" /> Contact
          </Link>
          <Link
            to={ROUTES.BLOG}
            className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant decoration-none font-bold text-sm"
          >
            <FileText className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10" /> Blog
          </Link>
          <Link
            to={ROUTES.PRIVACY_POLICY}
            className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant decoration-none font-bold text-sm"
          >
            <Shield className="w-4.5 h-4.5 text-sky-400 fill-sky-400/10" /> Privacy Policy
          </Link>
          <Link
            to={ROUTES.TERMS_OF_SERVICE}
            className="inline-flex items-center gap-2 hover:text-[#00FFC2] hover:-translate-y-0.5 transition-all text-on-surface-variant decoration-none font-bold text-sm"
          >
            <FileText className="w-4.5 h-4.5 text-amber-400 fill-amber-400/10" /> Terms of Service
          </Link>
        </div>

        <div className="max-w-2xl text-xs text-on-surface-variant/80 space-y-3 leading-relaxed border-t border-border-muted pt-6 select-none">
          <p className="font-extrabold text-primary">PDFMinty Copyright & Safety Guarantee</p>
          <p className="font-medium">
            © {new Date().getFullYear()} PDFMinty. All rights reserved. PDFMinty is an independent, client-side
            offline toolkit. We process all your PDF modifications entirely inside your
            browser's memory using secure Web Worker technology, meaning your files never touch
            a remote server and absolute device sovereignty is maintained.
          </p>
          <p className="font-medium">
            Offering a friction-free, account-less alternative to online cloud converters, our
            utilities let you merge, split, and edit your critical documents under full
            local device control. PDFMinty is committed to persistent data privacy and
            utility-grade performance, completely free of charge.
          </p>
          <p className="text-xs text-primary-fixed/80 font-semibold uppercase tracking-widest leading-none">
            Developed by & under Proprietorship of PDFMinty. Secure, client-buffered local
            suite.
          </p>
        </div>
      </div>
    </footer>
  );
};
