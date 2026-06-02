import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const projectRoot = process.cwd();
const SOURCE_LOGO = path.join(projectRoot, 'public', 'logo.png');
const OUTPUT_DIR = path.join(projectRoot, 'public');

async function generateFavicons() {
  try {
    const logoBuffer = await fs.readFile(SOURCE_LOGO);

    const faviconSizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 48, name: 'favicon.ico' }, // Actually PNG, modern browsers accept it perfectly
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' },
    ];

    for (const { size, name } of faviconSizes) {
      await sharp(logoBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, palette: size <= 48 })
        .toFile(path.join(OUTPUT_DIR, name));
      console.log(`✅ ${name} (${size}x${size})`);
    }

    // Generate manifest.json
    const manifest = {
      name: 'PDFMinty',
      short_name: 'PDFMinty',
      description: 'Free privacy-first PDF tools',
      start_url: '/',
      display: 'standalone',
      background_color: '#f8fafc',
      theme_color: '#3b82f6',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    };

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ manifest.json');

    // Generate browserconfig.xml (Windows tiles)
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#3b82f6</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

    await fs.writeFile(path.join(OUTPUT_DIR, 'browserconfig.xml'), browserconfig);
    console.log('✅ browserconfig.xml');
  } catch (err) {
    console.error('❌ Favicon/assets generation failed:', err);
  }
}

generateFavicons();
