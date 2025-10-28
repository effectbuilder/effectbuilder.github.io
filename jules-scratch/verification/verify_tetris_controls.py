import asyncio
from playwright.async_api import async_playwright
import os
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Start a local server to serve the content
        os.system("python3 -m http.server 8000 &")
        time.sleep(2) # Add a delay

        await page.goto("http://localhost:8000/index.html")

        # Add a "tetris" object
        await page.evaluate('''() => {
            const newId = objects.length > 0 ? (Math.max(...objects.map(o => o.id))) + 1 : 1;
            const newConfigs = getDefaultObjectConfig(newId);
            const shapeConf = newConfigs.find(c => c.property === `obj${newId}_shape`);
            if(shapeConf) shapeConf.default = 'tetris';

            const firstObjectConfigIndex = configStore.findIndex(c => (c.property || c.name || '').startsWith('obj'));
            if (firstObjectConfigIndex === -1) {
                configStore.push(...newConfigs);
            } else {
                configStore.splice(firstObjectConfigIndex, 0, ...newConfigs);
            }

            const state = { id: newId, name: `Object ${newId}`, gradient: {} };
            newConfigs.forEach(conf => {
                const key = conf.property.replace(`obj${newId}_`, '');
                let value = conf.default;
                if (conf.type === 'number') value = parseFloat(value);
                else if (conf.type === 'boolean') value = (value === 'true');
                state[key] = value;
            });

            const newShape = new Shape({ ...state, ctx, canvasWidth: 1280 });
            objects.unshift(newShape);

            renderForm();
            updateFormValuesFromObjects();
            drawFrame();
            recordHistory();
        }''')

        # Click on the "Tetris" tab
        await page.click('button[data-bs-target="#pane-1-Tetris"]')

        # Check for the existence of the new controls
        blur_edges_visible = await page.is_visible('input[name="obj1_tetrisBlurEdges"]')
        hold_visible = await page.is_visible('input[name="obj1_tetrisHold"]')

        if blur_edges_visible and hold_visible:
            print("Verification successful: Tetris controls are visible.")
        else:
            print("Verification failed: Tetris controls are not visible.")

        await page.screenshot(path="jules-scratch/verification/tetris_controls.png")

        await browser.close()

        # Kill the server
        os.system("kill %1")

asyncio.run(main())
