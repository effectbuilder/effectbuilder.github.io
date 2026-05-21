# RGBJunkie for Windows — What's new

Plain-language release notes for the desktop app. Newest changes are listed first.

**Version tags:** Start each release with `## v0.2.48 — May 18, 2026` (semver + date). The website, in-app update dialog, and `releases/latest.json` link to that section. `build.bat` adds a stub heading automatically when the version is bumped.

## v0.2.65 — May 20, 2026

#### In-app updates use tracked download.php URLs

Portable auto-updates now download through **rgbjunkie.com/download.php** with **`channel=app-update`**, separate from website portable downloads (`channel=website` in the browser tracker). **`releases/latest.json`** points at the gateway URL. On the server, optional Firestore logging (service account in `download-stats-secret.php`) records app-update downloads; the stats page shows a **Channel** column.

#### Workspace toolbar: snap and grid toggles show when they are on

**Snap Grid**, **Snap Edges**, **Snap Center**, and **Show Grid** now get a visible pressed state (accent highlight) in the Windows minimal theme. The toggles were saving and working; only the on-state styling was missing because flat toolbar buttons use `!important` backgrounds that overrode the older active style.

#### rgbjunkie.com gallery effects render again

Effects downloaded from the site often call **`engine.getSensorValue()`** (Effect Builder export). The desktop app now implements that API on top of LibreHardwareMonitor readings, with a safe animated fallback when a sensor name is missing or LHM is still starting — so gallery effects no longer crash on launch with a blank canvas.

#### Functional (.mjs) effects: preview grid and thumbnails

The engine canvas preview for **`.mjs`** effects now maps each preview cell’s **`ledIndex`** along the **horizontal strip** (same as real LED sampling), instead of a diagonal mix of X and Y — so patterns like **Euclidean Beats**, **Morse Stream**, **VU Meter**, and **Palindrome Symmetry** look correct on the workspace and in generated catalog PNGs. Thumbnail generation also simulates **`audio.level`** and **`audio.density`** so level-meter and sound-reactive previews are not stuck dark.

#### Maintainer: catalog thumbnails from effect canvas renders

New script **`npm run generate:effect-thumbnails:canvas`** (after `npx playwright install chromium`) loads each built-in **HTML** effect in headless Chromium with the same host bridge the app injects, waits for the largest **canvas** to draw, and writes **`{effectName}.png`** next to the effect file for the Effect Browser. It also supports **functional `.mjs`** effects (**`npm run generate:effect-thumbnails:mjs`**) by rendering the same coarse **`sampleLed`** preview grid the app paints on the engine canvas. Use **`--skip-existing`** to fill in only missing images; use **`generate:effect-thumbnails`** when you want AI-generated art instead of a live frame grab.

#### Effects: hardware sensors via bundled LibreHardwareMonitor

Effects can read CPU/GPU load, temperatures, fan speeds, and other values from **`engine.sensors`** — a stable ID-based API (`list()`, `get(id)`, `normalize(id)`). The app can ship **LibreHardwareMonitor** in the installer (see `vendor/librehardwaremonitor/README.md`), start it as a background helper, and poll its `data.json` feed so effects do not talk to port 8085 directly. Sidebar **`type="sensor"`** controls are now sensor pickers populated from the live catalog. Sample effect: **System Vitals**. Enable **Options → Remote web server → Run** in the helper if sensor status stays on “starting”.

#### Effects: LHM sensor list showed only one entry

LibreHardwareMonitor reports readings as strings with units (for example `69.5 °C`, `1264 RPM`), not bare numbers. The parser now understands those values and uses LHM’s `SensorId` paths, so the sensor picker lists the full catalog (hundreds of sensors) instead of a single S.M.A.R.T. counter like Power On Count.

#### Effect browser: cleaner filter bar layout

The Effect Browser filter bar is **one shallow row** that uses the modal’s **width** (CSS grid): search and dropdowns share horizontal space, actions are **icon-only**, active filter chips scroll in their own slot, and **“N shown”** moved to the header. No second filter row unless you open **More filters** (advanced row only). Fixed the **Favorites** toolbar control overlapping neighbors (it was injecting “Favorites (10)” text into an icon-sized button).

#### Effect browser: source badge and tags on one row

Effect cards show **Built-in** / **MJS** badges and effect tags (audio, visualizer, **+N**, …) in a **single combined chip row** instead of two separate lines.

#### Effect browser: card menu opens upward when needed

The **⋯** menu on effect cards no longer gets cut off at the bottom of the browser. It opens in a fixed layer above the grid, flips **above** the button when needed, and closes when you click **⋯** again, pick an action, or click outside the menu. **Star** (favorite) sits on the **top-right** of the preview image; **⋯** (more actions) on the **bottom-right**, with icons centered in their round buttons.

#### Effects: sensor tree picker in the sidebar

