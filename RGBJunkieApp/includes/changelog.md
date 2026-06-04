# RGBJunkie for Windows — What's new

Plain-language release notes for the desktop app. Newest changes are listed first.

**Version tags:** Headings use semver and date (for example **v0.2.48 — May 18, 2026**). The website and in-app update dialog link to these notes.

## v0.3.49 — June 3, 2026

#### Wallpaper Engine + Lively Wallpaper

- **Lively bridge stays smooth during long sessions** — the companion no longer rebuilds the full LED frame on every poll when nothing changed, so FPS on the Lively page stays steady after hours of use. Restart RGBJunkie once after updating so **rgbj-lively-bridge-4** replaces an older bridge.

---

## v0.3.48 — June 3, 2026

#### Updates

- **Minor reliability fixes** — small improvements so installs and in-app updates keep working smoothly.

---

## v0.3.47 — June 3, 2026

#### Effects

- **Aurora Borealis uses your full color profile** — choosing a profile in **Color Profile** (not **Custom**) now maps every stop in that gradient, including **Rainbow** and multi-stop presets like **Cyber** or **Sunset**, and those colors **drift with the curtains** instead of staying locked to fixed horizontal bands.

---

## v0.3.46 — June 3, 2026

#### Startup

- **Open at login works on Windows again** — RGBJunkie runs with administrator rights for USB and RAM lighting, so the old startup registry entry often never launched the app. Login startup now uses a Windows scheduled task (refreshed every time you open RGBJunkie) so the app starts when you sign in to Windows.
- **Update check starts with the app** — when **Settings → System → Startup → Check for updates on startup** is on, RGBJunkie begins loading the update manifest as soon as the program starts (before plugins and devices) and shows the result on the splash screen while the rest of startup continues.

---

## v0.3.45 — June 3, 2026

#### Wallpaper Engine + Lively Wallpaper

- **Cover / diffuser image stays visible when RGBJunkie starts** — the Lively page no longer wipes cover art when `frame.json` briefly has empty settings; the bridge keeps your cover path in JSON before the LED grid is ready; settings UDP is sent every effect frame (deduped) before colors. The diffuser stays a full-screen image on top of the opaque LED canvas.
- **Blur, LED shape, padding, and corner radius apply live in Lively** — LEDs render on the bottom canvas (z-index 0); your transparent cover PNG stays on top (z-index 999). Changing those Wallpaper settings forces a fresh UDP settings packet so `frame.json` updates immediately.
- **Show FPS moves to the top-right** — the Lively wallpaper FPS readout no longer sits in the top-left corner.
- **Blur and rounded LEDs in Lively look correct** — the LED canvas is fully opaque (background color plus solid LED cells); your transparent cover PNG stays on top. Shaped drawing, rounded corners, and blur apply to that solid grid.
- **LED Shape draws rectangles or circles in Lively** — **Rectangle** fills square cells; **Circle** (or legacy **Sphere**) draws round dots with even spacing; **Rounded Rectangle** uses the corner-radius slider. The matrix keeps square pixels on your monitor so circles are not stretched into vertical bars.

#### Installers and portable ZIP

- **Legacy SignalRGB shim removed from installs** — the old **SignalRgb.exe** helper under **runtime/wallpaper** is no longer included in the installer or portable ZIP (RGBJunkie uses **RGBJunkieLivelyBridge.exe** for Lively Wallpaper instead).

---

## v0.3.44 — June 3, 2026

*(Add release notes for v0.3.44.)*

---

## v0.3.43 — June 3, 2026

#### Wallpaper Engine + Lively Wallpaper

- **21:9 and other aspect ratios no longer show a scrambled grid in Lively** — Wallpaper now sends the full LED frame for the selected grid (not a leftover 48×27 slice), and Lively waits until every color cell is ready before drawing, so **63×27** in `frame.json` matches what you see on screen.
- **Each release rebuilds the Lively bridge for the installer** — version bumps (for example 0.3.42 → 0.3.43) no longer reuse an old **RGBJunkieLivelyBridge.exe** sitting in the build folder, so auto-update and portable ZIPs ship the bridge built with that release.

---

## v0.3.42 — June 3, 2026

*(Add release notes for v0.3.42.)*

---

## v0.3.41 — June 3, 2026

#### Wallpaper Engine + Lively Wallpaper

- **Installer and portable ZIP include the new Lively bridge** — release builds now compile **RGBJunkieLivelyBridge.exe** (release) before packaging, so auto-update and fresh installs ship **rgbj-lively-bridge-3** with **http://127.0.0.1:8138/meta.json**, not an old copy left in the build folder.

---

## v0.3.40 — June 3, 2026

#### Wallpaper Engine + Lively Wallpaper

- **Outdated Lively bridge is replaced automatically** — If **http://127.0.0.1:8138/meta.json** was missing (old **rgbj-lively-bridge-2** still running), RGBJunkie now stops it and starts **rgbj-lively-bridge-3**. Fully quit the app if Task Manager still shows an old **RGBJunkieLivelyBridge.exe**, then run **`npm run bridge:build`** and start RGBJunkie again.
- **Clearer logs for Lively vs Steam** — startup messages now say when **RGBJunkieLivelyBridge** is your Lively companion versus when UDP 8133/8134 is only Steam’s workshop wallpaper. The log also shows which **RGBJunkieLivelyBridge.exe** path was started (often under **Program Files\\RGBJunkie\\runtime\\wallpaper**).
- **Aspect ratio, cover image, and Show FPS** — fixes from the prior release now apply once the new bridge is running; reload the Lively Website wallpaper after updating.

---

## v0.3.39 — June 3, 2026

*(Add release notes for v0.3.39.)*

---

## v0.3.38 — June 3, 2026

#### Wallpaper Engine + Lively Wallpaper

- **Full Wallpaper settings in Lively** — the Lively Website wallpaper now matches the Wallpaper Engine plugin: diffuser **cover image** (local file or URL), stretch modes, LED **shape** (rectangle, rounded, sphere), **padding**, **corner radius**, **blur**, **background** color, and **Show FPS**. Local cover images are served by the bridge so the browser can load them safely.
- **Aspect ratio and display size** — changing the Wallpaper grid size no longer scrambles the LED pattern; the bridge clears and resizes its buffer when the layout changes, and the Lively page follows the new width and height.
- **Show FPS and cover image fixes** — the FPS overlay updates live when you turn it on, and cover art loads through the bridge (including local files you pick in Settings).

---

## v0.3.37 — June 3, 2026

*(Add release notes for v0.3.37.)*

---

## v0.3.36 — June 3, 2026

#### Wallpaper Engine + Lively Wallpaper

- **Two Wallpaper devices, two Lively pages** — RGBJunkie loads **Wallpaper Engine 2** (UDP **8133**) and **Wallpaper Engine 2 (2nd Screen)** (UDP **8134**). Each device is locked to its own UDP port (they no longer share **127.0.0.1** routing). The bundled bridge keeps separate streams: monitor 1 → **`http://127.0.0.1:8138/`**, monitor 2 → **`http://127.0.0.1:8139/`**. For one display only, set `"wallpaperEngineDualMonitor": false` in **media_sources.json**.

---

## v0.3.35 — June 3, 2026

*(Add release notes for v0.3.35.)*

---

## v0.3.34 — June 3, 2026

*(Add release notes for v0.3.34.)*

---

## v0.3.33 — June 2, 2026

*(Add release notes for v0.3.33.)*

---

## v0.3.32 — June 2, 2026

#### Wallpaper Engine + Lively Wallpaper

- **Lively Wallpaper support** — RGBJunkie can run a small bundled bridge that listens for the Wallpaper Engine 2 virtual device (same UDP ports as the Steam workshop wallpaper) and drives an **HTML LED matrix** in Lively. RGBJunkie starts the bridge when the Wallpaper plugin loads and port 8133 is free. In Lively, add a **Website** wallpaper at **`http://127.0.0.1:8138/`** (port **8137** was an early test build that returned JSON on `/`).
- **Lively matrix smoother** — the bridge wallpaper fills your monitor edge-to-edge (no letterboxing that jumped in Lively), one canvas upload per real frame, and it freezes when you pause the effect in RGBJunkie.
- **Steam Wallpaper Engine unchanged** — if the workshop companion is already listening on UDP 8133 or 8134, RGBJunkie leaves it alone and keeps sending frames there as before.

---

## v0.3.31 — June 1, 2026

#### Wallpaper Engine plugin

- **Canvas tab stays put when you change settings** — changing any Wallpaper Engine option (blur, aspect ratio, cover image, and so on) no longer jumps the virtual device layout back to your first workspace canvas.
- **Virtual matrix stays on the canvas you chose** — the Wallpaper Engine layout grid no longer disappears when you tweak settings on another workspace tab; RGBJunkie only re-applies saved positions when the LED grid size actually changes.

---

## v0.3.30 — May 31, 2026

#### Audio-reactive effects

