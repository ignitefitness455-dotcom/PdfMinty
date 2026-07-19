import { Sparkles } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { iconMap, badgeColors, badgeLabels, prefetchToolChunk } from '../../config/homeConfig';
import { TOOLS } from '../../config/seo-data';

interface ToolInfo {
  name: string;
  slug: string;
  description: string;
}

interface ToolCardProps {
  tool: ToolInfo;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const navigate = useNavigate();
  const toolSEO = TOOLS.find((t) => t.slug === tool.slug);
  if (!toolSEO) return null;

  const Icon = iconMap[toolSEO.icon] || Sparkles;
  const toolId = toolSEO.id;

  let badge = null;
  if (toolSEO.badge) {
    badge = {
      text: badgeLabels[toolSEO.badge] || toolSEO.badge,
      color: badgeColors[toolSEO.badge] || 'bg-slate-400/10 text-slate-400 border-slate-400/20',
    };
  }

  const handleLaunch = () => {
    window.scrollTo(0, 0);
    navigate(`/${tool.slug}`);
  };

  const isHighlighted = ['sign-pdf', 'ocr-pdf', 'ai-analyze-pdf', 'merge-pdf', 'split-pdf'].includes(tool.slug);

  return (
    <button
      type="button"
      id={`tool-card-${toolId}`}
      onClick={handleLaunch}
      onMouseEnter={() => prefetchToolChunk(tool.slug)}
      onFocus={() => prefetchToolChunk(tool.slug)}
      className={`page-card glass-panel rounded-[24px] p-6 flex flex-col justify-between text-left group transition-all duration-300 transform hover:-translate-y-1 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-security-green ${
        isHighlighted
          ? 'border-security-green/40 dark:border-security-green/50 shadow-[0_4px_24px_rgba(5,150,105,0.08)] hover:shadow-[0_4px_30px_rgba(5,150,105,0.16)] bg-gradient-to-br from-white/90 to-emerald-50/[0.15] dark:from-neutral-900/90 dark:to-emerald-950/[0.08]'
          : 'border-border-muted hover:border-security-green shadow-lg hover:shadow-security-green/5'
      }`}
    >
      {isHighlighted && (
        <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-transparent via-security-green/60 to-transparent rounded-b-full" />
      )}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low border border-border-muted flex items-center justify-center transition-transform group-hover:scale-110 shadow-md">
            <Icon className="w-5.5 h-5.5 text-security-green" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1.5">
            {isHighlighted && (
              <span className="text-[9px] font-black tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400 rounded-full border border-amber-500/20 animate-pulse-slow">
                ★ HIGH DEMAND
              </span>
            )}
            {badge && !['popular', 'ai_hybrid'].includes(toolSEO.badge || '') && (
              <span
                className={`text-[9px] font-extrabold tracking-wider px-2.5 py-1 rounded-full border ${badge.color}`}
              >
                {badge.text}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-black text-primary leading-snug mb-2 group-hover:text-security-green transition-colors font-sans">
          {tool.name}
        </h3>
        <p className="text-on-surface-variant text-xs leading-relaxed font-semibold line-clamp-2 min-h-[2.5rem]">
          {tool.description}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-xs text-on-surface-variant group-hover:text-security-green transition-all font-bold">
        Launch Tool{' '}
        <span className="translate-x-0 group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </button>
  );
};
