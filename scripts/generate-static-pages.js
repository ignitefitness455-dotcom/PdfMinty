import fs from 'fs';
import path from 'path';

const routes = [
  {
    path: '/merge-pdf',
    title: 'Merge PDF Without Uploading — 100% Private & Free | PDFMinty',
    desc: 'Merge PDF files online free — no upload needed. Combine multiple PDFs in your browser privately. 100% free, no account required.',
    name: 'Merge PDFs',
    staticBody: `
      <h1>Merge PDF Without Uploading — 100% Private, Free, and Native</h1>
      <p>Combine your PDF documents securely without uploading sensitive bills, invoices, contracts, or credentials. Everything processed locally in your browser sandbox.</p>
      <h2>How to Merge PDFs</h2>
      <ol>
        <li>Select your PDF files using the secure file picker</li>
        <li>Arrange files in your target order with easy drag and drop tools</li>
        <li>Click Merge to combine them natively on your CPU</li>
        <li>Download your consolidated PDF file instantly</li>
      </ol>
    `
  },
  {
    path: '/split-pdf',
    title: 'Split PDF Without Uploading — 100% Private & Free | PDFMinty',
    desc: 'Split PDF online free without uploading. Extract specific pages in your browser. Private, fast, no account needed.',
    name: 'Extract Pages',
    staticBody: `
      <h1>Split PDF Without Uploading — 100% Private, Free, and Native</h1>
      <p>Partition structural manuals, financial sheets, or legal documents safely. Extract pages or split PDF pages into a new file without sending files over the web.</p>
      <h2>How to Split a PDF</h2>
      <ol>
        <li>Select your PDF document locally in the secure sandbox</li>
        <li>Specify split options like '1-3, 5' or visually tick checkboxes on page thumbnails</li>
        <li>Prune and extract targeted ranges using modern client-side processing</li>
        <li>Download your new separated PDF files instantly</li>
      </ol>
    `
  },
  {
    path: '/compress-pdf',
    title: 'Compress PDF in Browser — Free Offline Optimizer | PDFMinty',
    desc: 'Compress PDF online free — optimize file size in browser. No upload, 100% private. Works offline.',
    name: 'Compress PDF',
    staticBody: `
      <h1>Compress PDF in Browser — Safely Optimize Your File Size Offline</h1>
      <p>Optimize your documents by safely scrubbing redundant digital structures, metadata definitions, and heavy layout codes without compressing visual images.</p>
      <h2>How to Compress a PDF</h2>
      <ol>
        <li>Select your PDF document locally without uploading to web servers</li>
        <li>Let the offline script parse and strip bloated tracking attributes and headers</li>
        <li>Process layouts in your browser to compress file elements safely</li>
        <li>Download your optimized, cleaner PDF file instantly</li>
      </ol>
    `
  },
  {
    path: '/rotate-pdf',
    title: 'Rotate PDF Pages Free Online — 100% Private | PDFMinty',
    desc: 'Rotate PDF pages online free — no upload required. Permanently rotate individual or all pages in browser.',
    name: 'Rotate Pages',
    staticBody: `
      <h1>Rotate PDF Pages Free Online — 100% Private &amp; Local</h1>
      <p>Need a safe way to rotate specific pages in pdf without uploading sensitive tax files, contracts, or bank statements to remote company servers? PDFMinty is an offline-first tool built to rotate pdf pages online without account requirements. Enjoy a premium, 100% in-browser utility that structures, aligns, and lets you rotate pdf pages free online using local Web Workers without risking your data security. Download your permanently fixed documents instantly with zero limits.</p>
      
      <h2>How to Rotate PDF Pages Online Without Account</h2>
      <ol>
        <li>Select or drag your PDF document locally in the secure sandbox.</li>
        <li>Click clockwise or counter-clockwise controls on individual pages to adjust orientation.</li>
        <li>Process and lock in the rotated layout instantly on your CPU.</li>
        <li>Download your permanently rotated PDF output immediately.</li>
      </ol>

      <h2>Rotate Specific Pages in PDF Permanently Without Uploading</h2>
      <p>Many online PDF rotators require sending your files to active server farms, which leaves your private invoices or security lists vulnerable. PDFMinty safeguards your information by performing secure local layout updates entirely in your client-side browser tab. If you need further optimizations, you can easily use our other tools to <a href="/compress-pdf">Compress PDF in browser</a>, <a href="/merge-pdf">Merge PDF without uploading</a> to combine files, or <a href="/split-pdf">Split PDF online free</a> in a highly secure environment.</p>

      <h2>Why Use our Local In-Browser PDF Rotator?</h2>
      <p>Traditional tools charge steep subscription fees or stamp ugly watermarks on documents to fix sideways pages. By executing all structural rotations locally in your web browser sandbox, PDFMinty avoids expensive cloud computing overhead. This ensures the service remains completely free and completely safe on all systems.</p>
    `
  },
  {
    path: '/organize',
    title: 'Delete PDF Pages Free Online — 100% Private & Local | PDFMinty',
    desc: 'Delete PDF pages online free — remove unwanted pages in browser. Private, no upload, no account needed.',
    name: 'Delete Pages',
    staticBody: `
      <h1>Delete PDF Pages Free Online — 100% Private &amp; Local</h1>
      <p>Need a secure, hassle-free way to delete pages from pdf free online without uploading sensitive files to cloud servers? PDFMinty is a premium, offline-first tool designed to remove pages from pdf without uploading files, allowing you to delete pdf pages in browser privately. Whether you are wondering how to delete pages from pdf for free or need to remove specific pages from pdf online, our responsive utility runs 100% locally on your computer's browser using in-browser processing. Enjoy safe document pruning with absolute peace of mind.</p>
      
      <h2>How to Delete Pages from PDF for Free Online</h2>
      <ol>
        <li>Select or drag your PDF document locally in the secure sandbox.</li>
        <li>Review visually rendered page thumbnails and click the trash/delete icon on any slides you wish to remove.</li>
        <li>Commit the deletion, completely offline, using secure client-side technologies.</li>
        <li>Download and save your permanently pruned PDF instantly with zero limits.</li>
      </ol>

      <h2>Remove Specific Pages from PDF Online Privately</h2>
      <p>Many online tools copy your financial files, passport scans, or contracts onto remote cloud storage systems, which creates privacy risks. PDFMinty safeguards your information by performing secure local page deletions inside your client-side browser tab. If you need further optimizations, you can easily use our other tools to <a href="/compress-pdf">Compress PDF in browser</a>, <a href="/merge-pdf">Merge PDF without uploading</a> to combine documents, or <a href="/split-pdf">Split PDF online free</a> to separate pages securely.</p>

      <h2>Why Delete PDF Pages in Browser Offline?</h2>
      <p>Traditional tools charge steep subscription fees or stamp ugly watermarks on documents to delete specific pages. By executing all structural modifications locally in your web browser sandbox on your device, PDFMinty avoids expensive cloud computing overhead. This ensures our service remains 100% free and safe on all operating systems.</p>
    `
  },
  {
    path: '/watermark-pdf',
    title: 'Add Watermark to PDF Free Online - No Upload | PDFMinty',
    desc: 'Add watermark to PDF free online — no upload. Stamp custom text on PDF pages privately in browser.',
    name: 'Add Watermark',
    staticBody: `
      <h1>Add Watermark to PDF Free Online — 100% Private, Secure &amp; Local</h1>
      <p>Looking for a secure way to add watermark to pdf free online without risking your files? PDFMinty is an offline-first tool that lets you watermark pdf without uploading sensitive contracts, bank details, or passport scans to remote servers. All text stamps are processed instantly in your browser sandbox using secure client-side technology, ensuring maximum privacy. Protect your intellectual property with customizable text opacity, angles, and color schemes without registration.</p>
      
      <h2>How to Add Watermark to PDF in Browser Free</h2>
      <ol>
        <li>Select or drag your PDF document locally in the secure sandbox.</li>
        <li>Type your custom watermark text, select color, opacity level, and angle.</li>
        <li>Preview the alignment and overlay details directly in your browser.</li>
        <li>Download your compiled PDF output instantly with zero wait times.</li>
      </ol>

      <h2>Protect Intellectual Property Without Uploading Sensitive Files</h2>
      <p>Traditional tools copy your legal documents, architectural plans, or financial sheets to remote cloud storage, making confidential papers vulnerable to scraping or exposure. PDFMinty safeguards your information by performing watermarks client-side. We keep all assets inside your local browser tab. If you need further optimizations, you can easily use our tool to <a href="/compress-pdf">Compress PDF in browser</a>, <a href="/merge-pdf">Merge PDF without uploading</a> to combine files, or <a href="/split-pdf">Split PDF online free</a> to separate pages.</p>

      <h2>How to Add Watermark to PDF Without Adobe Acrobat</h2>
      <p>Why pay for expensive Adobe subscriptions or desktop install setups? PDFMinty is fully open-access, responsive, and compatible with all modern mobile and desktop browsers, keeping your workflows unified and zero-friction.</p>
    `
  },
  {
    path: '/add-page-numbers',
    title: 'Add Page Numbers to PDF Free Online - No Upload | PDFMinty',
    desc: 'Add page numbers to PDF free online — no upload needed. Number PDF pages in browser privately.',
    name: 'Page Numbers',
    staticBody: `
      <h1>Add Page Numbers to PDF Free Online — 100% Private &amp; Local</h1>
      <p>Need an easy, secure way to add page numbers to pdf free online without uploading sensitive documents to external servers? PDFMinty is an offline-first tool built to let you number pdf pages without uploading, ensuring perfect security and confidentiality. Discover how to add page numbers to pdf free or add page numbers to pdf in browser seamlessly using client-side Web Workers. Keep your sensitive reports, books, and theses protected.</p>
      
      <h2>How to Add Page Numbers to PDF Offline Without Account</h2>
      <ol>
        <li>Select or drag the unnumbered PDF file directly into our local web panel workflow.</li>
        <li>Choose where you want the numbers (e.g. bottom right, bottom center) and format style options.</li>
        <li>Verify your chosen coordinates and stamp the vector numbers immediately on your CPU.</li>
        <li>Save the sequentially numbered PDF document instantly without account signups.</li>
      </ol>

      <h2>Customizable Page Alignment and Permanent Results</h2>
      <p>Our local tool allows you to easily skip the cover page or customize standard layout alignments (such as Bottom Right, Bottom Center, etc.). Once done, the page numbers are burned permanently into the PDF's vector structure so they look professional in any PDF reader. If you need other PDF optimizations on your device, you can also <a href="/compress-pdf">Compress PDF in browser</a> to optimize page sizes, <a href="/merge-pdf">Merge PDF without uploading</a> to join multiple manuals, or <a href="/split-pdf">Split PDF online free</a> to slice sheets privately in seconds.</p>

      <h2>Why Choose a Local Offline-First Numbering Tool?</h2>
      <p>Unlike classic websites that upload your personal documents to their cloud servers, PDFMinty runs 100% in-browser. This avoids server overhead and gives you absolute control over your private documents, ensuring your legal and academic files are read only by you. Our responsive, modern interface is free of annoying ads, watermarks, and mandatory registrations.</p>
    `
  },
  {
    path: '/add-blank-page',
    title: 'Add Blank Page to PDF Free — Insert Online | PDFMinty',
    desc: 'Insert blank page into PDF free online — no upload. Add blank pages anywhere in browser.',
    name: 'Add Blank Page',
    staticBody: `
      <h1>Add Blank Page to PDF Free Online — 100% Private &amp; Local</h1>
      <p>Need a secure, fast way to add blank page to pdf free online without uploading sensitive legal papers, contracts, or layout blueprints to remote servers? PDFMinty is a premium, offline-first tool built to insert blank page in pdf online without account requirements. Discover how to add blank page to pdf without acrobat easily in your browser. All layout generation runs 100% privately inside your local browser tab on your computer, protecting your information.</p>
      
      <h2>How to Add Blank Page to PDF in Browser Offline</h2>
      <ol>
        <li>Select or drag the PDF document requiring new page breaks directly into our secure client-side sandbox.</li>
        <li>Choose insertion coordinates (e.g. template after Page 1) and size formats (A4, Letter) easily.</li>
        <li>Process the formatting securely on your CPU without external cloud reliance.</li>
        <li>Download your updated PDF files instantly with zero waiting time or conversion gates.</li>
      </ol>

      <h2>Insert Blank Page in PDF Online Privately Without Uploading</h2>
      <p>Traditional tools copy your personal drawings, passport copies, or commercial invoices to cloud servers, risking your corporate secrets or general layout information. PDFMinty keeps every transaction confined strictly to your device's memory. If you need other PDF optimizations, you can easily use our platform to <a href="/compress-pdf">Compress PDF in browser</a> to optimize sizes, <a href="/merge-pdf">Merge PDF without uploading</a> to combine files, or securely <a href="/split-pdf">Split PDF online free</a> to slice sheets privately with absolute safety.</p>

      <h2>How to Add Blank Page to PDF Without Adobe Acrobat Premium</h2>
      <p>Why pay expensive monthly Adobe Acrobat subscription fees or download bloated software simply to insert a single blank sheet? PDFMinty is fully open-access, lightweight, and compatible across all desktop or mobile browsers. Enjoy a clean utility that fits the dimensions of your existing document seamlessly and keeps file sizes incredibly optimized.</p>
    `
  },
  {
    path: '/protect-pdf',
    title: 'Password Protect PDF in Browser — 100% Private | PDFMinty',
    desc: 'Password protect PDF online free — no upload. Encrypt PDF with password in browser. 100% private.',
    name: 'Secure PDF',
    staticBody: `
      <h1>Password Protect PDF in Browser — Lock PDF Without Software</h1>
      <p>Looking for a safe way to add password to pdf free and keep your personal or business files secure? PDFMinty lets you password protect pdf in browser without uploading sensitive records to the cloud. Protect PDF free online with no upload, keeping all processing 100% private and offline on your device.</p>
      <h2>How to Password Protect PDF in Browser Without Software</h2>
      <ol>
        <li>Select your private PDF document locally in the secure sandbox.</li>
        <li>Specify a secure password key and standard lock permissions.</li>
        <li>Render the standard cryptographically locked PDF instantly on your CPU.</li>
        <li>Download your password protected PDF file immediately.</li>
      </ol>
      <h2>100% Private AES Encryption — No File Uploads Needed</h2>
      <p>Our client-side tool is engineered with modern sandbox technology to keep all processing strictly local. You can also easily <a href="/unlock-pdf">Unlock PDF free offline</a> using your authorized key, <a href="/merge-pdf">Merge PDF without uploading</a> to combine files, or <a href="/split-pdf">Split PDF into separate files</a> in a highly secure environment.</p>
      <h2>Why Lock PDF Files Locally on Your Device?</h2>
      <p>Many online tools copy your legal documents and corporate papers to remote servers. PDFMinty safeguards your information by performing secure local locks without sending any byte over the internet.</p>
      <h2>How to Password Protect a PDF Without Adobe Acrobat</h2>
      <p>You do not need expensive subscriptions or software programs to add premium ISO-compliant password security. Our toolkit is 100% open-access and zero-friction for all modern web browsers.</p>
    `
  },
  {
    path: '/unlock-pdf',
    title: 'Unlock PDF Free Online — Remove PDF Password | PDFMinty',
    desc: 'Remove PDF password online free — no upload. Decrypt protected PDF in browser privately.',
    name: 'Unlock PDF',
    staticBody: `
      <h1>Unlock PDF Free Online — 100% Private &amp; Local</h1>
      <p>Need a safe way to unlock pdf free online without uploading sensitive legal briefs, business contracts, or banking logs to remote company servers? PDFMinty is an offline-first tool built to remove pdf password free and unlock pdf without uploading your files. Enjoy a premium, in-browser sandbox designed to remove pdf password protection online free using highly secure, client-side Web Workers on your local CPU.</p>
      
      <h2>How to Unlock a PDF Online Offline</h2>
      <ol>
        <li>Select or drag your password-locked PDF document directly into our secure client-side sandbox.</li>
        <li>If prompted for an open password, enter the authorized opening password securely.</li>
        <li>Process and strip the security restriction layers off the file stream.</li>
        <li>Download and save your permanently unlocked PDF file instantly.</li>
      </ol>

      <h2>Remove PDF Password and Owner Restrictions Privately</h2>
      <p>Many web services upload your personal financial records or corporate worksheets to active databases to strip password keys, creating secure data vulnerabilities. PDFMinty runs entirely on your local web browser, keeping your keys and files completely encapsulated inside your device's memory. If you require further secure file optimizations, you can easily use our platform to <a href="/compress-pdf">Compress PDF in browser</a> to shrink sizes, <a href="/merge-pdf">Merge PDF without uploading</a> to combine sections, or <a href="/split-pdf">Split PDF online free</a> to slice sheets privately with absolute safety.</p>

      <h2>Important Note: User vs. Owner PDF Passwords Explained</h2>
      <p>Please note that PDF document format security supports two distinct password types:</p>
      <ul>
        <li><strong>Owner or Permissions Passwords:</strong> These restrict actions like copying text, editing forms, or printing pages while still allowing the document content to be displayed. PDFMinty can instantly decrypt and strip these owner restrictions offline without any password required.</li>
        <li><strong>User or Open Passwords:</strong> These encrypt the entire document structure, requiring a security key before any viewer can display the content. PDFMinty does not support how to unlock pdf without password free if a user-open password is active. You must enter the correct authorized password so the browser-side script can decrypt and permanently strip it from the file. We respect the protection models of documents and do not host hacking or brute-forcing scripts.</li>
      </ul>
    `
  },
  {
    path: '/image-to-pdf',
    title: 'JPG to PDF Free Online No Upload — 100% Private | PDFMinty',
    desc: 'Convert images to PDF free online — no upload. Convert JPG, PNG to PDF in browser privately.',
    name: 'Image to PDF',
    staticBody: `
      <h1>Convert JPG to PDF Free Online No Upload — 100% Private</h1>
      <p>Need a safe way to convert photos to pdf free without sharing your personal receipts, passport photos, or confidential worksheets with cloud servers? PDFMinty is an offline-first image to pdf converter browser-based tool that runs entirely on your local device. Convert PNG to PDF online free and combine multiple images to pdf free online with absolute data privacy. All processing completes instantly within your device's RAM, ensuring your files never leave your computer.</p>
      
      <h2>How to Convert JPG to PDF Without Uploading to Server</h2>
      <ol>
        <li>Select or drag your image sequence (PNG, JPG, WebP) directly into our secure sandbox.</li>
        <li>Arrange the sequence manually or adjust border padding and paper layout metrics.</li>
        <li>Compile image coordinates to PDF parameters directly on your local CPU.</li>
        <li>Download your compiled PDF output instantly with zero watermarks.</li>
      </ol>

      <h2>Combine Multiple Images to PDF Free Online Privately</h2>
      <p>Traditional converters copy your visual pictures to remote cloud storage, making sensitive papers vulnerable to scraping or leaks. PDFMinty safeguards your photos by rendering everything client-side. We keep information fully encapsulated inside your browser tab. If you need to optimize the resulting file size, you can easily use our tool to <a href="/compress-pdf">Compress PDF in browser</a> without losing crisp quality. You can also securely <a href="/merge-pdf">Merge PDF without uploading</a> or use the sandbox to <a href="/split-pdf">Split PDF online free</a>.</p>

      <h2>Fast and Secure Image to PDF Converter in Browser</h2>
      <p>By executing all binary operations on your local processor instead of hosting resource-heavy remote server nodes, PDFMinty delivers high-speed, instant compilation. This enables us to maintain a completely free service without inserting advertising watermarks, requiring signups, or limiting your daily conversion schedules.</p>

      <h2>No Account and No Watermarks — Zero-Friction Photo Binder</h2>
      <p>Skip the tedious software setup or account creation flows. Easily bundle your smartphone photos, documents snapshots, paper receipts, or portfolios on any iOS, Android, macOS, or Windows browser securely in seconds.</p>
    `
  },
  {
    path: '/pdf-to-image',
    title: 'Convert PDF to Image Online Free — 100% Private | PDFMinty',
    desc: 'Convert PDF to images free online — no upload. Export PDF pages as JPG or PNG in browser.',
    name: 'PDF to Image',
    staticBody: `
      <h1>Convert PDF to Image Online Free — 100% Private &amp; Local</h1>
      <p>Need a safe way to convert PDF to image online free without sending bank statements, IDs, or confidential contracts over the web? PDFMinty lets you convert PDF to image in browser using highly performant client-side Web Workers, ensuring all file processing is kept strictly local on your CPU. Easily extract your pages as clear transparent PNGs or compact JPG formats without registering an account or facing hidden payment limits.</p>
      
      <h2>How to Convert PDF Pages to Images Without Uploading</h2>
      <ol>
        <li>Select or drag your PDF document locally in the secure sandbox.</li>
        <li>Choose your target format (JPEG/PNG) and resolution output (standard 150 DPI or professional 300 DPI).</li>
        <li>Click convert to cleanly render PDF pages into separate graphics locally on your device.</li>
        <li>Download high-quality image slides or save them in a consolidated ZIP archive.</li>
      </ol>

      <h2>Extract High-Resolution JPG or PNG Privately from Your PDF</h2>
      <p>Many online search results for PDF compressors or converters require sending raw files to web servers where they can be cached, logged, or exposed. Our platform is built from the ground up to render everything directly inside your browser. No files are uploaded to any clouds, giving you perfect peace of mind when extracting pages from personal tax forms, invoices, or secure identification papers.</p>

      <h2>Why Use an Offline-First PDF to Image Converter?</h2>
      <p>Traditional tools charge steep subscription fees to extract document pages. By processing bytes locally on your device's browser sandbox, PDFMinty avoids pricey cloud infrastructure costs. This allows us to offer completely free operations with no page restrictions, no watermarking, and absolute safety. If you also need to assemble images back together, you can <a href="/image-to-pdf">Convert Image to PDF online</a>, <a href="/merge-pdf">Merge PDF without uploading</a>, or easily <a href="/split-pdf">Split PDF pages offline</a> with zero tracking.</p>

      <h2>Zero Cost, No Account Required, and No Watermarks Allowed</h2>
      <p>Don't waste time creating accounts or entering email credentials to download your pictures. Simply drop your copy, select your settings, and save your separate images. It is a seamless, zero-friction process compatible with all modern desktop and mobile browsers.</p>
    `
  },
  {
    path: '/intelligence',
    title: 'AI PDF Analyzer Free — Analyze & Summarize Online | PDFMinty',
    desc: 'Analyze PDF with AI free online. Get summaries and insights from PDF documents privately.',
    name: 'AI PDF Analyzer',
    staticBody: `
      <h1>AI PDF Analyzer Free — 100% Private &amp; Local Text Extraction</h1>
      <p>Need a secure, hassle-free way to analyze pdf with ai free without uploading sensitive records to remote cloud servers? PDFMinty's modern offline-first browser engine extracts textual content locally on your computer inside your browser tab before securely transmitting encrypted text segments to our protected Gemini proxy. This lets you get instant summaries, outline key points, and chat with your papers safely. Use a premium pdf summarizer ai free online tool with absolute comfort and privacy.</p>
      
      <h2>How to Analyze a PDF with AI Free</h2>
      <ol>
        <li>Select or drag the PDF document containing complex structures or heavy text blocks directly into our secure client-side sandbox.</li>
        <li>Our responsive client-side script parses text positions and characters entirely within your native browser cache.</li>
        <li>Enter custom queries or use pre-set commands to instantly summarize pdf with ai no account required.</li>
        <li>Copy, print, or export your AI-generated outlines, structured insights, and Q&amp;A sessions in seconds.</li>
      </ol>

      <h2>The Safest AI Tool to Analyze PDF Documents Free</h2>
      <p>Many classic AI platforms copy your complete contracts, legal agreements, or medical files directly onto remote servers, exposing your sensitive information. PDFMinty safeguards your confidentiality by executing all layouts, previews, and text extraction locally on your device's web sandbox. Our secure, server-side proxy handles text communication using top-tier encryption, and neither our system nor the underlying Gemini API will ever utilize or retain your documents for model training. If you need other secure tools, feel free to also <a href="/compress-pdf">Compress PDF in browser</a>, use <a href="/merge-pdf">Merge PDF without uploading</a>, or securely <a href="/split-pdf">Split PDF online free</a> on your computer.</p>

      <h2>How We Support Scanned PDFs and Complex Layouts</h2>
      <p>Traditional tools frequently fail or hallucinate when reading non-selectable scanned text, complex tables, or multi-column reports. PDFMinty uses highly optimized browser-side text recognition to parse images and scanned sheets. It transcribes visual characters cleanly in multiple languages so that the AI model receives exact text arrays, delivering precise summaries with zero misread numbers.</p>
    `
  },
  {
    path: '/delete-pages-pdf',
    title: 'Delete PDF Pages Free Online — 100% Private & Local | PDFMinty',
    desc: 'Delete pages from pdf free online without uploading sensitive files to cloud servers. Remove specific pages from pdf online privately with our secure, in-browser editor. Try now!',
    name: 'Delete PDF Pages',
    staticBody: `
      <h1>Delete PDF Pages Free Online — 100% Private &amp; Local</h1>
      <p>Need a secure, hassle-free way to delete pages from pdf free online without uploading sensitive files to cloud servers? PDFMinty is a premium, offline-first tool designed to remove pages from pdf without uploading files, allowing you to delete pdf pages in browser privately. Whether you are wondering how to delete pages from pdf for free or need to remove specific pages from pdf online, our responsive utility runs 100% locally on your computer's browser using in-browser processing. Enjoy safe document pruning with absolute peace of mind.</p>
      
      <h2>How to Delete Pages from PDF for Free Online</h2>
      <ol>
        <li>Select or drag your PDF document locally in the secure sandbox.</li>
        <li>Review visually rendered page thumbnails and click the trash/delete icon on any slides you wish to remove.</li>
        <li>Commit the deletion, completely offline, using secure client-side technologies.</li>
        <li>Download and save your permanently pruned PDF instantly with zero limits.</li>
      </ol>

      <h2>Remove Specific Pages from PDF Online Privately</h2>
      <p>Many online tools copy your financial files, passport scans, or contracts onto remote cloud storage systems, which creates privacy risks. PDFMinty safeguards your information by performing secure local page deletions inside your client-side browser tab. If you need further optimizations, you can easily use our other tools to <a href="/compress-pdf">Compress PDF in browser</a>, <a href="/merge-pdf">Merge PDF without uploading</a> to combine documents, or <a href="/split-pdf">Split PDF online free</a> to separate pages securely.</p>

      <h2>Why Delete PDF Pages in Browser Offline?</h2>
      <p>Traditional tools charge steep subscription fees or stamp ugly watermarks on documents to delete specific pages. By executing all structural modifications locally in your web browser sandbox on your device, PDFMinty avoids expensive cloud computing overhead. This ensures our service remains 100% free and safe on all operating systems.</p>
    `
  },
  {
    path: '/extract-pages-pdf',
    title: 'Extract PDF Pages Online Free — PDFMinty',
    desc: 'Extract specific pages from PDF files for free. Download selected pages as a new PDF.',
    name: 'Extract PDF Pages',
    staticBody: `
      <h1>Extract PDF Pages Online Free</h1>
      <p>Separate or crop particular pages or ranges out of a bigger document cleanly in your environment.</p>
      <h2>How to Extract Pages from PDF</h2>
      <ol>
        <li>Choose a target PDF file</li>
        <li>Input the specific ranges of pages (e.g. 2-5, 8)</li>
        <li>Click Extract Pages to slice the document</li>
        <li>Download the newly formed page-subset PDF instantly</li>
      </ol>
    `
  },
  {
    path: '/reorder-pdf',
    title: 'Reorder PDF Pages Online Free — PDFMinty',
    desc: 'Reorder and rearrange PDF pages for free. Drag and drop pages into any order.',
    name: 'Reorder PDF Pages',
    staticBody: `
      <h1>Reorder PDF Pages Online Free</h1>
      <p>Visually rearrange the flow of your document by drag and drop sorting mechanisms with easy adjustments.</p>
      <h2>How to Reorder PDF Pages</h2>
      <ol>
        <li>Drop your PDF to render visual slide grids</li>
        <li>Drag page panels to reorder sequence flow</li>
        <li>Confirm correct positioning coordinates</li>
        <li>Generate and download your freshly sorted PDF file</li>
      </ol>
    `
  },
  {
    path: '/is-it-safe-to-upload-pdf-to-online-tools',
    title: 'Is It Safe to Upload Your PDF to Online Tools? Honest Answer | PDFMinty',
    desc: 'Are online PDF tools safe? Learn the real data security risks of cloud PDF tools, and the safest way to merge, compress, and edit PDF files online without uploading.',
    name: 'PDF Safety Guide',
    staticBody: `
      <h1>Is It Safe to Upload Your PDF to Online Tools? The Honest 2025 Answer</h1>
      <p>Have you ever hesitated before dragging a document into an online PDF merger or compressor? If you are uploading a sensitive bank statement, passport scan, or business contract, that hesitation is completely normal. In fact, your fear of using third-party sites is highly justified. Most people assume that online tools are just quick utilities that do their job and immediately forget your files. But behind the screen, standard cloud-based utilities work by copying your files to remote servers. This simple action exposes you to serious security, legal, and privacy risks that you should not overlook. In this article, we will explain exactly how these platforms handle your private data. You will discover why sharing files with some websites is risky. More importantly, we will show you a safe way to edit PDF without uploading, allowing you to merge, protect, and compress documents with 100% privacy right from your own browser. Let’s dive into the honest truth about online file security.</p>
      
      <h2>How Most PDF Tools Work</h2>
      <p>When you use popular cloud-based PDF tools like iLovePDF or Smallpdf, here is what happens. First, you drag your document into their web dashboard. At that moment, your file is sent over the internet and uploaded to a remote corporate server. These companies need to store your file on their host computers to run their processing programs. This means your private worksheets, tax returns, and corporate agreements are sitting inside an external database. Most popular platforms do have a document retention policy. For example, many services state that they delete your uploaded files automatically after 1 to 2 hours. While this sounds helpful, it is not a perfect security shield. During that short window, your document remains fully readable and stored on their hard drives. If a server crashes or a network connection glitches, files can sometimes stay stored longer than promised. In addition, you are completely trusting an external company's word that they actually delete the data when they say they do. The files still travel across the web, leaving a digital trail behind.</p>

      <h2>The Real Risks of Cloud Tools</h2>
      <p>Uploading confidential papers to cloud servers comes with real privacy risks. The first threat is a third-party data breach. Even large websites with strong firewalls can get hacked. If cybercriminals break into an online PDF service's databases, your personal bank statements, identity cards, and legal signatures could be stolen and sold on the dark web. So the question "can online pdf tools steal your data" is solved: yes, because any server that stores your file can be custom exploited. Second, there are legal and regulatory issues. If a company receives a government subpoena, they may be legally forced to share your uploaded files with law enforcement. Additionally, remote server employees might have access to view administrative folder backups during system maintenance. This can lead to unauthorized staff viewing your private contracts. Finally, uploading files often violates data compliance frameworks like GDPR for European individuals or HIPAA for medical documents. Sharing a patient's health records or a customer's personal data with third-party servers without strict data processing agreements can lead to massive fines. If you are handling business records, uploading them to public websites is a major pdf tools privacy risk that can harm your company.</p>

      <h2>What "Browser-Only" Processing Means</h2>
      <p>Thankfully, modern technology has created a much safer alternative: browser-only processing. Instead of sending your documents to a remote cloud server, browser-only tools run all of their code directly inside your web explorer. This setup is made possible by standard technologies called Web Workers and WebAssembly. They act like an isolated sandbox on your personal device. When you drop your file into a browser-only tool, the website uses your computer's native CPU to perform the work. If you want to join documents together, your browser stitches the pages directly inside your temporary memory. If you compress a file, the optimization code runs locally. Your files never leave your device and never travel across the web. This means there is zero network payload of your private data. Because nothing is ever uploaded, there are no databases for hackers to breach, no remote files for governments to subpoena, and no staff members who can peek at your work. It is the digital equivalent of working on an air-gapped office computer, keeping your private papers 100% safe. This is why when asking "are online pdf tools safe", only browser-only designs receive a clean, unqualified yes.</p>

      <h2>When to Use Which Tool: An Honest Guide</h2>
      <p>So, how should you choose your PDF utilities? It comes down to a simple, honest rule. If you are processing a public flyer, a school homework sheet, or general reading material, standard cloud-based upload tools are generally fine. These public files do not contain personal details, so a server database copy is not a big threat to your safety. However, if you are handling bank ledgers, payroll sheets, passport copies, employment contracts, or tax returns, you should always use a browser-only tool. There is absolutely no reason to risk your identity or company secrets when you can format everything locally. Using private, on-device document utilities ensures that your highly sensitive papers stay exactly where they belong: under your full personal control.</p>

      <h2>Conclusion & Next Steps</h2>
      <p>Your digital privacy is too important to leave in the hands of third-party cloud servers. Now you know that the safest way to modify, squeeze, or lock your files is to keep them on your own computer. If you are looking for a completely private, fast, and free solution, try PDFMinty. As a leading browser-based PDF toolkit, you can securely merge PDF online free or password protect PDF in browser without uploading a single byte. Everything runs locally on your device, giving you total peace of minty. Give it a try next time you edit sensitive papers!</p>
    `
  }
];

