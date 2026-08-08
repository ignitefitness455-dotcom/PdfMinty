import { ShieldCheck, Calendar, Clock, Share2, Check, UserCheck, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

import RelatedBlogs from '../components/RelatedBlogs';
import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';
import { TOOLS } from '../config/seo-data';

export const BlogPostPage: React.FC = () => {
  const { postSlug, slug: paramSlug } = useParams<{ postSlug?: string; slug?: string }>();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const currentPath = location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const targetSlug = postSlug || paramSlug || currentPath;

  const article = TOOLS.find((p) => {
    if (p.type !== 'article') return false;

    // Exact match on full path or ID
    if (p.slug === currentPath || p.id === currentPath) return true;

    // Match if slug / postSlug parameter matches
    if (targetSlug) {
      if (p.slug === targetSlug || p.id === targetSlug) return true;
      if (p.slug === `blog/${targetSlug}` || p.slug === `compare/${targetSlug}`) return true;
      if (p.slug.endsWith(`/${targetSlug}`)) return true;
    }

    return false;
  });

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-black text-2xl mb-4">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-on-surface mb-2">Article Not Found</h1>
        <p className="text-sm text-on-surface-variant max-w-md mb-6">
          The requested guide or article could not be located in our knowledge hub.
        </p>
        <Link
          to={ROUTES.BLOG}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 transition-all"
        >
          Return to Knowledge Hub
        </Link>
      </div>
    );
  }

  // Calculate read time
  const getReadingTime = (html: string): string => {
    const text = html ? html.replace(/<[^>]*>/g, '') : '';
    const words = text.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 225));
    return `${time} min read`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-10 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride={`${article.h1 || article.name} | PdfMinty Knowledge Hub`}
        descriptionOverride={article.metaDescription || article.shortDescription}
      />

      <article className="max-w-4xl mx-auto space-y-10" id="blog-post-container">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium overflow-x-auto pb-1">
          <Link to={ROUTES.HOME} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <Link to={ROUTES.BLOG} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0">
            Knowledge Hub
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-xs">
            {article.name}
          </span>
        </nav>

        {/* Article Header */}
        <header className="space-y-6 border-b border-border-muted pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                {article.category || 'Guide'}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {article.datePublished || '2026-07-16'}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {getReadingTime(article.longFormBody || article.shortDescription)}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container-low border border-border-muted hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share Article</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight leading-tight">
            {article.h1 || article.name}
          </h1>

          <p className="text-base sm:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            {article.shortDescription}
          </p>

          {/* Author Badge & In-Browser Guarantee */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-border-muted">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-emerald-500/20">
                <img src="/logo.svg" alt="PDFMinty Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
                  <span>PDFMinty Editorial Team</span>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Document Privacy & Security Analysis
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% In-Browser Privacy Guarantee</span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div
          className="prose dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-img:rounded-2xl leading-relaxed text-sm sm:text-base text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: article.longFormBody || article.shortDescription }}
        />

        {/* Closing CTA */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to process your PDFs securely?
          </h2>
          <p className="text-xs sm:text-sm font-bold text-emerald-100 max-w-xl mx-auto">
            Use PdfMinty's free, 100% private in-browser tools today. No uploads, zero trace.
          </p>
          <div className="pt-2">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-900 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-100"
            >
              <span>Explore All Free PDF Tools →</span>
            </Link>
          </div>
        </div>

        {/* Related Blog Posts */}
        <RelatedBlogs />
      </article>
    </div>
  );
};

export default BlogPostPage;
