# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edge_cases.spec.js >> Edge Cases >> Large file (50MB+) handling warns user
- Location: e2e/edge_cases.spec.js:98:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.toast-warning, .toast').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.toast-warning, .toast').first()

```

```yaml
- navigation:
  - link "🌿 PDFMinty":
    - /url: /
  - button "☀️"
- text: 🔒 Your files never leave your device. All processing happens locally in your browser.
- main:
  - link "← Back":
    - /url: /
  - heading "Compress PDF" [level=1]
  - paragraph: Reduce file size by converting pages to optimized JPEG images
  - 'button "File upload zone: Drag & drop a PDF here, or click to select"':
    - paragraph: Drag & drop a PDF here, or click to select
    - text: 📥 Release to add files
  - paragraph: 🔒 No upload. No servers. 100% private.
  - heading "How to use this tool" [level=3]
  - list:
    - listitem: Upload the PDF file you wish to compress.
    - listitem: Wait for the file to load and be read.
    - listitem: Click 🗜️ Compress PDF to reduce the file size.
    - listitem: The optimized PDF will be downloaded automatically.
- contentinfo:
  - text: 🔒
  - strong: 100% Secure & Private.
  - text: All files are processed locally on your device. No data is ever uploaded to our servers.
  - link "Provide Feedback":
    - /url: "#"
    - text: 💬 Provide Feedback
  - link "Contact Us":
    - /url: "#"
    - text: ✉️ Contact Us
  - paragraph: © 2026 PDFMinty. Free and open-source PDF tools.
- dialog "Contact Us":
  - heading "Contact Us" [level=2]
  - button "Close Contact Modal": ×
  - text: Name
  - textbox "Name":
    - /placeholder: Your Name
  - text: Email Address
  - textbox "Email Address":
    - /placeholder: you@example.com
  - text: Topic
  - combobox "Topic":
    - option "General Inquiry" [selected]
    - option "Feedback & Suggestions"
    - option "Bug Report"
    - option "Business Talk"
  - text: Message
  - textbox "Message":
    - /placeholder: How can we help you?
  - button "Send Message"
```

# Test source

```ts
  13  |       return { size: file.size, name: file.name };
  14  |     }, sizeMB);
  15  |   };
  16  | 
  17  |   test('Merge with 0 files selected', async ({ page }) => {
  18  |     await page.goto('http://localhost:5173/merge-pdf');
  19  |     // We expect the apply button to be hidden or disabled
  20  |     const applyBtn = page.locator('#btn-apply');
  21  |     await expect(applyBtn).toBeHidden();
  22  |   });
  23  | 
  24  |   test('Merge with 1 file selected should warn', async ({ page }) => {
  25  |     await page.goto('http://localhost:5173/merge-pdf');
  26  |     await page.waitForSelector('#file-input', { state: 'attached', timeout: 5000 });
  27  |     
  28  |     // Listen for dialog if browser natively alerts, or ui.showError
  29  |     let alertText = '';
  30  |     page.on('dialog', dialog => {
  31  |       alertText = dialog.message();
  32  |       dialog.dismiss();
  33  |     });
  34  | 
  35  |     // Mock upload 1 file using input
  36  |     await page.evaluate(() => {
  37  |       const db = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]);
  38  |       const blob = new window.Blob([db], { type: 'application/pdf' });
  39  |       const file = new window.File([blob], 'dummy.pdf', { type: 'application/pdf' });
  40  |       
  41  |       const fileList = {
  42  |         0: file,
  43  |         length: 1,
  44  |         item(index) { return this[index]; }
  45  |       };
  46  |       
  47  |       // trigger onFiles manually if file input is hidden or hard to interact with
  48  |       if (window.currentTool && window.currentTool.onFiles) {
  49  |          window.currentTool.onFiles(fileList);
  50  |       } else {
  51  |         const input = document.getElementById('file-input');
  52  |         Object.defineProperty(input, 'files', { value: fileList });
  53  |         input.dispatchEvent(new window.Event('change'));
  54  |       }
  55  |     });
  56  | 
  57  |     const applyBtn = page.locator('#btn-apply');
  58  |     await expect(applyBtn).toBeVisible();
  59  | 
  60  |     await applyBtn.click();
  61  |     
  62  |     // Typically the app intercepts and shows error toast/alert if files < 2
  63  |     const toast = page.locator('.toast');
  64  |     if (await toast.count() > 0) {
  65  |       await expect(toast.first()).toHaveText(/at least 2/i);
  66  |     }
  67  |   });
  68  | 
  69  |   test('Split with invalid page range', async ({ page }) => {
  70  |     await page.goto('http://localhost:5173/split-pdf');
  71  |     await page.waitForSelector('#file-input', { state: 'attached', timeout: 5000 });
  72  |     
  73  |     await page.evaluate(() => {
  74  |       const db = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]);
  75  |       const blob = new window.Blob([db], { type: 'application/pdf' });
  76  |       const file = new window.File([blob], 'dummy.pdf', { type: 'application/pdf' });
  77  |       const fileList = { 0: file, length: 1, item: () => file };
  78  |       const input = document.getElementById('file-input');
  79  |       Object.defineProperty(input, 'files', { value: fileList });
  80  |       input.dispatchEvent(new window.Event('change'));
  81  |       
  82  |       if (document.getElementById('split-ranges')) {
  83  |          document.getElementById('split-ranges').value = 'invalid,1-2';
  84  |       }
  85  |     });
  86  | 
  87  |     const applyBtn = page.locator('#btn-apply');
  88  |     if (await applyBtn.isVisible()) {
  89  |        await applyBtn.click();
  90  |        // Check validation error
  91  |        const toast = page.locator('.toast');
  92  |        if (await toast.count() > 0) {
  93  |           await expect(toast.first()).toContainText(/invalid/i);
  94  |        }
  95  |     }
  96  |   });
  97  | 
  98  |   test('Large file (50MB+) handling warns user', async ({ page }) => {
  99  |      await page.goto('http://localhost:5173/compress-pdf');
  100 |      await page.waitForSelector('#file-input', { state: 'attached', timeout: 5000 });
  101 |      
  102 |      await page.evaluate(() => {
  103 |       // simulate 55MB file
  104 |       const blob = new window.Blob([new Uint8Array(55 * 1024 * 1024)], { type: 'application/pdf' });
  105 |       const file = new window.File([blob], 'huge.pdf', { type: 'application/pdf' });
  106 |       const input = document.getElementById('file-input');
  107 |       Object.defineProperty(input, 'files', { value: { 0: file, length: 1, item: () => file }});
  108 |       input.dispatchEvent(new window.Event('change'));
  109 |      });
  110 | 
  111 |      // Warning toast is expected
  112 |      const toast = page.locator('.toast-warning, .toast');
> 113 |      await expect(toast.first()).toBeVisible({ timeout: 5000 });
      |                                  ^ Error: expect(locator).toBeVisible() failed
  114 |      await expect(toast.first()).toContainText(/large/i);
  115 |   });
  116 | });
  117 | 
```