import { BookOpen, ArrowRight, Clock, Calendar } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '../config/routes';
import { TOOLS, ToolSEOInfo } from '../config/seo-data';

export const RelatedBlogs: React.FC = () => {
  const { pathname } = useLocation();

  const relatedBlogs = useMemo(() => {
    const articles = TOOLS.filter((t) => t.type === 'article' && t.id !== 'blog' && t.id !== 'trust-article' && t.id !== 'about-us');
    const currentSlug = pathname.replace(/^\//, '').replace(/\/$/, '');

    // Filter out current article if viewing a blog post
    const filtered = articles.filter((a) => a.slug !== currentSlug);

    // Sort newest date first
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.datePublished || '2026-07-15').getTime();
      const dateB = new Date(b.datePublished || '2026-07-15').getTime();
      if (dateB !== dateA) return dateB - dateA;
      return articles.indexOf(b) - articles.indexOf(a);
    });

    // Return 3 articles
    return sorted.slice(0, 3);
  }, [pathname]);

  const getReadingTime = (html: string): string => {
    const text = html ? html.replace(/<[^>]*>/g, '') : '';
    const words = text.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 225));
    return `${time} min read`;
  };

  const getFormattedDate = (post: ToolSEOInfo): string => {
    const dateStr = post.datePublished || '2026-07-16';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'July 16, 2026';
    }
  };

  if (pathname === '/blog' || relatedBlogs.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border-muted" id="related_blogs_box">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>Recommended Guides & Articles</span>
        </h3>
        <Link
          to={ROUTES.BLOG}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 group"
        >
          <span>Explore All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {relatedBlogs.map((post) => (
          <Link
            key={post.id}
            to={`/${post.slug}/`}
            className="group flex flex-col justify-between p-5 bg-surface-container-low border border-border-muted rounded-2xl hover:border-emerald-500/50 hover:shadow-lg transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  {post.category || 'Guide'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getFormattedDate(post)}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                {post.name}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {post.shortDescription}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-border-muted flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono font-normal">
                <Clock className="w-3 h-3" />
                {getReadingTime(post.longFormBody)}
              </span>
              <span className="inline-flex items-center gap-1 font-bold">
                <span>Read</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedBlogs;
