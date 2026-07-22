import { BookOpen, ArrowRight } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '../config/routes';
import { TOOLS } from '../config/seo-data';

export const RelatedBlogs: React.FC = () => {
  const { pathname } = useLocation();

  const relatedBlogs = useMemo(() => {
    const articles = TOOLS.filter((t) => t.type === 'article' && t.id !== 'blog' && t.id !== 'trust-article');
    const currentSlug = pathname.replace(/^\//, '').replace(/\/$/, '');

    // Filter out current article if viewing a blog post
    const filtered = articles.filter((a) => a.slug !== currentSlug);

    // Return 3 articles
    return filtered.slice(0, 3);
  }, [pathname]);

  if (pathname === '/blog' || relatedBlogs.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800" id="related_blogs_box">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-zinc-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>Related Blog Posts</span>
        </h3>
        <Link
          to={ROUTES.BLOG}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {relatedBlogs.map((post) => (
          <Link
            key={post.id}
            to={`/${post.slug}`}
            className="group block p-4 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500 transition-all hover:shadow-sm"
          >
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Blog Article
            </span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
              {post.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-2 mt-2 leading-relaxed">
              {post.shortDescription}
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Read Guide</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedBlogs;
