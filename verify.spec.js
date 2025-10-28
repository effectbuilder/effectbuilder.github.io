const { test, expect } = require('@playwright/test');

test.describe('SignalRGB Effect Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded' });
    const acceptTermsButton = page.locator('#accept-terms-btn');
    await acceptTermsButton.waitFor({ state: 'visible', timeout: 10000 });
    if (await acceptTermsButton.isVisible()) {
      await acceptTermsButton.click();
    }
  });

  test('should correctly apply mix-gravity animation and mix colors', async ({ page }) => {
    // Expand the first object's accordion to make controls visible
    await page.locator('fieldset[data-object-id="1"] .d-flex.justify-content-between.align-items-center.w-100.px-2.py-1').click();
    await page.waitForTimeout(500); // Wait for accordion to expand

    // Change the shape to "tetris"
    await page.selectOption('select[name="obj1_shape"]', 'tetris');
    await page.waitForTimeout(500); // Wait for the UI to update

    // Navigate to the Tetris tab
    const tetrisTabSelector = 'fieldset[data-object-id="1"] button:has-text("Tetris")';
    await page.waitForSelector(tetrisTabSelector, { state: 'visible' });
    await page.locator(tetrisTabSelector).click();

    // Select the "mix-gravity" animation
    await page.waitForSelector('select[name="obj1_tetrisAnimation"]');
    await page.selectOption('select[name="obj1_tetrisAnimation"]', 'mix-gravity');

    // Take a screenshot to verify the animation is running
    await page.waitForTimeout(1500); // Wait a bit longer for animation to progress
    await expect(page).toHaveScreenshot('tetris-mix-gravity-animation.png', { maxDiffPixelRatio: 0.1 });
  });
});
