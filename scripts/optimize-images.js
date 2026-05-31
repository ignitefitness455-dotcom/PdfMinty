import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

const images = [
  { input: path.join(projectRoot, 'public', 'logo.png'), output: path.join(projectRoot, 'public', 'logo.webp'), width: 512 },
  { input: path.join(projectRoot, 'public', 'og-image.png'), output: path.join(projectRoot, 'public', 'og-image.webp'), width: 1200 },
];

async function optimize() {
  for (const { input, output, width } of images) {
    try {
      if (fs.existsSync(input)) {
        // If file already exists, verify first or overwrite
        if (fs.existsSync(output)) {
          fs.unlinkSync(output);
        }
        await sharp(input)
          .resize(width, undefined, { withoutEnlargement: true })
          .webp({ quality: 85, effort: 6 })
          .toFile(output);
        console.log(`✅ ${path.basename(output)} created successfully.`);
      } else {
        console.error(`⚠️ Input file not found: ${input}`);
      }
    } catch (err) {
      console.error(`❌ Error optimizing ${path.basename(input)}:`, err);
    }
  }
}

optimize();
