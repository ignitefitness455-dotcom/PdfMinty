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

  const isFAQPage = pathname === "/is-it-safe-to-upload-pdf-to-online-tools";

  const schema = useMemo(() => {
    if (isFAQPage) {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is it safe to upload sensitive PDF files to online converters?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Only if the tool operates 100% client-side. Standard tools upload documents to remote servers, exposing files to security risks. PDFMinty runs offline, ensuring your documents never leave your physical device."
            }
          },
          {
            "@type": "Question",
            "name": "How does client-side PDF processing work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Using WebAssembly binaries and Web Workers, PDF documents are processed entirely in your browser's RAM, keeping them isolated from external clouds."
            }
          },
          {
            "@type": "Question",
            "name": "Does PDFMinty save copies of my processed files?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. PDFMinty processes files in-memory and does not have any backend storage or server, leaving no traces of your data anywhere."
            }
          }
        ]
      };
    }

    if (!activeTool || !activeTool.steps || activeTool.steps.length === 0) {
      return null;
    }

    const cleanDescription = (desc: string) => {
      return desc ? desc.replace(/<[^>]*>/g, "") : "";
    };

    return {
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
  }, [activeTool, isFAQPage, pathname]);

  if (!schema) {
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default HowToSchema;