const distDir = path.join(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error(`Error: Compiled template "${templatePath}" not found. Please build first.`);
  process.exit(1);
}

const baseHTML = fs.readFileSync(templatePath, 'utf-8');

// Robust helper functions for HTML injection
function setMetaTag(html, nameOrProperty, newContent) {
  const matchRegex = new RegExp(`<meta\\s+[^>]*?(?:name|property)=["']${nameOrProperty}["'][^>]*?>`, 'i');
  if (!matchRegex.test(html)) {
    throw new Error(`Meta tag with identifier "${nameOrProperty}" not found in template.`);
  }
  return html.replace(matchRegex, (match) => {
    const contentRegex = /content=["']([^"']*)["']/i;
    if (!contentRegex.test(match)) {
      throw new Error(`Meta tag with identifier "${nameOrProperty}" is missing the content attribute.`);
    }
    return match.replace(contentRegex, `content="${newContent}"`);
  });
}

function setCanonicalLink(html, newUrl) {
  const matchRegex = /<link\s+[^>]*?rel=["']canonical["'][^>]*?>/i;
  if (!matchRegex.test(html)) {
    const titleRegex = /<title>/i;
    if (titleRegex.test(html)) {
      return html.replace(titleRegex, `\n    <link rel="canonical" href="${newUrl}" />\n    <title>`);
    } else {
      return html.replace('</head>', `    <link rel="canonical" href="${newUrl}" />\n</head>`);
    }
  }
  return html.replace(matchRegex, (match) => {
    const hrefRegex = /href=["']([^"']*)["']/i;
    if (!hrefRegex.test(match)) {
      throw new Error(`Canonical link tag is missing the href attribute.`);
    }
    return match.replace(hrefRegex, `href="${newUrl}"`);
  });
}

function setAlternateLink(html, hreflang, newUrl) {
  const matchRegex = new RegExp(`<link\\s+[^>]*?rel=["']alternate["'][^>]*?hreflang=["']${hreflang}["'][^>]*?>|<link\\s+[^>]*?hreflang=["']${hreflang}["'][^>]*?rel=["']alternate["'][^>]*?>`, 'i');
  if (!matchRegex.test(html)) {
    throw new Error(`Alternate link tag for hreflang="${hreflang}" not found in template.`);
  }
  return html.replace(matchRegex, (match) => {
    const hrefRegex = /href=["']([^"']*)["']/i;
    if (!hrefRegex.test(match)) {
      throw new Error(`Alternate link tag for hreflang="${hreflang}" is missing the href attribute.`);
    }
    return match.replace(hrefRegex, `href="${newUrl}"`);
  });
}

function setTitle(html, newTitle) {
  const matchRegex = /<title>.*?<\/title>/i;
  if (!matchRegex.test(html)) {
    throw new Error(`Title tag not found in template.`);
  }
  return html.replace(matchRegex, `<title>${newTitle}</title>`);
}

function generateRouteJsonLd(route, absoluteUrl) {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": route.title.split(' | ')[0] || "PDFMinty",
    "url": absoluteUrl,
    "description": route.desc,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "browserRequirements": "Requires JavaScript"
  };

  let blocks = `<script type="application/ld+json">${JSON.stringify(appSchema)}</script>`;

  const howToData = {
    "/merge-pdf": {
      name: "How to Merge PDF Files Online for Free",
      steps: [
        "Upload your PDF files by clicking or dragging them",
        "Arrange files in your preferred order using drag handles",
        "Click 'Merge PDFs' button to combine them",
        "Download your merged PDF instantly"
      ],
      totalTime: "PT30S"
    },
    "/split-pdf": {
      name: "How to Split a PDF File Online",
      steps: [
        "Upload your PDF document",
        "Enter page ranges to extract (e.g. 1-3, 5, 7-10)",
        "Click 'Split PDF' to extract selected pages",
        "Download the split PDF file"
      ],
      totalTime: "PT30S"
    },
    "/compress-pdf": {
      name: "How to Compress a PDF File Online",
      steps: [
        "Upload your PDF file",
        "Select optimization level (Light, Metadata, or Deep Purge)",
        "Click 'Compress PDF' to optimize",
        "Download your optimized PDF"
      ],
      totalTime: "PT20S"
    },
    "/rotate-pdf": {
      name: "How to Rotate PDF Pages Online",
      steps: [
        "Upload your PDF document",
        "Select pages to rotate or choose all pages",
        "Choose rotation angle (90°, 180°, or 270°)",
        "Download the rotated PDF"
      ],
      totalTime: "PT20S"
    },
    "/organize": {
      name: "How to Delete Pages from a PDF",
      steps: [
        "Upload your PDF file",
        "Select the pages you want to delete",
        "Click 'Delete Pages' to remove them",
        "Download your updated PDF"
      ],
      totalTime: "PT20S"
    },
    "/watermark-pdf": {
      name: "How to Add a Watermark to a PDF",
      steps: [
        "Upload your PDF document",
        "Enter your watermark text",
        "Adjust opacity, size, and rotation",
        "Click 'Apply Watermark' and download"
      ],
      totalTime: "PT30S"
    },
    "/add-page-numbers": {
      name: "How to Add Page Numbers to a PDF",
      steps: [
        "Upload your PDF file",
        "Choose position (header or footer) and alignment",
        "Select numbering format and starting number",
        "Click 'Add Page Numbers' and download"
      ],
      totalTime: "PT20S"
    },
    "/add-blank-page": {
      name: "How to Insert a Blank Page into a PDF",
      steps: [
        "Upload your PDF document",
        "Choose where to insert (start, end, or after a specific page)",
        "Select page size (A4, Letter, etc.)",
        "Click 'Add Blank Page' and download"
      ],
      totalTime: "PT15S"
    },
    "/protect-pdf": {
      name: "How to Password Protect a PDF",
      steps: [
        "Upload your PDF file",
        "Enter a strong password",
        "Set optional permissions (printing, copying)",
        "Click 'Protect PDF' and download the encrypted file"
      ],
      totalTime: "PT20S"
    },
    "/unlock-pdf": {
      name: "How to Remove Password from a PDF",
      steps: [
        "Upload your password-protected PDF",
        "Enter the document password",
        "Click 'Unlock PDF' to decrypt",
        "Download the unlocked PDF file"
      ],
      totalTime: "PT15S"
    },
    "/image-to-pdf": {
      name: "How to Convert Images to PDF",
      steps: [
        "Upload your JPG, PNG, or WebP images",
        "Arrange images in the desired order",
        "Click 'Convert to PDF'",
        "Download your new PDF file"
      ],
      totalTime: "PT30S"
    },
    "/pdf-to-image": {
      name: "How to Convert PDF to Images",
      steps: [
        "Upload your PDF document",
        "Select output format (JPG or PNG)",
        "Click 'Convert to Images'",
        "Download images as a ZIP file"
      ],
      totalTime: "PT20S"
    },
    "/intelligence": {
      name: "How to Analyze a PDF with AI",
      steps: [
        "Upload your PDF document",
        "Wait for AI to extract text content",
        "Type your question or request a summary",
        "Read the AI-generated analysis"
      ],
      totalTime: "PT60S"
    }
  };

  const currentHowTo = howToData[route.path];
  if (currentHowTo) {
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": currentHowTo.name,
      "totalTime": currentHowTo.totalTime,
      "step": currentHowTo.steps.map((step, index) => ({
        "@type": "HowToStep",
        "url": `${absoluteUrl}#step${index + 1}`,
        "name": step,
        "itemListElement": [
          {
            "@type": "HowToDirection",
            "text": step
          }
        ]
      }))
    };
    blocks += `\n  <script type="application/ld+json">${JSON.stringify(howToSchema)}</script>`;
  }

  return blocks;
}

