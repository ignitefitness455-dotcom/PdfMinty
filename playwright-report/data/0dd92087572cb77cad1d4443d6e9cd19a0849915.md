# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.js >> Applet E2E Tests >> has title
- Location: e2e/app.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1.hero-title')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1.hero-title')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - navigation [ref=e2]:
        - generic [ref=e3]:
            - link "🌿 PDFMinty" [ref=e4] [cursor=pointer]:
                - /url: '#'
                - generic [ref=e5]: 🌿
                - generic [ref=e6]: PDFMinty
            - button "🌙" [ref=e8] [cursor=pointer]
    - generic [ref=e9]: 🔒 Your files never leave your device. All processing happens locally in your browser.
    - main [ref=e10]:
        - generic [ref=e11]:
            - generic [ref=e12]: ✨ 100% Free & Secure
            - heading "The Ultimate PDF Tools Collection" [level=1] [ref=e13]
            - paragraph [ref=e14]:
                - text: Merge, split, compress, and edit PDFs directly in your browser.
                - strong [ref=e15]: No server uploads. No registration.
            - generic [ref=e16]:
                - generic [ref=e17]: 🔒 Local Processing
                - generic [ref=e18]: ⚡ Lightning Fast
                - generic [ref=e19]: 🛡️ Privacy First
        - generic [ref=e20]:
            - generic [ref=e21]:
                - heading "Popular Tools" [level=2] [ref=e22]
                - generic [ref=e23]:
                    - textbox "Search tools (e.g. merge, split)..." [ref=e24]
                    - generic: 🔍
            - generic [ref=e25]:
                - generic [ref=e26] [cursor=pointer]: All Tools
                - generic [ref=e27] [cursor=pointer]: Organize
                - generic [ref=e28] [cursor=pointer]: Optimize
                - generic [ref=e29] [cursor=pointer]: Edit
                - generic [ref=e30] [cursor=pointer]: Convert
                - generic [ref=e31] [cursor=pointer]: Security
            - generic [ref=e32]:
                - link "🔗 Merge PDF organize Combine multiple PDFs into one" [ref=e33] [cursor=pointer]:
                    - /url: '#merge'
                    - generic [ref=e34]: 🔗
                    - generic [ref=e35]:
                        - generic [ref=e36]:
                            - heading "Merge PDF" [level=3] [ref=e37]
                            - generic [ref=e38]: organize
                        - paragraph [ref=e39]: Combine multiple PDFs into one
                - link "✂️ Split PDF organize Extract pages from your PDF" [ref=e40] [cursor=pointer]:
                    - /url: '#split'
                    - generic [ref=e41]: ✂️
                    - generic [ref=e42]:
                        - generic [ref=e43]:
                            - heading "Split PDF" [level=3] [ref=e44]
                            - generic [ref=e45]: organize
                        - paragraph [ref=e46]: Extract pages from your PDF
                - link "🗜️ Compress PDF optimize Reduce file size without losing quality" [ref=e47] [cursor=pointer]:
                    - /url: '#compress'
                    - generic [ref=e48]: 🗜️
                    - generic [ref=e49]:
                        - generic [ref=e50]:
                            - heading "Compress PDF" [level=3] [ref=e51]
                            - generic [ref=e52]: optimize
                        - paragraph [ref=e53]: Reduce file size without losing quality
                - link "↻ Rotate PDF edit Rotate pages to correct orientation" [ref=e54] [cursor=pointer]:
                    - /url: '#rotate'
                    - generic [ref=e55]: ↻
                    - generic [ref=e56]:
                        - generic [ref=e57]:
                            - heading "Rotate PDF" [level=3] [ref=e58]
                            - generic [ref=e59]: edit
                        - paragraph [ref=e60]: Rotate pages to correct orientation
                - link "🔄 Reorder PDF organize Change the order of PDF pages" [ref=e61] [cursor=pointer]:
                    - /url: '#reorder'
                    - generic [ref=e62]: 🔄
                    - generic [ref=e63]:
                        - generic [ref=e64]:
                            - heading "Reorder PDF" [level=3] [ref=e65]
                            - generic [ref=e66]: organize
                        - paragraph [ref=e67]: Change the order of PDF pages
                - link "🗑️ Delete Pages organize Remove unwanted pages" [ref=e68] [cursor=pointer]:
                    - /url: '#delete-pages'
                    - generic [ref=e69]: 🗑️
                    - generic [ref=e70]:
                        - generic [ref=e71]:
                            - heading "Delete Pages" [level=3] [ref=e72]
                            - generic [ref=e73]: organize
                        - paragraph [ref=e74]: Remove unwanted pages
                - link "📑 Extract Pages organize Get specific pages as a new PDF" [ref=e75] [cursor=pointer]:
                    - /url: '#extract-pages'
                    - generic [ref=e76]: 📑
                    - generic [ref=e77]:
                        - generic [ref=e78]:
                            - heading "Extract Pages" [level=3] [ref=e79]
                            - generic [ref=e80]: organize
                        - paragraph [ref=e81]: Get specific pages as a new PDF
                - link "🖼️ Image to PDF convert Convert JPG/PNG to PDF" [ref=e82] [cursor=pointer]:
                    - /url: '#image-to-pdf'
                    - generic [ref=e83]: 🖼️
                    - generic [ref=e84]:
                        - generic [ref=e85]:
                            - heading "Image to PDF" [level=3] [ref=e86]
                            - generic [ref=e87]: convert
                        - paragraph [ref=e88]: Convert JPG/PNG to PDF
                - link "🖼️ PDF to Image convert Convert PDF pages to JPG" [ref=e89] [cursor=pointer]:
                    - /url: '#pdf-to-image'
                    - generic [ref=e90]: 🖼️
                    - generic [ref=e91]:
                        - generic [ref=e92]:
                            - heading "PDF to Image" [level=3] [ref=e93]
                            - generic [ref=e94]: convert
                        - paragraph [ref=e95]: Convert PDF pages to JPG
                - link "🔒 Protect PDF security Add password to your PDF" [ref=e96] [cursor=pointer]:
                    - /url: '#protect'
                    - generic [ref=e97]: 🔒
                    - generic [ref=e98]:
                        - generic [ref=e99]:
                            - heading "Protect PDF" [level=3] [ref=e100]
                            - generic [ref=e101]: security
                        - paragraph [ref=e102]: Add password to your PDF
                - link "🔓 Unlock PDF security Remove password from PDF" [ref=e103] [cursor=pointer]:
                    - /url: '#unlock'
                    - generic [ref=e104]: 🔓
                    - generic [ref=e105]:
                        - generic [ref=e106]:
                            - heading "Unlock PDF" [level=3] [ref=e107]
                            - generic [ref=e108]: security
                        - paragraph [ref=e109]: Remove password from PDF
                - link "💧 Watermark edit Stamp text on your PDF" [ref=e110] [cursor=pointer]:
                    - /url: '#watermark'
                    - generic [ref=e111]: 💧
                    - generic [ref=e112]:
                        - generic [ref=e113]:
                            - heading "Watermark" [level=3] [ref=e114]
                            - generic [ref=e115]: edit
                        - paragraph [ref=e116]: Stamp text on your PDF
                - link "🔢 Page Numbers edit Insert page numbers" [ref=e117] [cursor=pointer]:
                    - /url: '#add-page-numbers'
                    - generic [ref=e118]: 🔢
                    - generic [ref=e119]:
                        - generic [ref=e120]:
                            - heading "Page Numbers" [level=3] [ref=e121]
                            - generic [ref=e122]: edit
                        - paragraph [ref=e123]: Insert page numbers
                - link "📄 Add Blank Page edit Insert blank pages anywhere" [ref=e124] [cursor=pointer]:
                    - /url: '#add-blank-page'
                    - generic [ref=e125]: 📄
                    - generic [ref=e126]:
                        - generic [ref=e127]:
                            - heading "Add Blank Page" [level=3] [ref=e128]
                            - generic [ref=e129]: edit
                        - paragraph [ref=e130]: Insert blank pages anywhere
                - link "📐 Crop & Resize optimize Adjust margins and dimensions" [ref=e131] [cursor=pointer]:
                    - /url: '#crop-resize'
                    - generic [ref=e132]: 📐
                    - generic [ref=e133]:
                        - generic [ref=e134]:
                            - heading "Crop & Resize" [level=3] [ref=e135]
                            - generic [ref=e136]: optimize
                        - paragraph [ref=e137]: Adjust margins and dimensions
        - generic [ref=e138]:
            - heading "How PDFMinty Works" [level=2] [ref=e139]
            - paragraph [ref=e140]: Three simple steps to manage your documents
            - generic [ref=e141]:
                - generic [ref=e142]:
                    - generic [ref=e143]: '1'
                    - heading "Select Files" [level=3] [ref=e144]
                    - paragraph [ref=e145]: Choose your PDF files from your computer or mobile device. Files are stored entirely temporarily in your browser's IndexedDB storage.
                - generic [ref=e146]:
                    - generic [ref=e147]: '2'
                    - heading "Process Locally" [level=3] [ref=e148]
                    - paragraph [ref=e149]: Our browser-based engine handles the work. They are never sent to any external server or third-party service.
                - generic [ref=e150]:
                    - generic [ref=e151]: '3'
                    - heading "Download & Clean" [level=3] [ref=e152]
                    - paragraph [ref=e153]: Get your processed PDF instantly. All temporary data is cleared automatically when you close the browser tab.
        - generic [ref=e154]:
            - generic [ref=e155]:
                - heading "Why Choose PDFMinty?" [level=2] [ref=e156]
                - paragraph [ref=e157]: Professional grade tools without the premium price tag.
            - generic [ref=e158]:
                - generic [ref=e159]:
                    - generic [ref=e160]: 🛡️
                    - heading "100% Private" [level=3] [ref=e161]
                    - paragraph [ref=e162]: Your files never leave your device. All processing happens locally in your browser.
                - generic [ref=e163]:
                    - generic [ref=e164]: ⚡
                    - heading "Lightning Fast" [level=3] [ref=e165]
                    - paragraph [ref=e166]: No waiting for uploads or downloads. Get your results instantly.
                - generic [ref=e167]:
                    - generic [ref=e168]: 🆓
                    - heading "Completely Free" [level=3] [ref=e169]
                    - paragraph [ref=e170]: No hidden fees, no subscriptions, and no watermarks on your documents.
        - generic [ref=e171]:
            - heading "Frequently Asked Questions / Privacy & Security" [level=2] [ref=e172]
            - generic [ref=e173]:
                - generic [ref=e174] [cursor=pointer]:
                    - text: 'Privacy & Security: Are my files safe?'
                    - generic [ref=e175]: ▼
                - generic: আপনার সমস্ত PDF প্রক্রিয়াকরণ সম্পূর্ণভাবে আপনার ব্রাউজারে (লোকাল) সম্পন্ন হয়। টুল চালানোর জন্য প্রয়োজনীয় কোডগুলো শুধুমাত্র বিশ্বস্ত CDN থেকে লোড করা হয়, কিন্তু আপনার ফাইল কখনোই কোনো সার্ভারে আপলোড করা হয়না। (All your PDF processing is done entirely locally in your browser. The code required to run the tools is loaded from trusted CDNs, but your files are never uploaded to any server.)
            - generic [ref=e176]:
                - generic [ref=e177] [cursor=pointer]:
                    - text: Is it really free?
                    - generic [ref=e178]: ▼
                - generic: Absolutely. There are no hidden costs, no subscriptions, and no limits on how many files you can process.
            - generic [ref=e179]:
                - generic [ref=e180] [cursor=pointer]:
                    - text: Do I need to install anything?
                    - generic [ref=e181]: ▼
                - generic: No installation required. PDFMinty works directly in any modern web browser on your computer, tablet, or smartphone.
            - generic [ref=e182]:
                - generic [ref=e183] [cursor=pointer]:
                    - text: Does it work offline?
                    - generic [ref=e184]: ▼
                - generic: Once the page is loaded, most tools will work even if you disconnect from the internet, as all logic is client-side.
        - generic [ref=e185]:
            - heading "Ready to Mint Your PDF?" [level=2] [ref=e186]
            - paragraph [ref=e187]: Experience the fastest and most secure PDF tools today.
            - button "Get Started Now" [ref=e188] [cursor=pointer]
    - contentinfo [ref=e189]:
        - generic [ref=e190]:
            - generic [ref=e191]:
                - generic [ref=e192]: 🔒
                - generic [ref=e193]:
                    - strong [ref=e194]: 100% Secure & Private.
                    - text: All files are processed locally on your device. No data is ever uploaded to our servers.
            - paragraph [ref=e195]: © 2026 PDFMinty. Free and open-source PDF tools.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test.describe('Applet E2E Tests', () => {
  4  |   test('has title', async ({ page }) => {
  5  |     // Navigate to the app root
  6  |     await page.goto('http://localhost:5173');
  7  |
  8  |     // Expect the title to be correctly set
  9  |     await expect(page).toHaveTitle(/PDFMinty/i);
  10 |
  11 |     // Check if hero header exists
  12 |     const heroHeader = page.locator('h1.hero-title');
> 13 |     await expect(heroHeader).toBeVisible();
     |                              ^ Error: expect(locator).toBeVisible() failed
  14 |     await expect(heroHeader).toContainText('All-in-One');
  15 |   });
  16 |
  17 |   test('can navigate to a tool', async ({ page }) => {
  18 |     await page.goto('http://localhost:5173');
  19 |
  20 |     // Click on the merge tool
  21 |     await page.click('a[href="#merge"]');
  22 |
  23 |     // Wait for the tool to render
  24 |     const dropzone = page.locator('#drop-zone');
  25 |     await expect(dropzone).toBeVisible();
  26 |   });
  27 | });
  28 |
```
