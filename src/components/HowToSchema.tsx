import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "../config/routes";

interface HowToStep {
  "@type": "HowToStep";
  "url": string;
  "name": string;
  "itemListElement": Array<{ "@type": "HowToDirection"; "text": string }>;
}

interface SchemaData {
  name: string;
  steps: string[];
  totalTime: string;
}

const schemas: Record<string, SchemaData> = {
  "/merge-pdf": { name: "How to Merge PDF Files Online for Free", steps: ["Upload your PDF files by clicking or dragging them", "Arrange files in your preferred order using drag handles", "Click 'Merge PDFs' button to combine them", "Download your merged PDF instantly"], totalTime: "PT30S" },
  "/split-pdf": { name: "How to Split a PDF File Online", steps: ["Upload your PDF document", "Enter page ranges to extract (e.g. 1-3, 5, 7-10)", "Click 'Split PDF' to extract selected pages", "Download the split PDF file"], totalTime: "PT30S" },
  "/compress-pdf": { name: "How to Compress a PDF File Online", steps: ["Upload your PDF file", "Select optimization level (Light, Metadata, or Deep Purge)", "Click 'Compress PDF' to optimize", "Download your optimized PDF"], totalTime: "PT20S" },
  "/rotate-pdf": { name: "How to Rotate PDF Pages Online", steps: ["Upload your PDF document", "Select pages to rotate or choose all pages", "Choose rotation angle (90°, 180°, or 270°)", "Download the rotated PDF"], totalTime: "PT20S" },
  "/organize": { name: "How to Delete Pages from a PDF", steps: ["Upload your PDF file", "Select the pages you want to delete", "Click 'Delete Pages' to remove them", "Download your updated PDF"], totalTime: "PT20S" },
  "/reorder-pdf": { name: "How to Reorder and Organize PDF Pages", steps: ["Upload your PDF document", "Drag and drop pages into your desired order", "Preview the new page sequence", "Download your reorganized PDF"], totalTime: "PT25S" },
  "/extract-pages-pdf": { name: "How to Extract Pages from a PDF", steps: ["Upload your PDF document", "Select the specific pages you want to extract", "Click 'Extract Pages'", "Download the new PDF with just those pages"], totalTime: "PT20S" },
  "/watermark-pdf": { name: "How to Add a Watermark to a PDF", steps: ["Upload your PDF document", "Enter your watermark text", "Adjust opacity, size, and rotation", "Click 'Apply Watermark' and download"], totalTime: "PT30S" },
  "/add-page-numbers": { name: "How to Add Page Numbers to a PDF", steps: ["Upload your PDF file", "Choose position (header or footer) and alignment", "Select numbering format and starting number", "Click 'Add Page Numbers' and download"], totalTime: "PT20S" },
  "/add-blank-page": { name: "How to Insert a Blank Page into a PDF", steps: ["Upload your PDF document", "Choose where to insert (start, end, or after a specific page)", "Select page size (A4, Letter, etc.)", "Click 'Add Blank Page' and download"], totalTime: "PT15S" },
  "/protect-pdf": { name: "How to Password Protect a PDF", steps: ["Upload your PDF file", "Enter a strong password", "Set optional permissions (printing, copying)", "Click 'Protect PDF' and download the encrypted file"], totalTime: "PT20S" },
  "/unlock-pdf": { name: "How to Remove Password from a PDF", steps: ["Upload your password-protected PDF", "Enter the document password", "Click 'Unlock PDF' to decrypt", "Download the unlocked PDF file"], totalTime: "PT15S" },
  "/image-to-pdf": { name: "How to Convert Images to PDF", steps: ["Upload your JPG, PNG, or WebP images", "Arrange images in the desired order", "Click 'Convert to PDF'", "Download your new PDF file"], totalTime: "PT30S" },
  "/pdf-to-image": { name: "How to Convert PDF to Images", steps: ["Upload your PDF document", "Select output format (JPG or PNG)", "Click 'Convert to Images'", "Download images as a ZIP file"], totalTime: "PT20S" },
  "/intelligence": { name: "How to Analyze a PDF with AI", steps: ["Upload your PDF document", "Wait for AI to extract text content", "Type your question or request a summary", "Read the AI-generated analysis"], totalTime: "PT60S" }
};

export default function HowToSchema() {
  const location = useLocation();
  const path = location.pathname;
  const schemaData = schemas[path];
  if (!schemaData) return null;

  const absoluteUrl = `${SITE_URL}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": schemaData.name,
    "totalTime": schemaData.totalTime,
    "step": schemaData.steps.map((star, index): HowToStep => ({
      "@type": "HowToStep",
      "url": `${absoluteUrl}#step${index + 1}`,
      "name": star,
      "itemListElement": [{ "@type": "HowToDirection", "text": star }]
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
