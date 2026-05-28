const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow=\{processingProgress\} aria-valuemin=\{0\} aria-valuemax=\{100\}>[\s\n]*<div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `\$\{processingProgress\}%` }}><\/div>[\s\n]*<\/div>/g, 
  '<progress value={processingProgress} max="100" className="w-full h-2 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500 transition-all"></progress>');

content = content.replace(/<div className="w-full bg-slate-100 h-1\.5 rounded-full overflow-hidden">[\s\n]*<div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `\$\{processingProgress\}%` }}><\/div>[\s\n]*<\/div>/g, 
  '<progress value={processingProgress} max="100" className="w-full h-1.5 rounded-full overflow-hidden appearance-none [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-indigo-500 [&::-moz-progress-bar]:bg-indigo-500 transition-all"></progress>');


fs.writeFileSync('src/App.tsx', content);
console.log("Replaced inline styles with progress bars");
