const { test, expect } = require('@playwright/test');

test('debug page load', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  try {
    console.log('Navigating to page...');
    // Use 'load' or 'domcontentloaded' which are less strict than 'networkidle'
    await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log('Navigation complete.');

    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());

    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'test-results/debug-screenshot.png' });
    console.log('Screenshot taken.');

    // Print page content to see what HTML is loaded
    const content = await page.content();
    console.log('Page content length:', content.length);

  } catch (error) {
    console.error('Error during page navigation or interaction:', error);
    await page.screenshot({ path: 'test-results/debug-error-screenshot.png' });
    // Re-throw the error to make the test fail
    throw error;
  }
});
