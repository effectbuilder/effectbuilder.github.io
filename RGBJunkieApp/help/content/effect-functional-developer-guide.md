---
title: Functional effects guide (.mjs)
slug: effect-functional-developer-guide
summary: Build per-LED .mjs effects for RGBJunkie without a canvas: export meta and sampleLed, with audio and color-profile support.
category: Developer
tags: effect, developer, mjs, functional, per-led
published: 2026-07-01
updated: 2026-07-01
draft: false
---
This guide is for **anyone** who wants to build **JavaScript module effects** that run when the user selects **Effect** lighting mode — including **beginners** who are comfortable with basic JavaScript but may not want a full `<canvas>` pipeline.

**Start below** with what an `.mjs` effect is, then copy the **minimal example**. For the formal API rules (Worker readiness, enumeration order), see **`EFFECT-FUNCTIONAL-MJS-CONTRACT.md`**.

**HTML canvas effects** (iframe, `requestAnimationFrame`, `engine`, `<meta property>`) are documented in **[`EFFECT-DEVELOPER-GUIDE.md`](effect-developer-guide)**.

For downloads, Effect Builder, and gallery publishing, see **[rgbjunkie.com](https://www.rgbjunkie.com)**.

---

## Making functional effects (start here) {#making-functional-effects-start-here}

### What you are writing {#what-you-are-writing}

A **single ES module** file (extension **`.mjs`**) that exports exactly two **named** bindings:

| Export | Role |
| --- | --- |
| **`meta`** | Plain object: human-readable **name**, stable **`id`**, optional **description** / **publisher**, and a **`params`** array describing sidebar controls. |
| **`sampleLed`** | A **function** the host calls once per logical LED (and for preview tiles). It returns **`{ r, g, b }`** with channels in **0…255**. |

There is **no canvas** and **no animation loop** inside your module. The host drives time by passing **`args.tSec`** and **`args.frameIndex`**. Your job is pure math: “given this LED, this time, and the user’s settings, what RGB?”

### Why the host does it this way {#why-the-host-does-it-this-way}

The app needs colors for **many LEDs per frame**. A functional effect is easy for the host to run in lockstep with hardware sampling and workspace previews: it is just a function. That also keeps effects **small** and **testable** compared to a full HTML scene graph.

### HTML vs functional — quick choice {#html-vs-functional--quick-choice}

| Topic | HTML effect (`.html`) | Functional effect (`.mjs`) |
| --- | --- | --- |
| **Output** | You draw to a **`<canvas>`**; the host **samples pixels** to LEDs. | You return **RGB per LED** from **`sampleLed`**. |
| **Time** | You use **`requestAnimationFrame`** and `performance.now()`. | The host passes **`args.tSec`** (seconds since the effect was mounted). |
| **Settings** | `<meta property="…">` in `<head>` → globals on `window`. | **`meta.params`** → values in **`args.params`**. |
| **Audio** | `window.engine.audio` | **`args.context.audio`** (same shape). |
| **Color profiles** | Globals `foo` + `fooStops`, plus `window.__rgbjColorProfiles`. | Declare **`type: "colorProfile"`** in `meta.params`, then call **`args.context.sampleColorProfile(id, t)`** (see [Color profiles](#color-profiles)). |
| **DOM / network** | Allowed in the iframe (still read-only toward the host). | **Not allowed inside `sampleLed`** — no `window`, `document`, or fetches (see contract). |

Use **HTML** when you want layouts, images, screen capture, or rich UI. Use **`.mjs`** when your effect is **pure lighting math** and you want a **single file** with predictable performance.

---

## Minimal example (copy and adapt) {#minimal-example-copy-and-adapt}

Save as something like `effects/MyFirstSweep.mjs` (or your **user effects** folder — same discovery rules as HTML files). The basename should be unique vs any `.html` in the same folder.

```javascript
/**
 * SPDX-License-Identifier: LicenseRef-RGBJunkie-Proprietary
 * (Use your own SPDX / copyright line for shipping effects.)
 */

export const meta = {
    id: "my_first_sweep",
    name: "My First Sweep",
    description: "A hue that travels along the strip using host time.",
    publisher: "Your Name",
    contractVersion: 1,
    params: [
        { key: "speed", label: "Speed", type: "number", min: 1, max: 200, default: 80 },
    ],
};

function hueToRgb(p, q, t) {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
}

function hslToRgb(h, s, l) {
    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRgb(p, q, h + 1 / 3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1 / 3);
    return {
        r: Math.round(Math.max(0, Math.min(255, r * 255))),
        g: Math.round(Math.max(0, Math.min(255, g * 255))),
        b: Math.round(Math.max(0, Math.min(255, b * 255))),
    };
}

export function sampleLed(args) {
    const speed = Number(args.params.speed ?? 80);
    const n = Math.max(1, args.ledCount - 1);
    const su = args.stripU;
    const u =
        typeof su === "number" && Number.isFinite(su)
            ? Math.max(0, Math.min(1, su))
            : n <= 0
              ? 0.5
              : args.ledIndex / n;
    const phase = (args.tSec * speed * 0.012 + u) % 1;
    return hslToRgb(phase, 0.85, 0.55);
}
```

**What to notice**

- **`meta.id`** must stay **stable** (profiles and workspace tabs reference it). Use lowercase, digits, and underscores.
- **`stripU`** is **0…1** along the strip when the host can derive it; otherwise fall back to **`ledIndex / (ledCount - 1)`**.
- **`args.params.speed`** is always the types you declared (`number` → coerced number in the host).

---

## Discovery metadata (`meta`) {#discovery-metadata-meta}

These fields feed the **effect browser** (search, cards) and the **Effects** sidebar.

| Field | Required | Purpose |
| --- | --- | --- |
| **`id`** | Yes | Stable machine id, unique in the catalog. |
| **`name`** | Yes | Short title in the UI. |
| **`params`** | No (but usual) | Sidebar controls → **`args.params`**. |
| **`description`** | No | Card / tooltip text. |
| **`publisher`** | No | Attribution (e.g. `"RGBJunkie"`). |
| **`contractVersion`** | No | Defaults to **1**. Bump only if you target a newer host contract (see contract doc). |

---

## Sidebar controls (`meta.params[]`) {#sidebar-controls-metaparams}

Each control is an object with at least **`key`** and **`type`**. Optional **`label`**, **`default`**, **`min`**, **`max`**, **`values`**, **`allowNone`**.

| `type` | Sidebar widget | Value in `args.params[key]` |
| --- | --- | --- |
| **`number`** | Slider + numeric field | `number` |
| **`boolean`** | Checkbox | `boolean` |
| **`color`** | Color picker | `string` (`#rrggbb`) |
| **`string`** | Text input | `string` |
| **`list`** | Dropdown | `string` (must be one of **`values`**) |
| **`colorProfile`** | Same **modal + stripe** picker as HTML effects | `string` (profile id, e.g. `"Rainbow"` or a user profile id) |

For **`colorProfile`**, optional **`allowNone: true`** matches HTML’s `allowNone="true"` on `<meta type="colorProfile">` (adds **None** to the list). Omit **`allowNone`** for the default list (**Custom**, **Rainbow**, built-ins, user profiles).

---

## The `sampleLed` function {#the-sampleled-function}

### Arguments (`args`) {#arguments-args}

| Property | Meaning |
| --- | --- |
| **`tSec`** | Seconds since the effect was mounted (monotonic for that run). |
| **`frameIndex`** | Host tick counter (often `0` each frame in current builds — still useful for discrete stepping). |
| **`ledIndex`**, **`ledCount`** | Which LED in **host enumeration order** for this workspace (0 … `ledCount - 1`). |
| **`layout`** | **`{ x, y }`** in workspace/stage coordinates (same space as HTML sampling). |
| **`stripU`** | **0…1** along the logical strip when known; otherwise **`null`** — then derive position from **`ledIndex`**. |
| **`params`** | Current control values keyed by **`meta.params[].key`**. |
| **`context`** | Host-injected object (see below). **Do not** rely on arbitrary keys without checking — extras may appear in future versions. |

### Return value {#return-value}

Return **`{ r, g, b }`**. The host **clamps** to **0…255** and floors to integers; still prefer clean values.

### Performance {#performance}

The host may call **`sampleLed` very often** (every LED × preview grid). Keep inner loops cheap; prefer closed-form math over allocations.

---

## Host context (`args.context`) {#host-context-argscontext}

### Audio (`args.context.audio`) {#audio-argscontextaudio}

Same information as **`window.engine.audio`** for HTML effects:

| Field | Meaning |
| --- | --- |
| **`freq`** | **`number[]`**, length **200** — mono downmix spectrum bins **0…255** (unchanged for existing effects). |
| **`freqL`**, **`freqR`** | Same shape — left/right bins when **`stereo`** is true. |
| **`stereo`** | **`boolean`** — true when capture has separate L/R channels. |
| **`level`** | Overall loudness from the mono mix, roughly **−100…0** (dB-style). |
| **`levelL`**, **`levelR`** | Per-channel loudness when stereo is available. |
| **`density`** | **0…1** spectral energy from the mono mix. |
| **`densityL`**, **`densityR`** | Per-channel spectral energy. |
| **`pan`** | **−1…1** balance hint (left vs right) when **`stereo`** is true; **0** when mono. |

**Mono fallback (recommended):**

```javascript
const a = args.context && args.context.audio;
const stereo =
  a &&
  a.stereo &&
  Array.isArray(a.freqL) &&
  Array.isArray(a.freqR) &&
  a.freqL.length === a.freq?.length &&
  a.freqR.length === a.freq?.length;
const left = stereo ? a.freqL : a?.freq;
const right = stereo ? a.freqR : a?.freq;
```

When **`stereo`** is **`false`**, drive both halves of a split layout from **`freq`** so mono music stays balanced. HTML canvas authors: full reference in **[`EFFECT-DEVELOPER-GUIDE.md` Section 6.2](effect-developer-guide#engine-audio-stereo)** ([published Section 6.2](effect-developer-guide#engine-audio-stereo)).

Always guard: `const a = args.context && args.context.audio; if (!a || typeof a !== "object") …`.

### Color profiles (`sampleColorProfile` + `colorProfiles`) {#color-profiles}

When the host runs functional effects, it injects:

| Member | Type | Purpose |
| --- | --- | --- |
| **`context.colorProfiles`** | Object map | Serialized catalog (advanced; usually you only need **`sampleColorProfile`**). |
| **`context.sampleColorProfile`** | `(profileId: string, t: number) => { r, g, b }` | **`profileId`** is the current param string (e.g. **`args.params.colorProfile`**). **`t`** wraps on **\0, 1)** along the **resolved** closed gradient (same rules as HTML’s **`<name>Stops`**). |

**Recommended pattern:** compute your effect’s RGB with your usual math, then **tint** using the profile so hues stay inside the user’s palette. The built-in **`effects/*.mjs`** effects use **luminance scaling**: compute Rec. 601 luma **`y`** from your RGB, then **`tone = sampleColorProfile(id, paletteT01)`** and output **`{ r: tone.r * y, … }`** clamped. That avoids “green × orange still looks green” that you get from naive per-channel multiply.

Declare a control:

```javascript
{ key: "colorProfile", label: "Color profile", type: "colorProfile", default: "Rainbow" },
```

…and read **`String(args.params.colorProfile ?? "Rainbow")`** when calling **`sampleColorProfile`**.

---

## Rules that matter {#rules-that-matter}

1. **`sampleLed` must stay pure** — no `window`, `document`, `fetch`, `localStorage`, timers, or DOM. The host may evaluate calls from different code paths; side effects break previews and future Worker offloading.  
   **Formal list:** **[`EFFECT-FUNCTIONAL-MJS-CONTRACT.md` Section 4.2**.

2. **One module file** — no `import` of other project files unless your bundler supplies them; stock RGBJunkie loads a **single** `.mjs` source string. Pure math helpers **in the same file** are ideal.

3. **Multi-workspace tabs** use the same snapshot model as HTML effects for params and lighting mode. Overview: **`EFFECT-MULTI-CANVAS-CONTRACT.md`**.

---

## Learn more in this repo {#learn-more-in-this-repo}

| Resource | Use |
| --- | --- |
| **`EFFECT-FUNCTIONAL-MJS-CONTRACT.md`** | Normative contract, versioning, workspace notes. |
| **`effects/*.mjs`** | Shipped examples (rainbow sweep, plasma, spectrum bands, VU meter, …). |
| **[`EFFECT-DEVELOPER-GUIDE.md`](effect-developer-guide)** | Full HTML / canvas / `engine` reference. |
| **`docs/examples/effects/`** | Small **HTML** demos (`audio-bars-demo.html`, color profile gradient, …) — audio and color-profile *ideas* port straight to `sampleLed`. |

---

## Document history {#document-history}

| Version | Summary |
| --- | --- |
| 1 | Initial newcomer guide: minimal `.mjs` example, `meta.params`, `context`, color profiles, links to HTML guide and formal contract. |
