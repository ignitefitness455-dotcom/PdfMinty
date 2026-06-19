import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = "./public";

// Stylized SVG representing the PDFAid logo (Emerald/Mint green document badge)
const LOGO_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="110" fill="url(#grad)" />
  <g filter="url(#shadow)">
    <rect x="128" y="100" width="256" height="312" rx="24" fill="#FFFFFF" />
    <path d="M220 170H292M220 220H292" stroke="#10B981" stroke-width="24" stroke-linecap="round" />
    <path d="M190 270H322M190 320H270" stroke="#059669" stroke-width="24" stroke-linecap="round" />
  </g>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="shadow" x="100" y="80" width="312" height="368" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#047857" flood-opacity="0.18" />
    </filter>
  </defs>
</svg>
`;

// Stylized 1200x630 SVG for Open Graph image banner
const OG_IMAGE_SVG = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Gradient -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  
  <!-- Subtle Grid Patterns -->
  <g opacity="0.05">
    <path d="M0 100H1200M0 200H1200M0 300H1200M0 400H1200M0 500H1200M0 600H1200" stroke="#FFFFFF" stroke-width="2" />
    <path d="M100 0V630M200 0V630M300 0V630M400 0V630M500 0V630M600 0V630M700 0V630M800 0V630M900 0V630M1000 0V630M1100 0V630" stroke="#FFFFFF" stroke-width="2" />
  </g>

  <!-- Big Logo Icon on Left -->
  <g transform="translate(100, 115)">
    <!-- Main Logo Emblem -->
    <rect width="400" height="400" rx="86" fill="url(#logoGrad)" />
    <g filter="url(#logoShadow)">
      <rect x="100" y="78" width="200" height="244" rx="18" fill="#FFFFFF" />
      <path d="M172 133H228M172 172H228" stroke="#10B981" stroke-width="18" stroke-linecap="round" />
      <path d="M148 211H252M148 250H211" stroke="#059669" stroke-width="18" stroke-linecap="round" />
    </g>
  </g>

  <!-- Text and Branding on Right -->
  <g transform="translate(560, 0)">
    <!-- App Name -->
    <text x="0" y="240" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="900" font-size="94" fill="#FFFFFF" letter-spacing="-0.03em">PDFAid</text>
    
    <!-- Tagline -->
    <text x="0" y="315" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="600" font-size="34" fill="#E2E8F0" letter-spacing="-0.012em">Privacy-First PDF Toolkit</text>
    <text x="0" y="365" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="400" font-size="24" fill="#94A3B8">Combine, split, and edit PDF files offline instantly.</text>

    <!-- Badges / Features -->
    <g transform="translate(0, 430)">
      <!-- Badge 1: 100% Client-Side -->
      <rect x="0" y="0" width="180" height="42" rx="21" fill="#1E293B" stroke="#334155" stroke-width="2" />
      <text x="90" y="26" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#34D399" text-anchor="middle">100% OFFLINE</text>
      
      <!-- Badge 2: Local & Private -->
      <rect x="195" y="0" width="180" height="42" rx="21" fill="#1E293B" stroke="#334155" stroke-width="2" />
      <text x="285" y="26" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#38BDF8" text-anchor="middle">NO FILE UPLOADS</text>

      <!-- Badge 3: Free -->
      <rect x="390" y="0" width="100" height="42" rx="21" fill="#1E293B" stroke="#334155" stroke-width="2" />
      <text x="440" y="26" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#FBBF24" text-anchor="middle">FREE</text>
    </g>
  </g>

  <!-- Gradients & Filters -->
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#0B0F19" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Logo Gradient -->
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    
    <!-- Logo Shadow (Embedded within SVG) -->
    <filter id="logoShadow" x="80" y="60" width="240" height="284" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#047857" flood-opacity="0.25" />
    </filter>
  </defs>
</svg>
`;

async function main() {
  console.log("🚀 Generating high-quality brand assets...");
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  // 1. Generate logo.png
  const logoPath = path.join(PUBLIC_DIR, "logo.png");
  await sharp(Buffer.from(LOGO_SVG))
    .resize(512, 512)
    .png()
    .toFile(logoPath);
  console.log(`✅ Created logo.png at ${logoPath}`);

  // 2. Generate og-image.png
  const ogImagePath = path.join(PUBLIC_DIR, "og-image.png");
  await sharp(Buffer.from(OG_IMAGE_SVG))
    .resize(1200, 630)
    .png()
    .toFile(ogImagePath);
  console.log(`✅ Created og-image.png at ${ogImagePath}`);
}

main().catch(err => {
  console.error("❌ Brand generation failed:", err);
  process.exit(1);
});
