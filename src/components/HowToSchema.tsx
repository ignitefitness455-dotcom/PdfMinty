import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { TOOLS, SITE_URL } from '../config/seo-data';

interface HowToStep {
  '@type': 'HowToStep';
  url: string;
  name: string;
  itemListElement: Array<{ '@type': 'HowToDirection'; text: string }>;
}

export default function HowToSchema() {
  const location = useLocation();
  const path = location.pathname;
  const currentSlug = path.replace(/^\//, '').replace(/\/$/, '');

  // Find the tool definition in the SEO central array
  const tool = TOOLS.find((t) => t.slug === currentSlug);

  // If there is no tool or the tool doesn't have howTo metadata, render nothing
  if (!tool || !tool.howTo) return null;

  const schemaData = tool.howTo;
  const absoluteUrl = `${SITE_URL}/${tool.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: schemaData.name,
    totalTime: schemaData.totalTime,
    step: schemaData.steps.map(
      (stepText, index): HowToStep => ({
        '@type': 'HowToStep',
        url: `${absoluteUrl}#step${index + 1}`,
        name: stepText,
        itemListElement: [{ '@type': 'HowToDirection', text: stepText }],
      })
    ),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
