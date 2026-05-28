const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const hookInjectCode = `
  // SEO Meta Tag & Canonical URL Updater
  useEffect(() => {
    let title = 'PDFMinty - Free Secure Client-Side PDF Tools';
    let description = 'Process, merge, split, rotate, watermark, encrypt, compress, and edit PDF files securely in your browser. 100% free and private offline PDF toolkit.';
    let canonical = 'https://pdfminty.com/';

    if (activeTool) {
      const currentToolObj = toolsList.find(t => t.id === activeTool);
      if (currentToolObj) {
        title = \`\${currentToolObj.name} - Free Secure PDF Tool | PDFMinty\`;
        if (title.length > 60) title = title.substring(0, 60);

        description = \`Use PDFMinty's \${currentToolObj.name} tool to securely process your PDF documents in your browser. \${currentToolObj.description}\`;
        if (description.length > 160) description = description.substring(0, 157) + '...';
        
        canonical = \`https://pdfminty.com/#\${activeTool}\`;
      }
    }

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonical);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);
    
    // Update hash so Google bot can see different URLs (using history to not scroll)
    if (activeTool) {
      window.history.replaceState(null, '', \`#\${activeTool}\`);
    } else {
      window.history.replaceState(null, '', \`/\`);
    }

  }, [activeTool]);
`;

// Insert after setAiError
content = content.replace(/const \[aiError, setAiError\] = useState<string \| null>\(null\);/, 
  'const [aiError, setAiError] = useState<string | null>(null);\n' + hookInjectCode);

fs.writeFileSync('src/App.tsx', content);
console.log("Injected SEO meta tag logic");
