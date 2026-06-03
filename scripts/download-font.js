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

// Ensure public/fonts exists
fs.mkdirSync(path.dirname(destPath), { recursive: true });

async function download(urlIndex) {
  if (urlIndex >= urls.length) {
    console.error('All download attempts failed.');
    process.exit(1);
  }

  const fontUrl = urls[urlIndex];
  console.log(`Attempting download from: ${fontUrl}`);
  const file = fs.createWriteStream(destPath);

  try {
    https.get(fontUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location || '', (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            file.close();
            fs.unlinkSync(destPath);
            console.warn(`Redirect failed with status ${redirectResponse.statusCode}`);
            download(urlIndex + 1);
            return;
          }
          redirectResponse.pipe(file);
        });
      } else if (response.statusCode === 200) {
        response.pipe(file);
      } else {
        file.close();
        fs.unlinkSync(destPath);
        console.warn(`Original request failed with status ${response.statusCode}`);
        download(urlIndex + 1);
        return;
      }

      file.on('finish', () => {
        file.close();
        console.log('Font downloaded successfully to ' + destPath);
        process.exit(0);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      console.warn(`Connection error: ${err.message}`);
      download(urlIndex + 1);
    });
  } catch (err) {
    file.close();
    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }
    console.warn(`Catch error: ${err.message}`);
    download(urlIndex + 1);
  }
}

download(0);
