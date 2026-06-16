import React from "react";
import { useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Cpu,
  Zap,
  UserCheck,
  Lock,
  FileCheck,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

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
          title: "Merge PDF Without Uploading — Secure & Instant Local Processing",
          description: "Need to combine PDF files free online without compromising your data security? PDFMinty allows you to merge PDF files without uploading them to any external server. All operations run 100% privately in your secure browser sandbox, ensuring your bank statements, legal contracts, and personal IDs remain completely yours. Download your consolidated document instantly with no watermarks and no registration required.",
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
              q: "Is it safe to merge PDFs online?",
              a: "With standard cloud services, files are uploaded to third-party databases, presenting security risks for sensitive papers. PDFMinty runs entirely client-side using local web technology, making it 100% safe to merge PDFs online as your files never leave your computer."
            },
            {
              q: "Does merging PDFs reduce quality?",
              a: "No, merging PDFs with PDFMinty does not alter, compress, or degrade your original content layers. All fonts, high-resolution vector lines, text structures, and images are combined with pixel-perfect accuracy."
            },
            {
              q: "Can I merge PDFs without creating an account?",
              a: "Yes, you can merge any number of PDF files for free without creating an account, entering an email address, or encountering hidden subscription gates. We keep the tool entirely open-access and zero-friction."
            },
            {
              q: "Are my files stored after merging?",
              a: "No, your files are never stored or seen because they are processed locally in your browser's RAM. There is no server upload step, which means we do not possess and cannot store your documents."
            },
            {
              q: "Does this work offline?",
              a: "Yes! Once you load the PDFMinty website, the core processing modules are cached by your browser. You can fully combine PDF files privately and merge documents without any active internet connection."
            }
          ]
        };

      case "/split-pdf":
        return {
          toolName: "Split PDF",
          title: "Split PDF Without Uploading — 100% Private, Free, and Native",
          description: "Need to partition structural manuals or extract pages from PDF files with ultimate data peace of mind? PDFMinty lets you split PDF without uploading private financial reports, IDs, or secure records to potentially vulnerable cloud servers. Our modern, high-performance toolkit executes every extraction locally on your CPU using in-browser Web Workers, rendering all files completely private. Download selective pages instantly with no watermarks, no registration, and zero subscription gates.",
          steps: [
            { title: "Select Target Document", desc: "Choose your PDF document from local storage or deposit it straight into our sandboxed window in the browser." },
            { title: "Visual Page Verification", desc: "Specify disjoint page subsets like '1-3, 5, 8' or interact with dynamic, responsive page thumbnails directly." },
            { title: "Prune & Download Instantly", desc: "Execute target splits instantly on your CPU and trigger a native, high-speed download locally." }
          ],
          features: [
            {
              icon: <FileCheck className="w-5 h-5 text-emerald-500" />,
              title: "Visual Slide Verification",
              desc: "Confirm page count, layouts, and page content using live visual thumbnails inside your browser before splitting."
            },
            ...defaultFeatures.slice(1)
          ],
          faqs: [
            {
              q: "How do I split a PDF into individual pages?",
              a: "Simply drag and drop your file into the workspace, click select all pages or range splits, and launch the process. The local compiler will instantly separate the pages and package them for direct saving. The entire setup takes only a few seconds."
            },
            {
              q: "Can I split a PDF for free without software?",
              a: "Absolutely. There is no need to pay for heavy desktop PDF suites or download unknown executable programs. Our web applet is fully responsive, optimized for desktop and mobile, and provides premium split-pdf capabilities free without an account."
            },
            {
              q: "Will splitting a PDF affect image quality?",
              a: "No, splitting a PDF does not compress, alter, or trace down original vector maps or text layers. The separate pages generated will perfectly mirror the exact visual resolution, fonts, and pixel properties of the source file. It is a lossless operation."
            },
            {
              q: "How do I extract specific pages from a PDF?",
              a: "You can designate customized disjoint sequences or range splits in the options bar using a simple comma-separated pattern like '1-3, 5, 8'. You can also visually tick individual page thumbnails to extract only the slides you need into a new independent file."
            },
            {
              q: "Is my PDF safe when I split it online?",
              a: "Yes, choosing PDFMinty is incredibly safe because our architecture processes all files completely client-side in your browser's RAM, so nothing is sent to external servers. Unlike standard online utilities that require uploading private legal or corporate paperwork, we never see, process, or store your documents, keeping your data entirely confidential."
            }
          ]
        };

      case "/compress-pdf":
        return {
          toolName: "Compress PDF",
          title: "Compress PDF in Browser — Safely Optimize Your File Size Offline",
          description: "Looking to strip unnecessary digital clutter and optimize your documents privately? PDFMinty compiles a lightweight output by stripping heavy document metadata, unused font structures, and redundant layout spaces directly inside your browser. This tool does not compress or downscale your high-resolution images, ensuring your files retain 100% of their original visual sharpness. Compress PDF in browser safely, and share optimized attachments without sacrificing visual clarity.",
          steps: [
            { title: "Upload Heavy Document", desc: "Select files to optimize directly inside your local memory sandbox without uploading to external servers." },
            { title: "Metadata Stripping Preset", desc: "Let the local processor sanitize heavy structural headers and hidden tracking information." },
            { title: "Secure Instant Export", desc: "Download the flattened, streamlined PDF file instantly with zero change to image or text resolution." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Zap className="w-5 h-5 text-amber-500" />,
              title: "Lossless Metadata Strip",
              desc: "Intelligently wipes raw metadata, hidden author tags, and structural bloat without affecting visual pixels."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "How much can I reduce PDF file size?",
              a: "Our optimizer safely trims bloated metadata and structural definitions locally. For typical documents with heavy structural elements, you will see a clean decrease in file size, though pure scanned images will remain close to original size since our local engine prioritizes visual sharpness."
            },
            {
              q: "Does compressing a PDF reduce quality?",
              a: "No, our local optimization process retains the exact image resolution and vectors of your original document. Since we only strip metadata and redundant structures, there is absolutely zero quality loss."
            },
            {
              q: "Is it safe to compress PDFs online?",
              a: "Yes, because PDFMinty implements a strict client-side architecture. Unlike competitors who ask you to upload sensitive bills or legal documents to their cloud databases, your data never leaves your browser sandbox."
            },
            {
              q: "Can I compress a PDF without software?",
              a: "Absolutely. You do not need to install complex software or register an account. Our web-based toolkit works instantly across any browser on desktop or mobile, completely free of charge."
            },
            {
              q: "Why is my PDF still large after compression?",
              a: "If your PDF contains heavy high-resolution scanned drawings or images, our tool keeps them untouched to avoid making text blurry. This ensures your file stays clean, legible, and professional for official or public submissions."
            }
          ]
        };

      case "/rotate-pdf":
        return {
          toolName: "Rotate PDF",
          title: "Rotate PDF Pages Free Online — 100% Private & Local",
          description: "Need a safe way to rotate specific pages in pdf without uploading sensitive tax files, contracts, or bank statements to remote company servers? PDFMinty is an offline-first tool built to rotate pdf pages online without account requirements. Enjoy a premium, 100% in-browser utility that structures, aligns, and lets you rotate pdf pages free online using local Web Workers without risking your data security. Download your permanently fixed documents instantly with zero limits.",
          steps: [
            { title: "Drop Files in Editor", desc: "Select or drag your PDF document locally into our secure sandboxed editor." },
            { title: "Select Rotation Angles", desc: "Tap individual preview cards to adjust orientations (clockwise, counterclockwise, or 180-degree flip)." },
            { title: "Apply & Permanently Save", desc: "Commit your rotations on your device and save the perfectly oriented PDF file within seconds." }
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
              q: "How do I permanently rotate pages in a PDF?",
              a: "With PDFMinty, you can rotate pdf pages free online and keep them permanently fixed. Simply load your document into our private browser sandbox, click the rotate controls on any specific pages you want to orient, and click save. The local script rewrites the internal page coordinate streams on your CPU to permanently save the layout, meaning the alignment remains exactly how you wanted."
            },
            {
              q: "Can I rotate individual pages in a PDF?",
              a: "Yes, you can easily rotate specific pages in pdf. PDFMinty lets you choose to align the entire document at once, or interactively click individual pages of the document to rotate pages left, right, or upside down. All other pages retain their original orientation perfectly, keeping mixed vertical/horizontal documents unified."
            },
            {
              q: "Is rotating PDF pages free?",
              a: "Yes, PDFMinty is completely free to use with no hidden subscription traps, daily quotas, or watermarks. Since all calculations are done directly on your device rather than our servers, we don't have to pay for cloud database instances, allowing us to keep this a 100% free offline-first tool for everyone."
            },
            {
              q: "Why does my PDF keep rotating back?",
              a: "Some PDF viewers only temporarily adjust views instead of modifying the layout permanently. To rotate pdf permanently free, you need a tool like PDFMinty that edits the actual layout stream coordinates. This ensures that no matter what viewer or device you open the document in, the alignment remains structurally locked."
            },
            {
              q: "Can I rotate a PDF on my phone?",
              a: "Absolutely. Our local workspace is fully optimized for touch displays on both iOS and Android. You can load files directly from your mobile camera roll or files explorer, tap on individual pages to adjust orientation, and download the rotated PDF file in seconds while on the go."
            }
          ]
        };

      case "/organize":
        return {
          toolName: "Delete PDF Pages",
          title: "Delete PDF Pages Free Online — 100% Private & Local",
          description: "Need a secure, hassle-free way to delete pages from pdf free online without uploading sensitive files to cloud servers? PDFMinty is a premium, offline-first tool designed to remove pages from pdf without uploading files, allowing you to delete pdf pages in browser privately. Whether you are wondering how to delete pages from pdf for free or need to remove specific pages from pdf online, our responsive utility runs 100% locally on your computer's browser using in-browser processing. If you need further optimizations, you can easily use our other tools to <a href=\"/compress-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Compress PDF in browser</a>, <a href=\"/merge-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Merge PDF without uploading</a> to combine files, or <a href=\"/split-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Split PDF online free</a> to separate pages securely.",
          steps: [
            { title: "Select or Drag PDF", desc: "Choose the PDF document containing pages you want to delete directly within our secure client-side sandbox." },
            { title: "Click Delete on Thumbnails", desc: "Review the visually rendered page thumbnails and click the trash/delete icon on any slides you wish to remove." },
            { title: "Save Clean Document", desc: "Save the permanently pruned document instantly with full visual formatting and text layers intact." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Zap className="w-5 h-5 text-amber-500" />,
              title: "Instant Live Undo",
              desc: "Made an accidental page deletion? Instantly restore any deleted page or reset the canvas array before compiling your document."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "How do I delete a page from a PDF?",
              a: "To delete a page from a PDF, simply drop your document into PDFMinty's secure local editor. Once the layout is parsed, click the trash or delete icon on any unwanted page preview, and then compile. Your updated PDF file will be generated instantly and can be saved directly to your computer."
            },
            {
              q: "Can I delete multiple pages at once?",
              a: "Yes, you can easily delete multiple pages at once. Our interactive browser workspace allows you to visually inspect each page in order and click 'Delete' on several pages simultaneously or specify high-level index deletion commands before compiling."
            },
            {
              q: "Will deleting pages affect other content?",
              a: "No. Deleting pages with PDFMinty only omits the selected page structural objects from the compiled output file. The formatting, high-resolution imagery, text layers, vector assets, and embedded fonts of all remaining pages are preserved in their exact original form with zero quality loss."
            },
            {
              q: "How do I remove a blank page from PDF?",
              a: "To remove a blank page, select your PDF file in the editor to load the page thumbnails. Find the empty or blank page preview card, click the delete/trash icon on that page card, and tap download. The blank page is completely expunged from the file structure."
            },
            {
              q: "Is there a free way to delete PDF pages?",
              a: "Yes, PDFMinty offers a completely free way to delete PDF pages offline without account signups, subscriptions, or intrusive watermarks. All operations occur on your CPU via secure Web Workers, eliminating server fees and keeping your private documents perfectly safe."
            }
          ]
        };

      case "/watermark-pdf":
        return {
          toolName: "Add Watermark",
          title: "Add Watermark to PDF Free Online — 100% Private & Local",
          description: "Looking for a secure way to add watermark to pdf free online without risking your files? PDFMinty is an offline-first tool that lets you watermark pdf without uploading sensitive contracts, bank details, or passport scans to remote servers. All text stamps are processed instantly in your browser sandbox using secure client-side technology, ensuring maximum privacy. Protect your intellectual property with customizable text opacity, angles, and colors without registration.",
          steps: [
            { title: "Import PDF Target", desc: "Select or drag the PDF document that needs secure watermark protection directly into our local sandbox." },
            { title: "Type Custom Text Stamp", desc: "Write custom scripts (e.g., 'CONFIDENTIAL', 'SAMPLE'), then customize transparency, scale, and layout angle." },
            { title: "Apply Overlays Offline", desc: "Stamp layers securely on your CPU and download your newly watermarked copy instantly." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Lock className="w-5 h-5 text-amber-500" />,
              title: "Diagonal Overlays & Opacity",
              desc: "Adjust typography, colors, rotation angles, and transparency seamlessly to fit over core content safely."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "How do I add a watermark to a PDF?",
              a: "Simply drag and drop your document into PDFMinty, print your custom text watermark (like 'CONFIDENTIAL' or 'DRAFT'), adjust the opacity, color, and angle parameters, and click apply. The local script instantly stamps every page or selected scopes directly on your CPU and triggers an immediate download."
            },
            {
              q: "Can I remove a watermark from PDF?",
              a: "Once a watermark is applied using PDFMinty, the vector details are flattened directly into the document content stream. Stripping it is extremely difficult, ensuring permanent protection for your creative works and official drafts."
            },
            {
              q: "Is adding a watermark to PDF free?",
              a: "Yes, you can add text watermark to pdf free without any registrations, watermark tools watermark branding, or hidden pricing traps. Our tool leverages client-side browser technology rather than premium server computation, allowing us to keep it entirely open-source and free."
            },
            {
              q: "Can I add an image watermark instead of text?",
              a: "Currently, PDFMinty specializes in highly readable, vector-based text watermarks with full control over density and angle. This format is heavily recommended for protecting proprietary layouts while keeping files compact and printer-friendly."
            },
            {
              q: "Does watermarking affect PDF quality?",
              a: "No, adding a text watermark to your PDF is a completely lossless process. Since PDFMinty parses and overlays vector streams purely within your browser memory sandbox, your original images, font files, and high-resolution layout scales remain perfect."
            }
          ]
        };

      case "/add-page-numbers":
        return {
          toolName: "Add Page Numbers",
          title: "Add Page Numbers to PDF Free Online — 100% Private & Local",
          description: "Need an easy, secure way to add page numbers to pdf free online without uploading sensitive legal briefs, graduation theses, or bank books to remote servers? PDFMinty is an offline-first tool designed to let you number pdf pages without uploading any files, ensuring your documents remain 100% private. Learn how to add page numbers to pdf free or add page numbers to pdf in browser seamlessly on your own device's CPU. If you need other secure tools, you can easily use our platform to <a href=\"/compress-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Compress PDF in browser</a>, <a href=\"/merge-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Merge PDF without uploading</a>, or securely <a href=\"/split-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Split PDF online free</a> without tracking.",
          steps: [
            { title: "Deposit PDF File", desc: "Select or drag the unnumbered PDF file directly into our local web panel workflow." },
            { title: "Set Layout Alignment", desc: "Choose where you want the numbers (e.g. bottom right, bottom center) and format style options." },
            { title: "Inject Labels Offline", desc: "Verify your chosen coordinates and stamp the vector numbers immediately on your CPU." }
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
              q: "How do I add page numbers to a PDF?",
              a: "Simply select your document in PDFMinty, pick your desired numbering position and formatting style, specify which page to start counting from, and launch the engine. The local script stamps the page layouts offline and triggers an instant download of your numbered file."
            },
            {
              q: "Can I customize page number position?",
              a: "Yes, you can fully decorate your pages by picking different layout alignments (such as Bottom Left, Bottom Center, Bottom Right, Top Left, Top Center, or Top Right) to perfectly match your project layout guidelines."
            },
            {
              q: "Can I start page numbers from a specific page?",
              a: "Absolutely. You can choose to skip the cover page or introductory index pages and start sequential numbering on page 2 or any other specific index. You can also specify the starting number offset."
            },
            {
              q: "Is adding page numbers to PDF free?",
              a: "Yes, PDFMinty lets you add page numbers to pdf free online with no account setups, subscription limitations, or watermarks. Since all processing runs locally inside your browser sandbox on your device, we don't pay server infrastructure fees, allowing us to keep this tool 100% free."
            },
            {
              q: "Will page numbers be permanent?",
              a: "Yes, the page sequential number elements are permanently burned directly into the PDF's vector stream. Once generated, the numbers are locked in and will scale beautifully regardless of the viewer software, device, or print orientation."
            }
          ]
        };

      case "/add-blank-page":
        return {
          toolName: "Add Blank Page",
          title: "Add Blank Page to PDF Free Online — 100% Private & Local",
          description: "Need a secure, fast way to add blank page to pdf free online without uploading sensitive legal papers, contracts, or layout blueprints to remote servers? PDFMinty is a premium, offline-first tool built to insert blank page in pdf online without account requirements. Discover how to add blank page to pdf without acrobat easily in your browser. All layout generation runs 100% privately inside your local browser tab on your computer, protecting your information. If you need other secure tools, you can easily use our platform to <a href=\"/compress-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Compress PDF in browser</a>, <a href=\"/merge-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Merge PDF without uploading</a> to combine files, or securely <a href=\"/split-pdf\" class=\"text-emerald-500 hover:underline font-bold\">Split PDF online free</a> to slice sheets privately without any tracking.",
          steps: [
            { title: "Drop Files in Workspace", desc: "Select or drag the PDF document requiring new page breaks directly into our secure client-side sandbox." },
            { title: "Specify Page Coordinates", desc: "Choose insertion coordinates (e.g. 'after Page 1') and size templates (A4, Letter, Custom) easily." },
            { title: "Generate & Download", desc: "Click insert to generate and stitch the blank pages into your document on your CPU and download instantly." }
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
              q: "How do I insert a blank page into a PDF?",
              a: "To insert a blank page in pdf online with PDFMinty, simply select your PDF file in our secure workspace, customize where you want the new sheet placed (like 'after page 2'), select the page size matching your document, and tap 'Insert'. The page is generated locally inside your browser and can be saved to your device instantly."
            },
            {
              q: "Can I add multiple blank pages at once?",
              a: "Yes! You can choose to add multiple blank pages to pdf free at once by selecting several insertion points or specifying page offsets. You can configure multiple indices throughout your document layout recursively before downloading the output."
            },
            {
              q: "Can I choose where to insert the blank page?",
              a: "Absolutely. You have complete structural control over your files. You can choose to insert a blank page at the very beginning of the document (to create a coversheet slot), at the final page margin (for additional notes), or at any specific page index in between."
            },
            {
              q: "What page sizes are available?",
              a: "PDFMinty supports standard printing sizes like A4, Letter, and Legal. Best of all, our smart matching engine can automatically detect your original PDF's dimensions and create a perfectly scaled blank canvas to match seamlessly."
            },
            {
              q: "Is it free to add pages to a PDF?",
              a: "Yes, using PDFMinty is completely free with no account registrations, payment screens, daily limits, or watermarks. Since all the document compilation work runs locally on your computer rather than our servers, we maintain a free-to-use offline-first environment for everyone."
            }
          ]
        };

      case "/protect-pdf":
        return {
          toolName: "Protect PDF",
          title: "Password Protect PDF in Browser — Lock PDF Without Software",
          description: "Looking for a safe way to add password to pdf free and keep your personal or business files secure? PDFMinty lets you password protect pdf in browser without uploading sensitive records to the cloud. Protect PDF free online with no upload, keeping all processing 100% private and offline on your device. Secure your tax statements, health reports, and contracts instantly and download with absolute peace of mind.",
          steps: [
            { title: "Load Confidential PDF", desc: "Select the PDF file you wish to secure with a password key directly within our offline workspace sandbox." },
            { title: "Type Master Password", desc: "Define your password credentials. Select permission flags if required for standard secure locking." },
            { title: "Encrypt Sandbox Core", desc: "Run your local ISO-compliant PDF encryption, and save the protected outcome within seconds." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Lock className="w-5 h-5 text-indigo-500" />,
              title: "ISO-Compliant Security",
              desc: "Utilizes standard cryptographic PDF protection algorithms matching Adobe Acrobat compliance to enforce secure password keys locally."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "How secure is PDF password protection?",
              a: "PDF password protection using PDFMinty utilizes strong, industry-standard ISO 32000-2 encryption. This integrates native, block-level permissions that require the exact decryption password to open or view, keeping your document strictly secured."
            },
            {
              q: "Can I password protect a PDF for free?",
              a: "Yes! You can password protect a PDF free online without any registrations, subscriptions, or hidden charges. The entire locking procedure runs instantly in your local browser sandbox, totally free of charge."
            },
            {
              q: "What happens if I forget my PDF password?",
              a: "Since PDFMinty operates with a strict offline-first, private architecture, we do not store, send, or have access to your passwords or original files. If you lose or forget the password set for your PDF, we cannot retrieve it, as we do not operate any backend databases."
            },
            {
              q: "Is 256-bit PDF encryption safe?",
              a: "Yes. High-grade AES encryption ensures that your digital data is locked using cryptographic security layers matching Adobe Acrobat compliance. Brute-forcing such standards is virtually impossible, keeping your financial statements and corporate logs fully safe."
            },
            {
              q: "Can I protect a PDF without Adobe?",
              a: "Absolutely. PDFMinty allows you to quickly add a password and lock pdf without software or Adobe subscription gates. Simply drop your copy, choose your secure master key, and save your protected PDF instantly."
            }
          ]
        };

      case "/unlock-pdf":
        return {
          toolName: "Unlock PDF",
          title: "Unlock PDF Free Online — 100% Private & Local",
          description: "Need a safe way to unlock pdf free online without uploading sensitive legal papers, bank reports, or invoices to remote servers? PDFMinty is a premium, offline-first tool built to remove pdf password free and unlock pdf without uploading any documents. Our in-browser sandbox lets you remove pdf password protection online free using highly secure local client-side processing. Please note: This tool is designed to strip editing, printing, or copying constraints and save unprotected files instantly. While it can bypass standard owner restrictions, we do not support how to unlock pdf without password free if a strong user-open password is required to decrypt the contents—you must enter the authorized opening password to perform local decryption.",
          steps: [
            { title: "Deposit Secure PDF", desc: "Drag or select your password-locked PDF document directly into our local web panel workflow." },
            { title: "Input Clearance Key", desc: "Enter the authorized opening password if prompted. PDFMinty handles decryption calculations deep in your local CPU." },
            { title: "Save Unlocked PDF", desc: "Click Decrypt to strip the secure locks offline and download a permanently unencrypted PDF instantly." }
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
              q: "How do I remove a PDF password?",
              a: "To remove a PDF password, drop your file into PDFMinty's secure local editor, enter your authorized password when prompted by the decryption engine, and click Unlock. The application will safely strip the security layers offline, letting you save a permanently unlocked copy needing no future credentials."
            },
            {
              q: "Can I unlock a PDF I don't have the password for?",
              a: "No. To maintain high document security standards and legal data integrity, you must provide the proper opening (user) password if the document content is encrypted. We do not brute force, hack, or support how to unlock pdf without password free. However, if a file only contains owner restrictions that block printing, editing, or copying (but lets you view the content), our local engine can instantly strip those restriction parameters without a password."
            },
            {
              q: "Is it legal to unlock a PDF?",
              a: "Yes, as long as you are the owner, authorized guardian, or have explicit permission from the creator of the files to decrypt and modify them. Using a tool to unlock your own personal invoices, bank lists, or contracts is completely safe and legal."
            },
            {
              q: "What's the difference between user and owner password?",
              a: "A User Password (also called an Open Password) encrypts the document, demanding a password just to view its content. An Owner Password (also called a Permissions Password) restricts specific actions like copying text, compiling layouts, editing fields, or printing pages while still allowing the document to be opened. PDFMinty can instantly remove owner limitations, but requires the user password to open encrypted documents."
            },
            {
              q: "Will unlocking a PDF change the content?",
              a: "No, unlocking a PDF only decrypts the security structures in the file stream. The text formatting, font layout libraries, graphical coordinates, and high-fidelity page assets remain intact with zero alterations or quality degradation."
            }
          ]
        };

      case "/image-to-pdf":
        return {
          toolName: "Image to PDF",
          title: "JPG to PDF Free Online No Upload — 100% Private Tool",
          description: "Need a safe way to convert photos to pdf free without sharing your personal receipts, passport photos, or confidential worksheets with cloud servers? PDFMinty is an offline-first image to pdf converter browser-based tool that runs entirely on your local device. Convert PNG to PDF online free and combine multiple images to pdf free online with absolute data privacy. All processing completes instantly within your device's RAM, ensuring your files never leave your computer.",
          steps: [
            { title: "Select Digital Images", desc: "Select or drag your image sequence (PNG, JPG, WebP) directly into our local sandboxed window." },
            { title: "Reorder & Style Margins", desc: "Arrange layout order with ease. Customize paper dimensions (A4/Letter) and border margins to fit." },
            { title: "Generate Standard PDF", desc: "Compile image coordinates to PDF parameters on your CPU. Download your single unified document instantly." }
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
              q: "How do I combine multiple images into one PDF?",
              a: "Simply drag and drop your image files into our workspace window, arrange them using intuitive controls, and configure custom page sizes or margins. Click compile to convert your images into a single professional PDF directly on your local CPU."
            },
            {
              q: "Can I convert PNG to PDF for free?",
              a: "Yes, PDFMinty is completely free with no usage limits, hidden fees, or subscriptions. You can convert PNG, JPG, JPEG, and WebP formats to high-quality PDF files instantly without creating an account or providing an email address."
            },
            {
              q: "Will image quality be lost when converting to PDF?",
              a: "No, our client-side image to PDF converter preserves the exact visual resolution, pixel measurements, and clarity of your original photography. The photos are integrated losslessly into an industry-standard PDF document container, keeping text and photos crisp."
            },
            {
              q: "How many images can I convert at once?",
              a: "You can load and combine up to 50 image assets simultaneously. This dynamic batch threshold is optimized to keep the entire in-browser processing smooth, fast, and completely safe on any browser or system."
            },
            {
              q: "Does this work with photos from my phone?",
              a: "Absolutely. Our responsive applet is designed for desktop and mobile, so you can upload snapshots directly from your iPhone or Android camera roll."
            }
          ]
        };

      case "/pdf-to-image":
        return {
          toolName: "PDF to Image",
          title: "Convert PDF to Image Online Free — 100% Private & Local",
          description: "Need a safe way to convert PDF to image online free without sending bank statements, IDs, or confidential contracts over the web? PDFMinty lets you convert PDF to image in browser using highly performant client-side Web Workers, ensuring all file processing is kept strictly local on your CPU. Easily extract your pages as clear transparent PNGs or compact JPG formats without registering an account or facing hidden payment limits.",
          steps: [
            { title: "Load Primary Document", desc: "Choose your PDF document from local storage or deposit it straight into our sandboxed window in the browser." },
            { title: "Select Formats & DPI", desc: "Choose your target format (JPEG/PNG) and resolution output (standard 150 DPI or professional 300 DPI)." },
            { title: "Export Image Assets", desc: "Download high-quality image slides directly or save them in a consolidated ZIP file instantly." }
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
              q: "How do I convert a PDF to an image?",
              a: "Simply drop your document into PDFMinty, select your target output format (JPG or PNG) and resolution (150 or 300 DPI), and launch the engine. Our client-side script instantly renders the pages and packages them for quick download directly to your local device."
            },
            {
              q: "What image format is best for PDF conversion?",
              a: "Use JPEG if you want smaller files for email attachments, web uploads, or general storage. Choose PNG if you want to preserve transparency, sharp vector lines, or keep high-contrast document graphics for presentations."
            },
            {
              q: "Does converting PDF to image reduce quality?",
              a: "No, our client-side converter supports high-DPI rendering up to 300 DPI. This ensures that every vector path, logo, text character, and fine detail is extracted into high-resolution JPG or PNG formats with absolute pixel-perfect accuracy."
            },
            {
              q: "Can I convert multi-page PDF to separate images?",
              a: "Yes, PDFMinty lets you process all pages at once or input a specific range like '1, 3-5'. The system will cleanly generate separate, numbered image files for each page and bundle them in a neat ZIP archive."
            },
            {
              q: "Is it free to convert PDF to JPG online?",
              a: "Yes, you can convert any PDF file size completely free with PDFMinty without creating an account or running into daily usage gates."
            }
          ]
        };

      case "/intelligence":
        return {
          toolName: "AI PDF Analyzer",
          title: "AI PDF Analyzer Free — 100% Secure & Local Extraction",
          description: "Need a secure, private way to analyze pdf with ai free without uploading your sensitive files to remote cloud storage? PDFMinty's offline-extracted AI PDF analyzer free tool parses your documents directly inside your local browser sandbox. It utilizes high-performance browser-side parsing to extract text blocks locally and safely send only encrypted text segments to our protected Gemini proxy. This makes it a highly private pdf summarizer ai free online tool with no logins required.",
          steps: [
            { title: "Select or Drag PDF", desc: "Choose your study materials, business briefs, or legal papers to load into our secure, sandboxed client-side browser space." },
            { title: "Review Page Preview", desc: "Our engine performs lightning-fast client-side page layout detection, extracting text blocks directly within browser memory." },
            { title: "Ask Questions & Summarize", desc: "Instantly prompt the model for key summaries or custom questions." }
          ],
          features: [
            ...defaultFeatures.slice(0, 2),
            {
              icon: <Cpu className="w-5 h-5 text-blue-500" />,
              title: "Privacy Proxy Parsing",
              desc: "Only raw extracted text fragments are processed securely via our SSL-encrypted proxy endpoints to protect your original documents."
            },
            defaultFeatures[3]
          ],
          faqs: [
            {
              q: "How does AI PDF analysis work?",
              a: "To analyze a document, PDFMinty reads and parses the raw text and visual layout structures directly inside your browser cache. It then securely transcribes and formats only the text coordinates before sending the payload dynamically to our secure, server-side Gemini API proxy."
            },
            {
              q: "Is my PDF content safe with AI analysis?",
              a: "Yes, completely. Unlike other cloud repositories that save your raw documents, PDFMinty executes all document rendering and text extraction in your local browser sandbox. Only the abstracted text content is transmitted to the server via SSL encryption to communicate with the Gemini API."
            },
            {
              q: "What can AI tell me about my PDF?",
              a: "Our smart analyzer can instantly summarize lengthy books, extract structured key points, highlight project goals, identify action items inside business reports, or answer custom conversational questions."
            },
            {
              q: "How accurate is AI PDF summarization?",
              a: "It is exceptionally accurate. By utilizing Gemini's advanced natural language understanding and large context window, our tool can read and synthesize deep cross-page correlations."
            },
            {
              q: "Does AI analysis work on scanned PDFs?",
              a: "Yes! PDFMinty includes a responsive browser-side parser that reads text layers. For scanned PDFs or images that don't have built-in selectable text, our system automatically runs secure text recognition "
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

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${config.toolName} - PDFMinty`,
    "description": config.description.replace(/<[^>]*>/g, ""),
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
      <script type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <div className="mb-14">
        <span className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-900/30 uppercase">
          Client-Side Security Guide
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-4 tracking-tight leading-none">
          {config.title}
        </h2>
        <p
          className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 font-medium select-text max-w-3xl"
          dangerouslySetInnerHTML={{ __html: config.description }}
        />
      </div>

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
                <h4 className="text-xs font-black text-slate-905 dark:text-slate-200 uppercase tracking-wider mb-2">
                  {step.title}
                </h4>
                <p className="text-[12px] text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h3 className="text-lg font-black text-slate-855 dark:text-slate-100 mb-6 flex items-center gap-2">
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
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    {feat.title}
                  </h4>
                  <p className="text-[12px] text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
                    {feat.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-lg font-black text-slate-855 dark:text-slate-100 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
          <span>Frequently Answered Queries</span>
        </h3>
        <div className="space-y-4">
          {config.faqs.map((faq, idx) => (
            <details
              key={idx}
              id={`faq-accordion-${idx + 1}`}
              className="group border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-950/10 transition-colors duration-250 open:bg-white dark:open:bg-slate-900 open:border-emerald-305 dark:open:border-emerald-900/60"
            >
              <summary className="p-5 flex items-center justify-between text-xs font-bold text-slate-750 dark:text-slate-200 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-3 pr-4">
                  <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="leading-snug">{faq.q}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="px-5 pb-5 pt-1 text-xs text-slate-505 dark:text-slate-400 font-semibold border-t border-slate-100/50 dark:border-slate-850/50 leading-relaxed max-w-3xl">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
};