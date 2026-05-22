# RGBJunkie for Windows — What's new

Plain-language release notes for the desktop app. Newest changes are listed first.

**Version tags:** Start each release with `## v0.2.48 — May 18, 2026` (semver + date). The website, in-app update dialog, and `releases/latest.json` link to that section. `build.bat` adds a stub heading automatically when the version is bumped.

## v0.2.78 — May 21, 2026

#### Settings → Hardware — Performance tab

- The former **Throughput** sub-tab is renamed **Performance**. The table adds an **FPS** column showing each device’s plugin **Render()** rate (rolling ~2 s window), alongside data rate and I/O counts.

#### Nollie / high-FPS plugins — `setFrameRateTarget` now drives the engine

- **Performance** tab FPS was often stuck near **30–60** even when a plugin requested **100 FPS**, because the host sampled the canvas at ~60 Hz (or ~30 Hz with **Settings → System → Engine → Low-power engine**) and `setFrameRateTarget` only raised the floor without speeding up sampling. The default hardware sample cadence is now **~100 Hz** (`1000/100` ms). Plugins that call `device.setFrameRateTarget(100)` (Nollie32, etc.) pull the frame loop to match (up to the **100 FPS** sandbox cap). Turn off **Low-power engine** if you want headroom above ~30 Hz on devices without an explicit target.

#### Nollie32 — up to 100 FPS

- **Nollie32** (V1 and Firmware 2.x / Nos 2.0) can now drive hardware at up to **100 FPS** instead of being capped at 60. The host still paces multi-packet HID writes so the USB bus stays stable.
- **Plugin sandbox** — `device.setFrameRateTarget` is hard-capped at **100 FPS** for every device; no vendor-specific FPS rules in the sandbox. Nollie plugins declare `usbPathHealWithoutReinit: true` on `rgbjunkie` instead of the host matching USB vendor IDs.

#### LED timing when the window is in the background

- **Unfocused or minimized** — the lighting loop no longer waits until each frame finishes before scheduling the next tick (that pattern could drop well below 60 Hz and feel like LED lag). It now runs on a steady ~60 Hz timer, and effect preview frames are applied immediately instead of waiting on a throttled animation frame.
- **Tray / hidden window** — a native background pump keeps driving the loop when Chromium slows JavaScript timers, so strips and controllers stay in sync while you use other apps or RGBJunkie is only in the system tray.

#### WLED device list — one file in AppData (dev and release)

- **Settings → Devices → WLED** now loads and saves only **`%APPDATA%\RGBJunkie\profiles\devices\wled_devices.json`**. Dev and release builds share the same list (no separate WebView `localStorage` copy). A one-time migration copies any legacy browser-stored rows into that file on first launch after the update.

#### WLED — fewer periodic rapid flashes on long strips

- When the PC pauses the lighting loop briefly (memory trim, DNS refresh, or a heavy rescan), stacked UDP frames are no longer blasted to the controller in one burst. Each host now sends **one latest frame at a time**, and hostname lookups **reuse the last good IP** while refreshing in the background (about every 5 minutes) instead of stalling mid-stream.

#### WLED — layout components stay after restart (IP vs hostname)

- Scene autosave may store **`wled:192.168.x.x-0`** while **Settings → WLED** lists **`wled-matrix.local`** (or the other way around). On load, RGBJunkie matches the same physical controller by **discovered IP**, configured hostname, and UDP maps — then rebinds and remaps canvas channels to the live plugin id. **Duplicate** autosave rows (two per controller — IP and `.local`) are collapsed to **one** strip per WLED device on load and save.
- Restore still recreates skipped rows, merges missing WLED layout from **`devices/autosave_device.json`**, and avoids shrinking autosave when startup is partial. **Settings → WLED** keeps a stable device **id** per host when you save device settings.

#### LED timing when minimized to tray

