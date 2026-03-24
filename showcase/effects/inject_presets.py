import os
import json
import random
import urllib.parse
import re

# Folder containing your .html effect files
EFFECTS_FOLDER = "./"

def generate_random_color():
    return f"#{random.randint(0, 0xFFFFFF):06x}"

def parse_signalrgb_properties(content):
    """Finds property tags even with NBSP / weird whitespace."""
    clean_text = content.replace('\u00a0', ' ').replace('\t', ' ')
    tag_blocks = re.findall(
        r'<[^>]*?(?:meta|effect-property)[^>]*property\s*=[^>]*>',
        clean_text,
        re.IGNORECASE | re.DOTALL
    )
    
    meta_tags = []
    for block in tag_blocks:
        pairs = re.findall(
            r'([a-zA-Z_0-9-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^>\s]+))',
            block
        )
        attrs = {k.lower(): (v1 or v2 or v3 or '').strip() for k, v1, v2, v3 in pairs}
        if 'property' in attrs and 'type' in attrs:
            meta_tags.append(attrs)
    return meta_tags

def process_files():
    print(f"Scanning: {os.path.abspath(EFFECTS_FOLDER)}")
    html_files = [f for f in os.listdir(EFFECTS_FOLDER) if f.lower().endswith((".html", ".htm"))]
    
    if not html_files:
        print("No HTML files found.")
        return

    for filename in html_files:
        path = os.path.join(EFFECTS_FOLDER, filename)
        try:
            with open(path, 'r', encoding='utf-8-sig') as f:
                content = f.read()

            # Remove previous auto-generated preset scripts
            content = re.sub(
                r'(?is)<script\s+type="application/json"\s+class="effect-preset">.*?</script>\s*',
                '',
                content
            )

            meta_data = parse_signalrgb_properties(content)
            if not meta_data:
                print(f"➖ {filename}: No properties found")
                continue

            print(f"🔍 {filename}: {len(meta_data)} properties")

            # ─── Generate presets with value-aware names ───
            generated_presets = []
            for _ in range(2):
                params = {}
                changes = []  # list of (label, new_value) tuples

                for meta in meta_data:
                    prop = meta.get('property')
                    if not prop:
                        continue

                    typ = meta.get('type', '').lower()
                    default = meta.get('default', '')
                    label = meta.get('label') or prop
                    val = default
                    changed = False

                    if typ == 'number':
                        try:
                            mn = float(meta.get('min', 0))
                            mx = float(meta.get('max', 100))
                            new_v = str(random.randint(int(mn), int(mx)))
                            if new_v != str(default):
                                val = new_v
                                changed = True
                        except:
                            pass
                    elif typ in ('boolean', 'bool'):
                        new_v = random.choice(['true', 'false'])
                        if new_v.lower() != str(default).lower():
                            val = new_v
                            changed = True
                    elif typ in ('list', 'combobox', 'select'):
                        opts = [v.strip() for v in meta.get('values', '').split(',') if v.strip()]
                        if opts:
                            new_v = random.choice(opts)
                            if new_v != default:
                                val = new_v
                                changed = True
                    elif typ == 'color':
                        new_v = generate_random_color()
                        if new_v.lower() != default.lower():
                            val = new_v
                            changed = True

                    if prop:
                        params[prop] = val

                    if changed:
                        display_value = val
                        # Make some types more readable
                        if typ in ('boolean', 'bool'):
                            display_value = "On" if val.lower() == 'true' else "Off"
                        elif typ == 'color':
                            display_value = val.upper()  # #FF3366 looks better than #ff3366
                        changes.append((label, display_value))

                if params:
                    if not changes:
                        name = "Default Mix 🎲"
                    else:
                        # Show first 3 changes with values
                        shown = changes[:3]
                        parts = [f"{label} = {value}" for label, value in shown]
                        name = "Mix: " + ", ".join(parts)
                        if len(changes) > 3:
                            name += f" +{len(changes)-3} more"
                        name += " 🎲"

                    query = urllib.parse.urlencode(params)
                    base = filename.rsplit('.', 1)[0]
                    url = f"https://go.signalrgb.com/app/effect/apply/{base}/?{query}"
                    generated_presets.append({"name": name, "url": url})

            if not generated_presets:
                print(f"⚠️  {filename}: No presets generated")
                continue

            # ─── Build clean injection (Windows-friendly) ───
            injection_parts = []

            for preset in generated_presets:
                json_str = json.dumps(preset, indent=4, ensure_ascii=False)
                injection_parts.append('    <script type="application/json" class="effect-preset">')
                for line in json_str.splitlines():
                    injection_parts.append('    ' + line)
                injection_parts.append('    </script>')

            injection = '\n'.join(injection_parts) + '\n\n'

            # Find safe injection point
            lower = content.lower()
            pos = lower.rfind('</body>')
            if pos == -1:
                pos = lower.rfind('</html>')

            if pos == -1:
                print(f"❌ {filename}: No </body> or </html>")
                continue

            new_content = (
                content[:pos].rstrip() +
                '\n' +
                injection +
                content[pos:]
            )

            # Write with Windows line endings
            with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
                f.write(new_content)

            print(f"✅ {filename}: {len(generated_presets)} presets injected")

        except Exception as e:
            print(f"❌ {filename}: {e}")

    print(f"\nDone. Processed {len(html_files)} file(s).")

if __name__ == "__main__":
    process_files()