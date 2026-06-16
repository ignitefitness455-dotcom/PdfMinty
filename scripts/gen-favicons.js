import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const SOURCE_PATH = "./src/assets/logo.png";
const PUBLIC_DIR = "./public";

// Stylized SVG representing the PdfMinty aesthetic (Emerald/Mint green document badge)
const FALLBACK_SVG = `
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

async function main() {
  console.log("⚙️ Initialising favicon generation engine...");

  // Ensure public folder exists
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  let sourceBuffer;
  try {
    sourceBuffer = await fs.readFile(SOURCE_PATH);
    console.log(`Source found at ${SOURCE_PATH}, generating favicons from logo.`);
  } catch {
    console.warn(`Source logo not found at ${SOURCE_PATH}. Generating beautiful default SVG brand emblem...`);
    sourceBuffer = Buffer.from(FALLBACK_SVG);
  }

  // Define sizes
  const favicons = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "android-chrome-192x192.png", size: 192 },
    { name: "android-chrome-512x512.png", size: 512 },
  ];

  for (const fav of favicons) {
    const outputPath = path.join(PUBLIC_DIR, fav.name);
    await sharp(sourceBuffer)
      .resize(fav.size, fav.size)
      .png()
      .toFile(outputPath);
    console.log(`Created: ${outputPath} (${fav.size}x${fav.size})`);
  }

  // Create favicon.ico (multi-resolution fallback - 32x32)
  const icoPath = path.join(PUBLIC_DIR, "favicon.ico");
  await sharp(sourceBuffer)
    .resize(32, 32)
    .toFormat("png")
    .toFile(icoPath);
  console.log(`Created legacy favicon.ico fallback: ${icoPath}`);

  console.log("✅ Favicon suite compilation completed successfully.");
}

main().catch(err => {
  console.error("Fatality in favicon generator:", err);
});
