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

      {/* Category Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12 max-w-3xl mx-auto px-4" id="tool-categories">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full px-4 py-3 rounded-xl text-xs md:text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center border ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm dark:bg-zinc-800 dark:border-zinc-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:bg-zinc-900/50 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200'
              }`}
            >
              {category.name}
            </button>
          );
        })}
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
