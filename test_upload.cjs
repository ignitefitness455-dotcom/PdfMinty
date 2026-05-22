const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000');
  
  await page.click('text=Compress PDF');
  
  // Need to use dummy.pdf
  const fs = require('fs');
  const { PDFDocument } = require('pdf-lib');
  const doc = await PDFDocument.create();
  doc.addPage([500, 500]);
  const bytes = await doc.save();
  fs.writeFileSync('dummy.pdf', bytes);
  
  await page.waitForSelector('input[type="file"]', { state: 'attached' });
  await page.setInputFiles('input[type="file"]', 'dummy.pdf');
  
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
