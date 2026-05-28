const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// For <input> and <textarea> and <select>, let's just add an id, and for labels add htmlFor.
// But some of them don't have IDs. 

// A safer way: Add aria-label based on preceding label or placeholder.
// We can just add aria-label="Input field" to all inputs that don't have id or aria-label, wait that's bad.
// Let's do it with a simple replacement loop.

let idx = 0;
content = content.replace(/<input([^>]*)>/g, function(match, inner) {
    if(!match.includes('id=') && !match.includes('aria-label') && !match.includes('type="file"')) {
        let labelMatch = /placeholder="([^"]+)"/.exec(inner);
        let label = labelMatch ? labelMatch[1] : "Input field";
        return `<input aria-label="${label}"${inner}>`;
    }
    return match;
});

content = content.replace(/<textarea([^>]*)>/g, function(match, inner) {
    if(!match.includes('id=') && !match.includes('aria-label')) {
        let labelMatch = /placeholder="([^"]+)"/.exec(inner);
        let label = labelMatch ? labelMatch[1] : "Text area";
        return `<textarea aria-label="${label}"${inner}>`;
    }
    return match;
});

content = content.replace(/<select([^>]*)>/g, function(match, inner) {
    if(!match.includes('id=') && !match.includes('aria-label')) {
        return `<select aria-label="Select option"${inner}>`;
    }
    return match;
});

// also for the file input:
content = content.replace(/<input\s+type="file"[^>]*>/g, function(match) {
    if(!match.includes('aria-label')) {
        return match.replace('<input', '<input aria-label="File upload"');
    }
    return match;
});

fs.writeFileSync('src/App.tsx', content);

console.log("Inputs patched");