- The native background frame pump (used when the window is hidden or unfocused) now ticks at **~100 Hz** to match the engine, and the duplicate JavaScript `setInterval` is skipped when that pump is active — reducing the FPS drop users saw after minimizing to the tray.

#### Workspace canvas tabs — device tree and component menu

- **Devices panel** — every layout component stays listed under its device and channel, even when it belongs to a **different canvas tab** than the one selected above the workspace. Hiding other tabs on the layout (eye on the tab strip) only affects the **Konva canvas**, not the tree. Rows on another tab show a subtle **left-edge marker**, softer name text, and the **canvas pill** (1, 2, …) for which tab owns the strip.
- **Identify** (canvas or tree) no longer wipes **LED Studio** brush colors on the layout — painted LEDs are restored when identify stops.
- **Right-click a component** on the canvas (or in the Devices tree): removed **Clear LED paint for this component** (still in **Settings → Colors → LED Studio**); **Lock layout** is renamed **Lock component**; **Move to canvas** opens a flyout submenu with all workspace tabs (current tab marked).

#### Scene bar, toolbar, and settings — Español and 简体中文

- The **Scene** label, **Save**, **Reload**, **Delete**, scene dropdown placeholder, and related tooltips and dialogs translate when you choose **Español** or **简体中文** in Settings.
- Layout toolbar buttons (align, distribute, flip, snap, grid, report, help, settings, and grid spacing) use translated **hover tooltips** in those languages.
- **Settings → User media folders** — action buttons no longer stack Chinese text vertically; intro, tabs, **删除**, and **重新扫描硬件** are fully localized.
- **Settings → System → Startup** help text uses **退出** / **关于** instead of English **Quit** / **About**; update copy no longer says **ZIP** alone.

## v0.2.68 — May 21, 2026

#### Light, dark, and system color scheme

- **Settings → App look → Color scheme** — choose **Dark**, **Light**, or **Match system** (follows Windows/macOS `prefers-color-scheme`).
- Light mode restyles panels, docks, toolbar, device tree, dialogs, and splash using shared design tokens; your **accent theme** (Toxic Viper, Electric Blue, etc.) still applies in both modes.
- Fixed light mode only changing the canvas area — shell colors now follow the same theme tokens as the rest of the UI.
- Light mode now also reaches the **settings sidebar**, **status bar**, **device tree** rows, **effect browser**, and other panels that still used hardcoded dark greys.
- **Light mode readability** — accent-colored labels use a darker “readable” mix so green/blue accents are not neon-on-white; Overview stats, hardware tables, and Matrix-style sidebar fields use light surfaces with dark text.
- **Light mode dropdowns** — language, scene, and other custom select menus use a light panel with dark text instead of the dark-theme list chrome.
- **Light mode contrast** — Effects panel transport icons, setting tabs, effect title/author, and device-tree visibility buttons use darker text and icons on light surfaces.
- **Settings → Hardware** — VID/PID hex values and table chevrons use dark text in light mode (no more pale cyan on white).
- **Help tooltips** — `?` hints no longer show raw `<strong>` / `<code>` tags; HTML in locale strings is converted to plain text for tooltips and `aria-label`s.
- **Light mode — Settings** — About card and update blocks use light surfaces; sidebar selection uses a stronger accent tint and left-edge marker so the active tab is easy to see.
- **Light mode — Help** — Help paragraphs, lists, and keyboard-shortcut tables use dark text on light rows (no dark shortcut column); `kbd` chips and help popovers match the light theme.
- **Light mode — Logs** — Log tail viewers use a light monospace panel with dark text; file tabs and Copy/Refresh buttons match other settings controls.
- **Light mode — Modals** — Setup wizard, confirm dialogs, Effect Browser, and Component Library use light surfaces, dark copy, and readable badges instead of dark-theme panels and toolbars.
- The choice is saved in app data and applied before the window paints to reduce a flash of the wrong scheme on startup.

#### Component Library

