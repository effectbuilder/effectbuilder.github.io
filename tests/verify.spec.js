const { test, expect } = require('@playwright/test');

test('verifies mix animation and color picker', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });

  // Wait for the page to load and the accept button to be available
  const acceptButton = await page.waitForSelector('#accept-terms-btn', { timeout: 15000 });
  await acceptButton.click();

  // See what's on the page
  console.log(await page.content());

  // Wait for the main UI to be ready
  await page.waitForSelector('#controls-form');

  // Add a small delay to ensure UI is fully rendered
  await page.waitForTimeout(1000);

  // Click the object panel header to expand it
  await page.click('div[data-bs-target="#collapse-obj-1"]');

  // Click the "Geometry" tab to ensure the tab container is active
  await page.click('button[data-bs-target="#pane-1-Geometry"]');

  // Click the "Tetris" tab
  await page.click('button[data-bs-target="#pane-1-Tetris"]');

  // Select the "Mix-gravity" animation
  await page.selectOption('select[name="obj1_tetrisAnimation"]', 'mix-gravity');

  // Check if the mix color picker is visible
  const mixColorPicker = await page.locator('label:has-text("Mix Color")');
  await expect(mixColorPicker).toBeVisible();

  await page.screenshot({ path: 'test-results/screenshot.png' });
});
