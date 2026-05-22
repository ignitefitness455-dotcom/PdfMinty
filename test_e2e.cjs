const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const { PDFDocument } = require('pdf-lib');
  const dummyDoc = await PDFDocument.create();
  dummyDoc.addPage([500, 500]);
  const dummyBytes = await dummyDoc.save();
  fs.writeFileSync('dummy.pdf', dummyBytes);

  await page.goto('http://localhost:3000');
  await page.click('text=Rotate PDF');
  await page.setInputFiles('#file-input', 'dummy.pdf');
  
  await page.selectOption('#rotate-direction', 'custom');
  await page.fill('#custom-degree', '45');
  
  await page.waitForSelector('#btn-apply');
  const downloadPromise = page.waitForEvent('download');
  await page.click('#btn-apply');
  
  const download = await downloadPromise;
  await download.saveAs('downloaded-45.pdf');
  
  const downloadedBytes = fs.readFileSync('downloaded-45.pdf');
  const loadedDoc = await PDFDocument.load(downloadedBytes);
  const rot = loadedDoc.getPages()[0].getRotation().angle;
  console.log("Downloaded PDF rotation:", rot);
  console.log("Page width:", loadedDoc.getPages()[0].getWidth());
  
  await browser.close();
})();
