const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Font Sizes
content = content.replace(/text-\[8px\]/g, 'text-xs');
content = content.replace(/text-\[9px\]/g, 'text-xs');
content = content.replace(/text-\[10px\]/g, 'text-xs');
content = content.replace(/text-\[11px\]/g, 'text-xs');

// Tap Targets
// add min-h-[48px] min-w-[48px] to all <button> and <a> elements that don't have it already.
// we can just add these classes to the className string for any button.
content = content.replace(/<button([^>]*)className="([^"]*)"/g, function(match, p1, p2) {
    if (!p2.includes('min-h-')) {
        return `<button${p1}className="${p2} min-h-[48px] min-w-[48px] p-2"`;
    }
    return match;
});

content = content.replace(/<a([^>]*)className="([^"]*)"/g, function(match, p1, p2) {
    if (!p2.includes('min-h-')) {
        return `<a${p1}className="${p2} min-h-[48px] min-w-[48px] inline-flex items-center justify-center p-2"`;
    }
    return match;
});

// also for inputs and selects and textareas
content = content.replace(/<input([^>]*)className="([^"]*)"/g, function(match, p1, p2) {
    if (!p2.includes('min-h-')) {
        return `<input${p1}className="${p2} min-h-[48px] p-2"`;
    }
    return match;
});

content = content.replace(/<select([^>]*)className="([^"]*)"/g, function(match, p1, p2) {
    if (!p2.includes('min-h-')) {
        return `<select${p1}className="${p2} min-h-[48px] p-2"`;
    }
    return match;
});

content = content.replace(/<textarea([^>]*)className="([^"]*)"/g, function(match, p1, p2) {
    if (!p2.includes('min-h-')) {
        return `<textarea${p1}className="${p2} min-h-[48px] p-2"`;
    }
    return match;
});


fs.writeFileSync('src/App.tsx', content);
console.log("Replaced fonts and added tap targets");
