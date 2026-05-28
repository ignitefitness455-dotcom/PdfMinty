const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Change text-xs to text-base for inputs, selects, textareas
content = content.replace(/<input([^>]*)text-xs([^>]*)>/g, '<input$1text-base$2>');
content = content.replace(/<textarea([^>]*)text-xs([^>]*)>/g, '<textarea$1text-base$2>');
content = content.replace(/<select([^>]*)text-xs([^>]*)>/g, '<select$1text-base$2>');

fs.writeFileSync('src/App.tsx', content);
console.log("Updated font size in form inputs");
