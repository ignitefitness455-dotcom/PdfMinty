import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLayout } from "./Layout";

export const HowToSchema: React.FC = () => {
  const { pathname } = useLocation();
  const { toolsList } = useLayout();

  const activeTool = useMemo(() => {
    const pathSegments = pathname.toLowerCase().split("/").filter(Boolean);
    return toolsList.find((t) => pathSegments.includes(t.slug.toLowerCase()));
  }, [toolsList, pathname]);

  if (!activeTool || !activeTool.steps || activeTool.steps.length === 0) {
    return null;
  }

  const cleanDescription = (desc: string) => {
    return desc ? desc.replace(/<[^>]*>/g, "") : "";
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${activeTool.name} - PDFMinty`,
    "description": cleanDescription(activeTool.description),
    "step": activeTool.steps.map((step: { title: string; desc: string }, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title,
      "text": step.desc,
      "url": `https://pdfminty.com${pathname}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default HowToSchema;
