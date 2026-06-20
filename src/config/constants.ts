export interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  icon: string;
}

export const tools: Tool[] = [
  {
    id: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF files into a single, clean document in any order you choose.",
    category: "page-operations",
    path: "/merge-pdf",
    icon: "Merge",
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract ranges of pages or split custom pages into multi-part individual documents.",
    category: "page-operations",
    path: "/split-pdf",
    icon: "Scissors",
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce file size footprint using professional compression schemes purely in your browser.",
    category: "utilities",
    path: "/compress-pdf",
    icon: "Minimize2",
  },
  {
    id: "rotate-pdf",
    title: "Rotate PDF",
    description: "Rotate single pages or the entire document pages 90, 180, or 270 degrees clockwise.",
    category: "page-operations",
    path: "/rotate-pdf",
    icon: "RotateCw",
  },
  {
    id: "delete-pages-pdf",
    title: "Delete Pages",
    description: "Selectively strip out unwanted, trailing, or confidential pages from your master files.",
    category: "organize",
    path: "/delete-pages-pdf",
    icon: "Trash2",
  },
  {
    id: "watermark-pdf",
    title: "Watermark PDF",
    description: "Superimpose elegant, custom diagonal text stamps with configurable size and transparency.",
    category: "security-edit",
    path: "/watermark-pdf",
    icon: "Bookmark",
  },
  {
    id: "add-page-numbers",
    title: "Page Numbers",
    description: "Stitch standard page indices automatically onto document page footer panels.",
    category: "security-edit",
    path: "/add-page-numbers",
    icon: "Hash",
  },
  {
    id: "add-blank-page",
    title: "Add Blank Page",
    description: "Incorporate empty page spacing into start, middle, or end of your document flows.",
    category: "organize",
    path: "/add-blank-page",
    icon: "FilePlus",
  },
  {
    id: "protect-pdf",
    title: "Protect PDF",
    description: "Encrypt and secure your sensitive PDFs using state-of-the-art browser password standard hashes.",
    category: "security-edit",
    path: "/protect-pdf",
    icon: "Shield",
  },
  {
    id: "unlock-pdf",
    title: "Unlock PDF",
    description: "Strip document lock credentials from your standard user files for clear, unlocked reading.",
    category: "security-edit",
    path: "/unlock-pdf",
    icon: "Lock",
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Convert multiple PNG or JPG photos into clean formatted PDF pages instantly.",
    category: "convert",
    path: "/image-to-pdf",
    icon: "Image",
  },
  {
    id: "pdf-to-image",
    title: "PDF to Image",
    description: "Convert multiple pages from document directly into portable standard image canvases.",
    category: "convert",
    path: "/pdf-to-image",
    icon: "Eye",
  },
  {
    id: "ai-analyze",
    title: "AI Analyze",
    description: "Summarize, analyze, and inspect your PDF document content using secure offline local text parsing boosted by premium AI assistance.",
    category: "intelligence",
    path: "/intelligence",
    icon: "Sparkles",
  }
];
