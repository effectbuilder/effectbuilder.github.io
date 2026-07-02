---
title: Plugin developer guide
slug: plugin-developer-guide
summary: Build USB HID lighting plugins for RGBJunkie: the export-function format, lifecycle exports, and the device API.
category: Developer
tags: plugin, developer, device, hid, api
published: 2026-07-01
updated: 2026-07-01
draft: false
---
This guide is for **third-party developers** who want to implement a USB HID lighting plugin that runs inside the RGBJunkie desktop application. It describes the public plugin ABI and the **`device`** API available to your script. It does not assume access to the RGBJunkie source tree.

For release notes, downloads, and any packaged templates or validation tools, see **[rgbjunkie.com](https://www.rgbjunkie.com)**.

**Related:** **Effects** (Effect lighting mode) — HTML canvas in **[`EFFECT-DEVELOPER-GUIDE.md`](effect-developer-guide)** / **[`effect-developer-guide.html`](effect-developer-guide)** ([worked examples](effect-developer-guide#examples-detail)); functional **`.mjs`** effects in **`effect-functional-developer-guide.html`**. Runnable HTML samples under **`examples/effects/`**. **USB / device coverage** — browse **`supported-devices.html`** (served with the other docs, e.g. `/api/docs/supported-devices.html`).

### On this page {#on-this-page}

1. [What a plugin is](#1-what-a-plugin-is) — the mental model
2. [Standard export-function format](#2-standard-export-function-format-recommended) — **a complete plugin you can copy**
3. [Lifecycle exports](#3-lifecycle-exports) — when `initialize` / `render` / `shutdown` run
4. [`device` API](#4-device-api-summary) — HID, channels, colors, settings
5. [Common plugin patterns](#5-common-plugin-patterns) — strip, grid, zones, multi-device
6. [Shared code (`@rgbj-include`)](#6-shared-code-rgbj-include)
7. [ABI descriptor (advanced)](#7-abi-descriptor-rgbjunkie--advanced)
8. [Add-ons](#8-add-ons-extend-a-plugin-without-editing-it)
9. [Distribution and validation](#9-distribution-and-validation)
10. [Where to get help](#10-where-to-get-help)

**New here?** Read [Section 1](#1-what-a-plugin-is) for the mental model, then copy the complete plugin in [Section 2](#2-standard-export-function-format-recommended) and adapt it to your hardware.

---

## 1. What a plugin is {#1-what-a-plugin-is}

A plugin is a single **JavaScript module** (ES module syntax) that RGBJunkie loads from its **plugin directory** (see **Settings → Installed files** or **[Installed files](installed-files)** on the website). RGBJunkie runs it in a sandbox and injects the globals your plugin calls.

### How a plugin runs {#how-a-plugin-runs}

RGBJunkie drives every plugin through the same five steps. Your job is to fill in the functions for each step:

1. **Match** — RGBJunkie compares each plugged-in USB device against your **`VendorId()`** / **`ProductId()`**.
2. **Validate** — for a match, **`Validate(endpoint)`** picks the right HID interface ([Section 4.1](#41-hid-output-and-endpoint-selection)).
3. **Initialize** — **`Initialize()`** runs once: choose the HID endpoint, register LED channels or a key grid, add settings.
4. **Render loop** — **`Render()`** runs many times per second: read the colors RGBJunkie computed, pack them into your firmware's byte layout, and send them over HID.
5. **Shutdown** — **`Shutdown()`** runs on app close or PC sleep so you can leave the device in a safe state.

Everything else in this guide is detail on those five steps.

### Runtime globals {#runtime-globals}

| Global | What it is |
| --- | --- |
| **`device`** | Main API object — HID I/O, channel registration, color sampling, settings rows, layout helpers. Full reference: [Section 4](#4-device-api-summary). |
| **`bus`** | Internal event bus used by some shipped plugins for cross-plugin signals. Most third-party lighting plugins do **not** need it. |

Your plugin file may also read **globals created from settings rows** — each **`property`** / **`id`** in **`ControllableParameters()`** or **`rgbjunkie.settings`** becomes a variable in your scope (e.g. **`shutdownColor`**, **`pollingRate`**). See [Section 4.5](#45-settings-and-dynamic-parameters).

### Which format should I use? {#which-format-should-i-use}

RGBJunkie ships a large **importable device library** built as **export-function plugins** — one `.js` file per device family with `export function Name()`, `VendorId()`, `ProductId()`, `Initialize()`, `Render()`, and related entrypoints. **Write new third-party device plugins in this format** ([Section 2](#2-standard-export-function-format-recommended)) so they install cleanly and match what users already import from community repos.

When a plugin does **not** export an `export const rgbjunkie` descriptor, RGBJunkie **synthesizes** one from those export functions, so device matching, controllable parameters, and the `Initialize`/`Render`/`Shutdown` lifecycle all flow through the same pipeline.

The **`export const rgbjunkie` descriptor** ([Section 7](#7-abi-descriptor-rgbjunkie--advanced)) is RGBJunkie’s **optional advanced format**. It is used internally for RAM, GPU, motherboard, and the WLED virtual device, and remains fully supported — but it is **not** the starting point for new community device plugins.

---

## 2. Standard export-function format (recommended) {#2-standard-export-function-format-recommended}

Write new device plugins with **`export function`** entrypoints — the same format as RGBJunkie's built-in device library. You do **not** write an `export const rgbjunkie` descriptor; the host builds one from your exports. (The descriptor is an advanced option — [Section 7](#7-abi-descriptor-rgbjunkie--advanced).)

### A complete plugin {#a-complete-plugin}

This is a full, working plugin. Copy it, change the IDs and the `buildPacket` byte layout to match your hardware, and load it ([how to load](#load-your-plugin)):

```javascript
// 1. Identity — RGBJunkie matches these against plugged-in USB devices
export function Name() { return "Example RGB Strip"; }
export function VendorId() { return 0x1234; }         // your USB vendor ID
export function ProductId() { return 0x5678; }        // one PID, or [0x5678, 0x5679]
export function DeviceType() { return "lightingcontroller"; }
export function Publisher() { return "Your Studio"; }

// 2. Pick the right HID collection during USB probe
export function Validate(endpoint) {
  return endpoint.interface === 0;
}

// 3. Runs once when the device opens
export async function Initialize() {
  device.set_endpoint(0, 0x0001, 0xffc0, 0); // choose the HID endpoint
  device.addChannel("Strip", 30);            // 30 LEDs the host will fill
}

// 4. Runs every lighting frame
export async function Render() {
  const colors = device.channel("Strip").getColors("Inline", "GRB");
  device.write(buildPacket(colors), 65);     // 65 = your device's report size
}

// 5. Runs on app close or PC sleep
export async function Shutdown(systemSuspending) {
  device.write(buildPacket([]), 65);         // e.g. all-black
}

// 6. Your protocol — turn host colors into the bytes your firmware expects
function buildPacket(colors) {
  const packet = new Array(65).fill(0);
  packet[0] = 0x00;                          // report ID (vendor-specific)
  for (let i = 0; i < colors.length; i++) packet[1 + i] = colors[i];
  return packet;
}
```

### What each part does {#what-each-part-does}

1. **Identity exports** (`Name`, `VendorId`, `ProductId`) tell RGBJunkie which USB device this plugin drives. These three are **required** — without them the plugin will not load.
2. **`Validate(endpoint)`** picks the correct HID interface during probing ([Section 4.1](#41-hid-output-and-endpoint-selection)).
3. **`Initialize()`** chooses the HID endpoint and registers a **channel** — a named LED segment the host fills with colors ([Section 4.2](#42-channels-and-host-filled-colors)).
4. **`Render()`** runs every frame: read the host-filled colors, pack them into your firmware's byte layout, and send with **`device.write`** ([Section 4.1](#41-hid-output-and-endpoint-selection)).
5. **`Shutdown()`** leaves the device in a safe state.
6. **`buildPacket`** is *your* code — the vendor byte layout. Everything else is the RGBJunkie contract.

### Load your plugin {#load-your-plugin}

1. Save the file under your plugin folder (path shown in **Settings → Installed files**), e.g. **`plugins/<Vendor>/Example_Strip.js`**.
2. Open the **Devices** panel and click **Rescan**.
3. Plug in the device — it appears in the list once a `(VendorId, ProductId)` pair matches.

To iterate quickly, enable **Settings → System → Engine → Hot-reload user plugins**, which reloads saved `.js` files without a restart.

### Required exports {#required-exports}

| Export | Returns | Role |
| --- | --- | --- |
| **`Name()`** | `string` | Human-readable label in the device list (e.g. `"Nollie32"`). |
| **`VendorId()`** | `number` | USB **vendor ID** as a hex literal (e.g. `0x3061`). RGBJunkie matches this against plugged-in hardware. |
| **`ProductId()`** | `number` or `number[]` | USB **product ID(s)** for this plugin. Return one number or an array when several PIDs share the same protocol (e.g. `return [0x1234, 0x1235]`). |
| **`Initialize()`** | `void` or `Promise` | Runs once when the device is opened: pick HID endpoint, register channels/layout, add settings. |
| **`Render()`** | `void` or `Promise` | Runs every lighting frame: read host colors, build **`packet`**, call **`device.write`**. |
| **`Shutdown(systemSuspending)`** | `void` or `Promise` | Runs when the app closes or the PC sleeps. **`systemSuspending`** is **`true`** on sleep/hibernate — often use black or a saved shutdown color. |

### Common optional exports {#common-optional-exports}

| Export | Returns | Maps to |
| --- | --- | --- |
| **`Publisher()`** | `string` | **`publisher`** — your name or org. |
| **`DeviceType()`** | `string` | **`deviceKind`** — e.g. `"keyboard"`, `"lightingcontroller"` ([Section 7.3](#73-devicekind)). |
| **`Type()`** | `string` | **`transportType`** — usually `"Hid"` ([Section 7.2](#72-transporttype)). |
| **`Size()`** | `[number, number]` | **`size`** — logical grid **width × height** in cells (keyboards, mats). |
| **`Documentation()`** | `string` | **`documentation`** — help slug (optional). |
| **`DefaultPosition()`** | `[number, number]` | **`defaultPosition`** — `[x, y]` canvas hint when the user adds the device. |
| **`DefaultScale()`** | `number` | **`defaultScale`** — zoom hint for the canvas representation. |
| **`ImageUrl()`** | `string` | **`imageUrl`** — **`https://…`** brand tile URL or `""`. |
| **`DefaultComponentBrand()`** | `string` | **`componentBrand`** — default brand label for new layout components. |
| **`SubdeviceController()`** | `boolean` | **`subdeviceController`** — `true` when you use zone APIs ([Section 4.4](#44-multiple-zones-subdevices)). |
| **`Validate(endpoint)`** | `boolean` | HID filter — **`endpoint`** object ([Section 4.1](#41-hid-output-and-endpoint-selection)). Not synthesized; must be exported if used. |
| **`ControllableParameters()`** | `object[]` | Sidebar settings rows ([Section 4.5](#45-settings-and-dynamic-parameters)). |
| **`LedNames()`** / **`getLedNames()`** | `string[]` | One label per LED/key ([Section 4.3](#43-fixed-layout-grids-keyboards-mats-matrices)). |
| **`LedPositions()`** / **`getLedPositions()`** | `number[][]` | Parallel array of **`[x, y]`** grid coordinates ([Section 4.3](#43-fixed-layout-grids-keyboards-mats-matrices)). |

### Good to know {#good-to-know}

- **Casing is flexible.** Lifecycle can be **`Initialize`** / **`Render`** / **`Shutdown`** (PascalCase) or **`initialize`** / **`render`** / **`shutdown`** (camelCase). The host accepts either.
- **The `device` API is always available** ([Section 4](#4-device-api-summary)) — you do not import it.
- **Use the descriptor only when you must.** Reach for **`export const rgbjunkie`** ([Section 7](#7-abi-descriptor-rgbjunkie--advanced)) only for descriptor-only fields or RGBJunkie's built-in subsystems.

---

## 3. Lifecycle exports {#3-lifecycle-exports}

[Section 2](#2-standard-export-function-format-recommended) shows the three lifecycle hooks in a working plugin. This section covers their **timing and behavior**.

| Function | When it runs | Argument |
| --- | --- | --- |
| **`initialize()`** / **`Initialize()`** | **Once**, when the device opens (after a successful **`Validate`**). | *(none)* |
| **`render()`** / **`Render()`** | **Every lighting frame** — many times per second while the device is active. | *(none)* |
| **`shutdown(systemSuspending)`** / **`Shutdown()`** | Once, on app close, device removal, or PC sleep. | **`systemSuspending`**: **`boolean`** — **`true`** on sleep/hibernate, **`false`** on app close or rescan. |

Each may return a **Promise**; the host **awaits** it before continuing.

### The render loop {#the-render-loop}

**`render`** is the hot path. It runs on every frame, so keep it cheap:

- Read the colors RGBJunkie already computed (**`device.channel(...).getColors`**, **`device.color`**, **`device.subdeviceColor`**) — do not recompute effects yourself.
- Build the packet and send it (**`device.write`** / **`send_report`**). That is the whole job.
- Avoid allocations, logging, and blocking work in the loop where you can.
- To slow the loop down for hardware that cannot keep up (e.g. LCD encoders), cap it with **`device.setFrameRateTarget(fps)`** ([Section 4.7](#47-frame-pacing-and-watchdog)).

### Shutdown {#shutdown}

Use **`systemSuspending`** to decide the parting state — often black on sleep, or a saved color otherwise:

```javascript
export async function Shutdown(systemSuspending) {
  const hex = systemSuspending ? "#000000" : shutdownColor; // shutdownColor is a settings global
  device.write(buildSolidPacket(hex), REPORT_LEN);
}
```

**Never throw** from a lifecycle function. Errors are logged and the device may stop updating. Wrap risky work in `try/catch`.

---

## 4. `device` API (summary) {#4-device-api-summary}

The global **`device`** object is injected into your plugin sandbox — you do not import it. This section is the reference for everything your plugin calls at runtime. **Argument and return details** are spelled out in each subsection.

### What do I need? (cheat sheet) {#what-do-i-need-cheat-sheet}

| I want to… | Use | Section |
| --- | --- | --- |
| Send bytes to the device | **`device.write(packet, length)`** | [4.1](#41-hid-output-and-endpoint-selection) |
| Choose the HID interface | **`device.set_endpoint(...)`** + **`Validate(endpoint)`** | [4.1](#41-hid-output-and-endpoint-selection) |
| Read from the device | **`device.readAsync(...)`** / **`get_report(...)`** | [4.1](#41-hid-output-and-endpoint-selection) |
| Register a strip / segment | **`device.addChannel(name, ledCount)`** | [4.2](#42-channels-and-host-filled-colors) |
| Get the colors for a strip | **`device.channel(name).getColors(...)`** | [4.2](#42-channels-and-host-filled-colors) |
| Lay out keyboard/matrix keys | **`setControllableLeds`** or **`LedNames`/`LedPositions`** | [4.3](#43-fixed-layout-grids-keyboards-mats-matrices) |
| Get the color at a grid cell | **`device.color(x, y)`** | [4.3](#43-fixed-layout-grids-keyboards-mats-matrices) |
| Split into named zones | **`createSubdevice`** / **`subdeviceColor`** | [4.4](#44-multiple-zones-subdevices) |
| Add a settings control | **`ControllableParameters()`** / **`device.addProperty`** | [4.5](#45-settings-and-dynamic-parameters) |
| Show an image / LCD | **`setImageFromBase64`** / **`setImageFromUrl`** | [4.6](#46-displays-and-image-helpers) |
| Cap the frame rate | **`device.setFrameRateTarget(fps)`** | [4.7](#47-frame-pacing-and-watchdog) |

RGBJunkie's engine is built around **lighting** (channels, color sampling, HID LED streams), but many shipped plugins also expose **vendor hardware options** — DPI, polling rate, lift-off distance, and similar controls via **`ControllableParameters()`**, **`rgbjunkie.settings`**, or **`device.addProperty`**.

**Also available (where supported):** fan/pump registry (`createFanControl`, `setRPM`), temperature probes, **`setImageFromUrl`**, **`addFeature("battery")`**, **`getBrightness()`**. **`sendEvent`** (keyboard/mouse injection) only when the user enables **Settings → System → Allow plugins to send keyboard/mouse input**. Monitor DDC/CI brightness is **Windows-only** for v1.

### 4.1 HID output and endpoint selection {#41-hid-output-and-endpoint-selection}

#### `device.write(packet, length)` and `device.send_report(packet, length)` {#devicewritepacket-length-and-devicesend_reportpacket-length}

Send a **raw HID output buffer** to the device.

| Argument | What it is |
| --- | --- |
| **`packet`** | JavaScript **array of bytes** (`0`–`255`) in firmware order — often report ID, command byte, RGB payload, padding, checksum. |
| **`length`** | How many bytes to send from **`packet[0]`**. Usually the device’s **fixed report size** (e.g. **`65`**, **`1024`**). **`write`** zero-pads if **`packet`** is shorter. |

Prefer **`write`** for the main LED stream; **`send_report`** when the protocol uses feature/output report framing. Bytes clamp to **0–255**. Do not throw from **`render`**.

```javascript
const REPORT_LEN = 65;
const packet = new Array(REPORT_LEN).fill(0);
packet[0] = 0x00; packet[1] = 255; packet[2] = 0; packet[3] = 0;
device.write(packet, REPORT_LEN);
```

#### `device.set_endpoint(interface, usage, usage_page, collection?)` {#deviceset_endpointinterface-usage-usage_page-collection}

Select which HID **interface collection** to use for subsequent read/write on this device.

| Argument | What it is |
| --- | --- |
| **`interface`** | USB interface number (integer, often `0`). |
| **`usage`** | HID **usage** value for your protocol’s collection. |
| **`usage_page`** | HID **usage page** (e.g. `0xffc0` vendor-specific, `0xff00` generic). |
| **`collection`** | Optional collection index (often `0`). Omit if not needed. |

Call once in **`initialize`** with the same tuple you match in **`Validate(endpoint)`**.

#### `Validate(endpoint)` (export function) {#validateendpoint-export-function}

During USB probe, RGBJunkie calls this with one object per HID collection:

| Field | Type | Meaning |
| --- | --- | --- |
| **`endpoint.interface`** | `number` | USB interface number. |
| **`endpoint.usage_page`** | `number` | HID usage page. |
| **`endpoint.usage`** | `number` | HID usage. |
| **`endpoint.collection`** | `number` | Collection index (often `0`). |

Return **`true`** only for the collection your plugin will **`set_endpoint`** to.

```javascript
export function Validate(endpoint) {
  return endpoint.interface === 0 && endpoint.usage_page === 0xffc0;
}
```

#### HID reads {#hid-reads}

| Method | Arguments | Returns |
| --- | --- | --- |
| **`device.readAsync(buffer, length, timeoutMs?)`** | **`buffer`**: placeholder (often `[]`); **`length`**: max bytes to read; **`timeoutMs`**: optional timeout. | `Promise<number[]>` — bytes from the device. |
| **`device.input_reportAsync(...)`** | Same as **`readAsync`**. | Same (alias name). |
| **`device.get_report(prefix, length)`** | **`prefix`**: byte array sent before read (report ID prefix); **`length`**: bytes to read. | `number[]` (sync). |

### 4.2 Channels and host-filled colors {#42-channels-and-host-filled-colors}

Channels are **named LED segments** (strips, fans, zones). RGBJunkie fills them from the workspace/effect pipeline; your **`render`** reads bytes and sends them over HID.

#### `device.addChannel(name, ledCount)` {#deviceaddchannelname-ledcount}

| Argument | What it is |
| --- | --- |
| **`name`** | String label shown in the UI (e.g. `"Strip"`, `"Fans"`). Must match the name passed to **`device.channel(name)`**. |
| **`ledCount`** | Total physical LEDs on that segment (integer). |

#### `device.channel(name)` {#devicechannelname}

| Argument | What it is |
| --- | --- |
| **`name`** | Same string passed to **`addChannel`**. |

**Returns** an object with:

| Member | What it is |
| --- | --- |
| **`LedCount()`** | Total LEDs registered for this channel. |
| **`MappedLedCount()`** | LEDs currently mapped on the user’s canvas (may be less than **`LedCount()`**). |
| **`getColors(format, order)`** | See below. |

#### `getColors(format, order)` {#getcolorsformat-order}

| Argument | What it is |
| --- | --- |
| **`format`** | Legacy label (e.g. **`"Inline"`**). The host **ignores** this string today — pass **`"Inline"`** for compatibility with shipped plugins. |
| **`order`** | **`"RGB"`** or **`"GRB"`** — byte order in the returned array. |

**Returns:** flat **`number[]`**, length **`mappedLedCount × 3`**, values **`0–255`**.

```javascript
const bytes = device.channel("Strip").getColors("Inline", "GRB");
// bytes = [g0, r0, b0, g1, r1, b1, …] for each mapped LED
```

#### `device.SetLedLimit(n)` / `device.removeChannel(name)` {#devicesetledlimitn--deviceremovechannelname}

| Method | Argument |
| --- | --- |
| **`SetLedLimit(n)`** | **`n`**: cap on total LEDs for discovery/UI. |
| **`removeChannel(name)`** | **`name`**: channel to unregister. |

### 4.3 Fixed-layout grids (keyboards, mats, matrices) {#43-fixed-layout-grids-keyboards-mats-matrices}

For per-key/per-cell devices, register a **logical grid**. Coordinates are **integers** starting at **`(0, 0)`** top-left, one unit per cell, matching **`Size()`**.

#### `device.setControllableLeds(ledNames, positions)` {#devicesetcontrollableledslednames-positions}

| Argument | What it is |
| --- | --- |
| **`ledNames`** | `string[]` — label per LED (e.g. `"A"`, `"Esc"`). |
| **`positions`** | `number[][]` — parallel array; each entry **`[x, y]`** grid cell for that LED. |

Alternatively export **`LedNames()`** and **`LedPositions()`** (or **`getLedNames`** / **`getLedPositions`**) returning the same shapes — RGBJunkie may call them at startup.

```javascript
export function LedNames() {
  return ["Key A", "Key B"];
}
export function LedPositions() {
  return [[0, 0], [1, 0]];
}
export function Size() {
  return [15, 5]; // grid is 15 columns × 5 rows
}
```

#### `device.color(x, y)` {#devicecolorx-y}

| Argument | What it is |
| --- | --- |
| **`x`**, **`y`** | Integer cell coordinates on the fixed grid. |

**Returns:** **`[r, g, b]`** — three numbers **`0–255`**.

```javascript
const [r, g, b] = device.color(3, 2); // color at grid cell (3, 2)
```

#### `device.setControllableLedSizes(sizes)` (optional) {#devicesetcontrollableledsizessizes-optional}

| Argument | What it is |
| --- | --- |
| **`sizes`** | `number[][]` — per-LED **`[width, height]`** in grid units for wide/tall keys (visual layout only). |

### 4.4 Multiple zones (“subdevices”) {#44-multiple-zones-subdevices}

Zones split one physical device into named regions (e.g. keyboard + logo + strip).

| Method | Arguments | What it does |
| --- | --- | --- |
| **`device.createSubdevice(name)`** | **`name`**: zone string. | Declares a zone. |
| **`device.setSubdeviceLeds(name, ledNames, positions)`** | Same as **`setControllableLeds`**, scoped to **`name`**. | Registers LEDs for that zone. |
| **`device.subdeviceColor(name, x, y)`** | **`name`**: zone; **`x`**, **`y`**: grid coords. | **Returns `[r, g, b]`** (0–255). Single-color zones return that color for any **`x`/`y`**. |

### 4.5 Settings and dynamic parameters {#45-settings-and-dynamic-parameters}

Plugin settings appear under **Plugin Settings** in the device tree. Each row becomes a **global variable** in your plugin (saved in user profiles).

#### Row shape (`ControllableParameters`, `device.addProperty`, `rgbjunkie.settings`) {#row-shape-controllableparameters-deviceaddproperty-rgbjunkiesettings}

Export-function plugins use **`property`**; descriptor plugins use **`id`** — same role.

| Field | Required | What it is |
| --- | --- | --- |
| **`property`** / **`id`** | Yes | Global name and profile key (e.g. `"shutdownColor"`, `"pollingRate"`). **Do not rename** after release. |
| **`label`** | Recommended | Text shown in the sidebar. |
| **`type`** | Yes | **`boolean`**, **`number`**, **`color`**, **`string`**, **`combobox`**, **`list`**, **`select`**, **`range`**, **`slider`** ([Section 7.4](#74-settings-row-type)). |
| **`default`** | Recommended | Initial value (string or number; colors as **`"#RRGGBB"`**). |
| **`group`** | Optional | Sidebar tab (e.g. **`"lighting"`**). |
| **`min`**, **`max`**, **`step`** | Numeric types | Bounds for number/range/slider. |
| **`values`** | **`combobox`** / **`list`** | Allowed option strings. |

When the user changes a value, RGBJunkie updates the global and may call **`onXxxChanged()`** (e.g. **`pollingRate`** → **`onPollingRateChanged()`**).

#### `device.addProperty(descriptor)` / `getProperty` / `setProperty` {#deviceaddpropertydescriptor--getproperty--setproperty}

| Method | Arguments |
| --- | --- |
| **`addProperty(descriptor)`** | One settings row object (same fields as above). Used in **`initialize`** for dynamic UI (DPI stages, etc.). |
| **`getProperty(property)`** | **`property`**: string key. Returns **`{ …descriptor, value }`**. |
| **`setProperty(property, value)`** | **`property`**: key; **`value`**: new value (host coerces by **`type`**). |

You can also read globals directly after registration: **`if (pollingRate > 500) { … }`**.

```javascript
export function ControllableParameters() {
  return [
    { property: "shutdownColor", group: "lighting", label: "Shutdown Color", type: "color", default: "#000000" },
    { property: "ledOrder", group: "lighting", label: "Wire order", type: "combobox", values: ["RGB", "GRB"], default: "GRB" },
  ];
}

export function onLedOrderChanged() {
  // user picked a new wire order — push config packet if needed
}
```

### 4.6 Displays and image helpers {#46-displays-and-image-helpers}

For LCD / image surfaces (device-specific):

| Method | Typical arguments |
| --- | --- |
| **`device.setImageFromBase64(...)`** | Base64 image data for an on-device screen. |
| **`device.setSubdeviceImage(name, ...)`** | Image for a named zone. |
| **`device.getImageBuffer(...)`** | Readback buffer for encoding. |
| **`device.setImageFromUrl(url)`** | **`url`**: **HTTPS** URL on an allowed host. |

Confirm support for your hardware and RGBJunkie version on **[rgbjunkie.com](https://www.rgbjunkie.com)**.

### 4.7 Frame pacing and watchdog {#47-frame-pacing-and-watchdog}

| Method | Argument | What it is |
| --- | --- | --- |
| **`device.setFrameRateTarget(fps)`** | **`fps`**: number, or **`0`** / **`null`** to clear. | Caps how often **`render`** runs (e.g. slow LCD JPEG encoders). |
| **`device.setNeedsWatchdogRefresh(needs)`** | **`needs`**: **`boolean`**. Default **`true`**. | **`false`** if firmware **holds** the last frame until the next packet; **`true`** if LEDs blank without periodic traffic. |

```javascript
export function initialize() {
  device.addChannel("Strip", 60);
  device.setNeedsWatchdogRefresh(false);
}
```

### 4.8 Other helpers {#48-other-helpers}

| Method | Arguments | Returns / notes |
| --- | --- | --- |
| **`device.createColorArray(color, count, format, order)`** | **`color`**: **`"#RRGGBB"`** hex; **`count`**: LED count; **`order`**: **`"RGB"`** or **`"GRB"`**. | Flat byte array of **`count × 3`** bytes filled with that color. |
| **`device.pause(ms)`** | **`ms`**: milliseconds (bounded). | Synchronous delay between init commands so firmware can keep up. |
| **`device.createFanControl(name)`** | **`name`**: fan/pump label. | Registers a row in the device-tree fan UI (your plugin still sends HID to drive hardware). |
| **`device.setRPM(name, rpm)`** | **`name`**: fan; **`rpm`**: integer RPM display value. | Updates reported RPM in the UI. |

---

## 5. Common plugin patterns {#5-common-plugin-patterns}

Each pattern below lists **which functions you call**, **what you pass**, and **what you get back**.

### 5.1 Single channel strip or hub {#51-single-channel-strip-or-hub}

| Step | Call | Arguments / returns |
| --- | --- | --- |
| Init | **`device.addChannel(name, ledCount)`** | **`name`**: `"Strip"`; **`ledCount`**: physical LED count (e.g. `60`). |
| Init | **`device.set_endpoint(...)`** | Same tuple as **`Validate(endpoint)`** ([Section 4.1](#41-hid-output-and-endpoint-selection)). |
| Each frame | **`device.channel(name).getColors("Inline", order)`** | **`order`**: `"RGB"` or `"GRB"`. **Returns** flat byte array. |
| Each frame | **`device.write(packet, length)`** | **`packet`**: your vendor layout; **`length`**: report size (e.g. `65`). |

```javascript
export async function Initialize() {
  device.set_endpoint(0, 0x0001, 0xffc0, 0);
  device.addChannel("Strip", 60);
}

export async function Render() {
  const colors = device.channel("Strip").getColors("Inline", "GRB");
  device.write(packStripPacket(colors), 65);
}
```

### 5.2 Fixed LED grid (keyboard, mat) {#52-fixed-led-grid-keyboard-mat}

| Step | Call | Arguments / returns |
| --- | --- | --- |
| Export or init | **`LedNames()`** / **`LedPositions()`** or **`setControllableLeds(names, positions)`** | **`names`**: `string[]`; **`positions`**: `[[x,y], …]`. |
| Export | **`Size()`** | **`[width, height]`** in grid cells. |
| Each frame | **`device.color(x, y)`** | Integer **`x`**, **`y`**. **Returns `[r, g, b]`** (0–255). |

```javascript
export function Size() { return [15, 5]; }
export function LedNames() { return ["A", "B"]; }
export function LedPositions() { return [[0, 0], [1, 0]]; }

export async function Render() {
  const [r, g, b] = device.color(0, 0);
  device.write(packKey(r, g, b), REPORT_LEN);
}
```

### 5.3 Multiple zones (subdevices) {#53-multiple-zones-subdevices}

| Step | Call | Arguments / returns |
| --- | --- | --- |
| Init | **`device.createSubdevice(name)`** | **`name`**: zone label (e.g. `"Logo"`). |
| Init | **`device.setSubdeviceLeds(name, names, positions)`** | Same shapes as **`setControllableLeds`**, scoped to the zone. |
| Each frame | **`device.subdeviceColor(name, x, y)`** | **Returns `[r, g, b]`** for that zone. |

### 5.4 Same protocol, multiple VID/PID {#54-same-protocol-multiple-vidpid}

| Approach | What to pass |
| --- | --- |
| Export-function | **`ProductId()`** returns **`number[]`**: `[0x1234, 0x1235]`. |
| Descriptor | **`match.productIds`** plus optional **`matchAlternatives`**: `[{ vendorId: 0xABCD, productIds: [0x0001] }]` ([Section 7.1](#71-required-and-common-fields)). |

---

## 6. Shared code (`@rgbj-include`) {#6-shared-code-rgbj-include}

Split protocol tables or helpers into separate `.js` files and pull them in with a comment at the **top** of your plugin (or add-on):

```text
// @rgbj-include "relative/path/to/helpers.js"
```

| Rule | Detail |
| --- | --- |
| **Path** | Relative to the file that contains the comment. Ship included files **next to or under your plugin folder**. |
| **Entry vs fragment** | Only the **main plugin `.js`** exports lifecycle functions (and optionally **`rgbjunkie`**). Include files are **fragments** — constants, packet builders, font tables — not second plugins. |
| **No lifecycle in includes** | Do **not** put **`export function initialize()`** / **`render()`** stubs in included files; when inlined they can override the real plugin lifecycle (see [Section 8](#8-add-ons-extend-a-plugin-without-editing-it)). |
| **Resolution** | RGBJunkie searches the plugin’s directory and configured plugin roots for the relative path. |

```javascript
// @rgbj-include "./protocol/packets.js"
// packets.js defines: function buildSolidPacket(hex) { … }
export async function Render() {
  device.write(buildSolidPacket("#ff0000"), 65);
}
```

---

## 7. ABI descriptor (`rgbjunkie`) — advanced {#7-abi-descriptor-rgbjunkie--advanced}

> **Optional.** Use the **export-function format** ([Section 2](#2-standard-export-function-format-recommended)) for new community device plugins. This section documents RGBJunkie’s native descriptor object for maintainers and built-in subsystems.

A descriptor object uses **`abiVersion: 1`**.

**In this section:** [7.1 Fields](#71-required-and-common-fields) · [7.2 transportType](#72-transporttype) · [7.3 deviceKind](#73-devicekind) · [7.4 Settings types](#74-settings-row-type) · [**7.5 Color syntax**](#color-syntax) · [7.6 Example](#76-example) · [7.7 Notes](#77-notes) · [7.8 Thumbnails & brand CDN](#78-device-tree-thumbnails-imageurl-and-brand-assets)

### 7.1 Required and common fields {#71-required-and-common-fields}

#### `match` and `matchAlternatives` {#match-and-matchalternatives}

| Field | Shape | Example |
| --- | --- | --- |
| **`match.vendorId`** | `number` (hex OK in source) | `0x3061` |
| **`match.productIds`** | `number[]` | `[0x0001, 0x0002]` |
| **`matchAlternatives[]`** | Same shape as **`match`** | `{ vendorId: 0x046d, productIds: [0xc548] }` — optional OEM/regional IDs that share your protocol. |

RGBJunkie loads the plugin when **any** `(vendorId, productId)` pair from **`match`** or **`matchAlternatives`** matches plugged-in hardware.

#### Descriptor fields {#descriptor-fields}

| Field | Type | Meaning |
| --- | --- | --- |
| **`abiVersion`** | `1` | Fixed value for this guide. |
| **`displayName`** | string | Shown in the device list. |
| **`publisher`** | string | Your name or organization (optional but recommended). |
| **`match`** | `{ vendorId, productIds[] }` | Primary USB vendor/product IDs for binding this plugin to hardware. |
| **`matchAlternatives`** | array of same shape | Optional. Extra VID/PID sets that use the **same** protocol (logical OR with **`match`**). |
| **`transportType`** | string | How the device is reached. **See [Section 7.2](#72-transporttype) below.** |
| **`deviceKind`** | string | UI / grouping hint for the device. **See [Section 7.3](#73-devicekind) below.** |
| **`validateEndpoint`** | `(endpoint) => boolean` | HID interface filter: return true for the `(interface, usage, usage_page, …)` tuple your protocol uses. |
| **`imageUrl`** | string | Optional **HTTPS** URL for the device tree list (empty string if none). See **[Section 7.8](#78-device-tree-thumbnails-imageurl-and-brand-assets)**. |
| **`size`** | `[number, number]` | Logical grid size hint for fixed-layout sampling (e.g. keyboard matrix width × height). |
| **`documentation`** | string | Short slug or id for help content hooks (if the host exposes them). |
| **`settings`** | array | UI-facing options; each row needs stable **`id`**, **`label`**, **`type`**, and type-specific fields. **`type`**: **see [Section 7.4](#74-settings-row-type).** |
| **`subdeviceController`** | `boolean` | Optional. Set `true` when the plugin drives multiple addressable zones via the subdevice APIs. |
| **`maxLedLimit`** | number | Optional cap on total LEDs the host should assume for discovery. |
| **`ledChannels`** | `{ label, ledCount }[]` | Optional static channel list when you do not register everything with **`device.addChannel`**. |
| **`resolveLedChannels`** | `(productId: number) => …` | Optional; product-specific channel layout instead of or in addition to **`ledChannels`**. |
| **`defaultPosition`**, **`defaultScale`** | numbers | Optional canvas defaults for the device representation. |
| **`componentBrand`** | string | Optional default brand label for new components. |

### 7.2 transportType {#72-transporttype}

| Value | When to use |
| --- | --- |
| **`Hid`** | **Default** for USB Human Interface Device (LED/out reports). |
| **`HID`** | Same meaning as **`Hid`**; prefer **`Hid`** for new work. |
| **`SMBUS`** | Lighting over SMBus/I²C (e.g. DRAM modules, some GPU controllers). |
| **`network`** | Devices reached over the network (e.g. virtual/WLAN controllers bundled with the app). |
| **`serial`** | Serial or CDC-style bindings when the host exposes that transport for your device. |

### 7.3 deviceKind {#73-devicekind}

| Value | Typical hardware |
| --- | --- |
| **`keyboard`** | Keyboards and keypad-class devices |
| **`mouse`** | Mice |
| **`mousepad`** | RGB mouse mats / desk pads |
| **`headphones`** | Headsets and headphones with RGB |
| **`microphone`** | RGB microphones |
| **`speakers`** | RGB speakers |
| **`gpu`** | Graphics cards |
| **`ram`** | RGB memory modules |
| **`motherboard`** | Mainboard / chipset RGB controllers |
| **`lightingcontroller`** | Hubs, strips, Commander-style boxes, generic LED controllers |
| **`aio`** | AIO pumps / coolers with RGB |
| **`dongle`** | Wireless dongles that proxy RGB for another device |
| **`other`** | Stream Deck–class, monitors, docks, or anything that does not fit above |
| **`unknown`** | Fallback when category is not decided yet |

### 7.4 Settings row type {#74-settings-row-type}

Each object in **`rgbjunkie.settings`** (or legacy **`getControllableParameters()`**) must include **`id`**, **`label`**, **`type`**, and type-specific fields:

| `type` | UI | Typical extra fields | Example `default` |
| --- | --- | --- | --- |
| **`boolean`** | Checkbox | — | `true` or `false` |
| **`number`** | Numeric input | **`min`**, **`max`**, **`step`** | `500` |
| **`color`** | Color picker | — ([Section 7.5](#color-syntax)) | `"#ff8800"` |
| **`string`** | Free text | — | `"My label"` |
| **`combobox`** | Dropdown | **`values`**: `string[]`; optional **`valuesDisplay`** | `"GRB"` |
| **`list`** | List control | **`values`** | `"Option A"` |
| **`select`** | Dropdown (like combobox) | **`values`** | `"Mode 1"` |
| **`range`** | Numeric range | **`min`**, **`max`**, **`step`** | `"128"` |
| **`slider`** | Slider | **`min`**, **`max`**, **`step`** | `"50"` |

**Optional visibility:** **`visibleWhen`** hides a row until another setting matches:

| Form | Meaning |
| --- | --- |
| `{ property: "mode", equals: "Advanced" }` | Show when **`mode`** equals that string. |
| `{ property: "mode", oneOf: ["A", "B"] }` | Show when **`mode`** is one of the listed values. |
| `{ property: "flag", notEquals: false }` | Show when boolean **`flag`** is not false. |
| `{ allOf: [ … ] }` | **AND** — every sub-condition must pass (top-level **`property`** on the same object is ignored when **`allOf`** is non-empty). |

Referenced **`property`** values are other settings’ **`id`** (descriptor) or **`property`** (export-function rows).

**Optional combobox helper:** **`appendTokenToProperty`** — set to another setting’s **`id`**. Choosing a non-first **`values`** entry appends that token to the target string field; use **`values[0]: ""`** as the idle choice.

```javascript
settings: [
  { id: "mode", label: "Mode", type: "combobox", values: ["Basic", "Advanced"], default: "Basic" },
  {
    id: "advancedGain",
    label: "Gain",
    type: "slider",
    min: "0",
    max: "100",
    default: "50",
    visibleWhen: { property: "mode", equals: "Advanced" },
  },
]
```

### 7.5 Color syntax {#color-syntax}

RGBJunkie treats plugin-facing colors as **24-bit sRGB hex**:

| Form | Notes |
| --- | --- |
| **`#RRGGBB`** | **Preferred.** Six hexadecimal digits. Examples: `#ff8800`, `#FFFFFF`. |
| **`RRGGBB`** | Six hex digits **without** `#` are accepted where documented. |

**Not accepted:** 3-digit CSS shorthand, 8-digit alpha, spaces, or named colors. Unparseable strings map to **black** (`#000000`).

### 7.6 Example {#76-example}

```javascript
export const rgbjunkie = {
  abiVersion: 1,
  displayName: "Example RGB Strip",
  publisher: "Your Studio",
  match: { vendorId: 0x1234, productIds: [0x5678] },
  transportType: "Hid",
  deviceKind: "lightingcontroller",
  validateEndpoint: (endpoint) => endpoint.interface === 0,
  imageUrl: "",
  size: [18, 6],
  documentation: "example-strip",
  settings: [
    {
      id: "shutdownColor",
      group: "lighting",
      label: "Shutdown Color",
      type: "color",
      default: "#000000",
      min: "0",
      max: "360",
    },
  ],
};

export async function initialize() { /* … */ }
export async function render() { /* … */ }
export async function shutdown(systemSuspending) { /* … */ }
```

### 7.7 Notes {#77-notes}

- **`match`** + **`matchAlternatives`** together define every `(VID, PID)` pair that should load this plugin.
- Each **`settings[].id`** becomes a **named global** in your plugin scope and is persisted with user profiles—treat IDs as stable API.

### 7.8 Device tree thumbnails (`imageUrl`) and brand assets {#78-device-tree-thumbnails-imageurl-and-brand-assets}

- **In the app**, Settings / device tree brand art is resolved by **`src/ui/pluginDeviceImage.ts`** (tiles at **`https://assets.rgbjunkie.com/images/brands/<slug>.png`**).
- **Repository maintenance:** run **`npm run plugins:brand-image-urls`** to set quoted **`imageUrl`** strings when a PNG exists. Run **`npm run docs:supported-devices`** to refresh the public device browser JSON.

---

## 8. Add-ons (extend a plugin without editing it) {#8-add-ons-extend-a-plugin-without-editing-it}

An **add-on** layers extra behavior on top of an existing plugin — extra settings, lighting modes, or zones — **without modifying the base file**, so the base can keep being updated. Add-ons work for **both** export-function plugins ([Section 2](#2-standard-export-function-format-recommended)) and **`rgbjunkie`** descriptor plugins ([Section 7](#7-abi-descriptor-rgbjunkie--advanced)).

**In this section:** [8.1 File naming](#81-file-naming-and-location) · [8.2 How it runs](#82-how-it-runs) · [8.3 Hook](#83-what-you-can-do-in-__rgbjpostwirepluginexports) · [8.4 Rules](#84-rules) · [8.5 WLED overview](#85-wled-add-ons--overview) · [8.6 WLED naming](#86-wled--file-name-and-install-location) · [8.7 How to make an add-on](#87-how-to-make-an-add-on) · [8.8 WLED rules](#88-wled--rules-so-the-base-plugin-keeps-working) · [8.9 WLED hook shim](#89-wled--optional-hook-shim) · [8.10 Matrix add-ons](#810-wled--matrix-and-clock-add-ons) · [8.11 Licensing](#811-wled--licensing-open-source-share-alike)

### 8.1 File naming and location {#81-file-naming-and-location}

Place a sibling file next to the base plugin, named **`<BasePluginFileName>.addon.js`**:

```text
plugins/Razer/Razer_Modern_Mouse.js        ← base plugin
plugins/Razer/Razer_Modern_Mouse.addon.js  ← add-on (auto-merged)
```

The same relative path works under your **user plugin directory**. `*.addon.js` files are **never** loaded as standalone devices.

### 8.2 How it runs {#82-how-it-runs}

The host concatenates your add-on **after** the base plugin source and evaluates them together, then calls your exported **`__rgbjPostWirePluginExports()`** **once** — after the base plugin’s exports and the RGBJunkie ABI are wired, and **before** the host’s render wrapper.

### 8.3 What you can do in `__rgbjPostWirePluginExports()` {#83-what-you-can-do-in-__rgbjpostwirepluginexports}

The host calls this hook **once** after the base plugin’s exports are wired. It receives **no arguments**; use closures over **`exports`**, **`rgbjunkie`**, and settings globals.

| Technique | What to pass / assign |
| --- | --- |
| **Add settings** | Push row objects onto **`rgbjunkie.settings`** (same shape as [Section 7.4](#74-settings-row-type)), or wrap **`exports.ControllableParameters`** to append rows. |
| **Wrap render** | Save **`const base = exports.render`**, then **`exports.render = function() { …; return base(); }`** and set **`exports.Render = exports.render`**. |
| **Wrap initialize / shutdown** | Same pattern as render — call the saved base function after your setup/teardown. |
| **Extend LED layout** | Wrap **`exports.LedNames`** / **`exports.LedPositions`** to append keys or zones. |

```javascript
export function __rgbjPostWirePluginExports() {
  try {
    rgbjunkie.settings.push({
      id: "addonMode",
      label: "Add-on mode",
      type: "boolean",
      default: false,
    });
    const baseRender = exports.render;
    exports.render = function () {
      if (addonMode) { /* extra HID or color path */ }
      return baseRender();
    };
    exports.Render = exports.render;
  } catch (e) { /* never throw */ }
}
```

### 8.4 Rules {#84-rules}

- **Do not re-declare** the base plugin’s top-level **`function`** / **`const`** / **`class`** names. Wrap existing exports at runtime instead.
- Use **unique names** for helpers you add.
- Keep work inside **`render`** cheap — it runs every frame.
- An add-on must **never throw**; guard your hook with `try/catch`.

A ready-to-copy starting point ships as **`plugins/_templates/plugin.addon.template.js`**.

The subsections below document the **WLED** add-on path (`wled.addon.js`, merged by the host’s WLED pipeline). That path predates the generic **`*.addon.js`** mechanism above.

### 8.5 WLED add-ons — overview {#85-wled-add-ons--overview}

For **network template** plugins, RGBJunkie can merge an optional second JavaScript file after the main plugin body. The worked example is **WLED** (`plugins/Network/WLED/WLED.js`). The host concatenates a prelude, the main **`WLED.js`** body, your add-on, and a discovery bridge into one sandbox eval unit.

### 8.6 WLED — file name and install location {#86-wled--file-name-and-install-location}

Place **`wled.addon.js`** or **`WLED.addon.js`** next to **`WLED.js`** under your plugin root (e.g. `%APPDATA%\RGBJunkie\plugins\Network\WLED\` on Windows). The add-on is never loaded as a standalone device row.

### 8.7 How to make an add-on {#87-how-to-make-an-add-on}

You **do not** edit the base plugin file. You write a **separate** add-on file that RGBJunkie merges at load time ([Section 8.2](#82-how-it-runs)). The steps below work for **any** device plugin; the WLED notes at the end apply to **`wled.addon.js`** only.

#### Step 1 — Create the add-on file {#step-1--create-the-add-on-file}

| Base plugin type | Your file name | Sits next to |
| --- | --- | --- |
| Generic HID / export-function | **`<BaseFileName>.addon.js`** | The base `.js` (e.g. `Razer_Modern_Mouse.addon.js` beside `Razer_Modern_Mouse.js`) |
| WLED virtual device | **`wled.addon.js`** or **`WLED.addon.js`** | Stock **`WLED.js`** ([Section 8.6](#86-wled--file-name-and-install-location)) |

Start from the pattern in [Section 8.3](#83-what-you-can-do-in-__rgbjpostwirepluginexports) or copy a published template from **[rgbjunkie.com](https://www.rgbjunkie.com)** developer materials.

#### Step 2 — Optional sidebar title {#step-2--optional-sidebar-title}

Export a display name so **Plugin Settings** can group your rows under a heading:

```javascript
export const __rgbjAddonDisplayName = "My mouse add-on";           // generic *.addon.js
export const __rgbjWledAddonDisplayName = "My WLED clock add-on"; // wled.addon.js only
```

#### Step 3 — Register settings rows {#step-3--register-settings-rows}

Add **Plugin Settings** rows your `render` logic (or the stock plugin) will read as globals. Use **unique** `id` / `property` values — they become variable names and profile keys ([Section 7.4](#74-settings-row-type)).

**If the base plugin uses `export const rgbjunkie`** (including merged WLED), push onto **`rgbjunkie.settings`** when your file loads:

```javascript
(function mergeSettings() {
  try {
    if (!rgbjunkie || !Array.isArray(rgbjunkie.settings)) return;
    rgbjunkie.settings.push({
      id: "myAddonMode",
      label: "Add-on mode",
      type: "combobox",
      values: ["Off", "Custom"],
      default: "Off",
      group: "addon", // WLED matrix rows often use group: "matrix"
    });
  } catch (e) {}
})();
```

**If the base is export-function only** (no descriptor), wrap **`exports.ControllableParameters`** inside **`__rgbjPostWirePluginExports()`** to append rows — see the generic template pattern on **[rgbjunkie.com](https://www.rgbjunkie.com)**.

#### Step 4 — Wire behavior in `__rgbjPostWirePluginExports()` {#step-4--wire-behavior-in-__rgbjpostwirepluginexports}

Export one hook. The host calls it **once** with **no arguments**. Save the base functions, then replace them with wrappers ([Section 8.4](#84-rules)):

```javascript
export function __rgbjPostWirePluginExports() {
  try {
    const baseRender = exports.render ?? exports.Render;
    if (typeof baseRender !== "function") return;

    exports.render = function () {
      if (myAddonMode === "Custom") {
        // Your logic: read settings globals, build packets, call device.write, etc.
      }
      return baseRender();
    };
    exports.Render = exports.render;
  } catch (e) { /* never throw */ }
}
```

For **HID device** add-ons, your wrapper usually calls **`device.write`** / **`device.channel(...).getColors`** like a normal plugin ([Section 4](#4-device-api-summary)). For **WLED**, the stock driver already owns UDP — your wrapper often calls the saved **`baseRender()`** for normal effect canvas mode, and only runs custom pixel/matrix code when the user picks a mode you added in Step 3.

#### Step 5 — Split large helpers with `@rgbj-include` {#step-5--split-large-helpers-with-rgbj-include}

Font tables, protocol bytes, and other big static data belong in sibling files ([Section 6](#6-shared-code-rgbj-include)):

```javascript
// @rgbj-include "./my-glyph-table.js"
```

Included files must **not** declare **`initialize`** / **`render`** / a second **`rgbjunkie`** — only data and pure functions.

#### Step 6 — Try it on your machine {#step-6--try-it-on-your-machine}

1. Copy the add-on (and any include files) into the folder shown under **Settings → Installed files**, beside the base plugin.
2. **Rescan** in the **Devices** panel, or restart RGBJunkie.
3. Optional: **Settings → System → Engine → Hot-reload user plugins** reloads saved `.js` files while you iterate.

Your new settings appear under **Plugin Settings** for that device. If nothing loads, check the add-on file name, path beside the base plugin, and that the hook never throws ([Section 8.8](#88-wled--rules-so-the-base-plugin-keeps-working) for WLED-specific pitfalls).

### 8.8 WLED — rules so the base plugin keeps working {#88-wled--rules-so-the-base-plugin-keeps-working}

- Only one **`export const rgbjunkie`** and one real **`initialize`** / **`render`** / **`shutdown`** from stock **`WLED.js`**.
- Do **not** ship empty lifecycle stubs in included fragments — hoisting can override the real WLED lifecycle.
- Merge extra settings into **`rgbjunkie.settings`** with unique **`id`** values.

### 8.9 WLED — optional hook shim {#89-wled--optional-hook-shim}

If the add-on exports **`__rgbjPostWirePluginExports()`**, the host may replace it with a built-in shim that wires **`initialize`**, **`shutdown`**, and **`render`** for matrix vs stock UDP canvas modes. Set **`globalThis.__RGBJUNKIE_WLED_CLOCK_MATRIX_RENDER = true`** before WLED virtual plugins load to use your hook verbatim.

### 8.10 WLED — matrix and clock add-ons {#810-wled--matrix-and-clock-add-ons}

WLED add-ons that draw **clocks, scrolling text, pixel art, or sensor overlays** on a 2D matrix follow the same six steps in [Section 8.7](#87-how-to-make-an-add-on), with these conventions:

| Topic | What to do |
| --- | --- |
| **Settings group** | Use **`group: "matrix"`** so rows appear under your **`__rgbjWledAddonDisplayName`** heading. |
| **Modes** | Add a **`combobox`** (e.g. Components vs Time vs Custom text). Read the chosen value as a global in your render wrapper. |
| **Glyphs / fonts** | Put bitmap or font tables in **`@rgbj-include`** files; keep **`wled.addon.js`** short. |
| **Render path** | When the user picks effect-style lighting, call the saved stock **`render()`**. When they pick a matrix mode you own, build the frame buffer and send it through the WLED helpers already in the merged sandbox (study a working community add-on for the same hardware size). |
| **Display name** | **`export const __rgbjWledAddonDisplayName = "…"`** labels the matrix settings block in the sidebar. |

Advanced: RGBJunkie may supply a built-in shim for stock clock/matrix bundles ([Section 8.9](#89-wled--optional-hook-shim)). Hand-written add-ons can ignore that and implement **`__rgbjPostWirePluginExports()`** entirely in your file.

**Minimal WLED add-on shape:**

```javascript
export const __rgbjWledAddonDisplayName = "Example matrix add-on";

(function () {
  try {
    rgbjunkie.settings.push({
      id: "matrixExample",
      group: "matrix",
      label: "Enable example overlay",
      type: "boolean",
      default: false,
    });
  } catch (e) {}
})();

export function __rgbjPostWirePluginExports() {
  try {
    const base = exports.render;
    exports.render = function () {
      if (matrixExample) { /* pack matrix pixels, then send */ }
      return base();
    };
    exports.Render = exports.render;
  } catch (e) {}
}
```

### 8.11 WLED — licensing (open source, share-alike) {#811-wled--licensing-open-source-share-alike}

Add-on files should use **`SPDX-License-Identifier: GPL-3.0-or-later`** (or compatible copyleft). Template examples ship with RGBJunkie developer materials on **[rgbjunkie.com](https://www.rgbjunkie.com)**. Full policy: add-on licensing guide published with the docs.

---

## 9. Distribution and validation {#9-distribution-and-validation}

- Install your `.js` plugin (and any included fragments) into the user **plugins** folder documented in **Settings → Installed files**, or publish a Git repo and share an **Install in RGBJunkie** link ([App links](app-links)).
- After adding plugins, use **Rescan** in the **Devices** panel so RGBJunkie loads them.
- **Maintainers (source tree):** after changing many plugins’ metadata, run **`npm run harvest:plugin-db`**. For brand **`imageUrl`** sweeps, see **[Section 7.8](#78-device-tree-thumbnails-imageurl-and-brand-assets)**.

---

## 10. Where to get help {#10-where-to-get-help}

- **Website:** [https://www.rgbjunkie.com](https://www.rgbjunkie.com) — downloads, licensing, and published developer materials.
- **Supported USB devices:** **`/api/docs/supported-devices.html`** — search VID/PID, transport, and device kind.
- **Help Center:** [rgbjunkie.com/RGBJunkieApp/help/](https://www.rgbjunkie.com/RGBJunkieApp/help/) — end-user guides; **Settings → Help** in the app loads the same articles.