- **Filters** — Brand, type, LED count, and sort sit side by side under search; the LED count list includes every fixed count in the catalog plus **Dynamic length**.
- **LED layout thumbnails** — When a catalog entry has no product image (common for **CompGen** and other layout-only JSON), the grid shows a **rendered LED map** (dot positions from `LedCoordinates`) instead of the generic RGBJunkie logo. Entries with a real **ImageUrl** still use that artwork; failed downloads fall back to the layout render when possible.
- **Escape** closes the browser (same as **X**); if a rename/import prompt is open, **Escape** dismisses that prompt first.

#### Effect settings — consistent category tabs

- Controls grouped by **object name** from RGBJunkie builder exports (`Object 1: …`, `obj1_…`) now use the same **category tab** layout as effects that declare **`group="…"`** on each `<meta property>` (e.g. Fan Align). Builder rows no longer open a separate top-level **Object 1 / Object 2** tab bar; categories such as **Geometry**, **Stroke**, and **Fill-Animation** appear in the same icon tab row as other effects.

#### WLED — correct component after restart

- WLED channels no longer auto-load **Airgoo Neon DLS30** (or another random catalog strip with the same LED count). Pick your layout from the **Component Library** as before; that choice is kept when you restart the app or reload the scene.
- Scene autosave that still contains the old auto-spawned strip is upgraded to a neutral **Strip** layout on load. Deferred startup re-apply no longer tears down and rebuilds components (which was putting the old catalog strip back a few seconds after launch).

#### HID — fewer start/stop flickers when Windows churns USB paths

- Several HID devices no longer **pause for seconds, restart, then pause again** in a loop while the bus is stable. The USB watchdog used to treat every short-lived `hid_path` string change as a full hardware reload (dropping live frames, re-probing every plugin). It now compares **logical USB groups** (not raw path strings), waits for **two** consecutive peeks before closing stale handles, **coalesces** bursty plug-and-play notifications, and uses a **path-only heal** (repoint + re-init) instead of a full plugin scan when your devices are already bound.

#### Effect runtime log on the canvas

- Removed the accordion bar under the workspace; open the effect log with the **terminal** button in the **lower-right** corner of the canvas (Copy, Clear, and **Escape** to close).

#### Canvas maximize (effect preview fullscreen)

- A **fullscreen** control in the **top-right** of the layout canvas stretches only the **effect preview** to every pixel of the screen (layout wireframes and bleed margins hidden; aspect ratio is not preserved). Press **Escape** or click the button again to return. The control uses a frosted chip so it stays visible over bright effects.

#### In-app update check when latest.json fails

- If **releases/latest.json** on rgbjunkie.com errors (for example HTTP 500 while hashing a large portable ZIP), the app now shows the server message instead of failing silently on startup. The marketing site caches portable ZIP SHA-256 in a **`.sha256` sidecar** (uploaded with the ZIP) so the manifest stays fast and reliable.
- **Check for updates** tries both **www** and **non-www** manifest URLs and reports the real failure (native TLS vs in-app fetch) instead of a generic “could not reach the server” when the site works in your browser.
- Fixed update manifest validation rejecting valid **`downloadUrl`** links that include **`/RGBJunkieApp/downloads/portable/`** (native TLS check now matches the website manifest format).

#### In-app update download uses direct portable ZIP URL

