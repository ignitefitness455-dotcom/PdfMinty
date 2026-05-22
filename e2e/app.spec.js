import { test, expect } from '@playwright/test';

test.describe('Applet E2E Tests', () => {
  test('has title', async ({ page }) => {
    // Navigate to the app root
    await page.goto('http://localhost:5173');

    // Expect the title to be correctly set
    await expect(page).toHaveTitle(/PDFMinty/i);

    // Check if hero header exists
    const heroHeader = page.locator('h1');
    await expect(heroHeader).toBeVisible();
    await expect(heroHeader).toContainText('The Ultimate');
  });

  test('can navigate to a tool and split', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
    
    await page.goto('http://localhost:5173/pdf-to-image-pdf');

    await page.waitForSelector('#file-input', { state: 'attached' });

    await page.evaluate(async () => {
    const base64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM+PgpzdHJlYW0KCgplbmRzdHJlYW0KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZSAvUGFnZSAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8L0ZvbnQgPDw+PiAvUHJvY1NldCBbL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSV0+PiAvQ29udGVudHMgMiAwIFIgL1BhcmVudCAzIDAgUj4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUgL1BhZ2VzIC9LaWRzIFs0IDAgUl0gL0NvdW50IDE+PgplbmRvYmoKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAzIDAgUj4+CmVuZG9iago1IDAgb2JqCjw8L1Byb2R1Y2VyIChNYWNPUyBWZXJzaW9uIDEwLjE0LjYgXChCdWlsZCAxOEcyMDIyXCkgUXVhcnR6IFBERkNvbnRleHQpIC9DcmVhdGlvbkRhdGUgKEQ6MjAyMTAyMTYxNTU0MTBaMDAnMDAnKSAvTW9kRGF0ZSAoRDoyMDIxMDIxNjE1NTQxMFowMCcwMCcpPj4KZW5kb2JqCnhyZWYKMCA2Cj0gZiAKMDAwMDAwMDI3NCAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAyMTUgMDAwMDAgbiAKMDAwMDAwMDA2NiAwMDAwMCBuIAowMDAwMDAwMzIzIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2IC9Sb290IDEgMCBSIC9JbmZvIDUgMCBSIC9JRDpbPDcxZDJjZDZlNmZkNzk5ZGZlZGY5NjZkYWVmZDc3NGRmPjw3MWQyY2Q2ZTZmZDc5OWRmZWRmOTY2ZGFlZmQ3NzRkZj5dPj4Kc3RhcnR4cmVmCjQ5NQolJUVPRgo=";
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    const blob = new window.Blob([array], { type: 'application/pdf' });
    const file = new window.File([blob], 'dummy.pdf', { type: 'application/pdf' });
    
    // Call the dropzone input change
    const input = document.getElementById('file-input');
    const dt = new window.DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new window.Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    document.getElementById('btn-apply').click();
  });
  await page.waitForTimeout(2000);
});
});
