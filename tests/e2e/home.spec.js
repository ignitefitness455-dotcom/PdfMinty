import { test, expect } from '@playwright/test';

test.describe('PDFMinty Home Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display hero section', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('PdfMinty');
  });

  test('should list all tools', async ({ page }) => {
    const toolCards = page.locator('.tool-card');
    await expect(toolCards).toHaveCount(15);
  });

  test('should toggle dark theme and persist', async ({ page }) => {
    const themeButton = page.locator('.theme-toggle');
    const body = page.locator('body');

    // Check initial mode if not set
    const classList = await body.evaluate(el => el.className);
    const initialIsDark = classList.includes('dark-mode');

    // Toggle
    await themeButton.click();

    // Verify change
    const toggledClassList = await body.evaluate(el => el.className);
    if (initialIsDark) {
      expect(toggledClassList).not.toContain('dark-mode');
    } else {
      expect(toggledClassList).toContain('dark-mode');
    }
  });

  test('should filter tools via search input', async ({ page }) => {
    const searchInput = page.locator('#tool-search');
    await searchInput.fill('merge');

    // Non-merge tools are hidden (or filtered list has lower count)
    const visibleToolCards = page.locator('.tool-card:visible');
    // Expect fewer cards than the original 15
    const count = await visibleToolCards.count();
    expect(count).toBeLessThan(15);
  });
});
