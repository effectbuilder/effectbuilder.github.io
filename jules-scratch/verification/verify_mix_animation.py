
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Listen for console events and print them
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        # Navigate to the local HTML file
        await page.goto(f'file://{os.path.abspath("index.html")}')

        # Accept the terms
        await page.click('#accept-terms-btn')

        # Add a Tetris object
        await page.click('#add-object-btn')

        # Expand the new object's panel
        await page.click('fieldset[data-object-id="1"] [data-bs-toggle="collapse"]', force=True)
        await asyncio.sleep(1) # Wait for UI to update

        # Print the page content for debugging
        content = await page.content()
        print(content)

        # Now select the shape
        await page.select_option('select[name="obj1_shape"]', 'tetris')

        # Click the 'Tetris' tab to make the controls visible
        await page.click('#tab-1-Tetris')

        # Select the "Mix" animation
        await page.select_option('select[name="obj1_tetrisAnimation"]', 'mix')

        # Let the animation run for a bit
        await asyncio.sleep(2)

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/mix-animation.png")

        await browser.close()

if __name__ == '__main__':
    import os
    asyncio.run(main())
