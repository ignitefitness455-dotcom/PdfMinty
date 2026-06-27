import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = resolve(__dirname, '../public');

const tools = [
  { slug: 'merge-pdf', name: 'Merge PDF', tagline: 'Combine multiple PDFs into one', color: '#10b981', icon: 'M' },
  { slug: 'split-pdf', name: 'Split PDF', tagline: 'Extract pages or split into files', color: '#f59e0b', icon: 'S' },
  { slug: 'compress-pdf', name: 'Compress PDF', tagline: 'Reduce file size without quality loss', color: '#6366f1', icon: 'C' },
  { slug: 'rotate-pdf', name: 'Rotate PDF', tagline: 'Rotate pages 90, 180, or 270 degrees', color: '#06b6d4', icon: 'R' },
  { slug: 'delete-pages-pdf', name: 'Delete PDF Pages', tagline: 'Remove unwanted pages from PDF', color: '#ef4444', icon: 'D' },
  { slug: 'extract-pages-pdf', name: 'Extract PDF Pages', tagline: 'Save specific pages as new PDF', color: '#8b5cf6', icon: 'E' },
  { slug: 'reorder-pdf', name: 'Reorder PDF Pages', tagline: 'Rearrange page order in PDF', color: '#ec4899', icon: 'O' },
  { slug: 'watermark-pdf', name: 'Watermark PDF', tagline: 'Add text watermarks with custom opacity', color: '#a855f7', icon: 'W' },
  { slug: 'add-page-numbers', name: 'Add Page Numbers', tagline: 'Number your PDF pages automatically', color: '#14b8a6', icon: '#' },
  { slug: 'add-blank-page', name: 'Add Blank Page', tagline: 'Insert blank pages into PDF', color: '#0ea5e9', icon: '+' },
  { slug: 'protect-pdf', name: 'Protect PDF', tagline: 'Password-encrypt your PDF documents', color: '#1e40af', icon: 'P' },
  { slug: 'unlock-pdf', name: 'Unlock PDF', tagline: 'Remove password protection from PDF', color: '#0d9488', icon: 'U' },
  { slug: 'image-to-pdf', name: 'Image to PDF', tagline: 'Convert JPG, PNG, WebP to PDF', color: '#d946ef', icon: 'I' },
  { slug: 'pdf-to-image', name: 'PDF to Image', tagline: 'Convert PDF pages to PNG or JPEG', color: '#7c3aed', icon: 'F' },
  { slug: 'intelligence', name: 'AI PDF Analyzer', tagline: 'Chat with your PDF using AI', color: '#f59e0b', icon: 'A' },
];

function buildSvg(tool, isDefault = false) {
  const bgColor = tool.color;
  const displayName = isDefault ? 'PDFMinty' : tool.name;
  const tagline = isDefault ? 'Privacy-First PDF Toolkit' : tool.tagline;
  const url = isDefault ? 'pdfminty.com' : `pdfminty.com/${tool.slug}`;
  const iconSize = isDefault ? 100 : 90;
  const iconY = isDefault ? 260 : 270;
  const nameY = isDefault ? 390 : 400;
  const taglineY = isDefault ? 445 : 455;

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>

  <text x="80" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold" fill="white" opacity="0.9">PDFMinty</text>
  <text x="80" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="white" opacity="0.6">Privacy-First PDF Toolkit</text>

  <circle cx="600" cy="${iconY - 30}" r="${iconSize / 2 + 15}" fill="white" opacity="0.15"/>
  <text x="600" y="${iconY}" font-family="system-ui, -apple-system, sans-serif" font-size="${iconSize}" font-weight="bold" fill="white" text-anchor="middle">${tool.icon}</text>

  <text x="600" y="${nameY}" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">${displayName}</text>

  <text x="600" y="${taglineY}" font-family="system-ui, -apple-system, sans-serif" font-size="26" fill="white" opacity="0.85" text-anchor="middle">${tagline}</text>

  <text x="600" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="white" opacity="0.55" text-anchor="middle">${url}</text>

  <text x="80" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="white" opacity="0.5">100% Free • No Upload • Browser-Based</text>
</svg>`;
}

async function generateOGImage(tool, filename) {
  await sharp(Buffer.from(buildSvg(tool, filename === 'og-image.png')))
    .png()
    .toFile(resolve(publicDir, filename));
}

async function generateAll() {
  // Default homepage OG image
  await generateOGImage({ slug: '', name: 'PDFMinty', tagline: '15 Free Privacy-First PDF Tools', color: '#059669', icon: 'P' }, 'og-image.png');
  console.log('✓ Generated og-image.png (homepage)');

  for (const tool of tools) {
    await generateOGImage(tool, `og-${tool.slug}.png`);
    console.log(`✓ Generated og-${tool.slug}.png`);
  }

  // Article OG image
  await generateOGImage(
    { slug: 'is-it-safe-to-upload-pdf-to-online-tools', name: 'Is It Safe?', tagline: 'PDF Security Analysis', color: '#dc2626', icon: '?' },
    'og-is-it-safe-to-upload-pdf-to-online-tools.png'
  );
  console.log('✓ Generated og-is-it-safe-to-upload-pdf-to-online-tools.png (article)');

  console.log(`\n✓ Generated ${tools.length + 2} OG images total`);
}

generateAll().catch((err) => {
  console.error('OG image generation failed:', err);
  process.exit(1);
});
