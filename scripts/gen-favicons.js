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
      { size: 150, name: 'mstile-150x150.png' },
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

    // Generate responsive and crisp favicon.svg for modern browsers
    const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="1" />
      <stop offset="100%" stop-color="#059669" stop-opacity="1" />
    </linearGradient>
  </defs>
  <!-- Main Document Base with rounded corners -->
  <path d="M32 16h48l24 24v64c0 4.418-3.582 8-8 8H32c-4.418 0-8-3.582-8-8V24c0-4.418 3.582-8 8-8z" fill="url(#mintGrad)" />
  <!-- Folded Corner Details -->
  <path d="M80 16v18c0 3.314 2.686 6 6 6h18L80 16z" fill="#a7f3d0" />
  <!-- Clean Accent Lines representing rows of contents -->
  <rect x="42" y="56" width="44" height="8" rx="4" fill="#ffffff" />
  <rect x="42" y="72" width="44" height="8" rx="4" fill="#ffffff" />
  <rect x="42" y="88" width="28" height="8" rx="4" fill="#ffffff" />
</svg>`;

    await fs.writeFile(path.join(OUTPUT_DIR, 'favicon.svg'), svgFavicon, 'utf-8');
    console.log('✅ favicon.svg generated successfully.');
  } catch (err) {
    console.error('❌ Favicon/assets generation failed:', err);
    process.exit(1);
  }
}

generateFavicons();