Effect settings with **`type="sensor"`** now use a **searchable hardware tree** (same layout as LibreHardwareMonitor: PC → board → chip → group → sensor) instead of one long dropdown. **Type filter pills** (All, Temp, Load, Fan, …) narrow the list; each row shows a **live value** and updates when the catalog refreshes. The tree opens only when you click the sensor control (like the color-profile picker) and opens **to the left of the effects sidebar** over the canvas, not on top of the narrow panel. It closes when you pick a sensor, press **Escape**, or click outside. **Folder rows** start **collapsed**; expand and collapse with the chevron (▸/▾). Search still opens branches that contain matches. A second row of tabs filters by **hardware** (**CPU**, **GPU**, **RAM**, **Mobo**, and other buckets present on your PC) in addition to sensor type (Temp, Load, Fan, …). Choosing a hardware or type tab **expands all matching folders** so you see every sensor without clicking through the tree.

## v0.2.56 — May 18, 2026

*(Add release notes for v0.2.56.)*

## v0.2.58 — May 19, 2026

#### Desktop shell: no browser right-click menu or Find (Ctrl+F)

The embedded WebView no longer shows the **Edge-style default context menu** (Back, Refresh, Inspect, etc.) when you right-click outside RGBJunkie’s own menus. **Ctrl+F** / **F3** Find on page, **Ctrl+P** print, **Ctrl+R** / **F5** reload, and **Ctrl+Plus/Minus** zoom are disabled so the app feels like a desktop tool, not a browser tab. Your **canvas and component right-click menus** (move, copy preview, component actions) are unchanged — those are part of RGBJunkie. Developer builds can still open WebView tools from the tray when the **devtools** feature is enabled.

## v0.2.60 — May 19, 2026

#### Effect profiles: deleted canvas tabs no longer come back

Saving or loading an **Effect Settings** profile (for example **Audio Party**) could bring back a removed **Canvas B** tab. Workspace tabs are stored in both effect and device autosave; a later device layout restore could re-add a tab you had deleted, and the app’s default workspace used to include **Canvas B** whenever tabs were empty. Profiles now prune stale per-tab effect snapshots on save/load, treat saved `workspaceTabs` as authoritative over old component rows, sync device autosave after effect profile changes, and default to a single **Main** canvas only.

#### build.bat: automatic release prerequisites

`build.bat` now runs **`setup-release-prerequisites.mjs`** first: creates **`scripts/sftp-upload.config.local.json`** from the example when missing, checks the FTP password, installs **WSL Ubuntu apt packages** for Linux builds when needed (one sudo prompt), and warns if **OpenRGB** is not vendored. Use **`RGBJUNKIE_GIT_PULL=1`** to pull latest code before the build. Old **`RGBJunkie.AppDir`** and unpack folders under `bundle/` are cleaned before FTP upload.

#### WSL setup: auto-install Node.js and Rust

The WSL prerequisites script now installs **Node.js LTS** (NodeSource) and **rustup stable** when missing, instead of only printing a warning. First `build.bat` on a new Ubuntu WSL image may take a few minutes for apt + rustup.

#### Release FTP: clearer Linux upload failures

If Linux `.deb`/`.rpm`/AppImage versions do not match `package.json` (for example old **0.2.48** files after a bump to **0.2.62**), FTP upload now prints an explicit error instead of silently skipping Linux. `build.bat` runs `verify-linux-bundles.mjs` before upload; `build-linux-via-wsl.mjs` removes stale Linux artifacts when copying a new build back from WSL.

#### Linux downloads on the website (release pipeline)

`build.bat` can produce Linux installers via WSL, and the FTP upload step now publishes **`.deb`**, **`.rpm`**, and **AppImage** files under `downloads/linux/` on rgbjunkie.com (alongside Windows NSIS, MSI, and the portable ZIP). If a Linux build was skipped, the upload continues with Windows artifacts only.

#### Linux WSL build: fix Vite EPERM on `C:`

Building on `/mnt/c/...` from WSL could fail with `EPERM` when Vite copies `public/` into `dist/`. The WSL build script stages under `~/RGBJunkieApp-wsl-build`, builds on the Linux filesystem, then copies `.deb`/`.rpm`/AppImage back through Windows (`\\wsl$\...`) — not with Linux `cp` into `/mnt/c`, which often hits the same permission error.

#### LED Studio: toolbar layout like the design mockup

The LED Studio controls are laid out in one horizontal strip: **Component** (device dropdown), **Brush tools** (color + HEX in one capsule, Paint/Erase in another), and **Actions** (three rounded buttons, with **Clear all** in red). Sections are separated by vertical dividers with small uppercase labels above each group.

#### LED Studio: confirm before Clear all

**Clear all** in LED Studio now asks for confirmation first. It reminds you that painted LED colors will be removed on **every component** on the canvas, not only the one selected in the dropdown.

#### In-app confirmation dialogs (no more browser popups)

Destructive or important actions no longer use the WebView’s **“localhost says”** `confirm()` box. RGBJunkie shows a styled in-app dialog instead — LED Studio **Clear all**, removing a canvas component, deleting device/effect profiles, resetting effect parameters, setup wizard prompts, and similar confirmations in Settings (color profiles, WLED devices, installed files, Git disable-all).

## v0.2.62 — May 19, 2026

*(Add release notes for v0.2.62.)*

## v0.2.64 — May 19, 2026

#### Workspace: Escape clears selection

Press **Escape** to deselect all components and layout groups on the canvas (same as clicking empty workspace). Does not run while **Settings**, the effect browser, confirm dialogs, or a context menu is open. Fixed a case where the component library overlay was treated as always open (CSS-hidden modals no longer block Escape).

