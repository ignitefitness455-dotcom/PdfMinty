import React, { useState, useMemo } from 'react';

import { EmailJoinForm } from '../components/EmailJoinForm';
import { useLayout } from '../components/Layout';
import { SEO } from '../components/SEO';
import { SeoResourcesSection } from '../components/SeoResourcesSection';
import { TOOLS } from '../config/seo-data';
import { useDebounce } from '../hooks/useDebounce';

import { CtaSection } from './home/CtaSection';
import { FaqSection } from './home/FaqSection';
import { HeroSection } from './home/HeroSection';
import { HowItWorksSection } from './home/HowItWorksSection';
import { RecommendedToolsSection } from './home/RecommendedToolsSection';
import { SearchBar } from './home/SearchBar';
import { ToolGrid } from './home/ToolGrid';
import { WhyChooseSection } from './home/WhyChooseSection';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'workflows', name: 'Workflows' },
  { id: 'organize', name: 'Organize PDF' },
  { id: 'optimize', name: 'Optimize PDF' },
  { id: 'convert', name: 'Convert PDF' },
  { id: 'edit', name: 'Edit PDF' },
  { id: 'security', name: 'PDF Security' },
  { id: 'intelligence', name: 'PDF Intelligence' }
];

const isToolInCategory = (slug: string, categoryId: string): boolean => {
  if (categoryId === 'all') return true;
  
  switch (categoryId) {
    case 'workflows':
      return ['merge-pdf', 'split-pdf', 'reorder-pdf', 'extract-pages-pdf'].includes(slug);
    case 'organize':
      return ['reorder-pdf', 'extract-pages-pdf', 'delete-pages-pdf', 'rotate-pdf', 'add-blank-page'].includes(slug);
    case 'optimize':
      return ['grayscale-pdf', 'repair-pdf', 'sanitize-pdf', 'flatten-pdf'].includes(slug);
    case 'convert':
      return ['image-to-pdf', 'pdf-to-image', 'pdf-to-markdown'].includes(slug);
    case 'edit':
      return ['watermark-pdf', 'add-page-numbers', 'edit-pdf-metadata', 'sign-pdf'].includes(slug);
    case 'security':
      return ['protect-pdf', 'unlock-pdf', 'flatten-pdf', 'sanitize-pdf'].includes(slug);
    case 'intelligence':
      return ['ai-analyze-pdf', 'ocr-pdf'].includes(slug);
    default:
      return false;
  }
};

export const HomePage: React.FC = () => {
  const { toolsList = [] } = useLayout() || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { debouncedValue, isDebouncing } = useDebounce(searchQuery, 300);

  const sortedTools = useMemo(() => {
    if (!Array.isArray(toolsList)) return [];
    return [...toolsList].sort((a, b) => {
      if (!a || !a.slug) return 0;
      if (!b || !b.slug) return 0;
      const toolA = TOOLS.find((t) => t.slug === a.slug);
      const toolB = TOOLS.find((t) => t.slug === b.slug);
      const rankA = toolA?.homeRank ?? 999;
      const rankB = toolB?.homeRank ?? 999;
      return rankA - rankB;
    });
  }, [toolsList]);

  const filteredTools = useMemo(() => {
    const cleanQuery = (debouncedValue || '').toLowerCase().trim();
    
    // First filter by category
    const categoryFiltered = sortedTools.filter((tool) => {
      return tool && tool.slug && isToolInCategory(tool.slug, selectedCategory);
    });

    if (!cleanQuery) return categoryFiltered;
    
    return categoryFiltered.filter(
      (tool) =>
        (tool.name || '').toLowerCase().includes(cleanQuery) ||
        (tool.description || '').toLowerCase().includes(cleanQuery)
    );
  }, [sortedTools, debouncedValue, selectedCategory]);

  return (
    <div className="animate-fadein relative z-10 font-sans text-on-background bg-background pb-12 overflow-x-hidden">
      <SEO />

      {/* Decorative Glow Elements */}
      <div
        className="absolute top-[-150px] left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[450px] pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(ellipse at center, var(--custom-security-green) 0%, transparent 60%)'
        }}
        aria-hidden="true"
      />

      <HeroSection />

      <div className="mb-8 max-w-lg mx-auto" id="all-tools">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          isDebouncing={isDebouncing}
          placeholder="Search PDF tools..."
        />
      </div>

      {/* Category Filter Tabs (2 Horizontal Rows) */}
      <div className="mb-10 max-w-4xl mx-auto px-4 space-y-2.5" id="tool-categories">
        {/* Row 1 */}
        <div className="flex items-center gap-2 sm:grid sm:grid-cols-4 overflow-x-auto scrollbar-none py-0.5 select-none">
          {CATEGORIES.slice(0, 4).map((category) => {
            const isActive = selectedCategory === category.id;
            const count = sortedTools.filter((t) => isToolInCategory(t.slug, category.id)).length;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer border active:scale-95 shrink-0 sm:shrink ${
                  isActive
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-full font-black ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-2 sm:grid sm:grid-cols-4 overflow-x-auto scrollbar-none py-0.5 select-none">
          {CATEGORIES.slice(4, 8).map((category) => {
            const isActive = selectedCategory === category.id;
            const count = sortedTools.filter((t) => isToolInCategory(t.slug, category.id)).length;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer border active:scale-95 shrink-0 sm:shrink ${
                  isActive
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`text-[10px] md:text-[11px] px-2 py-0.5 rounded-full font-black ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ToolGrid
        filteredTools={filteredTools}
        onClearSearch={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
      />

      <HowItWorksSection />

      <WhyChooseSection />

      <RecommendedToolsSection />

      <SeoResourcesSection />

      <FaqSection />

      <div className="mt-16 max-w-4xl mx-auto px-4">
        <EmailJoinForm />
      </div>

      <CtaSection />
    </div>
  );
};

export default HomePage;
