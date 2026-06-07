import puppeteer from 'puppeteer';
import { exec } from 'child_process';

(async () => {
  const server = exec('npx vite preview --port 4000 --strictPort');
  await new Promise(r => setTimeout(r, 6000));
  
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PROD BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PROD BROWSER ERROR:\n', err.stack));
  
  await page.goto('http://localhost:4000/');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  server.kill();
})();
