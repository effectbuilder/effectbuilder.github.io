# RGBJunkie for Windows — What's new

Plain-language release notes for the desktop app. Newest changes are listed first.

**Version tags:** Start each release with `## v0.2.48 — May 18, 2026` (semver + date). The website, in-app update dialog, and `releases/latest.json` link to that section. `build.bat` adds a stub heading automatically when the version is bumped.

---

## v0.2.48 — May 18, 2026

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
