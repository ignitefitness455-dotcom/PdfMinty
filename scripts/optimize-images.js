import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const srcDir = path.join(projectRoot, 'src');

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection matched during image optimization:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception matched during image optimization:', err);
  process.exit(1);
});

function discoverImages(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      discoverImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        // Exclude system icons and favicons from general webp optimization to avoid clutter
        const baseName = path.basename(file, ext);
        const isSystemFavicon = /favicon|android-chrome|mstile|apple-touch-icon/i.test(baseName);
        if (!isSystemFavicon) {
          fileList.push({
            input: filePath,
            output: path.join(path.dirname(filePath), `${baseName}.webp`),
            // Define responsive target widths based on file type
            width: baseName.includes('logo') ? 512 : 1200
          });
        }
      }
    }
  }
  return fileList;
}

async function optimize() {
  let hasFailed = false;
  console.log('🔍 Scanning for source images to optimize in /public and /src...');
  const images = [...discoverImages(publicDir), ...discoverImages(srcDir)];
  console.log(`📸 Found ${images.length} images for optimization.`);

  for (const { input, output, width } of images) {
    try {
      if (fs.existsSync(input)) {
        // Avoid rebuilding if source is unmodified or remove existing output for clean overwrite
        if (fs.existsSync(output)) {
          fs.unlinkSync(output);
        }
        await sharp(input)
          .resize(width, undefined, { withoutEnlargement: true })
          .webp({ quality: 85, effort: 6 })
          .toFile(output);
        console.log(`✅ Optimized & converted to: ${path.relative(projectRoot, output)}`);
      } else {
        console.error(`❌ Input file not found: ${input}`);
        hasFailed = true;
      }
    } catch (err) {
      console.error(`❌ Error optimizing ${path.basename(input)}:`, err);
      hasFailed = true;
    }
  }
  if (hasFailed) {
    console.error('❌ Image optimization step failed!');
    process.exit(1);
  } else {
    console.log('🎉 All discovered images optimized successfully.');
  }
}

optimize();