#### Device tree: opening a device no longer jumps selection to the last channel

Clicking a device in the left panel selects that device’s components on the canvas instead of leaving only the last component in the last channel selected.

#### Dropdowns and fields match minimal panel buttons

Profile pickers, effect/device layout selects, toolbar dropdowns, effect-browser filters, plugin settings, and Settings form controls now use the same flat look as icon buttons — ghost comboboxes (faint underline, larger chevron, light hover wash) and lighter text fields instead of heavy gray boxes.

#### Custom dropdown menus (replacing the OS list)

Opening a profile or settings select now shows an in-app list (dark panel, hover highlight, accent on the current item) instead of the default WebView2 popup. Native `<select>` is still used for values and keyboard accessibility; only the open menu is custom.

#### Minimal sliders

Brightness, effect parameters (e.g. **Overall pace**), plugin settings, and calibration sliders use a thin track: your theme accent from the start up to the thumb, faint line after, and an accent-colored thumb (matches tabs and other accent controls).

#### Effect settings profile reload no longer adds extra canvases

Reloading a saved **effect settings** profile restores effect choices and sliders only — it no longer auto-loads the paired **default device layout**, which could add workspace canvases that were not part of the profile when you saved it. Switching effects in the library still applies the default device layout mapping when you have one set.

#### Warning before switching profiles with unsaved changes

Changing the **effect settings** or **device layout** profile dropdown, reloading a profile, or picking a new **default device layout for effect** now warns you when the session has changed since that profile was loaded or last saved (for example adding a **canvas** tab). Autosave still runs in the background, but the prompt compares against that loaded baseline — not autosave alone — so edits like a new canvas are not missed. The dialog offers **Cancel**, **Continue without Saving**, and **Save and Continue** on one row. **Save and Continue** now writes the **named profile file** you were on (not only autosave), so switching back to that layout keeps new canvases and other edits.

#### Effect browser: rescan local effects when opened

Opening **Browse effects** now runs a full disk rescan (built-in and user folders), merges the online gallery, and refreshes the list — so new or edited `.html` / `.mjs` files show up without restarting the app.

#### New effect: Topographic Contours

A calm **elevation-map** look — drifting hills drawn as contour lines with optional shading from your **color profile**, and optional bass response so lines shift slightly with music.

#### New effect: Chromatic Split

Soft floating shapes tinted by your **color profile**, then separated into **red / green / blue** channels — prismatic fringing that widens on bass hits. No text rain or digital noise; adjustable split distance, direction, and wobble.

#### Effect settings no longer reset when opening Browse effects

Opening the effect browser rescans disk and merges the gallery **without** switching to a different effect, relaunching the iframe, or reapplying autosave parameters — sidebar sliders and the running effect stay as they were.

#### Brainstorm effect pack — fixes and removals

**Removed:** Gray-Scott, SEM Lithography, Origami Fold, PCB Traces, Fan Tachograph, Network Pulse, Ambient Pulse, Slime Mold, Cymatics, Rope Chain, plus earlier weak HUD/layout effects (Pendulum Wave, Solar Day Arc, Path Runner, Corner Reflector, Desk Lamp, Terrarium, Star Ceiling, Health Rings, Cooldown Sweep, Loot Flash, Minimap Ping).

**Tuned:** **Halftone** drifts faster and has a **movement angle** slider. **Fibre Optic** sways slower with visible **sound response** (sway, brightness, and traveling pulses on bass). **Segment Chase** **scrolls** profile colors through bands and offers **segment shapes** (vertical, horizontal, diagonal, radial rings, wedges); wedge mode rotates profile colors with the spokes (not locked to the screen). **Dominant Color Wash** weights screen **center** more. **Seasonal Slow** density updates live; autumn vs spring look distinct. Double Pendulum has **arm length** controls.

#### Brainstorm effect pack (remaining canvas + strip `.mjs`)

Open **Browse effects** to rescan the disk.

- **Physics & math:** Double Pendulum  
- **Visual style:** Halftone, Fibre Optic  
- **PC / mood:** Dominant Color Wash (screen sampling)  
- **Layout / chase:** Segment Chase  
- **Calm / HUD:** Seasonal Slow  
- **Strip functional (`.mjs`):** Hilbert Walker, Euclidean Beats, Thermodynamic Noise, Palindrome Symmetry, Morse Stream  

#### Sidebar and Settings: hints behind icon-only help buttons

**Device Layout Profiles** and **Effect Settings Profiles** no longer show gray subtitle lines under the headings. The same text is on the **?** icon beside each title (hover or focus).

**Settings** uses the same control everywhere section intros used to be gray paragraphs: **App look** (language, theme, typography, canvas LEDs, labels), **Color profiles**, **Hardware** (OpenRGB RAM, WLED, unmatched devices), **RAM** / **GPU** tabs, **Engine** advanced options, **Backup**, **Computer**, **Logs**, **Installed files** (Git repos and media lists — click opens the full help dialog), and the **request missing device** dialog. Installed-files help no longer uses a bordered **?** text button.

#### App-wide buttons: minimal flat style

