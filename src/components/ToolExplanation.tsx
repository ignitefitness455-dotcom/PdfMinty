import React from "react";
import { useLocation } from "react-router-dom";
import ShieldCheck from "lucide-react/icons/shield-check";
import Cpu from "lucide-react/icons/cpu";
import Zap from "lucide-react/icons/zap";
import UserCheck from "lucide-react/icons/user-check";
import Lock from "lucide-react/icons/lock";
import FileCheck from "lucide-react/icons/file-check";
import HelpCircle from "lucide-react/icons/help-circle";
import ChevronDown from "lucide-react/icons/chevron-down";

interface Step {
  title: string;
  desc: string;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface FAQ {
  q: string;
  a: string;
}

interface ToolConfig {
  toolName: string;
  title: string;
  description: string;
  steps: Step[];
  features: Feature[];
  faqs: FAQ[];
}

export const ToolExplanation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");

  // Generate dynamic tailored content configurations based on the URL path
  const getConfigForRoute = (path: string): ToolConfig => {
    const defaultFeatures = [
      {
        icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
        title: "100% Secure Sandbox",
        desc: "All merging, split and formatting algorithms run strictly inside your local web browser sandbox context. Your file never touches external third-party hard drives."
      },
      {
        icon: <Cpu className="w-5 h-5 text-indigo-500" />,
        title: "No Server Uploads",
        desc: "Your data privacy is our covenant. Working locally means you spend zero bytes uploading heavy documents, providing immune defense against internet wiretapping."
      },
      {
        icon: <Zap className="w-5 h-5 text-amber-500" />,
        title: "GPU/CPU Local Speed",
        desc: "Harnesses your matching local device hardware. Compile large documents with instantaneous offline processing speeds that destroy old cloud queue delays."
      },
      {
        icon: <UserCheck className="w-5 h-5 text-blue-500" />,
        title: "Completely Free & Unlocked",
        desc: "Enjoy full toolbox features offline. No registration gates, no paying traps, no watermarks, and no annoying email subscription requirements."
      }
    ];

    switch (path) {
      case "/merge-pdf":
        return {
          toolName: "Merge PDF",
          title: "Merge PDF Free Online — Combine Documents Locally",
          description: "Need to combine PDF pages securely without uploading sensitive bills, invoices, contracts, or credentials? PDFMinty is a premium free tool utilizing modern Web Workers inside your browser. Arrange, sort, and compile infinite documents offline.",
          steps: [
            { title: "Select or Drag Files", desc: "Choose multiple PDF documents from your storage and deposit them directly in our offline toolbox." },
            { title: "Sort Sequence Reorder", desc: "Reorder rows sequentially using manual drag handles or our immediate up/down quick triggers." },
            { title: "Compile & Export Results", desc: "Click compile to merge. A unified PDF is synthesized in your web memory, ready to download instantly." }
          ],
          features: [
            {
              icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
              title: "Confidentiality Retained",
              desc: "Perfect for legal agreements, bank statements, and HR documents. Zero files get staged on intermediate servers."
            },
            ...defaultFeatures.slice(1)
          ],
          faqs: [
            {
              q: "Is there a limit on how many PDFs I can merge?",
              a: "You can merge up to 20 files at once with a cumulative limit of 100MB per action. These standards exist to prevent local browser tabs from exceeding default resource limitations."
            },
            {
              q: "Are my confidential files uploaded or saved?",
              a: "Absolutely not. PDFMinty runs a strict offline-first runtime. All bytes are processed within your device's RAM and never leave to any database."
            },
            {
              q: "Will my custom fonts and table formats be preserved?",
              a: "Yes. Our binary compiler preserves all vector content, embedded images, form objects, custom stylesheets, and fonts from your original PDFs perfectly."
            }
          ]
        };

      case "/split-pdf":
        return {
          toolName: "Split PDF",
          title: "Split PDF Online Free — Extract Page Ranges Locally",
          description: "Cut and split long textbooks, financial reports, or manuals into precise individual chapters. Verify pages visually and download your target slides securely with zero intermediate web uploads.",
          steps: [
            { title: "Select Target Document", desc: "Load your target PDF file into our secure workspace area." },
            { title: "Visual Page Verification", desc: "Set target page splits (e.g., '1-3, 5') or inspect individual slide thumbnails on the workspace canvas." },
            { title: "Prune & Download Instantly", desc: "Click split pages to extract selected scopes instantly on your CPU." }
          ],
          features: [
            {
              icon: <FileCheck className="w-5 h-5 text-emerald-500" />,
              title: "Visual Slide Verification",
              desc: "Confirm first page properties and check layouts using our custom visual sandboxed preview before committing extracts."
            },
            ...defaultFeatures.slice(1)
          ],
          faqs: [
            {
              q: "Can I extract disjoint ranges like '1-3' and '7-10'?",
              a: "Yes. You can write comma-separated parameters like '1-4, 8, 12-15' or click checkboxes on the page verification dashboard to extract exactly matching sequences."
            },
            {
              q: "Do you compress pages while splitting?",
              a: "No. The extracted page vectors remain in high definition mirroring their original raw resolution quality with perfect accuracy."
            },
            {
              q: "Is it safe to split scanned bank statements?",
              a: "Perfectly safe. Since the split engine runs completely client-side, your confidential statements never traverse the web."
            }
          ]
        };

      case "/compress-pdf":
        return {
          toolName: "Compress PDF",
          title: "Compress PDF Online — Compress File Sizes Offline",
          description: "Shrink heavy documents to meet tough upload limits on government portals and email attachments. Our multi-tier compression algorithm safely compresses font maps, simplifies page layouts, and web-optimizes embedded images instantly.",
          steps: [
            { title: "Upload Heavy Document", desc: "Select files up to 50MB to compress directly inside your local memory sandbox." },
            { title: "Select Density Ratio", desc: "Choose 'Recommended' (optimal weight/clarity ratio), 'Max' (smallest files), or 'High Quality' (low compression)." },
            { title: "Optimize PDF Size", desc: "Click compress. Watch your file footprint dramatically decrease in seconds without pixelated leaks." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Zap className="w-5 h-5 text-amber-500" />,
              title: "Lossless Smart Compression",
              desc: "Intelligently flattens redundant background XML spaces and downscales graphics safely to 150 DPI for elegant web use."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "Will compressed text remain sharp?",
              a: "Yes. Our optimization relies on resource garbage pruning and visual element resampling. Plain characters and vector symbols remain as sharp as originally drawn."
            },
            {
              q: "How small can the compressed document get?",
              a: "Depending on image densities, documents often compact by 40% to 80% of their base weight. Standard plain-text PDFs compress slightly less."
            },
            {
              q: "Can I run this offline on my train commute?",
              a: "Yes. Once PDFMinty boots, the service worker caches the core modules in your browser. You can Compress PDFs on any device without internet connections."
            }
          ]
        };

      case "/rotate-pdf":
        return {
          toolName: "Rotate PDF",
          title: "Rotate PDF Free — Orient and Fixed Slides Instantly",
          description: "Instantly fix sideways scans, flipped pages, or incorrect portrait/landscape layouts. Use our interactive editor to preview and rotate individual pages or whole documents 90, 180, or 270 degrees.",
          steps: [
            { title: "Drop Files in Editor", desc: "Drop the PDF. Our workspace will load and analyze rotation structures immediately." },
            { title: "Select Rotation Angles", desc: "Click rotate buttons on the preview slides to adjust orientations interactively." },
            { title: "Apply & Re-export Slides", desc: "Commit rotations. Save the perfectly oriented document within seconds." }
          ],
          features: [
            ...defaultFeatures.slice(0, 3),
            {
              icon: <UserCheck className="w-5 h-5 text-blue-500" />,
              title: "Selective Page Alignment",
              desc: "Align only specific slides while keeping the rest untouched, avoiding uniform rotational errors on mixed sheets."
            }
          ],
          faqs: [
            {
              q: "Can I rotate only a single sheet in a 100-page book?",
              a: "Yes. Each preview page card has dedicated clockwise and counter-clockwise controls. Simply click the adjustments for page 4 and export."
            },
            {
              q: "Does rotating modify text layers?",
              a: "No. It injects standard vector coordinate rotation keys inside the PDF structure. Text blocks and highlight fields remain selectable."
            },
            {
              q: "Is there a limit on how many pages are processed?",
              a: "We support documents up to 200 pages inside standard local memory limits without bottlenecking your device."
            }
          ]
        };

      case "/organize":
        return {
          toolName: "Delete Pages",
          title: "Delete Pages Free Online — Reorganize PDFs Locally",
          description: "Prune unwanted pages, duplicate files, or blank covers from books or reports. Hover, inspect, select, and prune irrelevant content with a single click in browser memory.",
          steps: [
            { title: "Upload PDF File", desc: "Choose the document containing pages you want to delete." },
            { title: "Click Trash Icons", desc: "Review rendered thumbnails and click 'Delete Page' to wipe slides instantly." },
            { title: "Export Clean Document", desc: "Save the pruned document with full visual layout integrity." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Zap className="w-5 h-5 text-amber-500" />,
              title: "Instant Live Undo",
              desc: "Made a mistake? Instantly click the 'Restore' action or reset workspace arrays prior to compiling your document."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "Are the deleted pages permanently removed?",
              a: "Yes, they are omitted from the export stream and deleted from temporary RAM once you compile the clean file."
            },
            {
              q: "Can I also reorder or insert pages here?",
              a: "This tool focuses on page deletion and pruning. For sequential ordering or combination of files, use our Merge PDF tool."
            },
            {
              q: "Can I process scanned pages securely?",
              a: "Yes. All thumbnails are rendered inside a local canvas. Scanned IDs, medical sheets, and passports remain private."
            }
          ]
        };

      case "/watermark-pdf":
        return {
          toolName: "Add Watermark",
          title: "Add Watermark to PDF Free — Secure Digital Papers",
          description: "Protect intellectual work, stamps, and sensitive property leases. Stamp customized overlay text diagonal keys with full transparency opacity controls inside sandbox environments.",
          steps: [
            { title: "Import PDF Target", desc: "Select the PDF file that needs security protection stamps." },
            { title: "Type Custom Text Stamp", desc: "Write custom scripts (e.g., 'CONFIDENTIAL', 'SAMPLE') and set opacity, scale, and color." },
            { title: "Apply Overlays Offline", desc: "Review parameters and compile to stamp consistent background or foreground overlays." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Lock className="w-5 h-5 text-amber-500" />,
              title: "Diagonal Opacity Triggers",
              desc: "Adjust visibility, colors, sizes, and rotate angles safely to fit over drawings or under legal footnotes."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "Can I write watermarks in other languages?",
              a: "Yes. Our standard vector drawing handles Unicode characters cleanly, enabling watermarks in Spanish, Arabic, Bengali, etc."
            },
            {
              q: "Can watermarks be easily removed?",
              a: "We flatten text layouts into current content streams on compiling. Stripping it is highly difficult, ensuring strong protection."
            },
            {
              q: "Will the watermarked text overlay on every single page?",
              a: "By default, yes, the system stamps every page consistently. You can customize font weight and layout boundaries easily."
            }
          ]
        };

      case "/add-page-numbers":
        return {
          toolName: "Add Page Numbers",
          title: "Add Page Numbers to PDF — Label Sheets Online",
          description: "Organize raw thesis slides, reports, or legal briefs by injecting sequential footer or header numbers. Choose alignments, fonts, offsets, and start values offline.",
          steps: [
            { title: "Deposit PDF File", desc: "Drag the unnumbered document into our web panel workflow." },
            { title: "Set Layout Alignment", desc: "Select layout alignments (e.g., Center, Bottom Right) and style options." },
            { title: "Inject Labels Offline", desc: "Verify coordinates and click compile to add vector numbers immediately." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <FileCheck className="w-5 h-5 text-indigo-500" />,
              title: "Custom Offsets & Skips",
              desc: "Easily skip cover pages and start counting from page 2 to maintain elegant layout conventions."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "Can I choose different styling and text formats?",
              a: "Yes. You can output simple page counts like '1' or descriptive prefixes like 'Page 1 of 24' depending on standard conventions."
            },
            {
              q: "Are the font families fully matching?",
              a: "We use standard web-safe vector fonts (Helvetica, Times Roman) ensuring perfect clarity at any printable size."
            },
            {
              q: "Can other people modify my page numbers?",
              a: "The page numbering structures are natively hard-baked into your document elements prior to exporting."
            }
          ]
        };

      case "/add-blank-page":
        return {
          toolName: "Add Blank Page",
          title: "Add Blank Page to PDF Free — Insert Custom Breaks",
          description: "Perfect for inserting notes pages, cover slots, or creating dual-sided printing alignments. Choose paper styles, orientations, and insert coordinates purely on your CPU.",
          steps: [
            { title: "Load Primary Document", desc: "Select the target PDF file that requires layout inserting additions." },
            { title: "Input Insertion Point", desc: "Specify insertion coordinates (e.g. 'after Page 1') and match dimensions (A4, Letter)." },
            { title: "Merge Blank Slots", desc: "Confirm pages structure and compile to export combined assets." }
          ],
          features: [
            ...defaultFeatures.slice(0, 3),
            {
              icon: <FileCheck className="w-5 h-5 text-blue-500" />,
              title: "Aspect Ratio Matcher",
              desc: "Our engine auto-matches page dimensions, generating Letter size sheets for Letter files, and A4 canvas for A4 files."
            }
          ],
          faqs: [
            {
              q: "Can I insert multiple blank sheets?",
              a: "Yes. You can insert multiple clean pages at distinct indexes throughout your document sequence."
            },
            {
              q: "Does adding pages alter previous content?",
              a: "No. Content, text fields, links, and forms remain unaffected. Pages are shifted over to clear slot arrays exactly."
            },
            {
              q: "Can I write directly on the blank page?",
              a: "This tool generates a blank sheet. To add rich annotations or signatures, we suggest using standard local PDF readers."
            }
          ]
        };

      case "/protect-pdf":
        return {
          toolName: "Protect PDF",
          title: "Protect PDF Free — Secure and Encrypt Files Offline",
          description: "Encrypt your sensitive documents. We use industry-standard security models to inject open passwords, restrict editing, copy, or printing capabilities entirely locally.",
          steps: [
            { title: "Load Confidential PDF", desc: "Select the PDF file you wish to secure with a password key." },
            { title: "Type Master Password", desc: "Define your password credentials. Select permission flags if required." },
            { title: "Encrypt Sandbox Core", desc: "Run local encryption. Export the protected document safely." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Lock className="w-5 h-5 text-indigo-500" />,
              title: "128-bit Encryption Standard",
              desc: "Utilizes robust standard algorithms matching Adobe Acrobat security guidelines to block unauthorized decryption."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "Is my security key sent to third parties?",
              a: "Absolutely not. Encryption calculations operate within local browser memory. No data is sent over the network."
            },
            {
              q: "What printing restrictions are available?",
              a: "You can restrict copying text blocks, physical document printing, or fill forms. Secure your PDF with confidence."
            },
            {
              q: "Is there an un-protect option?",
              a: "If you have the password, you can use our Unlock PDF tool in PDFMinty to decrypt it later."
            }
          ]
        };

      case "/unlock-pdf":
        return {
          toolName: "Unlock PDF",
          title: "Unlock PDF Online Free — Decrypt and Open Password PDFs",
          description: "Remove restrictive locks on your tax records, invoices, or personal statements. Enter the decryption password locally to save unlocked, editable, and printable plaintext copies.",
          steps: [
            { title: "Upload Password PDF", desc: "Select the encrypted or secure PDF file you want to unlock." },
            { title: "Input Security Key", desc: "Enter your document password. PDFMinty decrypts bytes directly in your browser." },
            { title: "Download Plaintext Copy", desc: "Download the unlocked document. No password prompt is required on opening." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Lock className="w-5 h-5 text-indigo-500" />,
              title: "Decryption Sandbox",
              desc: "Decrypts directly in your individual browser instance. Keep confidential keys hidden from the cloud."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "Can I decrypt a file if I forgot my password?",
              a: "No. PDFMinty is block-level safe and respects file protection models. We do not brute-force or bypass keys without correct inputs."
            },
            {
              q: "Are the unlocked documents saved on servers?",
              a: "No. Decryption operations run within local sandbox memory. PDFMinty is entirely offline-driven."
            },
            {
              q: "Will this preserve form fields and tables?",
              a: "Yes. All internal properties, text boxes, tables, pages, and objects are preserved without formatting loss."
            }
          ]
        };

      case "/image-to-pdf":
        return {
          toolName: "Image to PDF",
          title: "Image to PDF Converter — PDF Image Binder Free",
          description: "Convert receipts, handwritten notes, whiteboard summaries, or ID photos into standard PDF documents. Arrange files and pack multiple JPEGs, PNGs, SVG, and WebPs into a single, compact PDF securely.",
          steps: [
            { title: "Select Digital Images", desc: "Upload images from your hard drive or camera roll." },
            { title: "Reorder & Style Margins", desc: "Arrange layout order. Customize paper dimensions (A4/Letter) and border margins." },
            { title: "Generate Standard PDF", desc: "Convert files locally. Download the single unified document instantly." }
          ],
          features: [
            ...defaultFeatures.slice(0, 3),
            {
              icon: <UserCheck className="w-5 h-5 text-blue-500" />,
              title: "Multi-Format Matcher",
              desc: "Supports mixed uploads of different file formats like JPG, JPEG, PNG, WebP, and SVG simultaneously."
            }
          ],
          faqs: [
            {
              q: "Can I convert high-definition PNG files?",
              a: "Yes. Images are integrated directly into standard PDF vector shells. Resolution quality is maintained for crisp printing."
            },
            {
              q: "Is there a limit on image count?",
              a: "We support converting up to 50 images in a single batch to keep processing memory-safe on all devices."
            },
            {
              q: "Can I crop or align drawings?",
              a: "You can arrange the order of slides. To crop images, we suggest utilizing your device's built-in image tools first."
            }
          ]
        };

      case "/pdf-to-image":
        return {
          toolName: "PDF to Image",
          title: "PDF to Image Converter — Extract Pages Free",
          description: "Extract beautiful JPG or clear transparent PNG frames from your PDF documents. Select resolutions up to high-definition 300 DPI for editing, presentation screens, or social sharing.",
          steps: [
            { title: "Load Primary Document", desc: "Drop your PDF file into the local converter panel." },
            { title: "Select Formats & DPI", desc: "Choose your format (JPEG/PNG) and resolution output (150/300 DPI)." },
            { title: "Export Image Assets", desc: "Download high-quality image slides or save them in a ZIP file instantly." }
          ],
          features: [
            ...defaultFeatures.slice(0, 3),
            {
              icon: <UserCheck className="w-5 h-5 text-blue-500" />,
              title: "High-DPI Vector Extractor",
              desc: "Configure standard 150 DPI for fast web previews or crisp 300 DPI for professional publishing templates."
            }
          ],
          faqs: [
            {
              q: "What is the difference between JPEG and PNG options?",
              a: "PNG preserves transparent overlay margins and is ideal for presentation slides, whereas JPEG offers smaller file sizes."
            },
            {
              q: "Why does my browser request multiple file downloads?",
              a: "We save page images sequentially. The browser query is a security measure. Click 'Allow' to download your files."
            },
            {
              q: "Can I convert specific page scopes?",
              a: "Yes. Our visual layout options let you choose to export all pages or input precise scopes (e.g., '3-5')."
            }
          ]
        };

      case "/intelligence":
        return {
          toolName: "AI Analyze Document",
          title: "AI PDF Document Analyzer — Secure Smart Extracts",
          description: "Interact with your contracts, study manuals, textbooks, or reports. Run OCR analysis and queries about key points securely from your own device memory.",
          steps: [
            { title: "Upload Text PDF", desc: "Choose the heavy report, legal ledger, or book to analyze." },
            { title: "Run Secure Reading", desc: "Let our engine parse text contents, tables, and structures offline." },
            { title: "Ask and Get Summaries", desc: "Query summaries or key points. Keep your sensitive documents anonymous." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Cpu className="w-5 h-5 text-blue-500" />,
              title: "Privacy Proxy OCR",
              desc: "Only extracted text fragments are queried through our proxy endpoints, protecting your raw files."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "Are my documents saved or trained on?",
              a: "Absolutely not. We do not use your confidential data for artificial intelligence model training."
            },
            {
              q: "Does the analyzer support multilingual tables?",
              a: "Yes, our layout-aware OCR parsing extracts structures, code blocks, and data columns beautifully in multiple languages."
            },
            {
              q: "Can I process scanned or image-only documents?",
              a: "Yes, the system extracts text from high-resolution images as well as scanned documents."
            }
          ]
        };

      default:
        return {
          toolName: "PDF Tools Suite",
          title: "Secure Client-Side PDF Tools — No Cloud Storage Leakages",
          description: "All PDF workflows on PDFMinty are designed for absolute performance and client-side safety. Merge, Compress, Split, Rotate, or Protect your PDF documents without sharing data with third-party web databases.",
          steps: [
            { title: "Upload Chosen PDF Assets", desc: "Load any file. PDFMinty prepares its secure binary stream directly inside local memory." },
            { title: "Select Processing Presets", desc: "Apply actions (Splits, Watermarks, Compression ratios) safely with high compatibility parameters." },
            { title: "Save Secured Output Files", desc: "Export results with 100% data integrity and instant download feedback." }
          ],
          features: defaultFeatures,
          faqs: [
            {
              q: "What makes PDFMinty safer than other PDF websites?",
              a: "Traditional tools process files on cloud databases. PDFMinty uses local Web Assembly, pdf-lib, and browser APIs to edit files locally on your CPU."
            },
            {
              q: "Do I need to sign up for a subscription?",
              a: "No. Our tools are completely open, unlocking all operations with no subscription popups or payment limits."
            },
            {
              q: "Can I use these tools directly offline?",
              a: "Yes! Once loaded, the PWA architecture caches all core libraries, allowing you to use PDFMinty on an airplane or off-grid."
            }
          ]
        };
    }
  };