- **Developer docs (rgbjunkie.com)** — the **HTML canvas** and **functional (.mjs)** API guides now document **stereo audio**: `freqL` / `freqR`, per-channel loudness, `pan`, and the `stereo` flag, with safe mono fallback examples. Section 6 is rewritten in plain language (audio, stereo, screen, sensors) with quick links instead of one dense table.
- **Stereo Ring Spectrum** — removed on-screen **L / R** labels; **Layout** adds **Stereo Ring**, **Stereo Bars**, **Dual Arc**, **Mirror Ring**, **Bloom Orbit**, and **Mono Circle**. **Stereo Bars** and **Dual Arc** flip the left channel so bass sits at the top like the right; **Bloom Orbit** left-side blooms use the same flip. **Dual Arc** keeps thick arc segments at any band count (default 64 no longer collapses into dots). **Bass band share** now maps the top of the ring to low-end bins by arc length (lower values shrink the bass region; higher values spread it). **Frequency map** (**Log** / **Linear**) chooses logarithmic or linear bin spacing along the ring. **Low clip** and **High clip** drop FFT bins outside the range and remap the ring to what remains.
- **Functional effects (on-screen preview)** — the workspace canvas no longer wipes to black while each frame is still being calculated; the previous frame stays visible until the new one is ready (fixes on-screen flicker).
- **Stereo Spectrum Bands (.mjs)** — **Input gain** now actually scales sensitivity (low values no longer fill the whole strip). **Smoothing** at 0 is instant; higher values slow the fall and rise. **Scroll** shifts the analyzer along the strip again.
- **Stereo spectrum visualizer** — new **Stereo Spectrum** effect in the gallery: left and right channels shown side by side (split bars, mirror wings, pan scope, or dual orbit). Uses the new stereo audio data when Windows captures stereo playback; mono still works with both channels matched. Brighter defaults; **Bands per channel** no longer wipes the meter when you change it; brief audio dropouts fade smoothly instead of snapping to empty.
- **Stereo spectrum for new effects, same mono mix for old ones** — `engine.audio.freq`, `level`, and `density` still come from the overall (mono) mix, so existing audio-reactive effects behave exactly as before. When Windows captures stereo playback, effects can also read **`freqL`**, **`freqR`**, per-channel loudness, and **`pan`** (−1 left … +1 right) for left/right visuals.

#### Fan Tracer Pro Max

- **Rails use one serpentine path** — both fan rows act as a single animation path: row 1 runs left→right, row 2 runs right→left, meeting at the junction. The dot head moves onto row 2 right away; the row 1 trail keeps fading without leaving a second head behind. Each row keeps its own trail so motion stays smooth across the junction.
- **Rail dot matches trail thickness** — the moving head on the rails is the same height as the trail line, not a taller block.
- **Bounce return tail** — on Bounce, the left-moving return trail and the right-moving outbound trail use separate paths, so when the return tail finishes fading the new outbound trail stays put. At each turnaround the old leg’s head is dropped so it does not stay behind as a stuck dot.
- **Collide (Loop) on rails** — two dots meet at the junction between rows, move apart (one toward row 1’s left, one toward row 2’s right), then come back together smoothly each cycle instead of snapping on the loop wrap. Inward and outward legs keep separate fading trails so the tail does not reset when direction changes.
- **Loop (Rev) on rails** — dots travel the serpentine path backward (row 2 toward row 1) instead of matching plain Loop.
- **Solid Line Spinner + VU Meter rails** — with Circle style set to Solid Line Spinner, each fan ring spins when the audio meter on the rails reaches that fan (top and bottom rows, including VU Meter (Rev)).
- **VU Meter rails use stereo when available** — with **Rails → Style** set to **VU Meter** or **VU Meter (Rev)**, the top fan row follows the left channel and the bottom row follows the right when Windows captures stereo playback; mono mixes still drive both rows together.
- **VU Meter (Row 2 Rev)** — **Rails → Style** adds **VU Meter (Row 2 Rev)**: the top row fills left→right as usual; the bottom row fills right→left (handy when the second row’s LEDs run the opposite direction on your build).
- **Global Audio Sensitivity drives VU meters** — **Audio → Global Audio Sensitivity** now scales rail and tube/stick VU meter height the same way as the rest of the effect (including stereo left/right rails).
- **Sparkle rails fixed** — Sparkle no longer crashes the effect when rails are enabled.
- **Solid Line Spinner fan style** — under **Circle → Style**, **Solid Line Spinner** draws a full gradient ring on each fan. When a rail dot passes that fan (using your **Rails** style and speed), the ring spins and coasts to a stop — same spin direction on the return pass as on the way out. **Circle → Speed** and **Rails → Speed** control how hard each pass spins and how fast it slows down.
- **Random gradient per fan** — under **Circle**, turn on **Random gradient per fan** so each fan ring picks its own spot on the Color Profile instead of marching across the row in order.

#### Documentation

- **App deep link reference on rgbjunkie.com** — **Documentation → App deep links** is its own page with every supported `rgbjunkie://` URL and matching website handoff links, laid out for easy copying into Stream Deck, batch files, or bookmarks.

#### Effect settings

- **Sliders drag reliably again** — after scrolling the effect settings panel, sticky tab rows no longer sit on top of sliders and swallow your clicks; drags also stay on the slider instead of turning into scroll.

---

## v0.3.29 — May 31, 2026

#### Updates

- **Analog Dream: Custom color profile works again** — choosing **Custom** under Color Profile (or the Custom palette) no longer washed the whole effect white; it now uses your three custom color pickers as intended.
- **Effect links from rgbjunkie.com stay applied** — opening a share link such as **Analog Dream** (website handoff or `rgbjunkie://effect/apply/…`) switched to that effect for a moment, then snapped back to your last autosaved scene. The link now wins over the saved scene, and your choice is autosaved so it stays put.
- **Sensor effects just work — no more digging through LibreHardwareMonitor menus** — when an effect needs CPU/GPU/temperature readings, RGBJunkie now turns on LibreHardwareMonitor's data server for you. Its own bundled copy starts that server automatically, and if you're running your own copy with the server switched off, a one-click **"Turn on sensor server"** button (shown in the sensor picker) restarts it with the server enabled while keeping all your other LibreHardwareMonitor settings. If your copy runs as administrator and RGBJunkie can't manage it, it tells you how to enable it yourself (Options → Remote web server → Run).
- **Lights no longer freeze when the sensor helper isn't responding** — if LibreHardwareMonitor was running but its built-in web server was turned off (or still starting), the app kept trying to read sensors every fraction of a second, and each try stalled for up to ~2 seconds waiting on the dead connection. That stall briefly held up *all* LED updates, so every device froze on a steady ~2-second beat — even effects that don't use CPU/GPU readings at all. The app now gives up on an unreachable sensor server almost instantly and quietly slows its retries until the server comes back, so your lights keep running smoothly. (If you do want live CPU/GPU/temperature effects, enable **Options → Remote web server → Run** inside LibreHardwareMonitor.)
- **Lights no longer freeze every few seconds** — the routine "is a device still plugged in?" background check was quietly running a full USB scan on every pass. With many devices connected, that scan briefly tied up the USB lanes and froze *every* strip at once for a second or two, over and over. The check now reuses what it already knows and only does a full scan when Windows actually reports a device was plugged in or unplugged, so your lights keep moving smoothly even with a lot of hardware connected.
- **No flashing console during automatic update** — the install helper no longer opens a **timeout** window every second while waiting for RGBJunkie to close; delays run hidden in the background instead.
- **Install-from-link pauses your lights briefly** — opening a Git plugin link pauses LED output only while new plugins are probed on the USB bus, so your other strips keep running smoothly during download and rescan.
- **Wallpaper Engine goes away when you remove the plugin** — uninstalling the Wallpaper Engine plugin from **Settings → Installed** now removes its two virtual devices from the device tree right away instead of leaving them until you restart the app. Turning off or removing the Git repo does the same.
- **Wallpaper Engine stays off after you remove it** — the app remembers when you uninstall the plugin so duplicate copies on disk cannot bring the two virtual devices back until you install the plugin again.
- **Git Wallpaper Engine uninstall is complete** — turning off or removing the Wallpaper Engine Git repo now deletes its whole plugin folder (not only tracked files), clears the two virtual devices immediately, and blocks leftover copies from coming back on rescan.
- **Effect details show the cover art** — the selected effect’s name area now uses its thumbnail as a softly dimmed background so you can recognize it at a glance.
- **Smoother strip updates again** — when **Settings → System → Engine → Maximum device FPS** is above 60, lights now use the fast hardware path even if one device (such as WLED) asks for a slower refresh. Before, a single slow plugin could cap every USB strip at ~60 Hz while the UI still felt fine.
- **Bundled sensor helpers start correctly** — LibreHardwareMonitor and OpenRGB no longer fail to launch with a PowerShell **LiteralPath** error on Windows.
- **App opens even when the online effect list is slow** — the splash screen dismisses before rgbjunkie.com downloads finish, and restoring a saved gallery effect no longer freezes the whole window while the effect file loads.
- **Gallery effects no longer freeze the app** — the effect browser opens right away with your local list, online thumbnails load only as you scroll, and switching to another effect is not blocked by a slow rgbjunkie.com download.
- **Gallery cover art at the top of the list loads** — the first row of effect thumbnails from rgbjunkie.com now appears as soon as you open the browser, not only after you scroll.
- **Selecting a gallery effect works reliably** — picking an rgbjunkie.com effect now downloads and runs it instead of freezing the app when the effect list and dropdown were out of sync.
- **rgbjunkie.com gallery effects run like built-in ones again** — gallery effects now use the exact same launch, animation, and hardware path as your local effects. The only difference is the one-time **effect.json** download; everything after that is identical, so the lights respond the same way they do for built-in effects.
- **Gallery effects stay smooth while running** — rgbjunkie.com exports ship with sensor helper code even when the effect does not use CPU/GPU readings; the app no longer starts LibreHardwareMonitor polling for that boilerplate (which caused ~half-second LED stutters). Built-in effects were never affected.
- **Gallery effects skip disk hot-reload** — no file-watcher checks for online effects that only live in memory.
- **Built-in effect cover art shows again** — thumbnails and images bundled with your local effects load correctly in the effect browser (WebView2 blocked the secure asset URL the app uses for those files).
- **One LibreHardwareMonitor helper, not dozens** — RGBJunkie no longer starts a new sensor helper every time an effect polls before readings are ready; it reuses the bundled copy that is already running and waits less time before your lights start.
- **Extra workspace canvases animate again** — when you use more than one workspace tab (for example **Canvas 1**), each tab’s effect now keeps moving on its LEDs instead of staying frozen on the first frame.
- **Two workspace tabs no longer make effects stutter** — running an effect on a second workspace tab used to make your main effect work for half a second, freeze for half a second, and repeat. Each tab now reads its lights only once per update instead of reading the active tab twice, so a heavy gallery effect stays smooth even with another canvas open.
- **Effects stay smooth when you click away from the app** — clicking another program used to make a busy effect (and the whole RGBJunkie window) stutter, because the app switched to its background "keep the lights moving" mode the moment it lost focus. Now that high-speed background mode only kicks in when the window is actually minimized or hidden in the tray, so an effect you can still see on screen keeps running smoothly even when another app is in front.
- **Audio Sine and Audio Star work again** — both audio effects draw to the canvas correctly instead of staying black after an incomplete port update.
- **Audio Sine moves smoothly with the music** — the wave no longer jumps on every spectrum refresh; frequency bars ease in quickly and fall off gently between updates. The wave also keeps a gentle idle scroll and color drift when quiet, and no longer freezes on the first frame.

