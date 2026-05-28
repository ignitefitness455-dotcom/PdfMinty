const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const toolCardMatch = /<div\s+key=\{tool\.id\}\s+id=\{`tool-card-\$\{tool\.id\}`\}[^>]*>/;
content = content.replace(toolCardMatch, function(match) {
    if(match.includes('<button')) return match; 
    return match.replace('<div', '<button type="button"').replace('className="', 'className="text-left w-full focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none ');
});

content = content.replace(/<p className="text-slate-500 text-xs leading-relaxed">\{tool\.description\}<\/p>\s*<\/div>/, '<p className="text-slate-500 text-xs leading-relaxed">{tool.description}</p>\n                  </button>');


let dropzoneMatch = /<div\s+id="dropzone-area"[\s\S]*?onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}[\s\S]*?>/;
if(content.match(dropzoneMatch)){
	content = content.replace(dropzoneMatch, function(match) {
        return match.replace('<div', '<button type="button" aria-label="Upload files"').replace('className="', 'className="w-full focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 outline-none ');
	});
	content = content.replace(/<p className="text-\[10px\] text-slate-400 mt-1 font-semibold">Or use the tap upload below<\/p>[\s\n]*<\/div>/, '<p className="text-[10px] text-slate-400 mt-1 font-semibold">Or use the tap upload below</p>\n                  </button>');
}

fs.writeFileSync('src/App.tsx', content);
console.log("div onClicks patched to buttons");
