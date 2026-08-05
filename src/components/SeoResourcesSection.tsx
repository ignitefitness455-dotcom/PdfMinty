import { BookOpen, Shield, Sparkles, Scale, ArrowRight, FileText, Lock, Cpu } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '../config/routes';

export const SeoResourcesSection: React.FC = () => {
  const resourceCards = [
    {
      title: 'Free PDF to Word Guide',
      category: 'Guide',
      badge: 'POPULAR',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Learn how to convert PDF documents to editable Word files for free without ruining layout or formatting.',
      link: '/blog/how-to-convert-pdf-to-word-for-free-2026',
      icon: FileText,
    },
    {
      title: 'Adobe Acrobat Alternative',
      category: 'Alternative',
      badge: 'TOP FEATURED',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description: 'Replace expensive ~$240/year Adobe subscriptions with a 100% private, free client-side PDF utility suite.',
      link: ROUTES.ADOBE_ALTERNATIVE,
      icon: Sparkles,
    },
    {
      title: 'PDF Compression Guide',
      category: 'Optimization',
      badge: 'GUIDE',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      description: 'Understand lossy vs. lossless PDF reduction, image stream optimization, and how to shrink PDFs safely.',
      link: '/blog/how-to-compress-a-pdf-without-losing-quality-2026',
      icon: Cpu,
    },
    {
      title: 'PDFMinty vs SmallPDF',
      category: 'Comparison',
      badge: 'PRIVACY FIRST',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'Compare zero-upload browser processing against SmallPDF’s cloud server storage model.',
      link: ROUTES.COMPARE_SMALLPDF,
      icon: Scale,
    },
    {
      title: 'PDFMinty vs iLovePDF',
      category: 'Comparison',
      badge: 'NO ADS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      description: 'In-depth speed, security, and feature breakdown vs iLovePDF. No file limits or ad trackers.',
      link: ROUTES.COMPARE_ILOVEPDF,
      icon: Scale,
    },
    {
      title: 'Is Online PDF Upload Safe?',
      category: 'Security',
      badge: 'MUST READ',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      description: 'Crucial security analysis explaining the privacy hazards of sending sensitive PDFs to remote servers.',
      link: ROUTES.TRUST_ARTICLE,
      icon: Shield,
    },
    {
      title: 'Free PDF E-Signatures',
      category: 'Security',
      badge: 'TUTORIAL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      description: 'How to sign contracts and legal documents locally on your device without third-party server exposure.',
      link: '/blog/free-pdf-e-signature-sign-documents-without-uploading',
      icon: Lock,
    },
    {
      title: 'Remove PDF Metadata',
      category: 'Privacy',
      badge: 'SAFETY',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      description: 'Step-by-step guide to sanitizing author names, GPS location tags, and hidden edit history from PDFs.',
      link: '/blog/how-to-remove-pdf-metadata-for-privacy',
      icon: Shield,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 my-16 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SEO Knowledge & Resource Hub</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          PDF Guides, Comparisons & Resources
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Comprehensive tutorials, security breakdowns, and tool comparisons to help you manage PDF documents privately and efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {resourceCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="group p-5 bg-surface-container-low border border-border-muted rounded-2xl hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full border uppercase ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border-muted flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Explore Resource</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          to={ROUTES.BLOG}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-border-muted font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition-all shadow-xs"
        >
          <span>View All Articles & Guides in Knowledge Hub</span>
          <ArrowRight className="w-4 h-4 text-emerald-500" />
        </Link>
      </div>
    </section>
  );
};

export default SeoResourcesSection;
