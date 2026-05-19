# RGBJunkie for Windows — What's new

Plain-language release notes for the desktop app. Newest changes are listed first.

**Version tags:** Start each release with `## v0.2.48 — May 18, 2026` (semver + date). The website, in-app update dialog, and `releases/latest.json` link to that section. `build.bat` adds a stub heading automatically when the version is bumped.

## v0.2.56 — May 18, 2026

*(Add release notes for v0.2.56.)*

## v0.2.58 — May 19, 2026

#### Desktop shell: no browser right-click menu or Find (Ctrl+F)

The embedded WebView no longer shows the **Edge-style default context menu** (Back, Refresh, Inspect, etc.) when you right-click outside RGBJunkie’s own menus. **Ctrl+F** / **F3** Find on page, **Ctrl+P** print, **Ctrl+R** / **F5** reload, and **Ctrl+Plus/Minus** zoom are disabled so the app feels like a desktop tool, not a browser tab. Your **canvas and component right-click menus** (move, copy preview, component actions) are unchanged — those are part of RGBJunkie. Developer builds can still open WebView tools from the tray when the **devtools** feature is enabled.

## v0.2.60 — May 19, 2026

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

*(Add release notes for v0.2.64.)*

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
