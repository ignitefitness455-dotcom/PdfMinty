import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urls = [
  'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
  'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
];
const destPath = path.join(__dirname, '../public/fonts/NotoSans-Regular.ttf');
fs.mkdirSync(path.dirname(destPath), { recursive: true });

async function download() {
  for (const fontUrl of urls) {
    try {
      console.log(`Attempting to download from ${fontUrl}...`);
      const response = await fetch(fontUrl);
      if (!response.ok) {
        console.error(`Failed with status: ${response.status}`);
        continue;
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(destPath, Buffer.from(buffer));
      console.log(`Successfully downloaded to ${destPath}`);
      return;
    } catch (err) {
      console.error(`Error downloading from ${fontUrl}:`, err);
    }
  }
  console.error('All download attempts failed.');
  process.exit(1);
}

download();
