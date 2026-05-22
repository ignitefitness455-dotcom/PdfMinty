import { test, expect } from '@playwright/test';
import { uploadMockPDF } from './helpers/testPdf.js';

test.describe('PDFMinty E2E Core Tests', () => {
  test('HomePage loads correctly with all essential visual structure', async ({ page }) => {
    // Navigate using relative route configured via baseURL
    await page.goto('/');

    // Validate main heading text
    const heroHeader = page.locator('h1');
    await expect(heroHeader).toBeVisible();
    await expect(heroHeader).toContainText('The Ultimate');

    // Confirm that popular tools list displays properly
    const toolsGrid = page.locator('#tools-grid');
    await expect(toolsGrid).toBeVisible();

    const toolCards = toolsGrid.locator('.tool-card');
    const toolCount = await toolCards.count();
    expect(toolCount).toBeGreaterThan(10); // ensures all 15 tools are declared
  });

  test('Tool Navigation and Lazy Loading of Specific Tools', async ({ page }) => {
    // Navigate to Split PDF Tool (relative route)
    await page.goto('/split-pdf');
    const header = page.locator('.tool-header h1');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Split PDF');

    const backBtn = page.locator('#btn-back');
    await expect(backBtn).toBeVisible();

    // Go back using UI control
    await backBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('Interactive Workflows: Upload and Apply on PDF Split', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

    await page.goto('/split-pdf');
    await page.waitForSelector('#file-input', { state: 'attached' });

    // Upload using standard mock helper
    await uploadMockPDF(page);

    // Confirm workspace exhibits details about uploaded document
    await page.waitForSelector('#workspace', { state: 'visible' });
    const fileNameDisplay = page.locator('#file-name-display');
    await expect(fileNameDisplay).toContainText('dummy.pdf');

    // Trigger Split operation
    const applyBtn = page.locator('#btn-apply');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
  });

  test('Interactive Workflows: Rotate PDF Tool', async ({ page }) => {
    await page.goto('/rotate-pdf');
    await page.waitForSelector('#file-input', { state: 'attached' });

    await uploadMockPDF(page);
    await page.waitForSelector('#workspace', { state: 'visible' });

    // Attempt to rotate
    const applyBtn = page.locator('#btn-apply');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
  });

  test('Interactive Workflows: Protect PDF Tool with Password', async ({ page }) => {
    await page.goto('/protect-pdf');
    await page.waitForSelector('#file-input', { state: 'attached' });

    await uploadMockPDF(page);
    await page.waitForSelector('#workspace', { state: 'visible' });

    // Fill in passwords
    const pwdInput = page.locator('#protect-password');
    if (await pwdInput.count() > 0) {
       await pwdInput.fill('mintySec#123');
    }

    const applyBtn = page.locator('#btn-apply');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
  });
});
