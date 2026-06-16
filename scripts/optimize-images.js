import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const TARGET_DIRECTORIES = ["./public", "./src/assets"];

async function optimizeFolder(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await optimizeFolder(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
          console.log(`Optimizing image: ${fullPath}`);
          const buffer = await fs.readFile(fullPath);
          const originalSize = buffer.length;

          let optimizedBuffer;
          if (ext === ".png") {
            optimizedBuffer = await sharp(buffer)
              .png({ quality: 80, compressionLevel: 9, effort: 7 })
              .toBuffer();
          } else {
            optimizedBuffer = await sharp(buffer)
              .jpeg({ quality: 80, progressive: true, mozjpeg: true })
              .toBuffer();
          }

          if (optimizedBuffer.length < originalSize) {
            await fs.writeFile(fullPath, optimizedBuffer);
            const savings = (((originalSize - optimizedBuffer.length) / originalSize) * 100).toFixed(1);
            console.log(`Optimized Successfully: ${fullPath} (Saved ${savings}%)`);
          } else {
            console.log(`Image already fully compressed: ${fullPath}`);
          }
        }
      }
    }
  } catch (err) {
    // If directory of target assets does not exist, return gracefully
    if (err.code !== "ENOENT") {
      console.error(`Optimisation error on directory ${dirPath}:`, err);
    }
  }
}

async function main() {
  console.log("🎨 Starting professional physical image asset optimization...");
  for (const dir of TARGET_DIRECTORIES) {
    await optimizeFolder(dir);
  }
  console.log("✅ Image asset optimization scan completed successfully.");
}

main().catch(err => {
  console.error("Fatality in image optimization suite:", err);
});
