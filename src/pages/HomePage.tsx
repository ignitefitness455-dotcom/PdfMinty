import React, { useState, useMemo } from 'react';

import { useLayout } from '../components/Layout';
import { SEO } from '../components/SEO';
import { TOOLS } from '../config/seo-data';
import { useDebounce } from '../hooks/useDebounce';

import { CtaSection } from './home/CtaSection';
import { FaqSection } from './home/FaqSection';
import { HeroSection } from './home/HeroSection';
import { HowItWorksSection } from './home/HowItWorksSection';
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
  const { toolsList } = useLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { debouncedValue, isDebouncing } = useDebounce(searchQuery, 300);

  const sortedTools = useMemo(() => {
    return [...toolsList].sort((a, b) => {
      const toolA = TOOLS.find((t) => t.slug === a.slug);
      const toolB = TOOLS.find((t) => t.slug === b.slug);
      const rankA = toolA?.homeRank ?? 999;
      const rankB = toolB?.homeRank ?? 999;
      return rankA - rankB;
    });
  }, [toolsList]);

  const filteredTools = useMemo(() => {
    const cleanQuery = debouncedValue.toLowerCase().trim();
    
    // First filter by category
    const categoryFiltered = sortedTools.filter((tool) => {
      return isToolInCategory(tool.slug, selectedCategory);
    });

    if (!cleanQuery) return categoryFiltered;
    
    return categoryFiltered.filter(
      (tool) =>
        tool.name.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery)
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

      <div className="mb-8 max-w-lg mx-auto">
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
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer border active:scale-95 shrink-0 sm:shrink ${
                  isActive
                    ? 'bg-security-green border-security-green text-slate-950 shadow-lg shadow-security-green/15'
                    : 'bg-surface-container-low hover:bg-surface-container-high border-border-muted text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`text-[10px] md:text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-slate-950/15 text-slate-950'
                      : 'bg-surface-container-highest/60 text-on-surface-variant/80'
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
                className={`whitespace-nowrap flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer border active:scale-95 shrink-0 sm:shrink ${
                  isActive
                    ? 'bg-security-green border-security-green text-slate-950 shadow-lg shadow-security-green/15'
                    : 'bg-surface-container-low hover:bg-surface-container-high border-border-muted text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`text-[10px] md:text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-slate-950/15 text-slate-950'
                      : 'bg-surface-container-highest/60 text-on-surface-variant/80'
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

      <FaqSection />

      <CtaSection />
    </div>
  );
};

export default HomePage;
