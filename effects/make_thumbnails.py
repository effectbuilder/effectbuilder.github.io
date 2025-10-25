import os
import time
import io
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from PIL import Image

# --- Configuration ---
# Use r'...' for raw strings to handle backslashes correctly on Windows
HTML_FOLDER = r'C:\wamp64\www\effects' # <-- Path to your HTML files
OUTPUT_FOLDER = HTML_FOLDER # Thumbnails saved in the same folder
THUMBNAIL_WIDTH = 320
THUMBNAIL_HEIGHT = 200
WAIT_SECONDS = 2  # Adjust based on how long animations take to look good
USE_HEADLESS = False # Set to True to run Chrome without a visible window (faster)
# --- End Configuration ---

def create_thumbnails(html_dir, output_dir, width, height, wait_time, headless=False):
    """
    Opens HTML files in a browser, waits, and saves thumbnails
    in the same directory with a .png extension, only if the
    thumbnail doesn't already exist.
    """
    if not os.path.isdir(html_dir):
        print(f"Error: HTML folder not found at '{html_dir}'")
        return

    print(f"Checking for HTML files and existing thumbnails in: {output_dir}")

    # --- Setup Selenium WebDriver ---
    driver = None # Initialize driver to None for cleanup check
    try:
        print("Setting up browser driver...")
        service = Service(ChromeDriverManager().install())
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument('--headless')
            options.add_argument('--disable-gpu')
        options.add_argument(f'--window-size={width + 50},{height + 150}')
        options.add_argument('--hide-scrollbars')
        options.add_argument("--force-device-scale-factor=1")

        driver = webdriver.Chrome(service=service, options=options)
        driver.set_window_size(width + 100, height + 200)
        print("Driver setup complete.")
    except Exception as e:
        print(f"Error setting up WebDriver: {e}")
        print("Please ensure Google Chrome is installed and webdriver-manager can download the driver.")
        if driver:
            driver.quit()
        return

    html_files = [f for f in os.listdir(html_dir) if f.lower().endswith('.html')]

    if not html_files:
        print(f"No HTML files found in '{html_dir}'.")
        driver.quit()
        return

    print(f"Found {len(html_files)} HTML files. Starting processing...")

    # --- Process Files ---
    files_processed = 0
    files_skipped = 0
    for filename in html_files:
        base_name = os.path.splitext(filename)[0]
        thumb_filename = f"{base_name}.png"
        thumb_path = os.path.join(output_dir, thumb_filename)

        # --- MODIFIED: Check if thumbnail already exists ---
        if os.path.exists(thumb_path):
            print(f"  Skipping: {filename} (Thumbnail already exists at {thumb_path})")
            files_skipped += 1
            continue # Move to the next HTML file
        # --- END MODIFICATION ---

        try:
            file_path = os.path.abspath(os.path.join(html_dir, filename))
            file_url = f'file:///{file_path.replace(os.sep, "/")}'

            print(f"  Processing: {filename}")

            driver.get(file_url)

            print(f"    Waiting {wait_time} seconds...")
            time.sleep(wait_time)

            print("    Capturing screenshot...")
            png_data = driver.get_screenshot_as_png()

            print("    Resizing and saving...")
            img = Image.open(io.BytesIO(png_data))
            thumbnail = img.resize((width, height), Image.Resampling.LANCZOS)

            thumbnail.save(thumb_path)
            print(f"    Saved: {thumb_path}")
            files_processed += 1

        except Exception as e:
            print(f"  Error processing {filename}: {e}")

    # --- Cleanup ---
    print("\nProcessing summary:")
    print(f"  Thumbnails generated: {files_processed}")
    print(f"  Thumbnails skipped (already existed): {files_skipped}")
    print("Quitting browser...")
    driver.quit()
    print("Processing complete.")

# --- Run the function ---
if __name__ == "__main__":
    if 'path/to/your' in HTML_FOLDER:
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
         print("!!! PLEASE EDIT THE HTML_FOLDER variable                  !!!")
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        create_thumbnails(HTML_FOLDER, OUTPUT_FOLDER, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, WAIT_SECONDS, USE_HEADLESS)