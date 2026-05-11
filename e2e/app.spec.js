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

  test('can navigate to a tool', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Click on the merge tool
    await page.click('a[href="#merge"]');
    
    // Wait for the tool to render
    const dropzone = page.locator('#drop-zone');
    await expect(dropzone).toBeVisible();
  });
});
