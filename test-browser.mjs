import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000/compress-pdf');
  await new Promise(r => setTimeout(r, 1000));
  
  const elementHandle = await page.$('input[type=file]');
  await elementHandle.uploadFile(path.resolve('test.pdf'));
  
  await new Promise(r => setTimeout(r, 2000)); // wait for processing
  
  await browser.close();
})();