---

## v0.3.26 — May 31, 2026

#### Setup wizard

- **Wizard breathing fades to off** — each channel’s preview color now breathes from fully off to full brightness so it is easier to spot on your desk.
- **One channel at a time while picking a component** — when you choose a color from the list, only that channel keeps breathing; every other channel (including on high-speed controllers) is forced to black until you finish or go back.
- **Workspace goes black during setup** — while the wizard is open, your current effect pauses and the canvas stays black so only the hardware breathing colors stand out.
- **Longer wizard preview on each strip** — the breathing preview now lights up to **200** LEDs on a channel so longer strips are easier to spot.
- **Wizard colors match their names** — red is **#FF0000**, green **#00FF00**, blue **#0000FF**, and the rest of the list uses saturated values sent to your strips as-is (no soft tints like **#FF3333**).

---

## v0.3.24 — May 31, 2026

#### Updates

- **Automatic update opens RGBJunkie again** — after files copy, the updater relaunches the app with a small restart helper (no PowerShell). If the first launch does not stick, a background watcher tries again so the window comes back instead of staying closed.

---

## v0.3.17 — May 31, 2026

#### Setup wizard

- **Setup wizard stays responsive** — the initial setup wizard no longer slows the whole window while channels breathe. It skips heavy canvas work, lights only a short preview segment on each strip, and turns off other channels once instead of every frame.

#### Updates

- **Automatic update restarts RGBJunkie again** — after files copy, the updater relaunches the app with plain **cmd start**, trying **RGBJunkie.exe**, the exe that was running during the update, then the legacy **rgbjunkie-led-controller.exe** name from older installs.
- **No stuck console window during update** — the install helper no longer uses **find** / **findstr** pipes that could leave a blank command window open while waiting for the app to exit.

---

## v0.3.16 — May 31, 2026

#### Updates

- **Auto-update runs the install helper again** — the background updater now starts reliably (including under **Program Files**, where Windows may ask for admin approval after RGBJunkie closes), copies the new files, and opens RGBJunkie again instead of stopping at “Restarting…”.

#### App links

- **Website handoff opens RGBJunkie automatically again** — share links on **rgbjunkie.com** redirect to the app on load (no extra click). The fallback **Open RGBJunkie** button is still there if the browser blocks the redirect.
- **Copy link icons stay subtle** — small chain icons on **Settings** tabs, the **Scene** bar, **Effect browser**, active effects, and **Git** repos in **Installed** stay hidden until you hover that row or header. Release builds copy a **rgbjunkie.com** share link; while developing from source, the same buttons copy an **rgbjunkie://** link so testing does not launch a second copy from **Program Files**.
- **Share links encode paths correctly** — re-copy links after updating; older ones used slashes that some servers rejected as a bad request.

---

## v0.3.15 — May 30, 2026

#### App links (web and desktop)

- **Install plugins from a link** — open a GitHub or GitLab repo in RGBJunkie from a website button or bookmark, similar to SignalRGB addon links. Example: `https://www.rgbjunkie.com/RGBJunkieApp/s?p=addon/install&url=https://github.com/qiangqiang101/SignalRGB-Wallpaper-Engine`
- **Jump to settings, effects, or scenes** — `rgbjunkie://` links can open **Settings** tabs, the effect browser, or load a saved scene by name. Use `silent=1` or `-silentlaunch-` to run an action without restoring the window from the tray.
- **Batch and Stream Deck friendly** — use `start rgbjunkie://…` on Windows; `%20` encodes spaces in effect and scene names.
- **Copy link buttons** — a small link icon on settings tabs, the effect browser, scenes, Git repos, and effects copies the matching shortcut to your clipboard.

#### Wallpaper Engine 2

- **Second screen wakes up on its own** — RGBJunkie now watches **8133** (main) and **8134** (second monitor) separately. When the second-screen workshop wallpaper starts after RGBJunkie, settings and colors are sent again without toggling a slider.
- **Clearer setup messages** — startup logs name each UDP port (main vs 2nd screen) and point to the correct Steam workshop item when a companion is missing on one monitor.
- **Browse for cover image without freezing lights** — opening **Browse…** for **Cover Image** no longer stops LED updates while the Windows file picker is open.

---

## v0.3.14 — May 30, 2026

#### Installer

- **Windows setup builds reliably again** — fixed NSIS packaging for the step that stops the bundled sensor helper before files are replaced, so the setup `.exe` ships with the **v0.3.12** install fix.

---

## v0.3.13 — May 30, 2026

#### Updates

- **Portable auto-update helper runs** — **Install update automatically** no longer stops with “Windows cannot find … apply-update.cmd”. The helper now starts through PowerShell `Start-Process` instead of fragile `cmd start` quoting.

---

## v0.3.12 — May 30, 2026

#### Installer

- **Setup can finish while the sensor helper was running** — the Windows installer now closes RGBJunkie and the **bundled** LibreHardwareMonitor copy under `runtime/lhm` before it replaces files. Your own separate LibreHardwareMonitor install is not stopped.

---

## v0.3.11 — May 30, 2026

#### Updates

- **Auto-update respects your LibreHardwareMonitor** — the portable updater stops only the **bundled** copy under `runtime/lhm`, not a separate LibreHardwareMonitor install you already run.
- **Safer handoff when updating** — RGBJunkie pauses briefly after starting the update helper so Windows does not cancel it when the app closes.

---

## v0.3.10 — May 30, 2026

#### Updates

- **Automatic update starts again on Windows** — the portable updater no longer fails with “Windows cannot find … apply-update.cmd” when you choose **Install update automatically** (launch uses PowerShell instead of fragile `cmd start` quoting).

#### Hardware sensors (LibreHardwareMonitor)

- **Your own LibreHardwareMonitor install works** — if you already run LibreHardwareMonitor with **Options → Remote web server → Run** (port 8085), RGBJunkie uses it for effect sensors and does **not** start a second copy from `runtime/lhm`. Updates only stop the **bundled** helper under the RGBJunkie install folder, not your separate install.
- **Sensor helper stays in the background** — when RGBJunkie does start the bundled copy, its main window no longer pops up on screen (it still runs in the background for readings).
- **Setup hints only when you need sensors** — reminders to turn on **Remote web server** in LibreHardwareMonitor show up when a sensor effect is running or you open the sensor picker, and only while readings are not available yet — not at every app start.

---

## v0.3.9 — May 30, 2026

#### Updates

- **Automatic update opens RGBJunkie again** — when **Install update automatically** applies a portable or AppImage update, RGBJunkie now closes, replaces its files, and **starts the new version** instead of leaving the app shut down. The updater also stops the bundled **LibreHardwareMonitor** helper so locked sensor files no longer block the copy step, runs with admin rights when RGBJunkie is elevated (needed under **Program Files**), and still relaunches the app even if a few locked files could not be replaced.

---

## v0.3.8 — May 29, 2026

#### Serial (COM) devices

- **COM port scan works again** — hardware rescan can list USB serial devices without `serial_list_ports not found` in the log.

#### Wallpaper Engine 2

- **Second monitor in the log** — RGBJunkie now reports whether the workshop companion is listening on **8133** (main screen) and **8134** (second screen), and resyncs when the second companion comes online later.

---

## v0.3.7 — May 29, 2026

#### Wallpaper Engine 2

- **Browse for cover image** — **Cover Image** in Wallpaper Engine plugin settings now has a **Browse…** button so you can pick a PNG or JPG from your PC instead of typing the full path. You can still paste a URL in the field.
- **Saved settings stick on startup** — Wallpaper Engine plugin sliders (aspect ratio, display size, cover image, etc.) are restored from your scene/profile **before** RGBJunkie sends the setup packet to the workshop companion, so a restart or update no longer pushes defaults to the desk matrix first.

---

## v0.3.6 — May 29, 2026

#### Updates (portable Windows)

- **Auto-update restarts after the exe rename** — the portable updater now waits for and closes **`rgbjunkie-led-controller.exe`** as well as **RGBJunkie.exe**, then launches **RGBJunkie.exe** after the update (and removes the old dev-style exe when present). Updating from an older build no longer leaves the app closed when the process name changed.

---

## v0.3.5 — May 29, 2026

RGBJunkie **0.3.5** improves **Wallpaper Engine 2** companion setup (no SignalRGB helper, correct process name, Git install path) and keeps **Git repository** downloads organized in per-repo folders.

#### Wallpaper Engine 2