Buttons across RGBJunkie (toolbar, **Settings**, component/effect library modals, setup wizard, plugin settings, confirm dialogs, LED Studio, and the device/effect side panels) use the same light treatment: transparent by default, soft hover, accent when toggled on. **Browse effects**, **Submit**, and other primary actions still use the green **btn-primary-strong** style. Delete/remove controls keep a red hover hint. Top **toolbar** controls stay icon-only (labels hidden for space); icons keep an explicit size so they remain visible with the flat button style. Toolbar **button groups** no longer use a separate grey pill background — icons sit directly on the top bar. Tools that are unavailable (nothing selected, etc.) show **darker gray** icons instead of a washed-out fade.

#### Sidebar panels: lighter icon buttons

Small controls in the **Devices** and **Effects** docks (profile save/reload/delete, rescan, visibility/lock toolbar, transport buttons, share, reset, and per-device tree actions) use the same minimal **icon-only** style as the profile **?** help buttons — no heavy gray **btn** boxes; subtle hover and accent when active. Effect settings category tabs match (flat until selected).

#### Settings: hardware notes and color profile delete buttons

Removed the **RAM (OpenRGB)** and **GPU I2C** disclaimer notes from **Settings → Hardware**. Color profile and swatch **delete** controls now show an **×** icon (Bootstrap Icons) instead of a **?** placeholder.

#### Effect hot-reload: stay on the same effect

When you save an effect `.html` file while it is running, RGBJunkie reloads **that** effect instead of jumping to a different entry in the list (fixes wrong index after catalog rescan and profile restore overriding your selection).

#### Effect developer guide: scaling shapes to canvas size

**[`EFFECT-DEVELOPER-GUIDE.md`](EFFECT-DEVELOPER-GUIDE.md)** (and the HTML guide on the site) now documents **§2.2** — how to scale radii, spacing, and stroke width using **`canvas.width`/`height`**, **`engine.canvas`**, **`rgbjSetupCanvas`**, and the 320×200 reference size.

*(Add other release notes for v0.2.64.)*

---

## v0.2.65 — May 20, 2026

#### Component Library: LED layout thumbnails

When a catalog entry has no product image (common for **CompGen** and other layout-only JSON), the grid now shows a **rendered LED map** (dot positions from `LedCoordinates`) instead of the generic RGBJunkie logo. Entries with a real **ImageUrl** still use that artwork; failed downloads also fall back to the layout render when possible.

#### Component Library: Escape closes the browser

Press **Escape** to close the **Component Library** modal (same as the **X** button or the effect browser). If a rename/import prompt is open on top of the library, **Escape** dismisses that prompt first.

#### Workspace: maximize layout canvas

A **fullscreen** control in the **lower-right** of the layout canvas expands the render area **borderless on the current screen** (toolbar and side panels hidden for that view). Press **Escape** or click the button again to return to the normal layout. The stage rescales to fill the maximized area.

#### Escape closes more overlays

**Escape** now dismisses the **initial setup wizard** and **plugin device settings** modal (same as their close buttons, including the wizard’s “still unassigned channels?” confirm when needed). The **custom strip / rename prompt** cancels on **Escape** even when focus is not in the text field. Existing behavior is unchanged for **Settings**, **Browse effects**, **Component Library**, confirm dialogs, and canvas maximized view.

#### Settings Help and website docs updated

**Settings → Help** (all languages) now documents **Scene** profiles, the layout **maximize canvas** control, expanded **Escape** behavior, the **setup wizard**, **Component Library** LED thumbnails, and the refreshed **Devices / Effects** layout. The rgbjunkie.com **documentation** page adds an end-user guide section; release notes sync to the site changelog.

#### Multi-canvas scenes: inactive tabs start their effects on load

Loading a **Scene** with more than one workspace canvas now starts the saved effect on **every** tab, not only the active one. Inactive canvases use hidden effect runners (same as when you switch tabs); scene load and autosave restore now trigger that sync after profiles apply.

#### Effect settings tabs match Audio Party layout

Effects that declare a `group=` on each control (for example **Fan Align**) now use **one row of category tabs** (Layout, Colors, Pattern, …) like **Audio Party**, instead of turning `Label: Setting` prefixes into separate top-level tabs with an empty **General** panel. Multi-object builder exports (`Object 1: Width`) still get per-object tabs when needed.

#### Multi-canvas scenes: keyboard layout follow on inactive tabs

**Keyboard layout follow** on an inactive canvas tab now receives **keyboard input** and layout polling for that tab, not only the visible canvas. Previously, key events were wired to the active tab’s effect iframe only — so the hidden runner never triggered until you switched tabs (after which the last frame kept updating). Inactive runners also stay composited (`visibility: visible`, `opacity: 0`) so WebView2 does not pause their animation loop.

#### Scene profiles: one save for layout and effects

Device layout profiles and effect settings profiles are now a single **Scene** — layout, components, canvas tabs, and effect sliders live in one file under `profiles/scenes/`. The scene picker sits in a bar **above the workspace canvas tabs** (center column), not in the Devices or Effects side panels. **Share effect settings** is unchanged (effect-only link; no canvas data). Run `node scripts/merge-legacy-profiles-to-scenes.mjs` once to combine old `devices/` and `effects/` JSON on this PC.

