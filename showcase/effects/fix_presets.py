import os
import glob
import re
import json
import urllib.parse

# Set the folder where your HTML files are located
DIRECTORY = "." # Change to "." if the script is in the exact same folder as the HTML files

print(f"Scanning for HTML files in '{DIRECTORY}'...")

for filepath in glob.glob(os.path.join(DIRECTORY, "*.html")):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Grab the exact text from the <title> tag
    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    if not title_match:
        print(f"Skipping {os.path.basename(filepath)}: No <title> tag found.")
        continue
        
    effect_title = title_match.group(1).strip()
    
    # URL encode the title (e.g., "Custom Blink" becomes "Custom%20Blink")
    encoded_title = urllib.parse.quote(effect_title)

    # 2. Function to locate and rebuild the broken script blocks
    def fix_preset_block(match):
        full_tag = match.group(0)
        inner_content = match.group(1).strip()
        
        # If this block contains a preset link, intercept and fix it
        if 'go.signalrgb.com/app/effect/apply/' in inner_content:
            try:
                # Clean up any leftover JavaScript syntax the previous script might have left behind
                cleaned_content = re.sub(r'^(var|let|const)\s+\w+\s*=\s*', '', inner_content)
                cleaned_content = re.sub(r';$', '', cleaned_content)
                
                data = json.loads(cleaned_content)
                
                if 'url' in data:
                    old_url = data['url']
                    
                    # Regex target: /apply/[ANYTHING_HERE]/?
                    # Replacement: /apply/[ENCODED_TITLE]/?
                    new_url = re.sub(r'/apply/[^/?]+/?\?', f'/apply/{encoded_title}/?', old_url)
                    data['url'] = new_url
                    
                    # Format the JSON cleanly with 4 spaces
                    formatted_json = json.dumps(data, indent=4)
                    
                    # Return the fully repaired block with the exact attributes you need
                    return f'<script type="application/json" class="effect-preset">\n    {formatted_json}\n    </script>'
            except json.JSONDecodeError:
                print(f"  [!] Warning: Found preset URL but couldn't parse JSON in {os.path.basename(filepath)}")
                return full_tag
                
        return full_tag

    # Find ALL <script> tags and run them through our fixer function
    pattern = re.compile(r'<script[^>]*>(.*?)</script>', re.DOTALL | re.IGNORECASE)
    new_content = pattern.sub(fix_preset_block, content)

    # 3. Save the file if changes were made
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {os.path.basename(filepath)} (Title set to: '{effect_title}')")

print("Finished processing all files.")