- **Official Git repo install** — RGBJunkie now recognizes **Wallpaper_Engine_RGBJunkie.js** from **Settings → Installed → Git repositories** (the upstream RGBJunkie-Wallpaper-Engine folder), not only the older manual path `Network/Wallpaper/Wallpaper_Engine.js`.
- **Second monitor uses its own port** — the main desk matrix talks to **127.0.0.1:8133**; a second screen uses **8134** and needs the separate **second-screen** SignalRGB Wallpaper Engine workshop wallpaper on that monitor (not the main-screen one).
- **No SignalRGB helper required** — the workshop companion now detects RGBJunkie directly (looks for a **RGBJunkie** process), so RGBJunkie no longer starts a bundled `SignalRgb.exe` helper. Dev and release builds now run as **RGBJunkie.exe** so the companion can see the app (older dev builds used `rgbjunkie-led-controller.exe`, which the companion did not recognize).
- **Smoother desk preview** — color packets are sent in order as one frame, setup is not resent every few seconds (that was reloading the cover image and causing flicker), and a gentle keepalive prevents brief black flashes when the engine hiccups.
- **Nollie32 stays smooth with Wallpaper Engine on** — the wallpaper plugin slows to **45 fps** while a Nollie-class strip is active so USB lighting keeps priority.

#### Settings → Installed → Git repositories

- **Each repo in its own folder** — plugins and components downloaded from Git now land under **`owner/repo/`** in your user folder (for example `qiangqiang101/SignalRGB-Wallpaper-Engine/RGBJunkie-Wallpaper-Engine/Wallpaper_Engine_RGBJunkie.js`), keeping subfolders from the repository instead of dumping files at the plugins root. Re-downloading a repo replaces its previous files.

---

## v0.3.4 — May 29, 2026

#### Maximized effect preview

- **Cleaner fullscreen canvas** — zoom hints and other tooltips no longer pop up when you move the mouse over a maximized preview.
- **Effect log hidden while maximized** — the runtime log button stays out of the way until you exit maximized mode.
- **Exit control fades in on movement** — the exit-maximize button hides while you watch the effect and fades back when you move the mouse.

#### Wallpaper Engine 2

- **Settings resync when effects start** — if the Wallpaper Engine companion starts after RGBJunkie, the plugin sends its settings packet again on the first color frame so the matrix can wake up without toggling a slider.
- **Clearer wallpaper logs** — the log now reports the first **settings** and first **color** UDP packets separately (port 8133 / 8134), so support can tell whether RGBJunkie is streaming colors or only sent the setup packet.
- **More reliable UDP on localhost** — wallpaper traffic on 8133 and 8134 no longer shares one send queue keyed only by IP, so two-screen setups do not block each other.
- **Companion not listening warning** — if nothing is receiving on UDP port 8133, startup logs explain that the Wallpaper Engine workshop wallpaper must be applied (RGBJunkie can send colors while the desk stays blank).
- **Wallpaper companion wake-up** — the workshop wallpaper only listens for colors when it sees WhirlwindFX **SignalRGB** running. RGBJunkie now starts a tiny bundled helper so the companion opens UDP port **8133** without installing SignalRGB (the desk was staying black even though RGBJunkie was sending colors).
- **Settings when the companion connects late** — the workshop wallpaper can take up to ~10 seconds to open UDP after RGBJunkie starts. RGBJunkie now waits longer, then sends its setup packet again as soon as port **8133** comes online so the matrix can wake up without restarting the app.
- **Reliable companion detection on Windows** — the workshop app listens on all interfaces (`0.0.0.0:8133`); RGBJunkie now detects that correctly and keeps resending setup packets until the companion is ready (previously it thought nothing was listening and skipped the resync).
- **Steadier desk colors** — each wallpaper color frame is sent as one complete group of UDP packets (large grids use three), so the companion no longer mixes pieces of old and new frames and stays black. RGBJunkie also pushes a fresh color frame when the companion first connects, not only the setup packet.
- **Nollie32 stays smooth with Wallpaper Engine on** — localhost wallpaper UDP no longer queues ahead of USB lighting on the same path, the wallpaper plugin slows to 30 fps while a Nollie-class strip is active, and the periodic settings heartbeat no longer runs a full color render every few seconds.

---

## v0.3.3 — May 29, 2026

RGBJunkie **0.3.3** brings back **WLED matrix add-ons** from community Git repos, smooths **Identify** on USB and WLED gear, packs more into support reports, and adds an optional **Wallpaper Engine 2** network plugin.

#### Startup and stability

- **App opens again after a crash** — a blank white window after an out-of-memory crash was caused by WebView2 refusing to start with an outdated browser-flag list. RGBJunkie now uses a smaller, compatible set so the UI loads normally on current Edge WebView builds.

#### Wallpaper Engine 2

- **UDP settings packet** — the optional **Wallpaper Engine 2** network plugin no longer fails to send colors when **Show FPS** is off; boolean slider values are converted to bytes before UDP send.
- **Canvas grid stays in sync** — when you change **Aspect Ratio** or **Display Size** on **Wallpaper Engine 2**, the layout canvas grid updates to match so effect colors sample correctly (previously the plugin and canvas could disagree and the wallpaper stayed black).
- **Smoother wallpaper streaming** — color packets to the companion on port 8133 are no longer throttled by WLED-style UDP dedup (that path is only for WLED port 21324).

#### Multi-canvas scenes

- **Correct effect per canvas tab** — loading a scene with different effects on canvas 1 and canvas 2 (for example **Audio Party** on one tab and **Keyboard Effects** on the other) no longer swaps or picks the wrong effect when the Effect Library order changes. Each tab now remembers which effect it uses by stable id, not list position.

#### WLED matrix add-ons

- **Community add-ons load again** — optional **WLED matrix & clock** extras (clock, custom text, pixel art, Libre Hardware Monitor readouts on 2D matrices) install from **Settings → Installed → Git repositories**. Turn the repo **On**, rescan hardware, and **Matrix** settings appear on your WLED device. If nothing new shows up, delete the old add-on files in your user plugins folder and download the repo again.

#### Identify

- **Stop button matches the sidebar** — while identify is running, the bulb button switches to a stop icon with the same accent highlight as the other sidebar controls, instead of a plain black icon.
- **Quicker, softer pulse** — identify breathes a little faster with a smooth sine fade instead of a hard blink.
- **Hardware matches the layout fade** — physical LEDs now fade all the way off at the bottom of the pulse, like the layout dots.
- **Smooth fade, not steps** — layout dots use their own display-rate pulse; physical LEDs use the same engine path as your effects.
- **Identify matches effect smoothness** — hardware identify now updates every engine tick (not only on the slower hardware sample interval), so the breathe is no longer limited to a handful of brightness steps.
- **USB identify like WLED** — during identify, small USB HID packets (mice, mousepads, keyboards) go out immediately instead of waiting on the batched flush queue that was capping brightness to a few steps per second. Long LED strips still use the safe batched path.

#### Support reports

- **Diagnostic log zip** — **Settings → Logs → Send a report** (and missing-device requests) now attach one **`rgbjunkie-logs.zip`** with every diagnostic file that exists: **`rgbjunkie.log`**, **`hardware-snapshot.txt`**, **`rgb-hardware-debug.txt`**, **`freeze-events.txt`**, and a recent rotated log when present.
- **Diagnostic files always created** — every launch writes a **`sessionStart`** line to **`freeze-events.txt`** and refreshes **`rgb-hardware-debug.txt`** when hardware detection starts (and again after a successful scan or if detection fails), so support can tell the logging path works even when nothing stalled yet.

#### Network devices

- **Wallpaper Engine 2 (community plugin)** — RGBJunkie can load the optional **Wallpaper Engine 2** network plugin from your user plugin folder. It talks to the Wallpaper Engine / Lively companion over UDP on your PC so your wallpaper matrix can follow RGBJunkie effects. Not bundled with the installer — see the community repo README for install steps.

---

## v0.3.1 — May 28, 2026

RGBJunkie **0.3.1** brings back physical **Identify**, improves **Skydimo** serial-strip detection, polishes support diagnostics and the component library, and extends Linux installs.

#### Identify

- **Physical LEDs again** — **Identify** from the sidebar or workspace drives your real lights again, not just the dots on the layout. It works even when you have not placed a component on that channel yet — RGBJunkie uses the channel’s LED count from your device.
- **Smooth identify breathe** — identify fades the channel accent color up and down on a slow sine curve (fully off at the bottom), instead of a hard on/off blink, so watchdog strips stay steadier.
- **Layout dots restore when you stop** — stopping identify puts each component’s LED markers back to that canvas tab’s normal look (preview fill, LED Studio paint, and tab accent ring) instead of leaving the pulse colors on the layout.
- **Identify color matches the channel dot** — hardware identify now uses the same red/green/blue channel accent as the sidebar (fixes swapped green/red on strips and wrong colors when the device id contains dashes).

#### Skydimo serial LED strip

- **COM port devices show up** — **Skydimo LED Strip** (USB-serial CH340 `1a86:7523`) is detected from Windows COM ports when the port reports USB VID/PID, not only from the HID **SK0902** matrix (`1a86:e316`). Support snapshots list serial ports so missing strips are easier to diagnose.

#### Startup

- **Faster boot** — RGBJunkie no longer probes every anonymous COM port at startup (which could add many seconds on PCs with Bluetooth or virtual serial devices). USB-serial gear like Skydimo attaches only when Windows reports the expected USB ID on that COM port.
- **Less work before the UI appears** — serial plugins are matched from a short list instead of re-reading every plugin file from disk; USB detection reuses plugin code already in memory instead of opening each file again; extra layout warm-up runs only when a device still has no LED map; the online effects gallery loads in parallel with USB detection; support debug logs write in the background after devices are ready.

#### Support reports

- **Hardware debug log** — when you email a report from **Settings → Logs**, RGBJunkie refreshes **rgb-hardware-debug.txt** right before send so the latest device snapshot is always included.

