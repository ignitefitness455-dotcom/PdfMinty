import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

const iconSource = fs.existsSync(path.join(publicDir, 'logo.svg'))
  ? path.join(publicDir, 'logo.svg')
  : fs.existsSync(path.join(publicDir, 'logo.png'))
    ? path.join(publicDir, 'logo.png')
    : null;

async function generateFavicons() {
  if (!iconSource) {
    console.warn('No logo.svg or logo.png found in public directory. Skipping favicon generation.');
    return;
  }

  console.log(`Generating favicons from ${iconSource}...`);
  try {
    // 192x192
    await sharp(iconSource)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'logo-192.png'));

    // 512x512
    await sharp(iconSource)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'logo-512.png'));

    // Apple touch icon (180x180 with white background)
    await sharp(iconSource)
      .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    // favicon.ico (32x32)
    // Note: sharp doesn't output .ico natively easily without an older format, so we just output a 32x32 png
    // and rename to .ico, browsers support this or use link rel="icon" type="image/png"
    await sharp(iconSource)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));

    console.log('Favicon generation complete.');
  } catch (error) {
    console.error('Failed to generate favicons:', error);
  }
}

generateFavicons();
