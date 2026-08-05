import { ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';
import React from 'react';
import { useParams, Link } from 'react-router-dom';

import SEO from '../components/SEO';
import { ROUTES } from '../config/routes';
import { TOOLS } from '../config/seo-data';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const article = TOOLS.find((p) => (p.slug === slug || p.id === slug) && p.type === 'article');

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

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8 font-sans text-on-surface transition-colors duration-200">
      <SEO
        titleOverride={`${article.h1 || article.name} | PdfMinty Knowledge Hub`}
        descriptionOverride={article.metaDescription || article.shortDescription}
      />

      <article className="max-w-4xl mx-auto space-y-12" id="blog-post-container">
        {/* Navigation back link */}
        <Link
          to={ROUTES.BLOG}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-6 border-b border-border-muted pb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {article.category || 'Guide'}
            </span>
            <span className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {article.datePublished || '2026'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tight leading-tight">
            {article.h1 || article.name}
          </h1>

          <p className="text-base sm:text-xl font-medium text-on-surface-variant leading-relaxed">
            {article.shortDescription}
          </p>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-border-muted flex items-center gap-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>100% Private In-Browser Guarantee: Files processed on your device with zero server uploads.</span>
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
            Use PdfMinty's free, 100% private in-browser tools today.
          </p>
          <div className="pt-2">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-900 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-100"
            >
              <span>Try PDF Tools Now →</span>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