#### Component Library

- **Thumbnails on first open** — product photos and LED layout previews now appear as soon as you open the library, without needing to scroll the grid first (fixes blank cards on some PCs where the browser delayed visibility checks).

#### Updates and About

- **Release notes after an update check** — if your installed build has an older bundled changelog, **What's new** loads missing versions (including **v0.3.1**) from rgbjunkie.com instead of showing “No release notes found.”

#### SteelSeries QcK Prism Cloth

- **More cloth sizes light up** — QcK Prism **Cloth** pads that were mis-detected as the older rigid 12-zone QcK Prism (including **4XL**, **CS:GO Neon Rider XL**, and **Neo Noir XL**) now use the correct **two-zone** driver so top and bottom edges respond again.
- **Easier USB match** — cloth QcK pads are less picky about which HID interface Windows reports, so they are more likely to show under **Connected** instead of staying unmatched.
- **Smoother motion** — QcK cloth pads no longer sit at a low update rate with USB traffic that looks like zero and then bursts; effects and forced colors track your other devices more closely.

#### Linux and macOS

- **Settings and logs work on first launch** — RGBJunkie now creates your user folder automatically (`~/.config/RGBJunkie` on Linux, **Application Support** on Mac) instead of expecting Windows **%APPDATA%**. **Settings → Logs** no longer shows **Error loading: No APPDATA** on AppImage or `.deb` installs; profiles, WLED lists, and support reports save there like on Windows.
- **AppImage auto-update** — when you run the **AppImage** (not a `.deb` system install), **Settings → About** can download the new **.AppImage** from rgbjunkie.com, replace your file, and restart — same flow as the Windows portable ZIP. **Check for updates on startup** and **Install update automatically** apply on Linux AppImage when **latest.json** includes the AppImage URL and SHA-256.
- **Linux download checksums** — release builds now write **`.sha256` sidecar** files for **`.deb`**, **`.rpm`**, and **AppImage** (same as the Windows portable ZIP). **latest.json** lists each Linux installer URL with its SHA-256 so downloads and in-app update checks stay fast and reliable.

---

## v0.3.0 — May 27, 2026

RGBJunkie **0.3.0** tidies the install folder, fixes Windows login startup after portable updates, and adds a **Third party** page under About.

#### Install layout

- **Smaller install folder** — optional helpers now live under a single **`runtime/`** directory next to the app instead of scattered top-level folders.
- **`runtime/pawnio/`** — PawnIO DLL and SMBus modules for ENE DRAM RGB on supported boards (Windows).
- **`runtime/lhm/`** — LibreHardwareMonitor portable for sensor-driven effects (Windows).
- **No `openrgb/` in the install directory** — OpenRGB is not copied beside the app anymore. On Windows, RAM/OpenRGB integration can still download a portable build into app data the first time it is needed.
- **In-place upgrades** — if an older install left **`pawnio/`**, **`pawnio-runtime/`**, or top-level **`lhm/`** behind, RGBJunkie still finds them. After you confirm everything works, you can delete those legacy folders; new installs only need **`runtime/`**.
- **PawnIO folder choice** — when more than one PawnIO folder exists (for example after several portable updates), RGBJunkie prefers the copy that has **both** `PawnIOLib.dll` and bundled `Smbus*.bin` modules.

#### About

- **Overview and Third party tabs** — **Settings → About** keeps updates, legal, and version info under **Overview**; **Third party** lists open source and bundled helpers RGBJunkie relies on (Tauri, Konva, Bootstrap, optional Windows sensor/RAM helpers, p5.js for P5 effects, and others) with license names and links to each project.

#### Settings

- **LED calibration layout** — **Settings → Colors → Calibration** shows each channel’s percentage on the same row as **Red**, **Green**, and **Blue** (to the right of the label), with the slider directly underneath.
- **Windows startup** — **Settings → System → Startup → Open RGBJunkie when this computer starts** re-registers the login entry on every launch so portable moves and updates do not leave a broken path in Windows. If **Start minimized** is off, the main window appears after sign-in instead of staying tray-only.

#### Updates and About

- **What's new on update** — when a newer build is available, the update dialog shows release notes from the bundled changelog (every version between yours and the latest). **All release notes** opens the full in-app history; missing versions can load from rgbjunkie.com.

---

## v0.2.99 — May 26, 2026

#### Effects

- **ORGB port library** — the remaining OpenRGB ports under **ORGB_Port** now use host **Color profile** and eight **Custom** slots (same pattern as **Fractal Motion**, **Mosaic**, and **Custom Marquee**), resize with the engine canvas via `rgbjSetupCanvas` / `ImageData`, and share palette helpers injected with every effect iframe.
- **Moving Panes** — **Color profile** and custom slots now drive pane colors (the port had left the old two-color blend in place).
- **Policing** — scanner and flash colors follow **Color profile** / custom slots (alternates two profile samples each direction change).
- **Rain** — droplets use **Color profile** and custom slots (each drop samples the active profile; profile changes apply to new and falling drops).
- **Rainbow Wave** — sliding bands use **Color profile** and custom slots instead of a fixed HSL rainbow.
- **Random Marquee** — rebuilt like **Custom Marquee** (scrolling profile-colored bands, **Bar width** / **Bar gap**, horizontal or vertical); each cycle still randomizes bar size, gap, axis, and speed; colors follow **Color profile** and custom slots.
- **Noise Map** — fixed a broken render path after the ORGB port (`pixels` / canvas buffers were never initialized); colors come only from **Color profile** and custom slots (removed the old WLED **Color palette** list). Faster rendering (2D noise, color lookup table, optional **Render quality**); fixed oversized blobs after the speed pass (noise scale and upscaling).
- **Swap** — each wipe now uses the next colors from your **Color profile** (all eight **Custom** slots, or stepped samples along presets like **Rainbow**), not only two fixed profile points.
- **Starry Night** — fixed a broken render path after the ORGB port (`pixels` was never set from `framePixels`, so the effect threw an error and showed nothing). Stars re-initialize when the engine canvas is resized.
- **Stack** — fixed **Speed** feeling stuck near minimum: stacking advanced one column per second at the default slider, so wide layouts took minutes; speed now scales with matrix size (default **50** fills in about four seconds). **Color profile** samples advance only when a new stack starts (full reset), not every column or frame. **When full** list: **None**, **Fade at end**, or **Stack out** (one choice only — not both).
- **ORGB color profile audit** — remaining **ORGB_Port** effects now sample **Settings → Color profile** and eight **Custom** slots through the host API, not legacy `random_colors` / fixed hex pairs. **Sequence** cycles the full profile list; **Clock** uses three profile samples for hour/minute/second hands; **Mask** inside/outside colors follow the profile; **Visor** advances palette pairs each wipe like **Swap**; **Wavy**, **ZigZag**, **Smooth Blink**, and beam effects use profile phase colors; **Audio Sync**, **Audio VU Meter**, **Audio Bubbles** (new **Color profile** preset), and **Bloom** audio/rainbow modes map audio height or bins to profile colors; **Retro Wave** custom shapes use the profile; **Lightning** per-LED strikes use profile RGB. WLED-style palette pickers on **Bloom**, **audio eclipse**, and **Retro Wave** still work alongside the profile where noted.
- **Custom Gradient Wave** — fixed inverted FPS in the status bar (very high when the window was in the background, ~30 when focused). The effect was calling `fillRect` once per pixel each frame, which blocked the main thread; it now uses the same fast `ImageData` path as **Gradient Wave**.
- **Custom Marquee** — uses host color profiles via **Color profile**, or your eight custom slots when profile is **Custom**; **Bar width** and **Bar gap** adjust band thickness and spacing; each scrolling band keeps its color as it moves; fills engine resolution with fast `ImageData` rendering.
- **Double Rotating Rainbow** — same host color profile and custom-slot support; engine-sized canvas with fast `ImageData` rendering; **Rotation speed** and **Frequency** plus color profile controls (removed non-functional **Color speed** slider).
- **Fractal Motion** — uses host color profiles and custom slots (replaces single-color / random modes); engine-sized canvas with `ImageData` rendering; controls grouped under Motion, Wave, Harmonics, and Colors.
- **Hypnotoad** — uses host color profiles and eight custom slots (replaces Rainbow/Custom list modes); engine-sized canvas with fast `ImageData` rendering; controls grouped under Motion, Pattern, and Colors.
- **Mosaic** — uses host color profiles and eight custom slots (replaces Random Colors toggle and four fixed colors); engine-sized canvas with fast `ImageData` rendering; **Custom** profile spawns only from your slots, other profiles sample the active color profile.
- **Effect HTML hot-reload** — saving an effect file reloads the active iframe from the newest on-disk copy (repo edits beat stale bundled duplicates); improved Windows file matching plus a lightweight mtime poll when OS notify misses a save.
- **Effect edits during development** — the app loads HTML from your repo `effects/` folder before the bundled copy, so saving an effect file shows up after you re-select it (without stale installer resources winning by title).

#### Effects panel

- **Current effect summary** — effect name is larger; developer credit sits on its own line underneath (right **Effects** column).
- **Effect settings scroll** — the right **Effects** column keeps brightness, browse/transport, and the current-effect summary fixed; long parameter lists scroll inside the **Effect settings** box (layout sync keeps the scroll region sized correctly in the desktop shell).

#### Devices and layout

- **USB power-cycle layout** — when a USB device (for example a Razer soundbar that sleeps when idle) drops off the bus and comes back, RGBJunkie keeps your canvas position instead of spawning a new centered copy. Reconnect matches the same physical unit by stable USB group id and reuses the existing layout component when the plugin signature changes.

#### Updates and About

