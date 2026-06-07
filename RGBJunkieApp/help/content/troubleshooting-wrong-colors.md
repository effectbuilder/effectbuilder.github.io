---
title: Troubleshooting — wrong colors or odd effects
slug: troubleshooting-wrong-colors
summary: Fix reversed strips, tint, calibration, LED paint, and layout mismatches.
category: Troubleshooting
tags: troubleshooting, calibration, colors, layout
published: 2026-06-06
draft: false
---
## Effect looks fine on screen, weird on the desk

Usually the canvas layout doesn’t match reality yet. Try these:

1. **Layout** — drag components so order matches physical strips and fans. See [Workspace editor](workspace-editor).
2. **Flip / orientation** — **Flip horizontal** or **Flip vertical** on the toolbar, or **LED quadrants** to see which way the fan spins.
3. **Wrong product model** — replace the component in the [Component Library](component-library) if LED count or shape is off.
4. **Brightness** — lower **Brightness** in the Effects panel if everything blows out to white.
5. **Active tab** — make sure you’re editing the tab that owns those components ([Canvas tabs](canvas-tabs)).
6. **Scene** — reload the one you meant from the picker above the canvas.

## Tinted, swapped, or “why is green red?”

**Settings → Colors → Calibration** — per-channel RGB tweaks when red and green are swapped or a strip looks permanently muddy.

## Stuck colors that won’t change with the effect

You might have **painted** LEDs in **LED Studio**. That paint overrides the effect until you clear it. Open **Settings → Colors → LED Studio**, clear that component, or **Clear all** if you were just testing. See [LED Studio](led-studio).

## Rainbow when you wanted your gradient

Effects with a **color profile** dropdown need a profile picked on the right layer. See [Color profiles](color-profiles).

## Wallpaper / screen sync looks off

Colors follow the desktop but feel delayed or cropped? Check the plugin settings for your wallpaper or matrix bridge — [Wallpaper and screen sync](wallpaper-screen-sync).

## Related

* [Troubleshooting — no lights](troubleshooting-no-lights)
* [Workspace editor](workspace-editor)
* [Send a support report](send-support-report)
