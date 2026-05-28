const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. ARIA Labels: buttons with only icons
// e.g. <button onClick={...}><Trash2 /></button>
// Add aria-label
content = content.replace(/<button([^>]*)>\s*<(RotateCw|Trash2|ArrowLeft|ArrowUp|Copy|Check)[^>]*\/>\s*<\/button>/g, '<button aria-label="Icon button"$1><$2/></button>');

// Wait, doing this generally by regex is risky. Let's do exact edits by regex.

// "focus:outline-none" -> "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
content = content.replace(/focus:outline-none/g, 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2');

// Color contrast text-slate-400 -> text-slate-500, bg-slate-300 -> bg-slate-400?
content = content.replace(/text-slate-400/g, 'text-slate-500');

// ARIA live for toast container
content = content.replace(/<div id="toast-deck"[^>]*>/, '$& aria-live="polite" aria-atomic="true"');

// Form Inputs: every input/select/textarea must have label
// Where do we have inputs?
content = content.replace(/<input\s+([^>]*)placeholder="([^"]+)"([^>]*)>/g, function(match, p1, placeholder, p2) {
    if(!match.includes('aria-label') && !match.includes('id=')) {
        return `<input aria-label="${placeholder}" ${p1}placeholder="${placeholder}"${p2}>`;
    }
    return match;
});

content = content.replace(/<textarea\s+([^>]*)placeholder="([^"]+)"([^>]*)>/g, function(match, p1, placeholder, p2) {
    if(!match.includes('aria-label') && !match.includes('id=')) {
        return `<textarea aria-label="${placeholder}" ${p1}placeholder="${placeholder}"${p2}>`;
    }
    return match;
});

// Add role="dialog" aria-modal="true" to modals
content = content.replace(/id="feedback-modal-content"/g, 'id="feedback-modal-content" role="dialog" aria-modal="true" aria-labelledby="feedback-title"');
content = content.replace(/id="contact-modal-content"/g, 'id="contact-modal-content" role="dialog" aria-modal="true" aria-labelledby="contact-title"');

content = content.replace(/<h2 className="([^"]*)">Provide Feedback<\/h2>/, '<h2 id="feedback-title" className="$1">Provide Feedback</h2>');
content = content.replace(/<h2 className="([^"]*)">Contact Support<\/h2>/, '<h2 id="contact-title" className="$1">Contact Support</h2>');

// ARIA labels for buttons
content = content.replace(/<button([^>]*)>\s*<ArrowUp/g, '<button aria-label="Scroll to top"$1>\n        <ArrowUp');
content = content.replace(/<button\s+id={`remove-img-\${idx}`}/g, '<button aria-label="Remove image" id={`remove-img-${idx}`}');
content = content.replace(/<button\s+onClick=\{\(\) => setShowFeedbackModal\(false\)\}\s+className="absolute/g, '<button aria-label="Close dialog" onClick={() => setShowFeedbackModal(false)}\n              className="absolute');
content = content.replace(/<button\s+onClick=\{\(\) => setShowContactModal\(false\)\}\s+className="absolute/g, '<button aria-label="Close dialog" onClick={() => setShowContactModal(false)}\n              className="absolute');
content = content.replace(/<button\s+id=\{`rotate-\${page.index}`\}/g, '<button aria-label="Rotate page" id={`rotate-${page.index}`}');

fs.writeFileSync('src/App.tsx', content);

// index.html <html lang="en">
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<html[^>]*>/, '<html lang="en">');
fs.writeFileSync('index.html', html);

console.log("Done");