- **What's new on update** — when a newer build is available, the update dialog shows release notes from the bundled changelog (every version between yours and the latest). **All release notes** opens the full in-app history.
- **About → Release notes** — **Settings → About** has a **Release notes** button and the build label opens the same changelog modal for your installed version (scrollable, works offline; falls back to rgbjunkie.com when a version is missing from the bundle).
- **Release notes headings** — section titles such as **Effects** and **Sleep and hibernate** render as proper headings instead of raw markdown text.

---

## v0.2.98 — May 25, 2026

#### Sleep and hibernate

- **RAM after wake without restarting** — wake recovery now drops the in-app PawnIO SMBus session (same as quitting and reopening RGBJunkie), waits for motherboard firmware to finish its post-wake pattern, re-probes ENE DRAM, forces **direct mode** on each stick, and reinjects RAM plugins a few seconds after USB handles refresh.

#### Effects panel

- **Auto cycle per workspace tab** — when **Auto cycle effects** is on, each canvas tab keeps its own timer and advances through that tab’s saved effect list independently (not one global clock for the whole app).

---

## v0.2.97 — May 25, 2026

#### Sleep and hibernate

- **RAM after wake without restarting** — hibernate left the in-app PawnIO SMBus session running with a stale “direct mode already set” cache while the motherboard firmware had reset the DIMMs to its own pattern. Wake recovery now drops that session (same as quitting and reopening the app), waits for post-wake SMBus traffic to settle, re-probes ENE DRAM, forces direct mode on each stick, and reinjects the virtual RAM plugins a few seconds after USB handles refresh.

---

## v0.2.96 — May 25, 2026

#### Sleep and hibernate

- **RAM after wake** — post-hibernate recovery now runs the same full PawnIO RAM rediscovery as first boot and **Settings → Retry RAM discovery** (strip cached DIMM rows, probe SMBus, reinject fresh plugins) instead of only reconnecting the session. The USB watchdog does the same full replace after its reload finishes, so RAM should stay lit past the ~1 minute mark when the watchdog unpauses.

---

## v0.2.95 — May 25, 2026

#### Settings

- **Overview punctuation** — device cards and the workspace pill no longer show stray question marks between items (for example `1 channel · 1 layout component` and `PC · 2 tabs`). The same fix applies to LED calibration channel labels and a few Settings helper lines that used the wrong separator.

#### Sleep and hibernate

- **RAM staying dark after wake** — about a minute after hibernate, the USB watchdog could run a full rescan that stripped and re-probed PawnIO RAM over SMBus while USB was busy. Wake recovery now resets watchdog peek state, heals RAM without reinject on USB-only reloads, and re-heals PawnIO ~50s after wake when the watchdog unpauses.

---

## v0.2.94 — May 25, 2026

#### Sleep and hibernate

- **RAM after wake** — hibernate recovery now re-connects PawnIO/OpenRGB SMBus and re-runs RAM discovery (same path as Settings → Retry RAM discovery), and clears color dedup so DIMMs get a fresh push without a full USB rescan.

---

## v0.2.93 — May 25, 2026

#### Sleep and hibernate

- **Nollie32 flicker after wake** — logs showed resume was running a full hardware rescan *and* the USB watchdog reload at the same time, leaving multi‑second gaps between Nollie HID flushes (firmware blanks near 500 ms). Wake recovery now only reopens HID handles and repoints existing plugins; the USB watchdog stays paused briefly so Nollie keeps steady frames.

---

## v0.2.92 — May 25, 2026

#### Sleep and hibernate

- **Lighter wake recovery on USB strips** — resume no longer kicks off a full hardware rescan when reopening stale HID handles is enough, so Nollie-class strips spend less time dark right after wake.

---

## v0.2.91 — May 25, 2026

#### Sleep and hibernate

- **Nollie32 after wake** — resume recovery no longer re-runs full plugin **Initialize** on Nollie-class controllers (they only need fresh HID handles). That extra init was causing ~3 Hz flicker while colors were otherwise correct.

---

## v0.2.90 — May 24, 2026

#### Sleep and hibernate

- **USB and OpenRGB after wake** — hibernate often leaves the same HID path open in Windows but the handle is dead, so effects kept playing while USB/OpenRGB gear stayed dark. Wake recovery now closes **all** cached HID handles, resets OpenRGB and GPU I2C sessions, reloads plugins, and re-runs **Initialize** on every active device (WLED still gets the HTTP live nudge).

---

## v0.2.89 — May 24, 2026

#### Effects

- **Mixing** — simplified to **two-band merge only** (removed the large multi-shape editor); bands meet at center, **Blend** or **Custom** merge color, **Color Profile**, soft edges, gravity modes, bass flash; fills engine resolution.
- **Meteor** — **Speed** applies immediately while the comet is moving (not only after it hits an edge).
- **Meteor** — **Band Thickness** now works intuitively (higher = thicker band).
- **Meteor** — simplified to **comet only** (removed the large multi-shape editor); **Color Profile**, soft edges, optional gravity modes, and bass flash; fills engine resolution.
- **Liquid Metal** — fixed effect not rendering (crash from **Audio Sensitivity** variable shadowing the host-injected setting).
- **Liquid Metal** — fixed blank/black output: chrome ridges again lerp between profile **shadow and highlight** samples (full palette still drifts across the surface via **Color Flow**).
- **Liquid Metal** — fills **engine resolution** with **Render Quality** scaling; **Color Profile** maps the full palette across chrome ridges (Custom still uses highlight/shadow pickers); **Color Flow** drifts the palette; bass drives extra turbulence via **Audio Sensitivity**; settings grouped under **Motion**, **Surface**, **Colors**, and **Audio**.
- **Kyber Duel: Flashpoint** — each saber blade runs the **full color profile** from hilt to tip (left forward, right reversed); clash sparks sample random profile colors.
- **Kyber Duel: Flashpoint** — saber inner core tints from each blade’s profile color instead of always rendering white.
- **Kyber Duel: Flashpoint** — fills **engine resolution** (blade length, pivots, flash, and sparks scale with canvas); **Color Profile** via host profiles (Custom still uses saber overrides); settings grouped under **Sabers**, **Motion**, **Clash**, and **Colors**.
- **Kinetic Sand** — fills **engine resolution** (simulation and spawn scale with canvas size); colors use **Color Profile** + **Color Spread**; settings grouped under **Spawning**, **Physics**, **Colors**, and **Audio** (removed legacy palette picker).
- **Functional `.mjs` effects** — fixed freeze when the effect worker hung (batch timeout, main-thread fallback, effect switching clears the active worker); engine no longer deadlocks if sampling fails.
- **Euclidean Beats** — fixed frozen animation (host now keeps a stable time origin and passes frame index; pattern uses continuous **Step speed** motion).
- **Bass Reactive Pulse** (and other `.mjs` effects) — fixed stray dots on the engine canvas from per-LED 1×1 stamping (including manual **LED paint** overrides); the preview field now shows the effect only while hardware output is unchanged.
- **Audio Star** — removed **Edge Beat** and related border-flash settings.
- **Audio Star** — polar spectrum visualizer refresh: **Color Profile** + **Color Flow**, **Audio Reactivity**, **Star Points** rays, **Spoke Floor** for LED strips, engine-resolution canvas, and smoother bin response.
- **Audio Sine** — tighter vertical glow (less halo above/below the wave); default **Glow** lowered.
- **Audio Sine** — wave colors use **Color Profile** (Settings → Color profiles) with optional **Color Flow** on sound; removed Spectrum Cycle / static wave color.
- **Audio Sine** — stronger sound reactivity (bass-weighted level, taller waves, faster response); default **Audio Reactivity** is 100.
- **Audio Sine** — removed the always-on bounce and scroll; the wave height, drift, and spectrum colors now follow audio only (flat when silent).
- **Effect Browser** — built-in effect preview images in nested `effects/` folders load again during development (served from `/effects/…` instead of blocked asset URLs); also finds folder-named or `.jpg`/`.webp` sidecars beside the effect file.
- **Fractal Explorer** — fills the live **Engine Resolution** canvas (tracks `engine.canvas` each frame; no fixed 320×200 cap).
- **Fractal Explorer** — scales with engine resolution, **Render Quality** slider for speed vs sharpness, **Smooth Colors** / **Color Bands**, **Profile** palette from color profiles, smoother Julia orbit motion, and improved bass/mid/treble sampling.
- **Effect settings panel** — boolean options (e.g. **Enable Animation**, **Sound Responsive**) now use toggle switches instead of checkboxes; more vertical space between all options.
- **Flags of the World** — all effect settings now appear on one panel tab (wave and audio controls were previously split into separate tabs).
- **Flags of the World** — fixed startup crash (`Cannot read properties of null (reading 'style')`) when running inside RGBJunkie.
- **Firefly Glade** — new defaults: **Audio Sensitivity** 8 and **Beat White Flare** off (0) for a softer, less flash-heavy swarm out of the box.
- **Fibre Optic** — **Beat Reactivity** now speeds up glow pulses traveling down the strands on each beat (surges on beat hits).
- **Fibre Optic** — **Sway Speed** and **Glow Intensity** now have a clear effect (sway rate and bloom halo were previously too subtle to see).
- **Fibre Optic** — rebuilt with physics-based strand sway, traveling light pulses, neighbor color bleed, per-band **Bass / Mid / Beat** audio, **Strand Drape**, and **Glow**; works at engine resolution in RGBJunkie.
- **Festive Lights** — the first string starts near the top of the canvas; additional strings fill downward from there.
- **Festive Lights** — fixed blank preview: canvas now bootstraps at 320×200, uses host `rgbjSetupCanvas` when needed, and cords draw immediately from a sag shape instead of blocking on physics settle.
- **Festive Lights** — new **Cord Drape** slider (0 = tight/straight, 100 = deep sag) adjusts rope slack and gravity on the physics cords.
- **Festive Lights** — cords use **Verlet rope physics** (gravity, tension, slack) for natural catenary drape; audio shakes one anchored end and ripples propagate along the string.
- **Festive Lights** — **Bass** and **Mid Reactivity** now drive cord motion along the full string and brighter bulb response (works with Random Beat Lights on; set **Cord Vibration** above 0 for cord shake).
- **Festive Lights** — **Cord Variation** slider randomizes each string’s height, drape depth, end hang, and sag (0 = identical evenly spaced cords).
- **Festive Lights** — **Random Beat Lights** now brightens **only** the picked bulbs on each beat (rest stay dim); no whole-string beat pulse. Turn it off to restore beat brightness on every bulb.
- **Plasma Sphere** — updated effect description for the library (plasma-lamp lightning, layouts, and controls).
- **Plasma Sphere** — **Screen edge**: the full bolt follows a drifting edge contact (not just the last point). Wiggle shape is seeded and rerolls on a **Particle Speed** interval; **Particle Amplitude** sets zigzag size.

