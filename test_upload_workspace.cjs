const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  
  await page.click('text=Rotate PDF');
  
  const { PDFDocument } = require('pdf-lib');
  const doc = await PDFDocument.create();
  doc.addPage([500, 500]);
  const bytes = await doc.save();
  fs.writeFileSync('dummy.pdf', bytes);
  
  await page.waitForSelector('input[type="file"]', { state: 'attached' });
  await page.setInputFiles('input[type="file"]', 'dummy.pdf');
  
  await page.waitForTimeout(1000);
  
  const visible = await page.isVisible('#workspace:not(.hidden)');
  if (visible) {
    console.log("Workspace is successfully visible! Upload worked.");
  } else {
    console.log("Upload failed, workspace not visible.");
  }
  
  await browser.close();
})();
