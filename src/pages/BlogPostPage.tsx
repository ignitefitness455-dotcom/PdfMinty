import { ArrowLeft, Calendar, Clock, Shield, Copy, Check } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

import { SEO } from '../components/SEO';
import { ROUTES } from '../config/routes';
import { TOOLS } from '../config/seo-data';

export const BlogPostPage: React.FC = () => {
  const { postSlug } = useParams<{ postSlug: string }>();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Look up the post in our TOOLS data array
  const post = useMemo(() => {
    const derivedSlug = `blog/${postSlug}`;
    return TOOLS.find((t) => t.slug === derivedSlug && t.type === 'article');
  }, [postSlug]);

  // Compute scroll progress for the reading indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate estimated reading time
  const readingTime = useMemo(() => {
    if (!post) return '3 min read';
    const text = post.longFormBody.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 225));
    return `${time} min read`;
  }, [post]);

  // Format publication date
  const formattedDate = useMemo(() => {
    if (!post) return 'July 16, 2026';
    const dateStr = post.datePublished || '2026-07-16';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'July 16, 2026';
    }
  }, [post]);

  // Find 2 other related blog posts for the footer suggestions
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return TOOLS.filter((t) => t.type === 'article' && t.id !== 'blog' && t.id !== post.id).slice(0, 2);
  }, [post]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (!post) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-6 animate-fadein" id="blog-post-not-found">
        <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-400">
          <Clock className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Article Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          The security guide or tutorial you are looking for might have been moved, renamed, or is currently unavailable.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to={ROUTES.BLOG}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Browse Blog
          </Link>
          <Link
            to={ROUTES.HOME}
            className="px-4 py-2 border border-border-muted hover:bg-surface-container-high text-xs font-bold rounded-xl transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Strip H1 tag if present in body to avoid duplicate primary heading tags
  const cleanHtml = post.longFormBody.replace(/^\s*<h1>[\s\S]*?<\/h1>/i, '');

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 animate-fadein relative" id="blog-post-view">
      <SEO slug={post.slug} />

      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-surface-container-high z-50">
        <div
          className="h-full bg-emerald-500 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back to Blog button */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.BLOG}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog list</span>
        </Link>

        {/* Share Button */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-low border border-border-muted hover:bg-surface-container-high text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 transition-all shadow-sm cursor-pointer"
          aria-label="Copy article link to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
        </button>
      </div>

      {/* Title block */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.h1 || post.name}
        </h1>

        {/* Author / Date / Time Metadata Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium border-b border-border-muted pb-6">
          <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[10px]">
            <Shield className="w-4 h-4" />
            PDF PRIVACY SECURE
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {readingTime}
          </span>
        </div>
      </div>

      {/* Dynamic Rich Article Content */}
      <article
        className="prose prose-slate max-w-none dark:prose-invert font-sans
          [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3 
          [&_p]:text-slate-600 dark:[&_p]:text-slate-300 [&_p]:text-base [&_p]:leading-relaxed [&_p]:mb-6
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-6 [&_ul_li]:text-slate-600 dark:[&_ul_li]:text-slate-300 [&_ul_li]:text-base
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-6 [&_ol_li]:text-slate-600 dark:[&_ol_li]:text-slate-300 [&_ol_li]:text-base
          [&_strong]:font-semibold [&_strong]:text-slate-900 dark:[&_strong]:text-white
          [&_code]:font-mono [&_code]:text-xs [&_code]:bg-slate-100 dark:[&_code]:bg-slate-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
          [&_a]:text-emerald-600 dark:[&_a]:text-emerald-400 [&_a]:underline hover:[&_a]:text-emerald-500 font-bold"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
        id="blog-post-content"
      />

      {/* Offline Sandbox Guarantee Banner */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/40 dark:to-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 m-0">
          <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-4.5 h-4.5" />
          </span>
          PDFMinty Local Sandbox Guarantee
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 m-0 leading-relaxed font-medium">
          As written in the guide above, privacy is our top imperative. PDFMinty runs entirely in your local browser sandbox utilizing WebAssembly. Your files are processed locally in your browser memory and are <strong>never</strong> uploaded to a server or stored externally.
        </p>
      </div>

      {/* Suggested Reads / Related Articles Footer */}
      {relatedPosts.length > 0 && (
        <div className="pt-12 border-t border-border-muted space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Related Reads</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((rPost) => (
              <Link
                key={rPost.id}
                to={`/${rPost.slug}`}
                className="group block p-4 bg-surface-container-low border border-border-muted hover:border-emerald-500/40 rounded-xl transition-all"
              >
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                  {rPost.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {rPost.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostPage;