#### Scene profiles

- **Color calibration from component menu** — right-click a component on the canvas or in the sidebar and choose **Color calibration…** to open Settings → Colors → Calibration with that component's hardware channel already selected.
- **Color calibration stays global** — per-channel RGB calibration (Settings → Colors → Calibration) is saved in `profiles/devices/channel_calibration.json`, not in scene or layout files. Switching or saving a scene no longer overwrites your hardware calibration.
- **Layout and lighting split** — scenes store your effect, sliders, and colors; strip positions and canvas tabs live in a paired **device layout** file (`profiles/devices/`, referenced by **`defaultLayout`** on the scene). Saving or loading a named scene updates both files. Older scenes that still embed `components` in the JSON keep working until you save again.
- **Correct effect on load** — scene reload no longer picks the wrong Effect Library entry from a stale workspace tab or from clamping to the last slot when the saved effect cannot be resolved; re-save once if an old scene lacks stable effect ids.
- **Save, reload, and switch** — named scenes (e.g. Audio Party) keep strip positions after reload; multiple components on the same controller channel restore by **instanceId** and strip **name**; switching scenes no longer asks to save when nothing changed.

#### Nollie32 and high-FPS USB

- **Throughput and stability** — higher stable refresh on long strips, prioritized HID flushes when many USB devices are connected, optional **hardware update cap**, and smoother HTML effects at high sample rates.
- **Display off** — lights and effects keep moving when Windows blanks the monitor for power saving.

#### Audio Party

- **Wave floor** (General, default 14%) so bands do not drop to black between beats; **Glitch** off by default and softer when enabled.

#### Sleep and hibernate

- **USB controllers after wake** — resuming from sleep or hibernate runs a full device reload (stale HID handles cleared), relaunches the active effect, and retries if the app was still busy when Windows woke.
- **WLED after wake** — each configured controller gets **`on:true`** then **`live:true`** over HTTP so strips that powered off during hibernate accept realtime UDP again.

---

## v0.2.88 — May 23, 2026

#### Hardware update cap slider and high-FPS devices

- **Settings → System → Engine → Hardware update cap** — the FPS slider drags smoothly again; the limit is applied when you release the slider instead of on every pixel while dragging.
- **Nollie32 and other 100 Hz controllers** — when RGBJunkie is in the foreground, device updates are no longer stuck at ~60 FPS from monitor refresh; the engine keeps the rate your plugin or cap requests (up to 100 FPS by default).
- **Nollie32 with many USB devices** — watchdog `hid_device_flush` calls now jump ahead of mouse/keyboard-sized flushes when the global USB slot pool is full (8+ HID devices used to cap at **2** parallel flushes and starve Nollie). Commit-packet pacing default is **1 ms** (was 2 ms).

#### Scene load — component positions

- **Named scenes (e.g. Audio Party)** — loading a saved scene no longer replaces the on-disk layout snapshot with live canvas positions mid-restore (which could shift strips after USB spawn/rebind). Saved **x/y**, size, and workspace are re-applied from the scene file after plugin layout passes finish.
- **Save / reload named scenes** — saving a scene now writes the same snapshot to **autosave** as to the named `.json` file (instead of rebuilding autosave separately). Autosave no longer merges in **extra stale components** from an older autosave when a named scene is active, which made reload look like your save was ignored.
- **Scene reload flash** — reloading a named scene no longer snaps back to old positions a moment later when plugin layout spawns, USB rescans, or `loadSystemData`'s deferred layout pass re-run after the file load; saved **x/y** are frozen from the named file and re-applied after every spawn (including hardware rescans).
- **Multiple strips on one channel** — scenes like Audio Party can legitimately save several layout components on the same controller channel (e.g. three Nollie fan strips on `…-0`). Reload no longer maps every deferred re-apply to the first match on that channel; rows restore by **instanceId**, strip **name**, then nearest saved **x/y**.
- **Scene switch save prompt** — switching to another scene no longer asks to save when you have not edited anything. The clean baseline is captured as soon as a scene finishes loading (not only after the 2 s layout settle), and the prompt stays off while deferred restore is still running.
- **Focused high-FPS mode** — on-screen HTML effects keep updating at monitor refresh while hardware sampling runs faster, instead of repainting the effect iframe on every 100 Hz tick (which capped real throughput around 25–30 FPS).
- **Nollie32 blanking** — watchdog controllers no longer get forced black during channel identify, setup wizard, or USB rescans; HID frames are queued through rescans instead of dropped so firmware does not blank the strip.
- **Channel identify** — the old 4 Hz on/off hardware flash is removed; identify now pulses only on the workspace canvas so strips (especially Nollie32) stay steady. Saved layouts no longer restore a stuck identify selection.
- **Nollie USB pacing** — shorter default gap between commit packets (2 ms instead of 8 ms) to reduce visible flicker during multi-packet frames.
- **Nollie32 Firmware 2.x commit** — the group commit marker is now sent only on the last HID packet of each channel group (not on every packet for the highest channel). Long strips or multi-packet channels no longer commit mid-frame, which looked like a stutter or blink.
- **Nollie32 whole-strip blink** — high-FPS hardware sampling no longer clears the engine canvas between effect frames, reuses the last good pixel read when sampling fails, and skips watchdog HID pushes during brief all-black canvas dropouts so the strip stays on the last good frame instead of flashing off.
- **Nollie32 ~50 FPS cap** — the high-FPS engine timer now fires on a fixed schedule at the start of each frame instead of after frame work finishes (work time was doubling the interval). Nollie32 requests **108 Hz**; the default hardware update cap is **120 FPS** so you do not need to raise Settings unless you lowered it before.
- **Nollie32 ~50–60 FPS (focused)** — watchdog `Render()` now runs on a dedicated interval decoupled from the heavy UI `frameLoop` (canvas read + Konva), so throughput can reach ~108 Hz while effects still composite at monitor refresh.
- **Nollie32 strip stutter (HTML effects)** — high-FPS hardware no longer samples a ~60 Hz cached fallback while the fast timer runs at ~100 Hz (that uneven hold/jump pattern looked like stutter on long strips). The engine now blits the **live** effect canvas on the same tick as `getImageData`.
- **Nollie32 HID flushes/s** — Strimer USB traffic (6–12 extra packets per frame) now runs only when that Strimer subdevice has LEDs on your layout, not just because **GPU/ATX Strimer connected** is enabled in device settings. Unmapped channels also report **0** mapped LEDs to the plugin instead of the full 256-LED cap, so strip-only setups send fewer packets per flush and **HID flushes/s** can track closer to your hardware update cap.

#### Audio Party and physical LED strips

- **Audio Party** — wave bands no longer drop to pure black at every trough (new **Wave floor** setting under General, default 14%). **Glitch** is off by default and is softer when enabled, so long strips (Nollie32) no longer look like they are blinking off between beats.

#### Screen turns off from inactivity

- When Windows blanks the monitor to save power, your **lights and on-screen effects keep moving smoothly** instead of slowing to a crawl.

#### Smarter updates for some USB controllers

- **Nollie32** — only updates the channels and LED counts you actually placed on your layout (not every empty port at full size).
- **Prism Mini** — same for its strip channel.
- **ASRock motherboards** — when **Per-LED / ARGB** mode is enabled in settings, motherboard headers and built-in zones follow only the LEDs you added.
- **SteelSeries QcK Prism** (two-zone models) — sends less data when colors are not changing; animated effects still look normal.

#### Many USB devices on one PC

- When you run a lot of USB RGB gear, RGBJunkie spreads work across updates so one USB hub is less likely to stutter. **Wi‑Fi WLED** strips and **RAM** lighting behave as before.

#### Memory number matches Task Manager

- The memory shown in the **status bar** and under **Settings → System → Computer** now includes all parts of the app, so the total is closer to what you see for RGBJunkie in Task Manager.

#### Tray, minimize, lock screen, and other apps

- **Lights and effects stay smooth** when RGBJunkie is minimized, in the **system tray**, on the **lock screen** (Win+L), or while you use another program.
- Fixed a bug where **everything looked like a slideshow (~1 update per second)** after minimize or close-to-tray.
- The native background pump now calls the lighting loop **directly on the webview thread** (instead of throttled IPC events) and keeps the hidden WebView2 controller visible so tray/minimize timing stays at full speed.

#### Smoother effects when RGBJunkie is in front

- On-screen effects match your **monitor refresh** again instead of lagging behind slow device updates.
- **New installs** default to **320×200** engine size (**Settings → Engine → Resolution**, 100% scale).

#### Adjustable maximum device FPS

