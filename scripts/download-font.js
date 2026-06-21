import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urls = [
  'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf',
  'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/unhinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf',
  'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansbengali/NotoSansBengali%5Bwght%5D.ttf',
];
const destPath = path.join(__dirname, '../public/fonts/NotoSans-subset.ttf');
fs.mkdirSync(path.dirname(destPath), { recursive: true });

async function download(urlIndex) {
  if (urlIndex >= urls.length) { console.error('All download attempts failed.'); process.exit(1); }
  const fontUrl = urls[urlIndex];
  const file = fs.createWriteStream(destPath);
  https.get(fontUrl, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      https.get(response.headers.location || '', (r2) => {
        if (r2.statusCode !== 200) { file.close(); fs.unlinkSync(destPath); download(urlIndex + 1); return; }
        r2.pipe(file);
      });
    } else if (response.statusCode === 200) {
      response.pipe(file);
    } else {
      file.close(); fs.unlinkSync(destPath); download(urlIndex + 1); return;
    }
    file.on('finish', () => { file.close(); console.log('Font downloaded to ' + destPath); process.exit(0); });
  }).on('error', () => { file.close(); if (fs.existsSync(destPath)) fs.unlinkSync(destPath); download(urlIndex + 1); });
}
download(0);