#### Layout: Scene and Effects on the right; canvas tabs above the workspace

**Scene** (profile picker only) and **Effects** (current effect info, library, settings) stay in the **right column** with the **same dock shell as Devices** (one outer panel, scroll body, `.panel` sections) — no extra wrapper div that caused a double border at the top. **Devices** and **Effects** no longer appear twice at the top of each column (dock header vs section title). The effects **collapse rail** sits on the **canvas side** of the panel (not on the outer screen edge), matching the devices dock. **Canvas tabs** (Main [1], +, etc.) sit **centered above the workspace**, not in the Scene block. The Effects column no longer stacks old **Global Control** / **Effect Settings** boxes inside another box; controls flow as plain sections in one scroll (no duplicate **GLOBAL CONTROL** / **Effect Library:** headers, calmer **Browse effects** button, even 3-column settings tabs). The current-effect summary (title, author, tags) sits **below Auto-cycle** and **above Effect Settings**. A startup crash (“Initialization failed”) from removing the hidden **Effect Settings** container is fixed — that block is moved into the right rail but kept in the DOM for the engine. **Keyboards and other fixed-layout devices** no longer show a fake **Canvas layout** channel row; components attach under the device as before. Single-channel pads/strips still get a real **Canvas layout** channel row (with the color dot on that row only).

#### Device tree: channel dots only on channel rows

Colored channel indicators no longer appear on the **device** row (that was misleading — the dot is channel identity, not the device). Single-channel pads and strips (including **Prism Mini** when the firmware reports a generic “Channel 1” name) now show **Channel 01** on the channel row with the dot, identify, and **+** there — never **+** on the device row (including multi-channel rigs like **Nollie32**; use **+** on each channel row instead).

#### Right column: one panel, one scroll

Scene and Effects live in **one** glass column with a single scroll — no second bordered card around effect sliders or the current-effect summary.

#### Lost canvas layout after scene migration

If scene autosave only had a handful of components while your old **device layout autosave** still had the full rig, startup now **merges the larger list** from `profiles/devices/autosave_device.json` automatically. **Fan Tracer** and similar scenes that were merged from layout-only files (effect lived under a different name like **Fan Trail** in `profiles/effects/`) now pull the correct **Fan Tracer Pro Max** effect on load instead of keeping whatever effect was already open. Run `node scripts/restore-scene-components-from-legacy.mjs` once to rewrite `autosave_scene.json` on disk, or load the **Fan Tracer** (or other) scene that still lists 29 components in `profiles/scenes/`. Effect-only JSON must never replace device `components` when merging profiles.

#### Scene load: layout sampling for single-channel devices

After loading a scene, the app refreshes subdevice layout rows, rebinds components to plugins, and rebuilds the device tree. **Single-channel** devices with no canvas component (e.g. **Prism Mini**) get a default full-width strip on channel 0 so the active effect can reach the hardware again. Multi-channel devices (e.g. **Nollie32**) still need a layout component on each channel you use — expand the device and use **+** on that channel if LEDs stay dark.

#### Device tree: hardware output flags (scene load)

Scene load only applies **Output off** for devices that are actually connected, so stale profile keys cannot mute unrelated hardware.

#### Scene list: WLED config file hidden

`wled_devices.json` (saved WLED hosts for Settings, not a scene) no longer appears in the Scene dropdown if it was copied into `profiles/scenes/` during migration.

#### Workspace canvases: new tabs no longer vanish when you switch away

Adding a canvas with **+** and then clicking **Main** (or another tab) could remove the new tab from the strip. Switching tabs reloads the effect’s default device layout from disk, and older saves often only list **Main** — that overwrote tabs you had just added in memory. Runtime-added canvases are now kept until you save a device profile or remove the tab yourself.

#### Workspace canvases: switching tabs updates the active layout

Clicking another canvas tab (same effect on both tabs) no longer reloads the default device layout JSON from disk. The app now shows components for that canvas only and treats **active canvas** / layout edits as changed again (instead of resetting the session baseline). The default device layout file still loads when the other tab uses a **different** effect.

#### Workspace tabs: canvas number beside the name

Each workspace tab in the strip now shows its **1–9 shortcut slot** in brackets after the name (for example **Main [1]**, **Canvas B [2]**). The same numbering appears in the per-component canvas picker and context menu, so it matches pressing **1**–**9** on the keyboard to move the selection to that canvas.

#### Device tree: workspace canvas button matches other icons

The workspace picker pill on each component row shows **1**–**9** (same as keyboard shortcuts) instead of **M** for Main, and no longer uses the old gray beveled system button look — it uses the same flat icon style as the eye, lock, and identify controls beside it.

#### Device tree: one lock / unlock button

The separate **lock** and **unlock all** icons in the device sidebar are now a **single toggle**: when anything on the canvas is locked, the button shows the unlock icon and unlocks every component on click; otherwise it shows the lock icon and locks the current selection (disabled until you select something).

#### Device tree: hardware rescan shows a spinning icon

While USB hardware is rescanning, the **Rescan** button in the device sidebar no longer shows **Scanning…** text — only the same refresh icon, rotating until the scan finishes.

