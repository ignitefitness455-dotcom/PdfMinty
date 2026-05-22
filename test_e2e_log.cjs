const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
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
  
  await page.click('#btn-apply');
  
  // Wait a bit to catch errors
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
