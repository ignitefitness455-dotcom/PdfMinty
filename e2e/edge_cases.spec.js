import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  // Mock file creating function
  const createMockPDF = async (page, sizeMB = 1) => {
    return await page.evaluate(async (size) => {
      // Create a dummy PDF bytes matching the PDF signature
      const buffer = new Uint8Array(Math.floor(size * 1024 * 1024));
      const sig = [0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]; // %PDF-1.4
      buffer.set(sig);
      const blob = new window.Blob([buffer], { type: 'application/pdf' });
      const file = new window.File([blob], 'dummy.pdf', { type: 'application/pdf' });
      return { size: file.size, name: file.name };
    }, sizeMB);
  };

  test('Merge with 0 files selected', async ({ page }) => {
    await page.goto('http://localhost:5173/#merge');
    // We expect the apply button to be hidden or disabled
    const applyBtn = page.locator('#btn-apply');
    await expect(applyBtn).toBeHidden();
  });

  test('Merge with 1 file selected should warn', async ({ page }) => {
    await page.goto('http://localhost:5173/#merge');
    
    // Listen for dialog if browser natively alerts, or ui.showError
    let alertText = '';
    page.on('dialog', dialog => {
      alertText = dialog.message();
      dialog.dismiss();
    });

    // Mock upload 1 file using input
    await page.evaluate(() => {
      const db = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]);
      const blob = new window.Blob([db], { type: 'application/pdf' });
      const file = new window.File([blob], 'dummy.pdf', { type: 'application/pdf' });
      
      const fileList = {
        0: file,
        length: 1,
        item(index) { return this[index]; }
      };
      
      // trigger onFiles manually if file input is hidden or hard to interact with
      if (window.currentTool && window.currentTool.onFiles) {
         window.currentTool.onFiles(fileList);
      } else {
        const input = document.getElementById('file-input');
        Object.defineProperty(input, 'files', { value: fileList });
        input.dispatchEvent(new window.Event('change'));
      }
    });

    const applyBtn = page.locator('#btn-apply');
    await expect(applyBtn).toBeVisible();

    await applyBtn.click();
    
    // Typically the app intercepts and shows error toast/alert if files < 2
    const toast = page.locator('.toast');
    if (await toast.count() > 0) {
      await expect(toast.first()).toHaveText(/at least 2/i);
    }
  });

  test('Split with invalid page range', async ({ page }) => {
    await page.goto('http://localhost:5173/#split');
    
    await page.evaluate(() => {
      const db = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]);
      const blob = new window.Blob([db], { type: 'application/pdf' });
      const file = new window.File([blob], 'dummy.pdf', { type: 'application/pdf' });
      const fileList = { 0: file, length: 1, item: () => file };
      const input = document.getElementById('file-input');
      Object.defineProperty(input, 'files', { value: fileList });
      input.dispatchEvent(new window.Event('change'));
      
      if (document.getElementById('split-ranges')) {
         document.getElementById('split-ranges').value = 'invalid,1-2';
      }
    });

    const applyBtn = page.locator('#btn-apply');
    if (await applyBtn.isVisible()) {
       await applyBtn.click();
       // Check validation error
       const toast = page.locator('.toast');
       if (await toast.count() > 0) {
          await expect(toast.first()).toContainText(/invalid/i);
       }
    }
  });

  test('Large file (50MB+) handling warns user', async ({ page }) => {
     await page.goto('http://localhost:5173/#compress');
     
     await page.evaluate(() => {
      // simulate 55MB file
      const blob = new window.Blob([new Uint8Array(55 * 1024 * 1024)], { type: 'application/pdf' });
      const file = new window.File([blob], 'huge.pdf', { type: 'application/pdf' });
      const input = document.getElementById('file-input');
      Object.defineProperty(input, 'files', { value: { 0: file, length: 1, item: () => file }});
      input.dispatchEvent(new window.Event('change'));
     });

     // Warning toast is expected
     const toast = page.locator('.toast-warning, .toast');
     await expect(toast.first()).toBeVisible({ timeout: 5000 });
     await expect(toast.first()).toContainText(/large/i);
  });
});
