import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const logoPath = path.join(__dirname, 'public', 'logo.png');

const targets = [
  path.join(__dirname, 'public', 'favicon.ico'),
  path.join(__dirname, 'public', 'favicon-16x16.png'),
  path.join(__dirname, 'public', 'favicon-32x32.png'),
  path.join(__dirname, 'public', 'apple-touch-icon.png'),
];

try {
  if (fs.existsSync(logoPath)) {
    targets.forEach(target => {
      fs.copyFileSync(logoPath, target);
      console.log(`Successfully copied logo.png to ${path.basename(target)}`);
    });
  } else {
    console.error('Error: logo.png not found at', logoPath);
  }
} catch (err) {
  console.error('Failed to copy favicons:', err);
}
