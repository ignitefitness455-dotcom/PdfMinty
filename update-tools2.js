const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'public', 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');
    let modified = false;

    // Fix the validation logic
    if (content.match(/if \(file\.type !== 'application\/pdf'\) \{[\s\S]*?return;/)) {
        content = content.replace(/if \(file\.type !== 'application\/pdf'\) \{[\s\S]*?return;[\s\n]*\}/, '');
        modified = true;
    }
    if (content.match(/const validFiles = Array\.from\(files\)\.filter\(f => f\.type === 'application\/pdf'\);[\s\S]*?return;[\s\n]*\}/)) {
        content = content.replace(/const validFiles = Array\.from\(files\)\.filter\(f => f\.type === 'application\/pdf'\);\s*if \(validFiles\.length === 0\) \{[\s\S]*?return;\s*\}/, 'const validFiles = Array.from(files);');
        modified = true;
    }
    
    // Add try-catch if it doesn't have it around the btn apply logic.
    // Wait, most files have try-catch already, but let's just make sure "btnApply.textContent = 'Processing...';" is present!
    // And error catch block shows a friendly message.
    
    // Let's replace btnApply.textContent assignments when it gets disabled:
    content = content.replace(/btnApply\.textContent\s*=\s*(.*?);/g, (match, val) => {
        if(val.includes('Mer') || val.includes('Com') || val.includes('Ext') || val.includes('Spl') || val.includes('Rot') || val.includes('Ras') || val.includes('Deep') || val.includes('Opt')) {
            // Probably setting to "Processing" or related
            return `btnApply.textContent = "Processing...";`;
        }
        return match; // return original if restoring
    });

    // Make sure try/catch exists and friendly message is shown
    // We already have `if (typeof showError === 'function') showError(...)` in Catch blocks.
    
    fs.writeFileSync(path.join(toolsDir, file), content, 'utf-8');
});
console.log("Done checking replacements.");
