
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Listen for all console events and print them to the terminal
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

        # Navigate to the local HTML file
        await page.goto(f"file:///app/index.html")

        # Wait for the canvas to be visible to ensure the app has loaded
        try:
            await expect(page.locator("#effect-canvas")).to_be_visible(timeout=5000)
        except Exception as e:
            print(f"Error waiting for canvas: {e}")
            print("The application may have crashed. Check the console logs above.")
            await browser.close()
            return

        # 1. Select the "Tetris" shape
        await page.locator("#shape-selector").select_option("tetris")

        # Add a small delay to ensure the UI updates after shape selection
        await page.wait_for_timeout(500)

        # 2. Click the "Tetris" tab to reveal animation controls
        tetris_tab_button = page.get_by_role("button", name="Tetris")
        await expect(tetris_tab_button).to_be_visible()
        await tetris_tab_button.click()

        # 3. Select the "Mix" animation mode
        tetris_animation_dropdown = page.locator("#tetrisAnimation")
        await expect(tetris_animation_dropdown).to_be_visible()
        await tetris_animation_dropdown.select_option("mix")

        # 4. Set a custom color in the new color picker
        mix_color_input = page.locator("#tetrisMixColor")
        await expect(mix_color_input).to_be_visible()
        await mix_color_input.fill("#0000FF") # Set to bright blue

        # 5. Wait for the animation to reach the center mixing state
        # The logic has the blocks meet and hold, so a short wait should be enough
        await page.wait_for_timeout(2000)

        # 6. Take a screenshot
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
