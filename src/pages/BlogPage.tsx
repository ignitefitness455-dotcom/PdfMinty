import { ArrowLeft, BookOpen, Search, Clock, Calendar, Shield, Cpu, FileSignature } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { SEO } from '../components/SEO';
import { ROUTES } from '../config/routes';
import { TOOLS, ToolSEOInfo } from '../config/seo-data';

export const BlogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Security' | 'Privacy' | 'Optimization' | 'Tutorials'>('all');

  // Filter to find all individual articles except the blog index page itself
  const blogPosts = useMemo(() => {
    return TOOLS.filter((t) => t.type === 'article' && t.id !== 'blog');
  }, []);

  // Map post IDs to clean user-facing categories
  const getPostCategory = (id: string): 'Security' | 'Privacy' | 'Optimization' | 'Tutorials' => {
    switch (id) {
      case 'trust-article':
        return 'Security';
      case 'blog-privacy':
      case 'blog-privacy-2026':
      case 'blog-free-esignature':
        return 'Privacy';
      case 'blog-compress':
      case 'blog-batch-processing':
        return 'Optimization';
      case 'blog-metadata':
        return 'Tutorials';
      default:
        return 'Tutorials';
    }
  };

  // Get icons matching categories
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="w-4 h-4" />;
      case 'Privacy':
        return <Cpu className="w-4 h-4" />;
      case 'Optimization':
        return <Clock className="w-4 h-4" />;
      case 'Tutorials':
        return <FileSignature className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // Estimate reading time from HTML longFormBody content
  const getReadingTime = (html: string): string => {
    const text = html.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 225)); // average 225 words per minute
    return `${time} min read`;
  };

  // Format the publication dates beautifully
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

  // Filtered posts based on search query and category selection
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const category = getPostCategory(post.id);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      const matchesSearch =
        post.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.h1 && post.h1.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [blogPosts, selectedCategory, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-10 animate-fadein" id="blog-landing-container">
      <SEO slug="blog" />

      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          id="back-to-home-link"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>

      {/* Main Hero & Description */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Knowledge Hub</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          PDFMinty Blog & Resources
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed">
          Expert guides, privacy-first tutorials, and technical analyses on secure document management, browser cryptography, and offline PDF optimization.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface-container-low border border-border-muted rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides and tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            id="blog-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" id="category-filters">
          {(['all', 'Security', 'Privacy', 'Optimization', 'Tutorials'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-background hover:bg-surface-container-high border-border-muted text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="blog-posts-grid">
          {filteredPosts.map((post) => {
            const category = getPostCategory(post.id);
            const readingTime = getReadingTime(post.longFormBody);
            const formattedDate = getFormattedDate(post);
            // Dynamic path using the slug directly
            const targetPath = `/${post.slug}`;

            return (
              <article
                key={post.id}
                className="group flex flex-col justify-between p-6 bg-surface-container-low border border-border-muted rounded-2xl hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/2 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Category and Meta info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-high border border-border-muted rounded-md text-emerald-600 dark:text-emerald-400 font-bold">
                      {getCategoryIcon(category)}
                      {category}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Title */}
                  <Link to={targetPath} className="block group-hover:text-emerald-600 transition-colors">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                      {post.name}
                    </h2>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {post.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-border-muted text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {readingTime}
                  </span>
                  <Link
                    to={targetPath}
                    className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <span>Read Article</span>
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-container-low border border-border-muted rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No articles match your criteria</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
            Try adjusting your search query or selecting a different category to explore.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-all shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
