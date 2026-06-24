import React from 'react';

import { ToolCard } from './ToolCard';

interface ToolInfo {
  name: string;
  slug: string;
  description: string;
}

interface ToolGridProps {
  filteredTools: ToolInfo[];
  onClearSearch: () => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ filteredTools, onClearSearch }) => {
  if (filteredTools.length === 0) {
    return (
      <div
        aria-live="polite"
        className="text-center py-20 border-2 border-dashed border-border-muted rounded-[32px] max-w-lg mx-auto bg-surface-container-low shadow-xl"
      >
        <p className="text-primary font-black text-lg mb-2 font-sans">No tools found</p>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed font-semibold">
          We couldn't find any tools matching your search. Try checking your spelling or search for something else.
        </p>
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-6 px-6 py-3 bg-surface-container-high hover:bg-surface-container-highest border border-border-muted font-extrabold text-xs text-primary-fixed rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-security-green"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
};