#### Elgato Stream Deck Plus shows up again

**Stream Deck Plus** (USB `0x0FD9` / `0x0084`) could appear under **Settings → Hardware → USB devices not matched to a plugin** even though the driver file was present. The Plus plugin reads its canvas size at load time; the host now wires **`Size()`** from the plugin descriptor before that line runs, and the Plus script uses **`rgbjunkie.size`** directly so detection succeeds on a rescan.

#### Elgato Stream Deck plugins (Corsair-Elgato folder)

The five Stream Deck scripts from the SRGBmods **Corsair-Elgato** pack now ship under **`plugins/Corsair-Elgato/`** (MK.2, XL, original 0x0060, Mini, Plus). They use the RGBJunkie plugin format and shared Elgato HID helpers. **Stream Deck Neo** stays in **`plugins/Elgato/`**.

#### Settings: flat buttons and refreshed About tab

Buttons across **Settings** (About, Backup, Logs, Hardware, and other tabs) now use the same minimal flat style as the side panels — no heavy gray bordered boxes. The **About** tab is reorganized with a clearer hero (version pill with accent highlight), grouped **Updates** and **Legal** sections, centered action buttons, and cleaner footer links.

#### Toolbar: grid spacing dropdown no longer shifts the bar

Opening the **Grid** spacing list in the top toolbar used a custom dropdown inside the bar’s clipped area; focus could scroll the page and make the whole toolbar jump. The list now opens in a fixed layer under the control without moving the toolbar.

#### LED Studio: action buttons aligned left

**Paint All**, **Clear Component**, and **Clear All** in **Settings → Colors → LED Studio** now line up under the **Actions** label on the left, use single-line labels, and are wide enough that the text does not wrap. The **Component** dropdown and **Brush tools** (color/HEX and Paint/Erase) no longer use the extra bordered wells around each control — only the controls themselves show focus/active styling. **Component**, **Brush tools**, and **Actions** section titles now share the same baseline at the top of the toolbar.

#### UI accents: Crimson Pulse vs Rose Neon (color vision)

**Crimson Pulse** is now a deeper **true red** and **Rose Neon** a brighter **fuchsia-pink** (more blue), so the two presets are easier to tell apart if you have mild deutan or similar red–green confusion — they no longer sit on the same magenta-pink range.

---

---

## v0.2.63 — May 19, 2026

#### Linux: correct status-bar memory and bundled effects

On Ubuntu and WSL, the bottom **Proc.** line could show hundreds of thousands of MB and inflated **CPU** because Linux reports each thread as a separate process with full RSS. The app now counts main processes only, so memory and CPU match what you would expect (~hundreds of MB, not hundreds of GB).

Installed Linux builds (`.deb`, AppImage) now find **built-in effects** from the installer’s resource folder (not only effects downloaded from rgbjunkie.com). Paths under `/usr/lib/.../resources/effects` and Tauri’s resource resolver are included.

#### Linux / WSL without a sound card

On machines with no ALSA playback device (common in WSL), RGBJunkie no longer retries audio capture in a tight loop, which avoids repeated **ALSA lib … Unknown PCM default** messages on the console. Audio-reactive effects stay off until a real sound device is present; use a normal Ubuntu desktop or PipeWire/PulseAudio setup for microphone/loopback capture.

#### Discord invite opens #welcome-and-rules

