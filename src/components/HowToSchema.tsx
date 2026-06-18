import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLayout } from "./Layout";

interface HowToStep {
  name: string;
  text: string;
}

interface HowToSchemaProps {
  title?: string;
  description?: string;
  steps?: HowToStep[];
}

export const HowToSchema: React.FC<HowToSchemaProps> = ({ title, description, steps }) => {
  const { pathname } = useLocation();
  const { toolsList } = useLayout();

  const activeTool = useMemo(() => {
    const pathSegments = pathname.toLowerCase().split("/").filter(Boolean);
    return toolsList.find((t) => pathSegments.includes(t.slug.toLowerCase()));
  }, [toolsList, pathname]);

  const isFAQPage = pathname === "/is-it-safe-to-upload-pdf-to-online-tools";

  const schema = useMemo(() => {
    // If explicit steps are provided by the caller, use them
    if (steps && title && description) {
      return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: title,
        description: description,
        step: steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.name,
          text: step.text,
        })),
      };
    }

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

    const toolAny = activeTool as any;
    if (!toolAny || !toolAny.steps || toolAny.steps.length === 0) {
      return null;
    }

    const cleanDescription = (desc: string) => {
      return desc ? desc.replace(/<[^>]*>/g, "") : "";
    };

    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to use ${toolAny.name} - PDFMinty`,
      "description": cleanDescription(toolAny.description),
      "step": toolAny.steps.map((step: { title: string; desc: string }, index: number) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": step.title,
        "text": step.desc,
        "url": `https://pdfminty.com${pathname}`
      }))
    };
  }, [activeTool, isFAQPage, pathname, title, description, steps]);

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
