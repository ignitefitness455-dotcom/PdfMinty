import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = resolve(__dirname, '../public');

// Tool definitions matching src/config/seo-data.ts
const tools = [
  { slug: 'merge-pdf', name: 'Merge PDF', color: '#10b981', icon: '🔗' },
  { slug: 'split-pdf', name: 'Split PDF', color: '#f59e0b', icon: '✂️' },
  { slug: 'compress-pdf', name: 'Compress PDF', color: '#6366f1', icon: '📦' },
  { slug: 'rotate-pdf', name: 'Rotate PDF', color: '#06b6d4', icon: '🔄' },
  { slug: 'delete-pages-pdf', name: 'Delete Pages', color: '#ef4444', icon: '🗑️' },
  { slug: 'extract-pages-pdf', name: 'Extract Pages', color: '#8b5cf6', icon: '📄' },
  { slug: 'reorder-pdf', name: 'Reorder PDF', color: '#ec4899', icon: '🔀' },
  { slug: 'watermark-pdf', name: 'Watermark PDF', color: '#a855f7', icon: '💧' },
  { slug: 'add-page-numbers', name: 'Page Numbers', color: '#14b8a6', icon: '🔢' },
  { slug: 'add-blank-page', name: 'Add Blank Page', color: '#0ea5e9', icon: '➕' },
  { slug: 'protect-pdf', name: 'Protect PDF', color: '#1e40af', icon: '🔒' },
  { slug: 'unlock-pdf', name: 'Unlock PDF', color: '#0d9488', icon: '🔓' },
  { slug: 'image-to-pdf', name: 'Image to PDF', color: '#d946ef', icon: '🖼️' },
  { slug: 'pdf-to-image', name: 'PDF to Image', color: '#7c3aed', icon: '🖼️' },
  { slug: 'intelligence', name: 'AI Analyze', color: '#f59e0b', icon: '✨' },
];

async function generateOGImage(tool) {
  const bgColor = tool.color;
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Brand logo area -->
      <text x="80" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" fill="white" opacity="0.9">PDFMinty</text>
      <text x="80" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="white" opacity="0.6">Privacy-First PDF Toolkit</text>
      
      <!-- Tool icon -->
      <text x="600" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="120" text-anchor="middle">${tool.icon}</text>
      
      <!-- Tool name -->
      <text x="600" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">${tool.name}</text>
      
      <!-- Tagline -->
      <text x="600" y="470" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="white" opacity="0.8" text-anchor="middle">100% Free • No Upload • Browser-Based</text>
      
      <!-- Bottom URL -->
      <text x="600" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="white" opacity="0.6" text-anchor="middle">pdfminty.com/${tool.slug}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(resolve(publicDir, `og-${tool.slug}.png`));
}

async function generateAll() {
  // Also generate default og-image.png (homepage)
  await generateOGImage({ slug: '', name: 'PDFMinty', color: '#059669', icon: '🚀' });
  // Rename default to og-image.png
  fs.renameSync(
    resolve(publicDir, 'og-.png'),
    resolve(publicDir, 'og-image.png')
  );

  for (const tool of tools) {
    await generateOGImage(tool);
    console.log(`✓ Generated og-${tool.slug}.png`);
  }
  console.log(`✓ Generated ${tools.length + 1} OG images total`);
}

generateAll().catch((err) => {
  console.error('OG image generation failed:', err);
  process.exit(1);
});