The toolbar **Discord** button now uses [discord.gg/adHsQG8czv](https://discord.gg/adHsQG8czv), which lands in **#welcome-and-rules** instead of the old invite that opened **#bot-spam**.

---

---

## v0.2.61 — May 19, 2026

*(Add release notes for v0.2.61.)*

---

---

## v0.2.59 — May 19, 2026

#### Right-click → LED Studio on every component

**LED Studio…** is on the canvas and Devices sidebar menus for **every** component. It opens **Settings → Colors → LED Studio** with that component already selected. Components with no LED grid show the item disabled (tooltip explains why). Fixed-layout plugin rows in the sidebar can use the menu too (not only removable components).

#### Save confirmation toasts for device layout and effect settings

When you click **Save current layout** or **Save current effect settings**, a short success toast shows the profile name that was written. If the save fails, you get an error toast instead of only a console message.

#### App-wide links open in your browser (not inside the WebView)

**http**, **https**, and **mailto** links across the main app window now open in your default browser — Settings (About, Help, RAM/OpenRGB help text, bug-report footer, and similar), update dialogs, and other host UI. The embedded WebView no longer swallows those clicks. **Effect** panels are unchanged (they run in their own iframe). In **About**, the **build** stamp is always a link to this version’s release notes on rgbjunkie.com, including after you’re already up to date.

---

---

## v0.2.57 — May 18, 2026

*(Add release notes for v0.2.57.)*

---

---

## v0.2.48 — May 18, 2026

#### Languages: English, Español, 简体中文

The desktop app UI can run in **English**, **Español**, or **Simplified Chinese (简体中文)**. Open **Settings → App look → Language** — labels update immediately without restarting, and your choice is remembered for the next launch. If you have not picked a language yet, the app defaults to Spanish or Chinese when your Windows or browser language matches.

**What switches with the language:** toolbar and side panels; **Settings** (every tab, including Help cards, confirm dialogs, and toasts); effect browser; component library; setup wizard; device tree (visibility, rescan, favorites, filters); canvas and component context menus; workspace tabs; status bar; app update notices; startup splash phases; and the first-run Terms of Service summary and buttons.

- **Fix:** Changing language no longer clears the device list (the tree is rebuilt instead of wiping dynamic content).
- **Still in English:** full Terms of Service legal text; effect, plugin, and catalog names loaded from your disk; some low-level API error strings and OpenRGB SDK diagnostic dumps. Contributors: see `docs/I18N-CONTRACT.md`.

#### Setup wizard dismiss and new hardware

Closing or skipping the **initial setup wizard** now warns you when channels still have no components assigned, reminds you that you can run it again from the device panel (magic wand), and will not auto-open again until **new hardware** is detected — then RGBJunkie asks whether to open the wizard for those devices.

#### Discord community link

The top toolbar (next to Help and Settings) has a **Discord** button that opens the official RGBJunkie server invite: [discord.gg/ZXkqMPjzcB](https://discord.gg/ZXkqMPjzcB).

#### Bug fix: device layout autosave when you move components

Moving strips, fans, or keyboards on the canvas now reliably updates **`devices/autosave_device.json`** (the layout autosave was not wired for all drag paths). On quit, RGBJunkie flushes device and effect autosave before shutdown colors. If USB or WLED plugins attach a moment after startup, the app **re-applies** the saved layout so positions are not lost when a row was skipped with “no matching plugin” on the first pass.

#### Reliable WLED device removal

Removing a row under **Settings → Devices → WLED** now disconnects that controller from the device list immediately (with confirmation), not only after a separate save. Orphaned WLED plugins are pruned whenever the saved WLED list changes, including during fast hardware rescans that previously left removed devices running.

#### WLED discovery deduplication

**Discover WLED** no longer lists the same controller twice when SSDP/ARP reports both `192.168.x.x` and `192.168.x.x:80` — results use one canonical address (port **80** is omitted; other ports are kept).

#### Bug fix: effect settings and autosave restore the correct library effect

Loading **effect autosave** could open the wrong entry from the Effect Library (a random slot until you picked the effect again manually). That is fixed. Effect behavior now matches the intended model:

- **`effects/autosave_effect.json`** is the only state restored on startup (your last session).
- **Named effect setting files** are snapshots: save them when you want a backup, or pick one in the dropdown and use **Reload** to load it — that updates autosave for the next launch. The dropdown selection is remembered, but startup does not silently re-load an old file over autosave.
- Live slider and effect changes always save to **autosave only** (named files are not overwritten on every tweak).

- **Fix:** Restores use **stable effect ids** (gallery id, disk **source** + path, or display name) instead of trusting a bare `effect_3` list index after the rgbjunkie.com gallery merges or the library order changes.
- **Fix:** A local **effects identity registry** in AppData (`cache/effects_identity_registry_v1.json`) helps match older saves when the catalog changes between sessions.
- **Fix:** After the gallery catalog finishes loading, the app re-applies your saved effect so sliders and parameters stay tied to the right HTML effect.
- **Fix:** Release builds no longer launch a blank `effect_0` during hardware init before autosave runs — your saved sliders are pushed into the effect iframe after restore (including when the iframe is reused without a full reload).
- **Fix:** During startup restore, the effect iframe always reloads so saved sliders apply in release builds (not only when dev reuses a warm iframe).
- **Fix:** Built-in effects match across dev (`effects/` in the repo), installed (`Program Files`), and bundled paths using the same `effects/…` folder tail — not only the `.html` file name — so autosave tied to Fan Tracer (and similar) resolves to the same library entry in both modes.
- **Fix:** If nothing matches, the effect stays **paused** instead of defaulting to the first library entry.
- **Diagnostics:** On effect autosave load, the app logs the full path to `autosave_effect.json` under `%APPDATA%\RGBJunkie` (override with env `RGBJUNKIE_APP_DATA` if needed). Dev and release read the same file; if settings differ, compare that path in the log or F12 console.
- **Fix:** Effect launches are serialized during restore so an early `effect_0` launch cannot strip another effect’s saved slider keys from memory before your effect loads; saved globals are re-applied to the iframe several times after load so Fan Tracer–style effects pick up autosave values.
- **Fix:** Effect restore prefers the saved `effectParams` block (your live sliders) over empty placeholders in `effectCache`, so the control panel and preview no longer reset to defaults when an old cache slot matched first.

#### Privacy Policy page (website)

The RGBJunkie for Windows marketing site now includes a **Privacy Policy** at `/RGBJunkieApp/privacy/`, linked from the site navigation and footer. It covers website analytics, support reports, downloads, and local desktop app data in plain language.

#### About / settings copyright

Settings **About** now shows **© 2026 RGBJunkie** instead of a personal name.

#### Friendlier Terms of Service dialog

The first-run agreement screen is smaller and easier to scan: a short plain-language **summary** stays visible, and the full legal text lives in an expandable **Full Terms of Service** section. The yellow warning banner and long checkbox wording are gone; buttons are labeled **Continue** and **Exit**. Summary copy is warmer and avoids dollar amounts; agreement is described as continuing to use the app.

#### Quieter diagnostic logs

The app’s background **freeze / stall watchdog** used to write a `heapJump` line to `freeze-events.txt` every few seconds when the JavaScript heap bounced during normal use (for example after garbage collection). That made the log hard to read when nothing was actually wrong.

- **Throttled** — At most about **one `heapJump` entry per minute** under typical churn (still logs sooner if something serious is happening).
- **Smarter detection** — A jump is measured from a recent **low point**, not from the previous 2-second sample, so routine up/down swings are less likely to spam the file.
- **Baseline check** — Entries are only written when heap stays **meaningfully above** its recent 30-second low, not on tiny oscillations around normal levels.

Console output for heap jumps was already quiet unless memory stayed very high; this change mainly keeps the on-disk log useful for real investigations.

---

## May 8–9, 2026

Plain-language summary of changes users may notice. (Exact shipping date depends on your update channel.)

### May 8

#### Share your effect settings

You can **share a link** (or similar flow, depending on build) so others can open the same effect configuration. This is meant for presets, support, and showing setups without manually copying every slider.

#### Cleaner device support

Many device plugins were **trimmed to lighting-related behavior** so the app stays focused on RGB and control surfaces you actually use. The **device list** and related data were refreshed so names and entries stay consistent.

#### General improvements

- **Look and feel** — Updated layout and styling in parts of the main window.
- **App icon** — Refreshed icons for Windows, shortcuts, and related sizes so the app matches the current branding.
- **Reliability and quality** — Under-the-hood work on lighting output, plugins, WLED behavior, color handling, and diagnostics so sessions stay smoother and odd edge cases are less likely.
- **Component library** — Many fan, strip, and similar **layout parts** were touched for consistency and accuracy when you build a desk setup.

### May 9

*(These updates are in development builds; they may not all be in every installer until the next release.)*

#### Workspace and side panels

- **Collapsible columns** — The **devices** list and **effects** panel can be collapsed to a slim bar so the **center workspace** (layout + effect preview) gets more room.
- **Peek while collapsed** — When a column is collapsed, moving the pointer over the slim bar can **temporarily expand** it so you can glance at devices or settings without fully pinning the panel open.
- **Smoother peek** — Small gaps next to the center area no longer “flicker” the peek panel closed when you move the mouse toward the middle of the screen.
- **Same width** — The two side columns are matched in width so the layout feels balanced.

#### Effect preview and canvas

- **More preview, less empty frame** — The dark border around the **live effect preview** is reduced so the colorful preview uses more of the available space.
- **Softer edge** — The outer frame no longer reads as an extra harsh black ring around the preview when the effect doesn’t paint those pixels.
- **Tighter fit** — Margins around the preview area were slightly reduced so the canvas uses the window a bit better.

#### Layout editor

- **No dashed outline** — The dotted rectangle around the main layout area was **removed** so the workspace looks cleaner (the optional grid, when turned on, is unchanged).

#### Device list

- **Visibility** — Device visibility is shown with the familiar **eye** control again (not a brand logo in that spot).
- **Easier to scan** — The device column uses horizontal space a bit better, and row alignment was improved so labels, chevrons, and buttons line up more naturally.

---

## May 6–7, 2026

### Color profiles & built-in effects

- **One palette system everywhere** — A large set of **built-in HTML effects** now reads colors from the same **Color profiles** you manage under **Settings → Color profiles** (built-in gradients plus your own).
- **Accurate previews** — Profile swatches use the real gradient **stops** from the app, not hard-coded color tables inside each effect.
- **Smarter defaults** — Several effects were retuned so their default profile matches the new catalog.

### Effect settings UI (Color tab)

- **Profile chooser as a modal gallery** — Picking a color profile opens a **modal** with **card-style** gradient previews instead of a long plain dropdown.
- **Your profiles first** — **Custom profiles you created** appear in their own section **above** built-in themes.
- **Jump to profile editor** — A control in that modal sends you straight to **Settings → Color profiles** when you want to add or edit gradients.

### Settings → Color profiles

- **Import from Coolors** — Paste a **Coolors.co** share URL or hex values to create a new profile in one step.

### Layout, workspace & sidebar

- **Identify hardware** — **Identify** from the workspace or sidebar helps you match on-screen components to physical devices.
- **Device tree** — Summary rows for device groups can **collapse** again after you open them.
- **Rotated layouts** — Moving **rotated** selections along the workspace edge uses the correct dimensions.

### Support & bug reports

- **In-app bug report flow** — Send diagnostics with optional **note**, **contact** fields, application log, and USB / HID hardware snapshot.
- **Toolbar shortcut** — **Report** on the main bar jumps straight to **Settings → Logs**.

### USB hot-plug & Rescan hardware

- **Plug and unplug (Windows)** — The app reacts to USB topology changes so devices don’t stay in the sidebar after removal or return without lighting until a restart.
- **Sidebar Rescan** — **Rescan hardware** clears stale HID handles before reloading enumeration, which fixes many “ghost device” and dark-LED cases after replugging.

---

## Notes

- Newer sections appear first. Your installed version may include only a subset until you update.
- Check **Settings → About** (or your usual update path) for the app version if something above does not match what you see.