- Auto-update now downloads the **direct** `downloadUrl` portable `.zip` from the manifest instead of **download.php** (tracked gateway), so a server error in optional Firestore logging cannot block the update. **download.php** logging failures are also caught on the server so website and gateway downloads still serve the file.
- After the ZIP passes SHA-256 verification, the app sends a lightweight **HEAD** request to **`trackedDownloadUrl`** (`download.php` with **`channel=app-update`**) so **/stats/downloads/** records in-app updates without downloading the file twice. Older builds that only used the direct URL did not appear in stats.
- **Marketing site** — server-side download logging works when PHP **openssl** is enabled (fixed a WAMP crash on `OPENSSL_ALGORITHM_SHA256`); failed writes are logged to PHP **error_log**. On localhost, **`/stats/test-server-log.php`** verifies Firestore writes.

#### Scene profiles and layout shell

- **Scene profiles** combine device layout and effect settings in one file under `profiles/scenes/`. The picker sits in a bar **above your workspace tabs** (center column), not in the Devices or Effects side panels. **Share effect settings** remains effect-only (no canvas data). Run `node scripts/merge-legacy-profiles-to-scenes.mjs` once to merge old `devices/` and `effects/` JSON on this PC.
- **Save** shows a brief confirmation in the bottom status bar as well as the toast, and the save button indicates when a write is in progress.
- **Loading a scene** now confirms success (or shows an error) instead of switching silently.
- Loading a scene with **multiple workspace canvases** starts the saved effect on **every** tab, not only the active one. **Keyboard layout follow** on inactive tabs now receives input and layout polling for that tab’s hidden runner (WebView2 no longer pauses those iframes).
- **Scene load** refreshes subdevice layout rows, rebinds components, and rebuilds the device tree. **Single-channel** devices with no canvas component get a default full-width strip on channel 0 so the active effect can reach the hardware again. **Output off** applies only for devices that are actually connected. `wled_devices.json` no longer appears in the Scene dropdown if it was copied into `profiles/scenes/` during migration.
- **Effects** and **Scene** use the **right column** with the same dock shell as **Devices**; **canvas tabs** sit centered above the workspace. Channel-colored dots appear on **channel rows only**, not the device summary row.
- **Toolbar** stays compact icon-only; the top bar scrolls horizontally if your window is narrow. **Grid** spacing opens in a fixed layer so the bar does not jump. **Browse effects** stays the main call-to-action without a continuous pulse animation.
- **Workspace tabs** show the **1–9** shortcut slot in brackets (e.g. **Main [1]**). New tabs added with **+** are kept when you switch away until you save or remove them. Switching tabs shows that canvas’s components without reloading the default layout from disk when both tabs use the **same** effect.
- **Device tree** — one **lock/unlock** toggle for the canvas; workspace picker uses **1–9** with flat icon styling; **Rescan** shows a spinning icon only (no “Scanning…” text).

#### Portable updates verify ZIP SHA-256 before install

In-app auto-update now requires **`portableZipSha256`** in the update manifest. After the portable ZIP downloads, RGBJunkie checks its SHA-256 before extracting (same idea as the pinned OpenRGB download). On **rgbjunkie.com**, **`releases/latest.json`** is generated by **`releases/latest.php`** on each request from the newest **`downloads/portable/RGBJunkie_*_x64-portable.zip`** on the server — upload the ZIP via **`build.bat`** / FTP; no static manifest file in the repo or build output.

#### Security: safer profile files, effect paths, and portable updates

- **Profile save/load** (`save_user_data` / `load_user_data`) now only accepts known folders (`scenes`, `effects`, `devices`, `cache`) and safe `.json` basenames — blocking path traversal outside `%APPDATA%\RGBJunkie\profiles\`.
- **Effect / plugin / component discovery** — the library scans, in order: your **`%APPDATA%\RGBJunkie\`** imports, then **folders next to `RGBJunkie.exe`** (and `resources\…` when present), then the **repo dev trees** (`effects/`, `plugins/`, `components/` from the project root when you run `tauri dev`). Settings imports still land only under AppData.
- **Effect files by path** and **Open in Explorer / editor** use the same allowlist (AppData user effects + bundled install effects).
- **Open folder** in Settings only opens **RGBJunkie AppData**, **bundled install** effects/plugins/components folders (next to the app), or **Documents\RGBJunkie Backups** — not arbitrary paths on your PC. Opening an effect’s folder from the browser still uses the effect path allowlist.
- **`local_http_request`** (WLED JSON over the Rust proxy) only connects to **loopback, private LAN, link-local, and CGNAT (100.64/10)** addresses — not the public internet — so a compromised webview cannot use RGBJunkie as an arbitrary HTTP client.
- **Tighter webview CSP and asset access** — removed the catch-all **`**`** asset scope (AppData, install dir, resources, and dev working tree only). **`connect-src`** no longer allows arbitrary `http:`/`https:`/`ws:` to the internet; LAN WLED HTTP stays on the Rust proxy. Allowed fetches are limited to rgbjunkie.com, assets, GitHub API (update fallback), effect CDNs, and local IPC/dev URLs.
- **Plugin and functional effect isolation** — device plugins no longer get the full Tauri **`invoke`** surface on **`globalThis.__rgbjInvoke`**; only **`local_http_request`** and **`wled_udp_send`** (WLED LAN path). User **`.mjs`** effects are scanned at load for forbidden APIs (`fetch`, dynamic `import`, `invoke`, DOM, etc.) before the host runs them. When your browser supports Workers, **`sampleLed`** runs in an **isolated Worker** (batch sampling per frame) so effect code cannot reach the main window or Tauri; if Worker init fails, the app falls back to the previous in-process import path.
- **Functional (.mjs) preview no longer flashes black** — the workspace effect preview is painted on an offscreen buffer while the Worker runs, then copied to the engine canvas in one step (hardware LEDs were already using the finished sample cache and looked fine).
- **Guest Tauri invoke deny list** — `globalThis.__TAURI__.core.invoke` is patched at startup so plugin/WLED guest code cannot call profile I/O, `open_folder`, portable update, arbitrary effect/plugin reads, etc. (host UI still uses the normal `@tauri-apps/api` `invoke` path). WLED shims no longer fall back to unrestricted `__TAURI__` invoke.
- **`rgbjunkie://` effect-settings links** — only `rgbjunkie://import…` (and equivalent empty-host forms) are accepted; gzip/JSON payloads are capped to block decompression bombs.
- **HTML effect iframe bridge** — effects receive a narrow read-only `window.engine` facade instead of a live reference to the host `rgbEngine` object. `appState` is no longer attached to `window` in production builds.
- **Device plugin source scan** — plugin `.js` bodies are rejected at load if they reference `__TAURI__`, `window.parent`, or `parent.appState` (escape hatches before `new Function` evaluation).
- **HTML effect source scan** — built-in and imported `.html` effects are checked at launch for Tauri/`invoke`/host-state escape patterns (network `fetch` to CDNs remains allowed).
- **Effect iframe sandbox** — workspace effect iframes use `sandbox="allow-scripts allow-same-origin"` and `referrerpolicy="no-referrer"`.
- **Maintainer: `npm run audit:security`** — scans `plugins/` and `effects/` for forbidden markers; CI **Security audit** workflow runs it with `npm audit` and `cargo audit`.
- **Plugin sandbox invoke allowlist** — `PluginSandbox` only calls a fixed set of HID/GPU/SMBus Tauri commands (not the full IPC table).
- **Update manifest validation (Rust)** — `fetch_app_update_manifest` rejects malformed JSON, bad versions, non-rgbjunkie URLs, or oversized fields before the UI parses the manifest.
- **Security overview** — see `docs/SECURITY.md` for a plain-language summary of controls and limits.
- **Portable auto-update** URLs must use host **`rgbjunkie.com`** or **`www.rgbjunkie.com`** (parsed hostname, not a substring). The in-app **Update** button only appears when the manifest points at a valid **`downloads/portable/*.zip`** on that domain.

#### In-app updates use tracked download.php URLs

Portable auto-updates on current builds download through **rgbjunkie.com/download.php** with **`channel=app-update`**, separate from website portable downloads (`channel=website` in the browser tracker). **`releases/latest.json`** keeps a **direct `.zip` URL** in **`downloadUrl`** so older installed versions can still apply updates; **`trackedDownloadUrl`** is used by newer builds for gateway downloads and stats. On the server, optional Firestore logging (service account in `download-stats-secret.php`) records app-update downloads; the stats page shows a **Channel** column.

#### In-app update showed “Unavailable” after publishing latest.json

If **`downloadUrl`** was only a **download.php** link, builds before gateway support treated the update as not installable (button **Unavailable**). Republish **`latest.json`** with a direct portable **`.zip`** in **`downloadUrl`** (and optional **`trackedDownloadUrl`** for tracking).

#### Scene profiles: removed components stay removed when you reload

Loading a **saved scene** (for example **Audio Party**) no longer pulls extra strips and fans back in from old **`profiles/devices/autosave_device.json`**. That legacy merge still runs on **startup autosave** when the scene file was damaged or truncated, but a scene you saved after deleting a component is now the source of truth.

#### Workspace toolbar: snap and grid toggles show when they are on

**Snap Grid**, **Snap Edges**, **Snap Center**, and **Show Grid** now get a visible pressed state (accent highlight) in the Windows minimal theme. The toggles were saving and working; only the on-state styling was missing because flat toolbar buttons use `!important` backgrounds that overrode the older active style.

#### rgbjunkie.com gallery effects render again

Effects downloaded from the site often call **`engine.getSensorValue()`** (Effect Builder export). The desktop app now implements that API on top of LibreHardwareMonitor readings, with a safe animated fallback when a sensor name is missing or LHM is still starting — so gallery effects no longer crash on launch with a blank canvas.

#### Functional (.mjs) effects: preview grid and thumbnails

The engine canvas preview for **`.mjs`** effects now maps each preview cell’s **`ledIndex`** along the **horizontal strip** (same as real LED sampling), instead of a diagonal mix of X and Y — so patterns like **Euclidean Beats**, **Morse Stream**, **VU Meter**, and **Palindrome Symmetry** look correct on the workspace and in generated catalog PNGs. Thumbnail generation also simulates **`audio.level`** and **`audio.density`** so level-meter and sound-reactive previews are not stuck dark.

#### Maintainer: dependency security audits in CI

GitHub Actions workflow **Security audit** runs **`npm audit`** (prod + dev, high severity and above) and **`cargo audit`** on **`src-tauri`** when dependencies or core security code change. Run the same locally before release: `npm audit` and `cargo install cargo-audit && cargo audit` (in `src-tauri`).

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

#### Escape closes more overlays

**Escape** dismisses the **initial setup wizard** and **plugin device settings** modal (same as their close buttons). The **custom strip / rename prompt** cancels on **Escape** even when focus is not in the text field. Existing behavior is unchanged for **Settings**, **Browse effects**, **Component Library**, confirm dialogs, and maximized canvas view.

#### Effect settings: category tabs

Effects that declare `group=` on each control (for example **Fan Align**) now use **one row of category tabs** (Layout, Colors, Pattern, …) like **Audio Party**, instead of turning `Label: Setting` prefixes into separate top-level tabs with an empty **General** panel.

#### Devices: Elgato Stream Deck

**Stream Deck Plus** (`0x0FD9` / `0x0084`) is detected again — the host wires **`Size()`** before the plugin reads canvas dimensions. Five Stream Deck scripts from the SRGBmods **Corsair-Elgato** pack ship under **`plugins/Corsair-Elgato/`** (MK.2, XL, original, Mini, Plus). **Stream Deck Neo** stays in **`plugins/Elgato/`**.

#### Settings, Help, and accents

**Settings → Help** (all languages) documents Scene profiles, canvas maximize, expanded **Escape** behavior, the setup wizard, Component Library thumbnails, and the refreshed Devices/Effects layout. The rgbjunkie.com documentation page adds an end-user guide; run **`npm run changelog:sync-wamp`** after editing this file so the site changelog matches.

**Settings → About** uses a clearer hero (version pill), grouped **Updates** and **Legal**, and flat buttons consistent with the rest of the app.

**Crimson Pulse** is a deeper true red and **Rose Neon** a brighter fuchsia-pink so the two accent presets are easier to tell apart with mild red–green confusion.

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
