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

export const HomePage: React.FC = () => {
  const { toolsList } = useLayout();
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!cleanQuery) return sortedTools;
    return sortedTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery)
    );
  }, [sortedTools, debouncedValue]);

  return (
    <div className="animate-fadein relative z-10 font-sans text-on-background bg-background pb-12 overflow-x-hidden">
      <SEO />

      {/* Decorative Glow Elements */}
      <div
        className="absolute top-[-150px] left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[450px] bg-gradient-to-r from-security-green/10 via-primary-fixed/5 to-tertiary-fixed-dim/5 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <HeroSection />

      <div className="mb-14 max-w-lg mx-auto">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          isDebouncing={isDebouncing}
          placeholder="Search PDF tools..."
        />
      </div>

      <ToolGrid
        filteredTools={filteredTools}
        onClearSearch={() => setSearchQuery('')}
      />

      <HowItWorksSection />

      <WhyChooseSection />

      <FaqSection />

      <CtaSection />
    </div>
  );
};

export default HomePage;