- **Settings → System → Engine → Hardware update cap** — set the top speed for canvas sampling and device plugin updates (**15–240 FPS**, default **100**). Plugins can still request a lower rate via `device.setFrameRateTarget()` (for example **Nollie32** at 100 FPS, WLED at 60, mousepads at 25).
- **Low power mode removed** — the old **Enable low power mode** toggle is gone. Use **Hardware update cap** to limit CPU/USB load instead (for example **30–60 FPS** on busy hubs). Saved low-power preferences are ignored on upgrade.

#### Memory use

- The app frees unused memory after big changes (switching effects, rescanning hardware) **without freezing your lights** for a long cleanup.
- Automatic cleanup about every **2 minutes** when memory stays above about **600 MB** (was 5 minutes / 800 MB).
- **Free RAM** from the status bar or **Ctrl+Shift+F** still does a deeper cleanup when you ask for it.
- Less aggressive cleanup when you alt-tab away, which could cause small LED hiccups.

#### Stays responsive in the background

- Windows is less likely to **slow RGBJunkie down** while it runs in the tray and your lights are still on.

#### After sleep or hibernate

- Your gear **comes back on its own** after wake — similar to using **Rescan hardware**. **WLED** gets a quick refresh; everything else settles within a couple of seconds.

## v0.2.81 — May 22, 2026

#### Developer workflow

- **`compile.bat devtools`** — runs elevated `tauri dev` with **`RGBJUNKIE_OPEN_DEVTOOLS=1`** so WebView2 DevTools open on startup (tray → **Open developer tools** remains available). Plain **`compile.bat`** is unchanged.
- **Tray FPS diagnostics** — in Edge DevTools, **`window.rgbEngine.getFrameTickDriverStatus()`** reports whether the background Web Worker tick driver is active while the window is minimized or in the tray (`workerActive`, `pageHidden`, target interval).

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

#### Nollie plugins — one brand folder

- All Nollie controllers now live under **`plugins/Nollie/`** only. The old **`plugins/Firmware 2.x/`** folder (Nos 2.0 / CDC variants) and duplicate **`plugins/Default/Nollie*.js`** stubs are removed. **`Nollie32.js`** remains the unified plugin (V1 + Firmware 2.x protocols); Nos 2.0 and CDC builds are sibling files in the same folder. Saved bindings that pointed at **`Firmware 2.x/...`** or **`Default/Nollie...`** paths are redirected automatically.

#### WLED — fewer periodic rapid flashes on long strips

- When the PC pauses the lighting loop briefly (memory trim, DNS refresh, or a heavy rescan), stacked UDP frames are no longer blasted to the controller in one burst. Each host now sends **one latest frame at a time**, and hostname lookups **reuse the last good IP** while refreshing in the background (about every 5 minutes) instead of stalling mid-stream.

#### WLED — layout components stay after restart (IP vs hostname)

- Scene autosave may store **`wled:192.168.x.x-0`** while **Settings → WLED** lists **`wled-matrix.local`** (or the other way around). On load, RGBJunkie matches the same physical controller by **discovered IP**, configured hostname, and UDP maps — then rebinds and remaps canvas channels to the live plugin id. **Duplicate** autosave rows (two per controller — IP and `.local`) are collapsed to **one** strip per WLED device on load and save.
- Restore still recreates skipped rows, merges missing WLED layout from **`devices/autosave_device.json`**, and avoids shrinking autosave when startup is partial. **Settings → WLED** keeps a stable device **id** per host when you save device settings.

#### LED timing when minimized to tray — Web Worker tick driver and effect rAF polyfill

- **Tray / taskbar minimize** — LED FPS used to collapse to **1–2 Hz** when the window was minimized or hidden because Chromium's **IntensiveWakeUpThrottling** clamps hidden-page `setInterval` to ~1 second per tick, no matter what Tauri events tried to do. The lighting loop now ticks from a **dedicated Web Worker** that runs on its own thread (not subject to page visibility throttling) at the same ~100 Hz the focused window uses. WebView2 also gets the `IntensiveWakeUpThrottling` and `CalculateNativeWinOcclusion` features disabled, so timers, message ports, and IPC stop being slowed down when the window is occluded. The native Tokio pump and the JS `setInterval` remain as a belt-and-suspenders fallback.
- **Effect animations stay alive when hidden** — Chromium **pauses** (not just throttles) `requestAnimationFrame` inside iframes whenever the parent page is hidden, so HTML effects froze and the LED loop kept sampling the same canvas. Every effect iframe now boots with a small polyfill that swaps `requestAnimationFrame` for a `setInterval`-backed driver while `document.visibilityState === "hidden"`, so JavaScript / Canvas2D / WebGL effects keep redrawing at ~60 Hz when the window is minimized or in the tray. Native `requestAnimationFrame` is restored automatically when the window is visible again.

#### Workspace canvas tabs — device tree and component menu

- **Devices panel** — every layout component stays listed under its device and channel, even when it belongs to a **different canvas tab** than the one selected above the workspace. Hiding other tabs on the layout (eye on the tab strip) only affects the **Konva canvas**, not the tree. Rows on another tab show a subtle **left-edge marker**, softer name text, and the **canvas pill** (1, 2, …) for which tab owns the strip.
- **Identify** (canvas or tree) no longer wipes **LED Studio** brush colors on the layout — painted LEDs are restored when identify stops.
- **Right-click a component** on the canvas (or in the Devices tree): removed **Clear LED paint for this component** (still in **Settings → Colors → LED Studio**); **Lock layout** is renamed **Lock component**; **Move to canvas** opens a flyout submenu with all workspace tabs (current tab marked).

#### Scene bar, toolbar, and settings — Español and 简体中文

- The **Scene** label, **Save**, **Reload**, **Delete**, scene dropdown placeholder, and related tooltips and dialogs translate when you choose **Español** or **简体中文** in Settings.
- Layout toolbar buttons (align, distribute, flip, snap, grid, report, help, settings, and grid spacing) use translated **hover tooltips** in those languages.
- **Settings → User media folders** — action buttons no longer stack Chinese text vertically; intro, tabs, **删除**, and **重新扫描硬件** are fully localized.
- **Settings → System → Startup** help text uses **退出** / **关于** instead of English **Quit** / **About**; update copy no longer says **ZIP** alone.

## v0.2.73 — May 21, 2026

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

## v0.2.63 — May 19, 2026

#### Linux: correct status-bar memory and bundled effects

On Ubuntu and WSL, the bottom **Proc.** line could show hundreds of thousands of MB and inflated **CPU** because Linux reports each thread as a separate process with full RSS. The app now counts main processes only, so memory and CPU match what you would expect (~hundreds of MB, not hundreds of GB).

Installed Linux builds (`.deb`, AppImage) now find **built-in effects** from the installer’s resource folder (not only effects downloaded from rgbjunkie.com). Paths under `/usr/lib/.../resources/effects` and Tauri’s resource resolver are included.

#### Linux / WSL without a sound card

On machines with no ALSA playback device (common in WSL), RGBJunkie no longer retries audio capture in a tight loop, which avoids repeated **ALSA lib … Unknown PCM default** messages on the console. Audio-reactive effects stay off until a real sound device is present; use a normal Ubuntu desktop or PipeWire/PulseAudio setup for microphone/loopback capture.

#### Discord invite opens #welcome-and-rules

The toolbar **Discord** button now uses [discord.gg/adHsQG8czv](https://discord.gg/adHsQG8czv), which lands in **#welcome-and-rules** instead of the old invite that opened **#bot-spam**.

## v0.2.62 — May 19, 2026

#### Patch release

No separate release notes for this version. See **v0.2.64** for user-facing changes shipped in this period.

## v0.2.61 — May 19, 2026

#### Patch release

No separate release notes for this version. See **v0.2.60** for user-facing changes shipped in this period.

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

## v0.2.59 — May 19, 2026

#### Right-click → LED Studio on every component

**LED Studio…** is on the canvas and Devices sidebar menus for **every** component. It opens **Settings → Colors → LED Studio** with that component already selected. Components with no LED grid show the item disabled (tooltip explains why). Fixed-layout plugin rows in the sidebar can use the menu too (not only removable components).

#### Save confirmation toasts for device layout and effect settings

When you click **Save current layout** or **Save current effect settings**, a short success toast shows the profile name that was written. If the save fails, you get an error toast instead of only a console message.

#### App-wide links open in your browser (not inside the WebView)

**http**, **https**, and **mailto** links across the main app window now open in your default browser — Settings (About, Help, RAM/OpenRGB help text, bug-report footer, and similar), update dialogs, and other host UI. The embedded WebView no longer swallows those clicks. **Effect** panels are unchanged (they run in their own iframe). In **About**, the **build** stamp is always a link to this version’s release notes on rgbjunkie.com, including after you’re already up to date.

## v0.2.58 — May 19, 2026

#### Desktop shell: no browser right-click menu or Find (Ctrl+F)

The embedded WebView no longer shows the **Edge-style default context menu** (Back, Refresh, Inspect, etc.) when you right-click outside RGBJunkie’s own menus. **Ctrl+F** / **F3** Find on page, **Ctrl+P** print, **Ctrl+R** / **F5** reload, and **Ctrl+Plus/Minus** zoom are disabled so the app feels like a desktop tool, not a browser tab. Your **canvas and component right-click menus** (move, copy preview, component actions) are unchanged — those are part of RGBJunkie. Developer builds can still open WebView tools from the tray when the **devtools** feature is enabled.

## v0.2.57 — May 18, 2026

#### Patch release

No separate release notes for this version. See **v0.2.58** for user-facing changes shipped in this period.

## v0.2.56 — May 18, 2026

#### Patch release

No separate release notes for this version. See **v0.2.58** for user-facing changes shipped in this period.

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
