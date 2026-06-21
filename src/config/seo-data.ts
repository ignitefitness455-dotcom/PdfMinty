export const SITE_URL = 'https://pdfminty.com';
export const SITE_NAME = 'PDFMinty';

export interface ToolSEOInfo {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  icon: string;
  category: string;
  priority: number;
  changefreq: string;
  type: 'tool' | 'article';
  longFormBody: string;
  howTo?: {
    name: string;
    totalTime: string;
    steps: string[];
  };
}

export const TOOLS: ToolSEOInfo[] = [
  {
    id: 'merge',
    slug: 'merge-pdf',
    name: 'Merge PDF',
    shortDescription: 'Combine multiple PDFs into one document',
    metaTitle: 'Merge PDF Free - Combine PDFs Online Instantly | PDFMinty',
    metaDescription:
      'Merge PDF files online for free. Combine multiple PDF documents into one single secure file right inside your web browser. No server uploads, keeping your data confidential.',
    h1: 'Merge PDF Files Online with Absolute Privacy',
    icon: 'Merge',
    category: 'page-operations',
    priority: 0.9,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Merge PDF Files Online',
      totalTime: 'PT30S',
      steps: [
        'Upload your PDF files by clicking or dragging them in.',
        'Arrange files in your preferred order using visual drag handles.',
        "Click the purple 'Merge PDFs' button to combine them together.",
        'Download your newly merged PDF file instantly.',
      ],
    },
    longFormBody: `
      <h1>Merge PDF Files Online with Absolute Privacy</h1>
      <p>PDFMinty introduces a fundamentally modern, secure way to combine your critical administrative documents. Traditionally, using free online PDF mergers meant uploading your tax returns, financial records, or medical scans to unknown cloud servers. PDFMinty relies entirely on offline-capable browser sandboxing, meaning your private pages are combined piece-by-piece right on your local device. This client-side execution makes it physically impossible for unauthorized entities to intercept your files.</p>
      
      <h2>Streamlined Assembly for Professional Reports</h2>
      <p>Whether you are a freelancer compiling a monthly performance report, an academic merging separated research chapters, or a real estate agent gathering mortgage pre-approval forms, our dynamic merge PDF tool provides the visual flexibility you need. Our system parses multiple PDF outlines seamlessly, retaining active internal hyperlinks, font definitions, and table formats without compromise. Our drag-and-drop workspace enables real-time rearrangement, ensuring the final output flows exactly as you intended.</p>
      
      <h2>Step-by-Step Instructions to Merge PDFs Privately</h2>
      <ol>
        <li>Select or drag your multiple PDF sheets directly into the workspace loader.</li>
        <li>Drag files into your required visual order. You can easily remove individual sheets should they become redundant.</li>
        <li>Hit the 'Merge PDFs' action. The assembly completes locally in milliseconds.</li>
        <li>Instantly download the combined document without throttling or sign-up gates.</li>
      </ol>
      
      <h2>The Cryptographic Safety Edge</h2>
      <p>By shifting computational loads from remote farms into your local environment via high-octane WebAssembly, PDFMinty ensures no data leaks over network calls. The original files never travel through external server gateways. It is full-strength offline document packaging with zero footprint.</p>
    `,
  },
  {
    id: 'split',
    slug: 'split-pdf',
    name: 'Split PDF',
    shortDescription: 'Extract custom page ranges',
    metaTitle: 'Split PDF Free - Extract Pages Online Instantly | PDFMinty',
    metaDescription:
      'Split PDF pages or extract custom page ranges online. Free browser-side utility to separate complex PDF documents into smaller parts securely.',
    h1: 'Split PDF Online - Extract Pages with Absolute Privacy',
    icon: 'Scissors',
    category: 'page-operations',
    priority: 0.9,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Split a PDF Offline',
      totalTime: 'PT30S',
      steps: [
        'Upload your PDF document by clicking or dropping the file.',
        'Enter specific page ranges or selection indices to isolate.',
        "Click 'Split PDF' to assemble the selected pages.",
        'Download the split PDF file to your machine instantly.',
      ],
    },
    longFormBody: `
      <h1>Split PDF Online - Extract Pages with Absolute Privacy</h1>
      <p>Dealing with massive documents or manuals often means you only need a couple of pages. PDFMinty's split PDF tool extracts target page ranges with surgical utility. Unlike legacy services that host server processes to rip files apart, our system uses client-side parser bindings. This allows you to split pages or isolate multi-page scopes on your laptop or smartphone without exposing confidential content.</p>
      
      <h2>Targeted Extraction for Complex Documents</h2>
      <p>Isolate single invoices, retrieve critical legal attachments, or separate chapters from lengthy eBooks in a click. Our interface features precise range controls allowing inputs like '1-3, 5, 8-10'. The underlying technology splits the binary PDF trailer structure, keeping metadata blocks intact while separating only the corresponding streams. All embedded graphics and interactive elements are retained securely inside the resulting pieces.</p>
      
      <h2>How to Extract Specific PDF Page Ranges Online</h2>
      <ol>
        <li>Drop your master PDF file into the secure workspace block.</li>
        <li>Define your target extraction indices. You can define comma-separated lists and ranges.</li>
        <li>Trigger 'Split PDF'. The local processor divides the document.</li>
        <li>Download the split output PDF instantly. No limits, no credentials needed.</li>
      </ol>
      
      <h2>Ensuring Native Document Integrity</h2>
      <p>Our division process operates on the PDF's structural catalog directly, protecting vector drawings, margins, and layout structures. Since there is zero cloud upload or server-based rasterization involved, your output file remains crisp, compact, and private.</p>
    `,
  },
  {
    id: 'compress',
    slug: 'compress-pdf',
    name: 'Compress PDF',
    shortDescription: 'Reduce PDF file size offline',
    metaTitle: 'Compress PDF Free - Reduce PDF File Size Online | PDFMinty',
    metaDescription:
      'Reduce your PDF file size online without losing quality. Complete offline-first compression on your machine, securing confidential files.',
    h1: 'Compress PDF Online - Reduce PDF File Size Securely',
    icon: 'Minimize2',
    category: 'utilities',
    priority: 0.9,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Compress PDF Size',
      totalTime: 'PT20S',
      steps: [
        'Upload your high-resolution PDF file.',
        'Select your compression intensity (Light or Medium settings).',
        "Click the 'Compress PDF' button to trigger the reduction routine.",
        'Download your optimized, much smaller PDF file.',
      ],
    },
    longFormBody: `
      <h1>Compress PDF Online - Reduce PDF File Size Securely</h1>
      <p>High-resolution graphics or heavy embedded fonts can inflate a PDF's size, triggering email bounce-backs and slow upload speeds. PDFMinty's offline PDF compression optimizes document footprints without degrading readability. The optimizer works inside your browser, so you never hand confidential slides or corporate reports to third-party databases.</p>
      
      <h2>Fine-Tuned Reduction Settings</h2>
      <p>Our compression engine includes several compression pipelines. From standard downsampling of bloated vector coordinates, down to clearing unneeded redundant metadata and duplicate font subsets, we achieve maximum reduction ratios. The output files keep legible text definitions and clean document structures while shedding megabytes of useless overhead.</p>
      
      <h2>How to Safely Compress PDF Footprints</h2>
      <ol>
        <li>Drag your heavy PDF document into the browser workspace panel.</li>
        <li>Pick your desired optimization mode depending on how small you need the file.</li>
        <li>Select 'Compress PDF'. The browser processor optimizes streams locally.</li>
        <li>Download the compressed file. Perfect for email attachments and portal submissions.</li>
      </ol>
      
      <h2>Offline-First Performance Built for Business</h2>
      <p>By keeping document bytes local, business teams can safely optimize files even containing employee payroll, sensitive customer records, or financial disclosures. Enjoy immediate, secure, zero-cloud compression with PDFMinty.</p>
    `,
  },
  {
    id: 'rotate',
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    shortDescription: 'Rotate specific or all PDF pages',
    metaTitle: 'Rotate PDF Free - Flip PDF Pages Online Instantly | PDFMinty',
    metaDescription:
      'Rotate PDF pages clockwise or counterclockwise. Flip individual pages or rotate all pages in seconds from your web browser safely.',
    h1: 'Rotate PDF Pages Online with Instant Verification',
    icon: 'RotateCw',
    category: 'page-operations',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Rotate PDF Pages Online',
      totalTime: 'PT20S',
      steps: [
        'Upload your PDF document by clicking or dropping.',
        'Select individual pages or choose to rotate all pages.',
        'Select your rotation angle (90°, 180°, or 270° clockwise).',
        'Download the correctly oriented PDF file.',
      ],
    },
    longFormBody: `
      <h1>Rotate PDF Pages Online with Instant Verification</h1>
      <p>Mismatched column alignments, inverted form scans, or sideways landscape architectural blueprints can disrupt reading. PDFMinty's browser-bound rotate PDF utility easily corrects page orientation. You can select specific pages or rotate all pages simultaneously, watching the layout shift in real-time, all completely on your local device.</p>
      
      <h2>Visual Orientation Fixing for Scanned Pages</h2>
      <p>Incorrectly rotated pages frequently occur when bulk-scanning paper files. Instead of rewriting or re-scanning, use our tool to fix singular pages or make wholesale changes. Our tool alters the 'Rotate' coordinate attribute within the PDF’s internal catalog, maintaining document structures and vector assets.</p>
      
      <h2>How to Rotate PDF Sheets Locally</h2>
      <ol>
        <li>Load your PDF into our tool. High-resolution previews display the booklet's pages.</li>
        <li>Select specific page thumbnails or select a global rotation command.</li>
        <li>Set the rotation degree (90, 180, or 270 degrees).</li>
        <li>Process and download the instantly corrected PDF file.</li>
      </ol>
      
      <h2>No Server Footprints, Just Instant Rotations</h2>
      <p>Because orienting pages relies only on altering simple metadata attributes, the operation is exceptionally resource-efficient. Your computer processes the change instantly, bypassing the need to transmit your private data to a remote cloud server.</p>
    `,
  },
  {
    id: 'delete-pages',
    slug: 'delete-pages-pdf',
    name: 'Delete Pages',
    shortDescription: 'Filter out unneeded pages from PDF',
    metaTitle: 'Delete PDF Pages Free - Remove Pages from PDF Online | PDFMinty',
    metaDescription:
      'Remove unwanted pages from your PDF file securely. Clean and select visual thumbnail pages to delete in your browser without cloud uploads.',
    h1: 'Delete PDF Pages Online - Eliminate Unwanted Sheets',
    icon: 'Trash2',
    category: 'organize',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Delete Pages from a PDF',
      totalTime: 'PT20S',
      steps: [
        'Drag and drop your PDF file into the upload zone.',
        'Select the checklist boxes corresponding to pages you want to delete.',
        "Click the red 'Delete Pages' button to remove the selection.",
        'Instantly download the newly cleaned PDF document.',
      ],
    },
    longFormBody: `
      <h1>Delete PDF Pages Online - Eliminate Unwanted Sheets</h1>
      <p>Preparing a document for presentation often requires cutting unnecessary filler, confidential metadata, or blank trailing pages. PDFMinty's delete pages feature makes editing simple. Our visual workspace lets you select, toggle, and strip out unwanted sheets locally, ensuring confidential details stay within your device boundaries.</p>
      
      <h2>Visual Interface with Precision Control</h2>
      <p>Our interactive thumbnail grid displays every page of your PDF so you can doublecheck before purging. You can select specific pages individually or list them in range fields for bulk removal. The software re-orders the internal PDF index map immediately to skip the deleted page structures, preserving hyperlinks and formatting in the remaining pages.</p>
      
      <h2>How to Remove Pages from PDFs Online</h2>
      <ol>
        <li>Upload your PDF file to the client-side panel.</li>
        <li>Check the checkboxes on the thumbnails of the pages you want to delete.</li>
        <li>Click 'Delete Pages'. The browser engine processes the changes.</li>
        <li>Save the modified PDF, free from unnecessary pages.</li>
      </ol>
      
      <h2>Safer Document Preparing</h2>
      <p>PDFMinty is designed around a strict local-execution philosophy. Removing portions of your business agreements, medical charts, or legal documents will never leak data over the internet, keeping your file editing safe and secure.</p>
    `,
  },
  {
    id: 'extract-pages',
    slug: 'extract-pages-pdf',
    name: 'Extract PDF Pages',
    shortDescription: 'Extract pages into a brand new PDF',
    metaTitle: 'Extract PDF Pages Free - Save Specific Pages Online | PDFMinty',
    metaDescription:
      'Isolate and extract specific pages from your PDF documents. Save individual pages as a brand new secure PDF locally, 100% in-browser.',
    h1: 'Extract PDF Pages Safely - Isolate Crucial Documents',
    icon: 'Scissors',
    category: 'organize',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Extract Pages from a PDF',
      totalTime: 'PT20S',
      steps: [
        'Upload your PDF document into the browser workspace.',
        'Select the specific pages you want to isolate from the thumbnail list.',
        'Click the button to execute the extraction command.',
        'Download the new, smaller PDF containing only the selected pages.',
      ],
    },
    longFormBody: `
      <h1>Extract PDF Pages Safely - Isolate Crucial Documents</h1>
      <p>PDFMinty's extract PDF pages tool allows you to pull important sheets out of complex reports and save them as standalone files. Keep your relevant tax summaries, contract signatures, or chart illustrations, while discarding the rest of the document. Like all PDFMinty tools, the extraction process is completed directly in your browser with zero server latency.</p>
      
      <h2>Surgical Separating for Heavy Reports</h2>
      <p>Our extraction interface is designed for ultimate precision. It provides high-contrast thumbnail previews of your document sheets, making page selection painless. The engine isolates your chosen pages into a clean, new PDF structure, keeping all vector layers, high-res graphics, and hyperlinks intact.</p>
      
      <h2>How to Extract PDF Pages Local-First</h2>
      <ol>
        <li>Drag your PDF document into the client space.</li>
        <li>Select the specific sheets you wish to keep by clicking their checkboxes.</li>
        <li>Click 'Extract Pages'. PDFMinty gathers the chosen chapters.</li>
        <li>Download the new PDF file directly to your files.</li>
      </ol>
      
      <h2>Complete Data Privacy</h2>
      <p>Using outdated tools that upload PDFs pose serious privacy risks. PDFMinty provides a truly safe alternative. Isolating confidential financial details, sensitive client transcripts, or proprietary formulas takes place locally, ensuring your file content is never seen by anyone else.</p>
    `,
  },
  {
    id: 'reorder',
    slug: 'reorder-pdf',
    name: 'Reorder PDF Pages',
    shortDescription: 'Drag and drop to rearrange PDF page order',
    metaTitle: 'Reorder PDF Pages Free - Arrange PDF Pages Online | PDFMinty',
    metaDescription:
      'Rearrange the page order of your PDF document online for free. Drag, drop and organize page thumbnails privately inside your browser.',
    h1: 'Reorder PDF Pages - Arrange and Organize Pages Online',
    icon: 'Layers',
    category: 'organize',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Reorder PDF Pages',
      totalTime: 'PT25S',
      steps: [
        'Upload your PDF document by clicking or dragging.',
        'Drag and drop thumbnails into your desired order.',
        'Preview the new visual page sequence to verify layout.',
        'Download your reorganized PDF file instantly.',
      ],
    },
    longFormBody: `
      <h1>Reorder PDF Pages - Arrange and Organize Pages Online</h1>
      <p>Scanned files and compiled reports can easily end up with pages mixed up or out of sequence. PDFMinty's reorder PDF pages tool provides an easy drag-and-drop workspace to organize your document layouts. This interactive interface works 100% inside your web browser, keeping your page ordering simple, fast, and completely private.</p>
      
      <h2>Fluid Visual Layout Reorganization</h2>
      <p>Our intuitive grid lets you quickly reorganize multi-page PDFs. Just click, hold, and drag any page thumbnail to move it to its correct position. The system updates the page flow in real-time, adjusting the underlying PDF cross-reference tables instantly. When you save, your index links, headings, and margins remain properly aligned.</p>
      
      <h2>How to Reorder PDF Pages Online Safely</h2>
      <ol>
        <li>Load your PDF document into the local reordering window.</li>
        <li>Simply select a page preview and drag it into its new position in the grid.</li>
        <li>Verify formatting and structure using our live layout previews.</li>
        <li>Download the finalized, correctly structured PDF document.</li>
      </ol>
      
      <h2>Absolute Information Security</h2>
      <p>PDFMinty secures your documents by replacing server-side file uploads with browser-based rendering. Moving your private corporate plans near the front or arranging payroll summaries is computed entirely on your local machine, keeping your sensitive data private and secure.</p>
    `,
  },
  {
    id: 'watermark',
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    shortDescription: 'Draw custom stamp text overlay on PDF',
    metaTitle: 'Watermark PDF Free - Add Text Watermarks to PDFs | PDFMinty',
    metaDescription:
      'Protect and stamp your PDF files online with a secure custom watermark. Custom styling, transparency, and positioning locally.',
    h1: 'Add Watermark to PDF - Overlay Custom Text Seals Safely',
    icon: 'Bookmark',
    category: 'security-edit',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Add a Watermark to a PDF',
      totalTime: 'PT30S',
      steps: [
        'Upload your PDF document to the tool workspace.',
        "Enter your custom watermark text (e.g., 'CONFIDENTIAL').",
        'Adjust settings like transparency, text font size, and diagonal rotation.',
        'Apply the watermark stamp and download your protected document.',
      ],
    },
    longFormBody: `
      <h1>Add Watermark to PDF - Overlay Custom Text Seals Safely</h1>
      <p>Stamping documents with custom text overlays is a great way to safeguard intellectual property, label drafts, and discourage unauthorized sharing. PDFMinty's watermark tool lets you apply customizable, transparent watermarks to all of your PDF pages locally, right inside your web browser, without relying on vulnerable cloud servers.</p>
      
      <h2>Full Overlapping Customization Settings</h2>
      <p>Our interface offers extensive styling and positioning options. Easily type in custom labels like 'DRAFT', 'DO NOT COPY', or 'CONFIDENTIAL', and adjust text size, opacity, and rotation angles. The stamp is written directly to the document's vector paths, preventing simple removals while keeping your text sharp and legible.</p>
      
      <h2>Step-by-Step Guide to Watermarking PDFs Offline</h2>
      <ol>
        <li>Select and drop your PDF into the local workspace engine.</li>
        <li>Type your watermark text into the text field.</li>
        <li>Fine-tune the horizontal position, opacity, font size, and rotation angle using slide controls.</li>
        <li>Click 'Apply Watermark' to stamp all sheets, and download the finished file.</li>
      </ol>
      
      <h2>Designed for Strong Data Privacy</h2>
      <p>Traditional PDF editors require uploading documents to remote cloud farms, which can expose private files to data leaks. PDFMinty protects your privacy by processing files locally. Your contracts, mockups, or financial files remain on your device, ensuring complete security.</p>
    `,
  },
  {
    id: 'page-numbers',
    slug: 'add-page-numbers',
    name: 'Page Numbers',
    shortDescription: 'Add page identifiers dynamically',
    metaTitle: 'Add Page Numbers to PDF Free - Number PDF Pages | PDFMinty',
    metaDescription:
      'Insert page numbers into your PDF file. Customize numbering formats, header or footer layouts, and alignment completely in-browser.',
    h1: 'Add Page Numbers to PDF - Format Documents Instantly',
    icon: 'Hash',
    category: 'security-edit',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Add Page Numbers to a PDF',
      totalTime: 'PT20S',
      steps: [
        'Upload your PDF file to the numbering tool.',
        'Choose where pages numbers go (header or footer, left, right, or center).',
        'Select your text numbering style and starting integer.',
        "Click 'Add Page Numbers' and download your updated PDF.",
      ],
    },
    longFormBody: `
      <h1>Add Page Numbers to PDF - Format Documents Instantly</h1>
      <p>Unnumbered documents are difficult to navigate and reference in professional and academic settings. PDFMinty's page numbers tool lets you automatically stamp consistent, clear page counts onto your PDFs. Best of all, our tool operates entirely within your web browser, keeping your files safe, secure, and private.</p>
      
      <h2>Flexible Layout and Formatting Options</h2>
      <p>Add page counters in the exact format your project requires. You can place numbers at the top or bottom of pages and align them left, center, or right. Our engine reads your document's layout boxes to position numbers cleanly in headers or footers, avoiding overlapping text and keeping formatting professional.</p>
      
      <h2>How to Insert Page Numbers Privately</h2>
      <ol>
        <li>Drag your PDF file into our secure workspace area.</li>
        <li>Select your preferred alignment (left, center, or right) and position (header or footer).</li>
        <li>Provide starting numbers and font scaling preferences.</li>
        <li>Proceed with 'Add Page Numbers' to update your file in milliseconds.</li>
      </ol>
      
      <h2>The Secure Alternative to Cloud Tools</h2>
      <p>PDFMinty processes all files locally, so your private documentation, financial reports, or academic manuscripts are never exposed to external networks. You get fast, reliable page numbering with maximum privacy.</p>
    `,
  },
  {
    id: 'add-blank',
    slug: 'add-blank-page',
    name: 'Add Blank Page',
    shortDescription: 'Insert empty spacing sheets into PDF',
    metaTitle: 'Insert Blank Page into PDF Free - Add Empty PDF Pages | PDFMinty',
    metaDescription:
      'Add clear blank pages anywhere in your PDF file. Select custom layout sizes like Letter or A4 to insert blank pages securely.',
    h1: 'Add Blank Page to PDF - Insert Space Margins Safely',
    icon: 'FilePlus',
    category: 'organize',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Insert a Blank Page into a PDF',
      totalTime: 'PT15S',
      steps: [
        'Upload your PDF document into the secure workspace.',
        'Choose where to insert the blank sheet (start, end, or after a specific page).',
        'Select page template sizes (e.g., A4 or US Letter dimensions).',
        'Click the insert button and download the updated file.',
      ],
    },
    longFormBody: `
      <h1>Add Blank Page to PDF - Insert Space Margins Safely</h1>
      <p>Whether you're creating printable planners, preparing double-sided reports, or adding section break space, adding blank pages to your PDFs is easy with PDFMinty. Our offline tool lets you quickly insert clean, blank pages into your documents, keeping your editing private, fast, and secure.</p>
      
      <h2>Accurate Sizing and Positioning</h2>
      <p>Unlike editing tools that can distort page margins and alignments, PDFMinty matches the page size of your existing document. Insert blank pages at the very beginning, at the end, or after any specific page in your document. Choose from US Letter or A4 dimensions to ensure your formatting remains professional.</p>
      
      <h2>Step-by-Step Instructions to Insert Blank Pages</h2>
      <ol>
        <li>Load your PDF document into our local workspace.</li>
        <li>Select your preferred insert position (start, end, or after page).</li>
        <li>Choose a page size paper template matching your current document dimensions.</li>
        <li>Click 'Add Blank Page' to process your updated file locally.</li>
      </ol>
      
      <h2>Guaranteed Local-First Privacy</h2>
      <p>PDFMinty is built on a strict, serverless privacy architecture. Since files are processed entirely in your browser sandbox, your sensitive contracts, reports, or manuscript drafts are never uploaded to the cloud, giving you complete peace of mind.</p>
    `,
  },
  {
    id: 'protect',
    slug: 'protect-pdf',
    name: 'Protect PDF',
    shortDescription: 'Encrypt document with password constraint',
    metaTitle: 'Protect PDF Free - Password Protect PDF Online | PDFMinty',
    metaDescription:
      'Secure your PDF files with high-strength file access passwords. Completely local in-browser encryption safeguards sensitive business files.',
    h1: 'Password Protect PDF - Secure Documents with AES Encryption',
    icon: 'Shield',
    category: 'security-edit',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Password Protect a PDF',
      totalTime: 'PT20S',
      steps: [
        'Upload your PDF file to the encryption module.',
        'Enter a strong, custom key password.',
        'Set optional permissions (disable printing or content copying).',
        "Click 'Protect PDF' and download your secure encrypted file.",
      ],
    },
    longFormBody: `
      <h1>Password Protect PDF - Secure Documents with AES Encryption</h1>
      <p>PDFMinty's protect tool lets you lock your sensitive PDF documents with robust encryption. Encrypting your files ensures key tax filings, financial spreadsheets, or business reports are shielded from prying eyes. Best of all, our high-speed tool encrypts your files directly in your web browser, keeping your passwords and content completely confidential.</p>
      
      <h2>High-Level Security Standards</h2>
      <p>Our secure system generates standard compliance passwords, blocking unauthorized viewing and document modifications. You can require passwords to open the file, or set custom permissions that allow viewing but restrict editing, copying, or printing. This gives you flexible control over your sensitive documents.</p>
      
      <h2>How to Encrypt PDF Documents Offline</h2>
      <ol>
        <li>Drag your PDF document into our client-side encryption workspace.</li>
        <li>Invent a strong password in the input field.</li>
        <li>Customize permissions, or use default settings for global viewing locks.</li>
        <li>Click the 'Protect PDF' button to download your secure file.</li>
      </ol>
      
      <h2>The Modern Browser Encryption Advantage</h2>
      <p>Uploading files to online PDF tools can expose your private data to security bypasses and password theft on remote servers. PDFMinty eliminates this risk. By keeping your files local, your data and passwords never cross network gateways, giving you ultimate peace of mind.</p>
    `,
  },
  {
    id: 'unlock',
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    shortDescription: 'Decrypt pages to clean format',
    metaTitle: 'Unlock PDF Free - Remove PDF Password Security Online | PDFMinty',
    metaDescription:
      'Decrypt standard password protections from your PDFs. Strip file-restrictions and render your unlocked documents instantly in-browser.',
    h1: 'Unlock PDF - Decrypt Password Restricted PDF Documents',
    icon: 'Lock',
    category: 'security-edit',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Remove Password from a PDF',
      totalTime: 'PT15S',
      steps: [
        'Upload your password-protected PDF document.',
        'Enter the correct, authorized document password.',
        "Click 'Unlock PDF' to decrypt the file controls.",
        'Download your unlocked, restriction-free PDF file.',
      ],
    },
    longFormBody: `
      <h1>Unlock PDF - Decrypt Password Restricted PDF Documents</h1>
      <p>PDFMinty's unlock tool lets you quickly decrypt pages so you can access, read, and print your files hassle-free. If you're tired of entering credentials every time you open a file, or if you need to print a restricted PDF, our tool handles it in seconds directly inside your web browser.</p>
      
      <h2>Fast, Local PDF Decryption</h2>
      <p>Our engine parses standard user permissions and master restrictions locally. Simply enter the matching password, and our tool rebuilds the internal cross-reference schema, stripping away security flags, copying restrictions, and printing blocks, while keeping your document's layout intact.</p>
      
      <h2>How to Unlock Your PDF Files in Seconds</h2>
      <ol>
        <li>Load your password-protected PDF into our workspace interface.</li>
        <li>Provide the authorized user or owner password in the input field.</li>
        <li>Trigger 'Unlock PDF' to run our decryption routine.</li>
        <li>Instantly download your unlocked document, free from restrictions.</li>
      </ol>
      
      <h2>Safe and Confidential Decryption</h2>
      <p>Unlike other PDF tools that process decryption on external networks, PDFMinty is built on a strict, serverless privacy architecture. Because files are decrypted locally in your browser sandbox, your personal passwords and file content are never exposed to the cloud, giving you complete security.</p>
    `,
  },
  {
    id: 'image-to-pdf',
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    shortDescription: 'Convert PNG/JPG into beautiful PDFs',
    metaTitle: 'Image to PDF Free - Convert JPG/PNG to PDF Online | PDFMinty',
    metaDescription:
      'Convert images to PDF documents for free. Assemble JPG, PNG, and WebP files into single clean PDF pages completely inside your web browser.',
    h1: 'Convert Image to PDF - Turn JPEG and PNG Photos into PDFs',
    icon: 'Image',
    category: 'convert',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Convert Images to PDF',
      totalTime: 'PT30S',
      steps: [
        'Drop your PNG, JPG, or WebP images into the upload zone.',
        'Drag and drop thumbnails to arrange their sequence.',
        "Click 'Convert to PDF' to build the PDF document streams.",
        'Download your newly created PDF file to your machine.',
      ],
    },
    longFormBody: `
      <h1>Convert Image to PDF - Turn JPEG and PNG Photos into PDFs</h1>
      <p>Converting scanned files, sketches, and mobile photos into clean, organized PDFs can make them much easier to view and share. PDFMinty's image to PDF tool lets you combine JPG, PNG, and WebP files into professional documents. Our conversion process runs 100% locally in your web browser, keeping your photos secure without uploading them to remote servers.</p>
      
      <h2>Organize and Arrange Multiple Photos</h2>
      <p>Our tool makes compiling images into PDFs easy. Drop your image files into our workspace grid and arrange them in the exact order you need. Our conversion engine preserves your images' full resolution and color depth, resizing them cleanly to fit standard A4 or US Letter page boundaries for a professional-looking output.</p>
      
      <h2>Step-by-Step Instructions to Convert Images</h2>
      <ol>
        <li>Drag your JPG, PNG, or WebP graphic assets into the conversion area.</li>
        <li>Arrange pages by dragging thumbnails into your preferred order.</li>
        <li>Select 'Convert to PDF' to bundle your images in your web browser.</li>
        <li>Download the finalized PDF file instantly. No registration or credit cards required.</li>
      </ol>
      
      <h2>Strong Data Privacy Protection</h2>
      <p>Sending private photos to online PDF editors can expose your personal data to security leaks on remote web servers. PDFMinty protects your privacy by processing files locally. Your photos and documents remain on your device, ensuring complete security.</p>
    `,
  },
  {
    id: 'pdf-to-image',
    slug: 'pdf-to-image',
    name: 'PDF to Image',
    shortDescription: 'Export PDF pages to standard raster images',
    metaTitle: 'PDF to Image Free - Convert PDF to JPG Online | PDFMinty',
    metaDescription:
      'Convert PDF pages to lossless PNG or high-quality JPG images. Zero uploading means document text elements remain private and local.',
    h1: 'Convert PDF to Image - Export Pages to PNG and JPEG',
    icon: 'Eye',
    category: 'convert',
    priority: 0.8,
    changefreq: 'monthly',
    type: 'tool',
    howTo: {
      name: 'How to Convert PDF to Images',
      totalTime: 'PT20S',
      steps: [
        'Upload your PDF document by clicking or dragging files.',
        'Select your output file format (PNG or JPG quality settings).',
        'Click the conversion button to trigger the browser rendering pipeline.',
        'Download your converted images inside a single ZIP folder.',
      ],
    },
    longFormBody: `
      <h1>Convert PDF to Image - Export Pages to PNG and JPEG</h1>
      <p>Converting PDF pages into individual image files can make them easy to share, view on mobile devices, or use in web projects. PDFMinty's PDF to image tool converts files into lossless PNGs or high-quality JPGs in seconds. Best of all, our conversion process runs entirely in your web browser, keeping your critical documents completely private and secure.</p>
      
      <h2>Page-by-Page HTML5 Canvas Extraction</h2>
      <p>Our conversion engine renders PDF vectors onto local HTML5 canvas elements, producing high-resolution, pixel-perfect PNG and JPG graphics. You can select specific pages or convert the entire document. When finished, your files are packaged into a single ZIP archive, keeping your downloads organized and fast.</p>
      
      <h2>How to Convert PDF Pages into Images Offline</h2>
      <ol>
        <li>Select and load your PDF file into our secure workspace area.</li>
        <li>Choose your preferred output format, like PNG or JPG.</li>
        <li>Click 'Convert to Images' to render pages using local browser resources.</li>
        <li>Download the organized ZIP folder containing your images.</li>
      </ol>
      
      <h2>Maximum Privacy and Security</h2>
      <p>PDFMinty is built on a strict, serverless privacy architecture. Since files are processed entirely in your browser sandbox, your sensitive contracts, reports, or manuscript drafts are never uploaded to the cloud, giving you complete peace of mind.</p>
    `,
  },
  {
    id: 'intelligence',
    slug: 'intelligence',
    name: 'AI Analyze',
    shortDescription: 'Summarize or ask questions via server AI',
    metaTitle: 'AI PDF Analyzer Free - Chat with PDFs Online | PDFMinty',
    metaDescription:
      'Analyze PDF files with edge AI. Securely summarize, chat with, and extract deep structural details from your PDF contents with privacy in mind.',
    h1: 'AI Analyze PDF - Summarize and Query Documents with Gemini',
    icon: 'Sparkles',
    category: 'intelligence',
    priority: 0.85,
    changefreq: 'weekly',
    type: 'tool',
    howTo: {
      name: 'How to Analyze a PDF with AI',
      totalTime: 'PT60S',
      steps: [
        'Upload your PDF document inside the intelligence app module.',
        'Wait for the local extraction interface to parse the text layout.',
        "Select the 'Summary' option or type a custom question in the chat bar.",
        'Read or copy the AI-generated answers and analytical breakdowns.',
      ],
    },
    longFormBody: `
      <h1>AI Analyze PDF - Summarize and Query Documents with Gemini</h1>
      <p>Reading through lengthy PDFs, research papers, legal contracts, or technical manuals can be incredibly time-consuming. PDFMinty's AI Analyze tool lets you summarize and chat with your documents using powerful artificial intelligence, helping you find key insights instantly.</p>
      
      <h2>Local Text Parsing with Secure Serverless Analysis</h2>
      <p>To prioritize your privacy, PDFMinty parses your PDF text locally in your web browser first. The text layers are extracted directly on your machine before being analyzed by the Gemini model. This approach ensures your original formatting remains private, while giving you access to fast, highly accurate, and in-depth answers, summaries, and translations.</p>
      
      <h2>How to Get Instant Answers and Summaries</h2>
      <ol>
        <li>Drag your PDF document into our AI Analyze workspace window.</li>
        <li>Let the local extraction engine parse the document's characters.</li>
        <li>Select 'Summarize' for a high-level breakdown, or ask specific questions in the chat lobby.</li>
        <li>Review your AI-generated answers and copy insights to your clipboard in seconds.</li>
      </ol>
      
      <h2>Smart, Privacy-First PDF Analysis</h2>
      <p>Unlike other AI tools that upload and store entire files, PDFMinty processes text layers locally first, only sending plain text to secure APIs. This local-first parsing shields your private documents from unauthorized search indexes and keeps your files safe.</p>
    `,
  },
  {
    id: 'trust-article',
    slug: 'is-it-safe-to-upload-pdf-to-online-tools',
    name: 'Is It Safe?',
    shortDescription: 'Safety analysis and trust details',
    metaTitle: 'Is It Safe to Upload PDFs to Online Tools? | PDFMinty',
    metaDescription:
      'Discover the severe security risks of online PDF tools. Learn about server-side vulnerabilities and why client-side processing is crucial.',
    h1: 'Is It Safe to Upload PDF Files to Online Tools? An In-Depth Safety Analysis',
    icon: 'Shield',
    category: 'trust',
    priority: 0.7,
    changefreq: 'monthly',
    type: 'article',
    longFormBody: `
      <h1>Is It Safe to Upload PDF Files to Online Tools? An In-Depth Safety Analysis</h1>
      <p>Millions of professionals, students, and businesses use online PDF tools every day to merge contracts, compress tax returns, or convert receipts. However, many users don't realize where their documents go after clicking 'Upload'. Let's take an in-depth, cybersecurity-focused look at the severe risks of online tools, and explain why browser-side local document processing is the safest solution.</p>
      
      <h2>The Risks of Remote PDF Compiling</h2>
      <p>When you upload a file to a conventional online PDF editor, your document is sent to an external server in the cloud, where it is stored and processed. This approach introduces several major security risks, including:</p>
      <ul>
        <li><strong>Insecure File Storage:</strong> Files can sometimes remain on cloud servers long after your session ends, leaving them vulnerable to data breaches.</li>
        <li><strong>Data Interception:</strong> Hackers can intercept file packets as they travel over public networks, potentially exposing sensitive information.</li>
        <li><strong>Third-Party Access:</strong> Some services may sell or share your data with advertisers and external entities without your consent.</li>
      </ul>
      
      <h2>Why Browser-Side (Client-Side) Processing is Safer</h2>
      <p>PDFMinty is built on a browser-side (client-side) architecture, which process your files entirely on your local machine using technologies like WebAssembly. This approach offers several key security benefits:</p>
      <ul>
        <li><strong>Zero Uploads:</strong> Your files never leave your device, meaning there is no data transmitted over network calls.</li>
        <li><strong>Instant Processing:</strong> Without network latency, your files are processed in your web browser milliseconds.</li>
        <li><strong>No Account Required:</strong> Since files are computed locally, you don't need to log in or share personal details.</li>
      </ul>
      
      <h2>How to Keep Your PDF Files Private</h2>
      <p>To safeguard your private business documents and personal details, always look for tools that prioritize local-first processing. PDFMinty provides a truly safe alternative. By keeping your files local, your data and passwords never cross network gateways, giving you ultimate peace of mind.</p>
    `,
  },
];
