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
files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.html')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('"ok"') || content.includes("'ok'") || content.includes('`ok`')) {
      console.log(`Found '"ok"' in: ${file}`);
    }
    if (content.includes('"OK"') || content.includes("'OK'") || content.includes('`OK`')) {
      console.log(`Found '"OK"' in: ${file}`);
    }
  }
});
