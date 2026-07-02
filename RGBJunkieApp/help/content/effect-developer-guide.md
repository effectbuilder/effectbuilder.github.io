---
title: Effect developer guide (HTML canvas)
slug: effect-developer-guide
summary: Create HTML canvas effects for RGBJunkie: metadata, sidebar settings, and the engine API for audio, screen, and sensors.
category: Developer
tags: effect, developer, canvas, html, engine
published: 2026-07-01
updated: 2026-07-01
draft: false
---
This guide is for **anyone** who wants to build **HTML canvas effects** that run inside the RGBJunkie desktop application when the user selects **Effect** lighting mode — including **beginners** still learning JavaScript. **Start with the section right below** (canvas, animation loop, sine waves, and outside links), then skim [**Section 12**](#examples-detail) worked examples in this file or in the HTML guide.

**Functional (`.mjs`) effects** — single ES modules with `meta` + `sampleLed` (no canvas) — have their own newcomer guide: **[`EFFECT-MJS-DEVELOPER-GUIDE.md`](effect-functional-developer-guide)**. The formal API is **`EFFECT-FUNCTIONAL-MJS-CONTRACT.md`**.

The numbered sections that follow are a **technical reference** (discovery metadata, `<meta property>` controls, `engine` API). It does not assume access to the RGBJunkie source tree.

For downloads, Effect Builder tooling, and gallery publishing, see **[rgbjunkie.com](https://www.rgbjunkie.com)**.

## Making simple effects (start here) {#canvas-primer}
RGBJunkie effects are normal web pages with a `<canvas>`. You draw one **frame** at a time; the app maps that picture to your LEDs. Many nice effects are just a few shapes moving in a pattern — you do not need to be an expert.

### A simple animation loop {#a-simple-animation-loop}

Browsers provide **`requestAnimationFrame`**: you register a function that runs before the next repaint (often ~60× per second). Each frame, paint the background (or clear), draw shapes using the current time, then schedule the next frame.

- `const ctx = canvas.getContext("2d")` — the “pencil” for rectangles, circles, lines, gradients.
- `canvas.width` / `canvas.height` — the drawable pixel size the host sets; use them for all layout and **scale** your shapes to match (see [Section 2.1](#canvas-container) and [Section 2.2](#canvas-scaling)).

### Drawing basic shapes {#drawing-basic-shapes}

- **Filled rectangle** — `ctx.fillStyle = "#3399ff"; ctx.fillRect(x, y, width, height);`
- **Disc** — `ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();`
- **Line** — `ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();`
- **Smooth color** — build `"hsl(" + hue + ", 80%, 55%)"` and assign to `ctx.fillStyle` (hue 0–360).

### Why `Math.sin` and `Math.cos` help {#why-mathsin-and-mathcos-help}

They always stay between **−1** and **1**. Feed them an angle that grows smoothly with time (e.g. `performance.now() / 1000`) and you get a gentle wave — great for motion and pulsing colors.

- **Circle path** — `x = cx + Math.cos(t) * R`, `y = cy + Math.sin(t) * R` with radius `R` and angle `t` in radians.
- **Slide back and forth** — `x = cx + Math.sin(t) * amplitude`.
- **Breathe a value** — `const u = Math.sin(t) * 0.5 + 0.5` gives `u` between 0 and 1 for hue, opacity, or mixing colors.

### Learn more (free, on the open web) {#learn-more-free-on-the-open-web}

- [MDN — Canvas tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [MDN — Canvas 2D reference](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [MDN — `Math.sin`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sin) · [`Math.cos`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cos)
- [MDN — `requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [MDN — JavaScript basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics)
- [javascript.info](https://javascript.info/) — modern JS, first chapters are enough to start
- [The Coding Train](https://thecodingtrain.com/) — creative coding and math, explained in a friendly way

When a moving shape on a canvas “clicks,” continue with [**Section 1**](#what) below for how RGBJunkie loads your file, then open [**Section 12**](#examples-detail) for tiny examples that call the host APIs.

> **Worked examples** — Jump to [**Section 12**](#examples-detail) in this file (or use the cards in the HTML guide) for full source plus “how it works.” That material is meant to be **read** or republished without a live `engine`; the matching `.html` files only **run** inside RGBJunkie. Optional repo copies: `examples/effects/`.

---

## 1. What an effect is {#what}

- A **single HTML document** (typically self-contained: markup, styles, and scripts) that RGBJunkie loads into an isolated **iframe** when the user picks your effect from the catalog.

> **Functional effects (`.mjs`, optional second runtime)** — Effects can also be authored as a **single ES module** that exports **`meta`** and **`sampleLed`** instead of drawing to `<canvas>`. Newcomers should start with **[`EFFECT-MJS-DEVELOPER-GUIDE.md`](effect-functional-developer-guide)**; the normative contract is **`EFFECT-FUNCTIONAL-MJS-CONTRACT.md`**. This file remains the reference for **HTML canvas** effects.
- The host injects a small bootstrap **before** your page scripts run: **`window.engine`**, **`window.points`**, **`RGBJunkie_Ready`**, and one **global variable per setting** derived from your `<meta property="…">` rows (see [Section 4](#settings)).
- Your effect usually draws each frame to a **`<canvas>`**. The main workspace engine **samples that canvas** and maps pixels to LEDs and hardware output.

### 1.1 Host contract: effects are read-only {#host-contract-readonly}

Effects run in a **sandboxed iframe**. They must treat the host as the **only** owner of devices, files, persisted app configuration, and exclusive system resources.

**Read-only with respect to the host**

- **Inputs** arrive by host injection and documented channels: globals from `<meta property>`, `window.engine`, optional color-profile maps, keyboard/geometry messages, and (when enabled) **audio features** pushed from the host. Effects **consume** these; they do not replace the host’s capture or configuration pipeline.
- **Outputs** that leave the sandbox are intentionally narrow: **pixels on your canvas** (and any values the host explicitly reads via its sampler or agreed APIs). The host maps canvas pixels to LEDs; that read is not an invitation to write plugin state from inside the effect.
- **Do not** open microphones, cameras, or HID from inside an effect for RGBJunkie’s normal lighting path — the host (or a future shared service) owns **permission and stream lifetime**. Audio-reactive effects should rely on **`engine.audio`** (or a future host-delivered audio frame API), not `getUserMedia` in the effect document, so multiple layers or tabs can share one capture without fighting for the mic.

**What “read-only” does *not* mean**

- Your effect may still keep **internal** animation state (particles, phase variables, buffers). That is normal; it is not “host state.”
- Drawing to your own canvas every frame is required, not forbidden.

**Multi-workspace UI (tabs / “canvases”)** in the desktop app is specified separately so host and effect responsibilities stay aligned: see **`EFFECT-MULTI-CANVAS-CONTRACT.md`** (layout tabs on a single Konva stage; assignment of components to tabs; effect binding per tab). Effects themselves remain read-only consumers regardless of how many tabs the host shows.

---

## 2. Minimal document shape {#shape}

Use a normal HTML5 document with a `<head>` and `<body>`. Put **catalog metadata** and **setting definitions** in `<head>`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>My Effect</title>
  <meta name="developer" content="Your Name" />
  <meta name="description" content="Short description for the effect browser." />
  <meta name="tags" content="ambient, gradient" />

  <meta property="speed" label="Speed" type="number" min="1" max="100" default="40" />

  <style>
    html, body { margin: 0; height: 100%; overflow: hidden; background: #000; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <!-- The host sets canvas.width / canvas.height; no need to hardcode 320×200. -->
  <canvas id="fx"></canvas>
  <script>
    const canvas = document.getElementById("fx");
    const ctx = canvas.getContext("2d");
    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      /* … use w/h for all layout; do not assume fixed 320×200 … */
    }
    function frame() {
      requestAnimationFrame(frame);
      draw();
    }
    window.addEventListener("resize", () => {
      /* optional: reset state when the host resizes the bitmap */
    });
    requestAnimationFrame(frame);
  </script>
</body>
</html>
```

### 2.1 Canvas and workspace container {#canvas-container}

RGBJunkie’s effect iframe is sized to fill the **workspace preview** (CSS **`width`/`height`: 100%** of that region). You should make **`html`/`body`** fill the iframe and stretch the **`<canvas>` element** the same way (`width`/`height`: **100%**, **`display: block`**) so the visible preview always tracks the panel.

**Bitmap resolution** (the canvas backing store for **`getContext("2d")`** drawing) is **managed by the host**, not by your CSS:

- The host picks the **largest** `<canvas>` in the document (by bitmap area) and sets its **`canvas.width`** / **`canvas.height`** to match the user’s **Engine Resolution**, **but never larger than fits inside the iframe’s layout box** — if the configured resolution would exceed the iframe, the bitmap is **scaled down** with **aspect preserved** so memory stays bounded.
- Whenever those dimensions change, the host dispatches a **`resize`** event on the effect **`window`**. Listen with **`addEventListener("resize", …)`** and refresh any cached sizes or grids.

**Reading sizes at runtime:**

| Source | Meaning |
| --- | --- |
| **`canvas.width`**, **`canvas.height`** | Actual drawable pixel size after host sync — **use these** for drawing coordinates and scaling your scene. |
| **`engine.canvas.width`**, **`engine.canvas.height`** | The workspace **logical** render size (Engine Resolution setting). Usually matches the bitmap; when the iframe is smaller than that resolution, the **bitmap may be smaller** than these numbers — still draw using **`canvas.width`** / **`canvas.height`**. |

Use **one primary `<canvas>`** per effect if possible so the host consistently targets the intended surface.

### 2.2 Scaling shapes to canvas size {#canvas-scaling}

Users change **Engine Resolution** in settings (for example 320×200, 640×360, or wider layouts). The host sets your drawable bitmap to that size and fires **`resize`** when it changes. **Shapes must grow or shrink with `canvas.width` / `canvas.height`** — do not hard-code pixel radii, spacing, or positions as if the canvas were always 320×200.

**What the host reports**

| Source | Use for |
| --- | --- |
| **`canvas.width`**, **`canvas.height`** | **All drawing coordinates** each frame (centers, radii, spacing, line width). |
| **`engine.canvas.width`**, **`engine.canvas.height`** | Logical **Engine Resolution** — good as a **design reference** when you author tuned constants (often matches the bitmap after sync). |
| **`window.RGBJ_REF_W`** (320), **`window.RGBJ_REF_H`** (200) | Legacy **reference** size shipped with many built-in effects; same aspect as the default engine. |
| **`rgbjSetupCanvas(canvas)`** | Host helper (injected in every effect iframe). Returns `{ width, height, scale }` where **`scale`** is a **uniform** factor: `min(canvas.width / 320, canvas.height / 200)` (clamped). Call once per frame or on **`resize`** before drawing. |

**Recommended patterns**

**1. Normalized layout** — express position as a fraction of width/height so it works at any resolution:

```javascript
const w = canvas.width, h = canvas.height;
const cx = w * 0.5, cy = h * 0.5;
const radius = Math.min(w, h) * 0.35;
ctx.arc(cx, cy, radius, 0, Math.PI * 2);
```

**2. Reference constants × scale** — keep readable “design” numbers (dot spacing `8`, link distance `60`) and multiply by a single scale factor:

```javascript
const w = Math.max(1, canvas.width | 0);
const h = Math.max(1, canvas.height | 0);
const layout = typeof rgbjSetupCanvas === "function"
  ? rgbjSetupCanvas(canvas)
  : { width: w, height: h, scale: Math.min(w / 320, h / 200) };
const dotStep = 8 * layout.scale;
const lineW = 2 * layout.scale;
ctx.lineWidth = lineW;
```

Or derive scale from **`engine.canvas`** when you tune against Engine Resolution:

```javascript
const baseW = engine?.canvas?.width || 320;
const baseH = engine?.canvas?.height || 200;
const s = Math.min(w / baseW, h / baseH);
const particleSize = 4 * s;
```

**3. Uniform scale only** — use **`Math.min(w / baseW, h / baseH)`** (not separate X/Y stretch) so circles stay round and stroke weights stay even. If you use **`ctx.scale(sx, sy)`**, wrap each frame in **`save()`** / **`restore()`** so transforms do not accumulate.

**On `resize`**

Listen with **`window.addEventListener("resize", …)`**. Re-read **`canvas.width`** / **`canvas.height`**, recompute **`scale`**, and rebuild buffers that depend on size (trail grids, offscreen canvases, particle pools). Cached values from the first frame will look wrong after the user changes Engine Resolution.

**Avoid**

- Fixed coordinates such as `x = 160` or `radius = 40` without multiplying by current width/height or **`scale`**.
- Hard-coding **`width="320" height="200"`** on `<canvas>` for production layout (a seed size in dev-only stubs is fine; the host overwrites the bitmap when the effect runs in the app).
- Assuming **`engine.canvas`** always equals the drawable bitmap — when the preview panel is smaller than Engine Resolution, **`canvas.width`** may be smaller; still scale using **`canvas.width`** / **`canvas.height`**.

---

## 3. Discovery metadata (effect browser) {#discovery}

The host reads the metas below from `<head>` when building the **effect browser** (search, filters, cards) and the compact **effect details** line in the sidebar. They are ordinary `<meta>` rows — not `<meta property>` settings.

| Role | How to declare |
| --- | --- |
| **Developer / author** | `<meta name="developer" content="…">` — also accepted: **`author`**, **`publisher`**, **`creator`**, or the same names as **`property`** on `<meta>`. |
| **Description** | `<meta name="description" content="…">` or `property="description"`. |
| **Tags** | `<meta name="tags" content="a, b, c">` — comma-separated; **`keywords`** is accepted as an alias. Tags (with the effect **name**, **developer**, and **description**) feed **search and style filters** in the effect browser — use words users might look for (`ambient`, `audio`, `spectrum`, …) so your effect groups naturally with similar entries. |

If omitted, the UI shows sensible placeholders.

### 3.1 Grouping and tooltips on `<meta property>` (sidebar) {#discovery-grouping}

The same `<head>` usually contains **`<meta property="…">`** rows for user-facing controls (see [Section 4](#settings)). Those rows are **not** parsed as discovery metadata, but they **do** control how options appear in the workspace **Effect** panel:

- **Category tab (`group`)** — Set `group="Display"`, `group="Audio"`, or any short tab name so the control lands in that **top-level category**. Aliases: `setting-group`, `settingGroup`. If you omit `group`, RGBJunkie infers a tab from the property name and label (e.g. names mentioning `audio` lean toward **Audio**).
- **Tab order (`groupOrder`)** — Optional document-level meta: `<meta name="groupOrder" content="Look, Processing, Display" />` (comma-separated; must match `group` names exactly). Listed groups appear in that order; any other groups follow, in the order they first appear among `<meta property>` rows. Without `groupOrder`, tab order follows first occurrence in the HTML only.
- **Sub-tab from `label`** — If the label contains **`:`**, the text **before** the first colon is a **sub-tab** inside the category; the text after is the row title (e.g. `label="Fans: Row 1 count"`). Labels without **`:`** use the category’s default sub-tab (often **General**).
- **Tooltips** — Add `tooltip="Longer help text"` on any `<meta property>` row. The host shows it as the row’s native **hover tooltip** (`title`) on the label and control strip.

Full attribute list: [Section 4.1](#settings).

---

## 4. Settings (`<meta property>`) {#settings}

Declare user-adjustable parameters as **empty custom elements** with attributes (HTML5 allows unknown elements).

```html
<meta
  property="speed"
  label="Speed"
  type="number"
  min="1"
  max="100"
  step="1"
  default="40"
/>
```

### 4.1 Attributes {#41-attributes}

| Attribute | Purpose |
| --- | --- |
| **`property`** | **Required.** Becomes the **global variable name** in the effect iframe (`speed`, `hueShift`, …). Use stable names; values persist in user profiles. |
| **`label`** | **Recommended.** Shown in the sidebar. If the label contains **`:`**, text **before** the first **`:`** is a **sub-tab** inside the category; text after is the row title (e.g. `label="Object 1: Radius"`). Without **`:`**, the row uses the category’s default sub-tab. |
| **`type`** | **Recommended.** Drives control widget and injection type ([Section 4.2](#settings-types)). |
| **`default`** | Initial value when no saved profile exists. |
| **`min`**, **`max`**, **`step`** | For numeric controls. |
| **`values`** | For **`combobox`**: comma-separated options (Unicode commas supported). |
| **`group`** | Optional **top-level category tab** (e.g. `Display`, `Audio`, `Motion`). Aliases: **`setting-group`**, **`settingGroup`**. Omitted → host infers from property name + label. |
| **`groupOrder`** (document meta) | Optional **tab order** for category groups: `<meta name="groupOrder" content="Tab A, Tab B" />` in `<head>` (not on each property row). Names must match **`group`** values. Unlisted groups appear after listed ones, in document order. |
| **`tooltip`** | Optional longer help; shown as the row’s hover **`title`** tooltip. The HTML **`title`** attribute on the same `<meta>` row is also read. |

### 4.2 Supported `type` values {#settings-types}

The host normalizes a few aliases (e.g. **`list`** → **`combobox`**, **`slider`** → **`number`**). Unknown types fall back to a **text** field.

| `type` | Sidebar control | Injected global |
| --- | --- | --- |
| **`number`** | Slider (range input) | JavaScript **number** |
| **`boolean`** | Checkbox | **boolean** |
| **`color`** | Color picker | **string** (use **`#rrggbb`** for defaults) |
| **`string`** / **`text`** | Text input | **string** |
| **`combobox`** | Dropdown | **string** (one of **`values`**) |
| **`colorprofile`** | Color-profile picker | Host injects **two** globals: **`<propName>`** (string, the profile id, e.g. `"Rainbow"`) and **`<propName>Stops`** (`string[]`, a ready-to-draw closed array of hex stops — host resolves Rainbow / None / Custom modes so effects don't have to). Effects should normally just read `<propName>Stops`. The full catalog is still available at **`window.__rgbjColorProfiles`** for effects that need names, labels, or modes. Teaching example: **`examples/effects/gradient-colorprofile-demo.html`**. |

After launch, your script may read **`speed`**, **`hueShift`**, etc. as **globals** on `window` (same names as **`property`**). When the user moves a control, the host updates that global on the fly.

**Color strings:** For **`type="color"`**, prefer **`default="#rrggbb"`** (six hex digits with `#`), consistent with plugin settings.

---

## 5. Host-injected globals {#globals}

Always available in the effect iframe (unless your script overwrites them):

| Global | Meaning |
| --- | --- |
| **`engine`** | Alias of the parent **`rgbEngine`** object ([Section 6](#engine)). |
| **`points`** | Array (initialized empty); legacy compatibility for some effects. |
| **`RGBJunkie_Ready`** | Set **`true`** after bootstrap; effects may poll it if they start before wiring completes. |

Each **`meta property="foo"`** injects **`window.foo`** with the current parameter value.

---

## 6. Host APIs (`engine`) {#engine}

RGBJunkie injects an **`engine`** object (same as **`window.engine`**) so your effect can read **audio**, **screen pixels**, and **PC sensor** values without opening microphones or capture APIs yourself. Capabilities can change by app version — treat **[rgbjunkie.com](https://www.rgbjunkie.com)** as the public statement for what ships today.

**Quick links:** [Audio](#engine-audio) · [Stereo](#engine-audio-stereo) · [Canvas helpers](#engine-canvas) · [Screen capture](#engine-screen) · [PC sensors](#engine-sensors)

### 6.1 Audio — react to music {#engine-audio}

Each frame, read **`engine.audio`**. The host updates it about **30 times per second** from desktop loopback capture (what you hear on Windows). Old effects can keep using the mono fields only — nothing breaks when stereo is available.

| Field | Meaning |
| --- | --- |
| **`freq`** | 200 numbers from bass to treble (each **0…255**). This is the **mono mix** — the usual starting point for bar visualizers. |
| **`level`** | Overall loudness, roughly **−100** (quiet) to **0** (hot). |
| **`density`** | How much energy is in the spectrum, **0…1**. Handy for simple “is music playing?” checks. |

Teaching example (mono): [Section 12.2](#ex-audio). For left/right visuals, continue to [Stereo](#engine-audio-stereo) below.

### 6.2 Stereo — left and right channels {#engine-audio-stereo}

When Windows capture has separate channels, **`engine.audio.stereo`** is **`true`** and you also get per-channel spectra and loudness. On mono sources, **`stereo`** is **`false`** — use **`freq`** for both sides so the layout still looks balanced.

| Field | Meaning |
| --- | --- |
| **`freqL`**, **`freqR`** | Same 200-bin layout as **`freq`**, one array per ear. |
| **`levelL`**, **`levelR`**, **`densityL`**, **`densityR`** | Per-channel loudness and energy (same scales as the mono fields). |
| **`pan`** | **−1** (left) … **+1** (right), **0** when centered or mono. |

**Safe pattern:**

```javascript
const a = engine.audio;
if (!a || !a.freq || a.freq.length < 2) return;

const stereo =
  !!a.stereo &&
  a.freqL && a.freqR &&
  a.freqL.length === a.freq.length &&
  a.freqR.length === a.freq.length;

const left = stereo ? a.freqL : a.freq;
const right = stereo ? a.freqR : a.freq;
```

Functional **`.mjs`** effects use the same fields on **`args.context.audio`** — [functional guide: Stereo audio](effect-functional-developer-guide#audio-stereo). Gallery examples: **Stereo Spectrum**, **Stereo Ring Spectrum**.

**Platform:** Stereo loopback is on **Windows** today. Elsewhere, guard on **`stereo`** and fall back to mono.

### 6.3 Canvas helpers {#engine-canvas}

These help your drawing match the user’s **Engine Resolution** setting (see [Section 2.1](#canvas-container), [Section 2.2](#canvas-scaling)).

| Member | Role |
| --- | --- |
| **`engine.canvas.width`**, **`engine.canvas.height`** | Logical resolution from settings. Your **`<canvas>`** element’s **`width`**/**`height`** may be smaller if the preview panel is tight — always draw using the element size. |
| **`rgbjSetupCanvas(canvas)`** | Returns **`{ width, height, scale }`** — uniform scale vs the 320×200 reference. Call each frame or on **`resize`**. |
| **`RGBJ_REF_W`**, **`RGBJ_REF_H`** | Reference constants **320** and **200** used by many built-in effects. |

### 6.4 Screen capture — sample the desktop {#engine-screen}

In plain English: your effect asks for a snapshot of the user’s desktop, draws it on the canvas, and the host maps those pixels to LEDs. You do **not** pick the monitor, frame rate, or capture size in code — when you call either API below, RGBJunkie adds **Display**, **Capture rate**, and **Capture size** sliders to the effect sidebar automatically.

| Member | Role |
| --- | --- |
| **`engine.requestNativeScreenBitmap()`** *(recommended)* | Returns **`Promise<ImageBitmap>`** you can **`drawImage`** — no arguments. |
| **`engine.requestNativeScreenFrame()`** | Raw pixels for analysis (dominant color, brightness zones). Returns **`{ width, height, data, toImageData() }`**. |
| **`engine.systemScreen`** / **`engine.screen`** | Last captured frame buffer (**`width`**, **`height`**, **`data`**, **`updatedAt`**). |
| **`engine.getScreenCaptureImageData()`** | **`ImageData`** from the last successful capture, or **`null`**. |
| **`engine.listScreenMonitors()`** | List of monitors if you build custom UI (most effects should rely on the host Display control instead). |

Do **not** declare **`screen_monitor_index`**, **`screen_capture_fps`**, or **`screen_capture_size`** in your HTML. Do **not** pass legacy size/monitor arguments or run your own **`setTimeout`** capture loop. Walkthrough: [Section 12.3](#ex-screen). Production reference: **Screen Ambience** catalog effect.

### 6.5 PC sensors — CPU, GPU, fans {#engine-sensors}

Read hardware stats from the bundled LibreHardwareMonitor helper (Windows). Declare sidebar pickers with **`type="sensor"`** in your metadata.

| Member | Role |
| --- | --- |
| **`engine.sensors`** | **`list()`**, **`get(id)`**, **`normalize(id)`** — stable IDs for CPU/GPU load, temperatures, fan speeds, and more. |
| **`engine.getSensorValue(name)`** | Legacy Effect Builder name lookup — returns **`{ value: number }`**. Prefer **`engine.sensors`** for new effects. |

---

## 7. Rendering and compositing {#rendering}

- Draw your scene to a **`canvas`** in the effect document. The host reads pixels from the iframe (**largest** canvas / bitmap bridge) and composites into the **workspace** output that drives LEDs.
- Size your **CSS layout** to fill the iframe ([Section 2.1](#canvas-container)); size your **drawing** using **`canvas.width`** / **`canvas.height`** after host sync, **scale shapes** to that bitmap ([Section 2.2](#canvas-scaling)), and handle **`resize`** when the window or Engine Resolution changes.
- Prefer a **`requestAnimationFrame`** loop; avoid busy loops that block the iframe.
- If you use **screen capture**, call **`requestNativeScreenFrame`** only when needed; overlapping calls with the same options may share one native capture internally.

---

## 8. Optional: keyboard → canvas coordinates (privacy) {#8-optional-keyboard--canvas-coordinates-privacy}

The host relays **physical key codes only** (`KeyboardEvent.code`, e.g. `KeyA`, `Space`) into the effect iframe — **not** `event.key` or typed characters.

To receive a press as a **canvas position**:

1. Set **`window.__rgbjKeyboardSpotByCode`** to an object mapping each relevant `code` string to **`{ x, y }`** in **your effect canvas pixel space** (typically key centers).
2. Implement **`onKeyboardCanvasPoint(x, y)`** on `window` (or a global function with that name). The host-injected relay resolves `code` → `{x,y}` and calls your handler with those numbers only.

If these are absent, keyboard relay no-ops for that effect.

**Combiner / nested iframes:** effects that embed other effect iframes may set **`window.__rgbjForwardKeyEventsToChildLayers = true`** so the same `postMessage` payload is forwarded to child `<iframe>` documents (still **code-only**).

---

## 9. Logging {#9-logging}

**`console.log` / `warn` / `error`** in the effect iframe are forwarded to the host’s **effect log** stream so users can diagnose issues without opening devtools inside the iframe.

---

## 10. Distribution {#10-distribution}

- **Local install:** Place your `.html` file in the **user effects** folder described in the application’s documentation or settings.
- **Gallery / rgbjunkie.com:** Publishing flows, validation, and **`effect.json`** payloads are described on **[rgbjunkie.com](https://www.rgbjunkie.com)** and are separate from this generic ABI reference.

The public HTTP catalog format for the website’s gallery is **not** the same as a single effect file on disk; gallery authors should follow the site’s publishing guide.

---

## 11. Where to get help {#11-where-to-get-help}

- **Website:** [https://www.rgbjunkie.com](https://www.rgbjunkie.com) — Effect Builder, downloads, and published developer materials.
- **Functional `.mjs` effects:** **[`EFFECT-MJS-DEVELOPER-GUIDE.md`](effect-functional-developer-guide)** (tutorial) and **`EFFECT-FUNCTIONAL-MJS-CONTRACT.md`** (formal contract).

---





















## 12. Worked examples (full source) {#examples-detail}
> **Minimal teaching code.** Each example below is the smallest file that exercises one API surface — no clamping, no fallbacks, no defensive coding. They will only run inside RGBJunkie because they call host-injected globals (`window.engine`, `window.__rgbjColorProfiles`, settings declared via `<meta property>`). Copy a file into the user effects folder to try it, or just read it here.

### 12.1 Color profile gradient {#ex-gradient}
**How it works.** Declaring `<meta property="colorProfile" type="colorProfile">` tells the host to inject *two* globals into the effect: `colorProfile` (the profile id, useful for display) and `colorProfileStops` (a ready-to-draw **closed** array of hex strings — the host resolves Rainbow/None/Custom modes and closes the palette so the seam is invisible). The effect just reads `colorProfileStops` and paints. The actual teaching trick in this example is the seamless slide: the gradient is built *twice the canvas width* with both copies of the palette inside it, so as `slide` cycles 0 → 1 the visible region always falls within the gradient — no wrap visible.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Color profile gradient</title>
  <meta name="description" content="Animated gradient driven by the user's selected color profile." />

  <!--
    The `type="colorProfile"` meta tells RGBJunkie to inject TWO globals:
      * `colorProfile`      — the profile id (e.g. "Rainbow", "Sunset")
      * `colorProfileStops` — a ready-to-draw, closed hex-stop array
    Most effects only need `colorProfileStops`.
  -->
  <meta property="colorProfile" label="Color profile" type="colorProfile" default="Rainbow" />

  <style>
    html, body { margin: 0; height: 100%; background: #000; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="fx"></canvas>
  <script>
    const canvas = document.getElementById("fx");
    const ctx = canvas.getContext("2d");

    function draw() {
      const stops = colorProfileStops;
      const w = canvas.width, h = canvas.height;
      const slide = (performance.now() / 5000) % 1;

      // The gradient is 2× wide and holds two copies of the palette, so the
      // visible canvas always falls inside it as `slide` cycles 0 → 1.
      const grad = ctx.createLinearGradient(-slide * w, 0, (2 - slide) * w, 0);
      for (let i = 0; i < stops.length; i++) {
        const p = (i / (stops.length - 1)) * 0.5;
        grad.addColorStop(p, stops[i]);
        grad.addColorStop(p + 0.5, stops[i]);
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>
```

### 12.2 Audio spectrum bars {#ex-audio}
**How it works.** `engine.audio.freq` is a 200-element array of spectrum bins (each 0–255), refreshed in place by the native audio pipeline. The loop bins those 200 raw values down to `BARS` = 64 visualizer columns by sampling at even intervals — real audio visualizers always bin (most of the upper-frequency bins are near zero in normal music, so rendering all 200 looks blurry and busy). The `<canvas>` declares an explicit internal resolution of 640×320 so each bar lands on a whole-pixel boundary. **Note the explicit black `fillRect` background each frame** instead of `clearRect` — the host's canvas sampler treats fully transparent pixels (which `clearRect` produces) as "keep previous value", leaving a trail. Effects that paint a non-transparent background every frame (or fill the whole canvas with their gradient, like the previous example) sidestep this entirely.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Audio bars</title>
  <meta name="description" content="Vertical bars driven by the audio spectrum." />

  <style>
    html, body { margin: 0; height: 100%; background: #000; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <!-- Explicit internal resolution so each bar is a whole number of pixels wide. -->
  <canvas id="fx" width="640" height="320"></canvas>
  <script>
    const canvas = document.getElementById("fx");
    const ctx = canvas.getContext("2d");
    const BARS = 64;

    function draw() {
      // `engine.audio.freq` is a 200-element array of spectrum bins (each 0–255).
      // Bin down to BARS by sampling at even intervals — 64 bars is a comfortable
      // visualizer width, and most of the raw bins above the audible mid-range are
      // near zero anyway.
      const freq = engine.audio.freq;
      const w = canvas.width, h = canvas.height;
      const barW = w / BARS;

      // Paint an opaque black background each frame. `clearRect` would only zero the
      // alpha channel, and the host's per-frame canvas sampler treats fully
      // transparent pixels as "keep previous value" — that leaves a trail.
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < BARS; i++) {
        const v = freq[Math.floor(i * freq.length / BARS)] / 255;
        ctx.fillStyle = `hsl(${(i / BARS) * 360}, 80%, 55%)`;
        ctx.fillRect(i * barW, h - v * h, barW, v * h);
      }
      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>
```

### 12.3 Screen sample {#ex-screen}
**How it works.** `engine.requestNativeScreenBitmap()` returns a `Promise<ImageBitmap>` — one frame of the user's desktop, ready to `drawImage`. The loop `await`s it, paints it, closes the bitmap, then schedules the next iteration with `requestAnimationFrame`. **Everything else is host-managed.** Whenever an effect calls this API the app injects three sidebar controls automatically: *Display* (which monitor), *Capture rate* (FPS budget — the Promise does not resolve faster than the user-chosen rate), and *Capture size* (max-edge pixels of the capture). The effect itself takes **no arguments**, declares no screen-capture metas, and does not throttle its own loop. For a production-grade reference that also exposes an effect-side canvas-width control, see the shipped *Screen Ambience* effect.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Screen sample</title>
  <meta name="description" content="Draws a downscaled copy of the user's desktop into the canvas." />

  <style>
    html, body { margin: 0; height: 100%; background: #000; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="fx"></canvas>
  <script>
    const canvas = document.getElementById("fx");
    const ctx = canvas.getContext("2d");

    async function loop() {
      // Monitor, capture rate, and capture size are all host-managed — the app injects
      // sidebar controls for them. The effect just asks for the next frame.
      const bmp = await engine.requestNativeScreenBitmap();
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      bmp.close();
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>
```

*Optional repo copies (desktop testing): `examples/effects/` — regenerate this section from those files when they change.*