try {
  console.log('Generating static prerendered files for perfect SEO coverage...');

  for (const route of routes) {
    // Determine correct folder structure inside dist/
    const outputSubDir = path.join(distDir, route.path.replace(/^\//, ''));
    fs.mkdirSync(outputSubDir, { recursive: true });

    const absoluteUrl = `https://pdfminty.com${route.path}`;

    let html = baseHTML;

    // 1. replace <title>
    html = setTitle(html, route.title);

    // 2. replace <meta name="description" ... />
    html = setMetaTag(html, "description", route.desc);

    // 3. Open Graph titles & descriptions
    html = setMetaTag(html, "og:title", route.title);
    html = setMetaTag(html, "og:description", route.desc);
    html = setMetaTag(html, "og:url", absoluteUrl);

    // 4. Twitter tags
    html = setMetaTag(html, "twitter:title", route.title);
    html = setMetaTag(html, "twitter:description", route.desc);
    html = setMetaTag(html, "twitter:image", "https://pdfminty.com/og-image.png");

    // 5. Canonical link and alternates
    html = setCanonicalLink(html, absoluteUrl);
    html = setAlternateLink(html, "en", absoluteUrl);
    html = setAlternateLink(html, "x-default", absoluteUrl);

    // 6. Strip default Homepage-bound JSON-LD Structured Data block from template to avoid duplicating homepage metadata & homepage FAQPage on sub-routes
    // Using a highly robust regex to identify the homepage-bound JSON-LD script block containing "@graph", safely surviving Vite minification and comment stripping.
    const schemaRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@graph"[\s\S]*?<\/script>/i;
    html = html.replace(schemaRegex, '');

    // 7. Generate route-specific JSON-LD Structured Data (SoftwareApplication only, no HowTo or FAQPage)
    const jsonLd = generateRouteJsonLd(route, absoluteUrl);
    
    if (!html.includes('</head>')) {
      throw new Error('Closure tag </head> not found in template for structured data injection.');
    }
    html = html.replace('</head>', `${jsonLd}\n</head>`);

    // 8. Inject static HTML content inside <div id="root"></div>
    if (route.staticBody) {
      if (html.includes('<div id="root"></div>')) {
        html = html.replace(
          '<div id="root"></div>',
          `<div id="root"><main style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">${route.staticBody}</main></div>`
        );
      } else if (html.includes('<div id="root">')) {
        html = html.replace(
          '<div id="root">',
          `<div id="root"><main style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; line-height: 1.6;">${route.staticBody}</main>`
        );
      }
    }

    const outputPath = path.join(outputSubDir, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅ Prerendered: ${route.path}/index.html`);
  }

  // Ensure the root homepage also includes a clean index canonical link and alternates
  let homeHtml = baseHTML;
  homeHtml = setCanonicalLink(homeHtml, "https://pdfminty.com/");
  homeHtml = setAlternateLink(homeHtml, "en", "https://pdfminty.com/");
  homeHtml = homeHtml.replace(
    '</head>',
    `</head>`
  );
  homeHtml = setAlternateLink(homeHtml, "x-default", "https://pdfminty.com/");

  fs.writeFileSync(templatePath, homeHtml, 'utf-8');
  console.log('✅ Updated Root Homepage: index.html with correct canonical attributes');
  console.log('🎉 Prerendering complete! 16 unique pages generated inside dist/.');

} catch (error) {
  console.error('❌ Static pre-rendering build failed unexpectedly:', error.message || error);
  process.exit(1);
}
