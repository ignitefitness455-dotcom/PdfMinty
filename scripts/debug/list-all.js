import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(walk(filePath));
      }
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('.');
console.log('--- ALL TS/TSX/JS/JSON FILES ---');
files.forEach(f => {
  if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.json')) {
    console.log(f);
  }
});
