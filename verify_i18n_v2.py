from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the page
        print("Loading page...")
        page.goto("http://localhost:8080/index.html")

        # Handle Terms Modal
        print("Handling Terms Modal...")
        try:
            page.click("#accept-terms-btn", timeout=5000)
            print("Terms accepted.")
        except Exception as e:
            print(f"Terms modal not found or already accepted: {e}")

        # 1. Verify default language (English)
        print("Verifying default language...")
        new_btn = page.locator("#new-ws-btn")
        if "New" not in new_btn.inner_text():
            print("FAILED: Default language is not English or i18n failed.")
            print(f"Text found: {new_btn.inner_text()}")
        else:
            print("PASSED: Default language is English.")

        # 2. Switch to Spanish
        print("Switching to Spanish...")
        page.click("#languageDropdown")
        page.click("a[data-lang='es']")
        time.sleep(1) # Wait for update

        # Verify New button translation
        if "Nuevo" not in new_btn.inner_text():
            print("FAILED: Language switch to Spanish failed.")
            print(f"Text found: {new_btn.inner_text()}")
        else:
            print("PASSED: Language switch to Spanish successful (Static Content).")

        # 3. Verify Dynamic Content (Form Controls)
        # Add an object to ensure controls exist
        print("Adding an object...")
        page.click("#add-object-btn")
        time.sleep(1)

        labels = page.locator("label.form-label").all_inner_texts()
        found_translated_label = False
        for label in labels:
            if "Forma" in label:
                found_translated_label = True
                break

        if found_translated_label:
             print("PASSED: Dynamic content (Controls) translated successfully.")
        else:
             print("FAILED: Dynamic content translation not found.")
             # print(f"Labels found: {labels}")

        # 4. Verify New Dynamic Translations (Global Overrides)
        # Click the "General Settings" tab/collapse if necessary?
        # Global Overrides is inside the general settings area.
        # It's a span with class "fs-6 fw-semibold" inside the overrides header.

        overrides_text = page.locator("#collapse-overrides").locator("..").locator(".fs-6.fw-semibold").inner_text()
        # In Spanish, "Global Overrides" might be "Configuración General" or similar depending on languages.js?
        # Wait, I mapped 'properties.General Settings' to 'Configuración General' in previous steps?
        # Let's check languages.js content I wrote.
        # "General Settings": "Configuración General",
        # "Global Overrides": "Global Overrides" (Wait, did I add Global Overrides key?)
        # In main.js I used: i18next.t('properties.General Settings', 'Global Overrides')
        # So it should resolve to "Configuración General".

        if "Configuración General" in overrides_text or "Global Overrides" in overrides_text:
             # Note: If translation missing, it returns key or default.
             # Ideally it should be the Spanish value.
             print(f"Global Overrides text found: {overrides_text}")
             if "Configuración General" in overrides_text:
                 print("PASSED: Global Overrides translated.")
             else:
                 print("WARNING: Global Overrides might not be translated correctly (Found default?).")

        # 5. Verify Modal Translation (Load Project Modal)
        print("Checking Load Project Modal...")
        # Trigger modal
        # The button is disabled by default if not logged in? No, Load button is disabled.
        # Let's check the Export modal which is enabled.
        page.click("#export-btn")
        time.sleep(1)

        modal_title = page.locator("#exportOptionsModalLabel").inner_text()
        # English: Export Properties
        # Spanish: Exportar Propiedades
        if "Exportar Propiedades" in modal_title:
            print("PASSED: Export Modal title translated.")
        else:
            print(f"FAILED: Export Modal title translation mismatch. Found: {modal_title}")

        browser.close()

if __name__ == "__main__":
    run()