  const config = getConfigForRoute(currentPath);

  // Generate Google Structured Sitemaps/Rich Snippets schema markup in headers
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${config.toolName} - PDFMinty`,
    "description": config.description,
    "step": config.steps.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "name": step.title,
      "text": step.desc,
      "url": `https://pdfminty.com${currentPath || "/"}`
    }))
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": config.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div
      id="tool-explanatory-section"
      className="max-w-4xl mx-auto px-4 mt-20 pt-16 border-t border-slate-250 dark:border-slate-800/80 animate-fadein font-sans text-left"
    >
      {/* Generate dynamic JSON-LD scripts inside DOM for SEO crawls */}
      <script type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      {/* Hero Headline Box with subtle structural contrast */}
      <div className="mb-14">
        <span className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-900/30 uppercase">
          Client-Side Security Guide
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-4 tracking-tight leading-none">
          {config.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 font-medium select-text max-w-3xl">
          {config.description}
        </p>
      </div>

      {/* Grid: 1. How to Use Step-by-Step UI Layout */}
      <section className="mb-16">
        <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
          <span>How to Use {config.toolName} in 3 Simple Steps</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {config.steps.map((step, idx) => (
            <div
              key={idx}
              id={`step-card-${idx + 1}`}
              className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 hover:border-emerald-500/20 dark:hover:border-emerald-400/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 flex items-center justify-center font-black text-xs shadow-sm mb-4">
                  0{idx + 1}
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
                  {step.title}
                </h4>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid: 2. Features & Benefits layout with dynamic hover effects */}
      <section className="mb-16">
        <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
          <span>Privacy & Security Advantages</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {config.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.01)] dark:shadow-none hover:shadow-md transition-all duration-350"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {feat.title}
                  </h4>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Layout: 3. FAQ Section with Standard details & summary semantic components */}
      <section className="mb-12">
        <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
          <span>Frequently Answered Queries</span>
        </h3>
        <div className="space-y-4">
          {config.faqs.map((faq, idx) => (
            <details
              key={idx}
              id={`faq-accordion-${idx + 1}`}
              className="group border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10 transition-colors duration-250 open:bg-white dark:open:bg-slate-900 open:border-emerald-300 dark:open:border-emerald-900/60"
            >
              <summary className="p-5 flex items-center justify-between text-xs font-bold text-slate-750 dark:text-slate-200 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-3 pr-4">
                  <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="leading-snug">{faq.q}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100/50 dark:border-slate-850/50 leading-relaxed max-w-3xl">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};
