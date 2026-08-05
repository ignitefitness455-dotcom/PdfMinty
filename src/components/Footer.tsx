import { Mail, Shield, FileText, Sparkles } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '../config/routes';
import { NORD_AFFILIATE_LINKS } from '../config/constants';

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
            <FileText className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10" /> Knowledge Hub
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

        {/* Major SEO Resource & Comparison Links */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-on-surface-variant/80 border-t border-border-muted/60 max-w-4xl">
          <span className="text-emerald-500 font-extrabold uppercase tracking-wider text-[11px]">Popular Resources:</span>
          <Link to="/blog/how-to-convert-pdf-to-word-for-free-2026" className="hover:text-emerald-400 transition-colors">
            PDF to Word Guide
          </Link>
          <span>•</span>
          <Link to="/blog/how-to-compress-a-pdf-without-losing-quality-2026" className="hover:text-emerald-400 transition-colors">
            PDF Compression Guide
          </Link>
          <span>•</span>
          <Link to={ROUTES.COMPARE_SMALLPDF} className="hover:text-emerald-400 transition-colors">
            PDFMinty vs SmallPDF
          </Link>
          <span>•</span>
          <Link to={ROUTES.COMPARE_ILOVEPDF} className="hover:text-emerald-400 transition-colors">
            PDFMinty vs iLovePDF
          </Link>
          <span>•</span>
          <Link to={ROUTES.TRUST_ARTICLE} className="hover:text-emerald-400 transition-colors">
            Is Online PDF Upload Safe?
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
          <p className="text-[11px] text-on-surface-variant/70 font-medium pt-2 normal-case tracking-normal">
            Privacy tools we recommend:{' '}
            <a
              href={NORD_AFFILIATE_LINKS.NORDVPN}
              target="_blank"
              rel="nofollow sponsored"
              className="hover:text-emerald-500 underline transition-colors"
            >
              NordVPN
            </a>{' '}
            |{' '}
            <a
              href={NORD_AFFILIATE_LINKS.NORDPASS}
              target="_blank"
              rel="nofollow sponsored"
              className="hover:text-emerald-500 underline transition-colors"
            >
              NordPass
            </a>{' '}
            |{' '}
            <a
              href={NORD_AFFILIATE_LINKS.NORDVPN_ARABIA}
              target="_blank"
              rel="nofollow sponsored"
              className="hover:text-emerald-500 underline transition-colors"
            >
              NordVPN Arabia
            </a>{' '}
            |{' '}
            <a
              href={NORD_AFFILIATE_LINKS.THREAT_PROTECTION}
              target="_blank"
              rel="nofollow sponsored"
              className="hover:text-emerald-500 underline transition-colors"
            >
              Threat Protection
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
