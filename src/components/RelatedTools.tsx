import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useLayout } from './Layout';

const RELATED_MAPPING: Record<string, string[]> = {
  'edit-pdf-metadata': ['sanitize-pdf', 'protect-pdf', 'unlock-pdf', 'repair-pdf', 'flatten-pdf'],
  'sanitize-pdf': ['edit-pdf-metadata', 'protect-pdf', 'unlock-pdf', 'flatten-pdf', 'repair-pdf'],
  'merge-pdf': ['split-pdf', 'reorder-pdf', 'extract-pages-pdf', 'delete-pages-pdf', 'add-blank-page'],
  'split-pdf': ['merge-pdf', 'extract-pages-pdf', 'delete-pages-pdf', 'reorder-pdf', 'add-blank-page'],
  'rotate-pdf': ['reorder-pdf', 'delete-pages-pdf', 'extract-pages-pdf', 'merge-pdf'],
  'delete-pages-pdf': ['extract-pages-pdf', 'reorder-pdf', 'split-pdf', 'merge-pdf', 'add-blank-page'],
  'extract-pages-pdf': ['delete-pages-pdf', 'reorder-pdf', 'split-pdf', 'merge-pdf', 'add-blank-page'],
  'reorder-pdf': ['rotate-pdf', 'delete-pages-pdf', 'extract-pages-pdf', 'merge-pdf', 'add-blank-page'],
  'watermark-pdf': ['add-page-numbers', 'protect-pdf', 'edit-pdf-metadata', 'flatten-pdf'],
  'add-page-numbers': ['watermark-pdf', 'add-blank-page', 'reorder-pdf', 'merge-pdf'],
  'add-blank-page': ['merge-pdf', 'split-pdf', 'reorder-pdf', 'add-page-numbers', 'delete-pages-pdf'],
  'protect-pdf': ['unlock-pdf', 'sanitize-pdf', 'edit-pdf-metadata', 'flatten-pdf'],
  'unlock-pdf': ['protect-pdf', 'sanitize-pdf', 'edit-pdf-metadata', 'repair-pdf'],
  'image-to-pdf': ['pdf-to-image', 'merge-pdf', 'pdf-to-markdown', 'ai-analyze-pdf'],
  'pdf-to-image': ['image-to-pdf', 'pdf-to-markdown', 'ai-analyze-pdf', 'extract-pages-pdf'],
  'pdf-to-markdown': ['ai-analyze-pdf', 'pdf-to-image', 'image-to-pdf', 'extract-pages-pdf'],
  'ai-analyze-pdf': ['pdf-to-markdown', 'pdf-to-image', 'sanitize-pdf', 'edit-pdf-metadata'],
  'grayscale-pdf': ['flatten-pdf', 'watermark-pdf', 'sanitize-pdf', 'repair-pdf'],
  'flatten-pdf': ['grayscale-pdf', 'protect-pdf', 'sanitize-pdf', 'watermark-pdf'],
  'repair-pdf': ['unlock-pdf', 'sanitize-pdf', 'edit-pdf-metadata', 'flatten-pdf'],
};

export const RelatedTools: React.FC = () => {
  const { pathname } = useLocation();
  const { toolsList } = useLayout();

  const related = useMemo(() => {
    const segments = pathname.toLowerCase().split('/').filter(Boolean);
    const activeTool = toolsList.find((t) => segments.includes(t.slug.toLowerCase()));

    if (!activeTool) return [];

    const curatedSlugs = RELATED_MAPPING[activeTool.slug];

    if (curatedSlugs) {
      // Filter existing tools matching the curated slugs in order
      const curatedList = curatedSlugs
        .map(slug => toolsList.find(t => t.slug === slug))
        .filter((t): t is typeof toolsList[number] => !!t && t.slug !== activeTool.slug);
      
      if (curatedList.length >= 3) {
        return curatedList.slice(0, 3);
      }
    }

    const list = toolsList.filter((t) => t.slug !== activeTool.slug);
    const currentIdx = toolsList.indexOf(activeTool);
    const fallbackIdx = currentIdx !== -1 ? currentIdx : 0;

    return list.slice(fallbackIdx % list.length, (fallbackIdx % list.length) + 3);
  }, [toolsList, pathname]);

  if (pathname === '/') return null;

  return (
    <div className="mt-12 pt-8 border-t border-slate-200" id="related_tools_box">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400 mb-4">
        Related PDF Tools
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.slug}
            to={`/${tool.slug}`}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-all hover:shadow-sm"
          >
            <span className="font-bold text-sm text-slate-800 block hover:text-emerald-700 transition-colors">
              {tool.name}
            </span>
            <span className="text-[11px] text-slate-500 block line-clamp-1 mt-1">
              {tool.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
