import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const projectRoot = process.cwd();
const logoPath = path.join(projectRoot, 'public', 'logo.png');

const targets = [
  { size: 16, path: path.join(projectRoot, 'public', 'favicon-16x16.png') },
  { size: 32, path: path.join(projectRoot, 'public', 'favicon-32x32.png') },
  { size: 180, path: path.join(projectRoot, 'public', 'apple-touch-icon.png') },
  { size: 32, path: path.join(projectRoot, 'public', 'favicon.ico') },
];

async function generate() {
  if (!fs.existsSync(logoPath)) {
    console.error('logo.png not found at', logoPath);
    return;
  }

  for (const { size, path: outPath } of targets) {
    try {
      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
      }
      await sharp(logoPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, palette: true })
        .toFile(outPath);
      console.log(`✅ ${path.basename(outPath)} (${size}x${size})`);
    } catch (err) {
      console.error(`❌ Error generating ${path.basename(outPath)}:`, err);
    }
  }
}

generate();
