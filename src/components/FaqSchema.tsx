import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { TOOLS } from '../config/seo-data';

export default function FaqSchema() {
  const location = useLocation();
  const path = location.pathname;
  const currentSlug = path.replace(/^\//, '').replace(/\/$/, '');

  // Find the tool definition in the central SEO array
  const tool = TOOLS.find((t) => t.slug === currentSlug);

  // If there is no tool or the tool doesn't have faqs metadata, render nothing
  if (!tool || !tool.faqs || tool.faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
export { FaqSchema };
