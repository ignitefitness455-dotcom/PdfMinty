const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace the useState for activeTool
const newUseState = `  const [activeTool, setActiveTool] = useState<ToolType | null>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Validate hash is a tool
      const validTools = ['merge', 'split', 'rotate', 'organize', 'watermark', 'page-numbers', 'blank-pages', 'encrypt', 'decrypt', 'img-to-pdf', 'pdf-to-img', 'compress', 'intelligence'];
      if (validTools.includes(hash)) return hash as ToolType;
    }
    return null;
  });`;

content = content.replace(/const \[activeTool, setActiveTool\] = useState<ToolType \| null>\(null\);/, newUseState);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated to use hash based deep link');
