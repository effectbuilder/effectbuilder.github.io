---
title: Wallpaper and screen sync
slug: wallpaper-screen-sync
summary: Mirror desktop wallpaper or screen colors to LEDs with optional plugins.
category: How-To
tags: wallpaper, screen, sync, lively
published: 2026-06-06
draft: false
---
## Lights that follow your screen

**Wallpaper** and **screen sync** effects sample color from your desktop — the wallpaper image, full screen, or a region — and push it to LEDs you’ve mapped on the canvas.

You’ll need the right **plugins** installed (Wallpaper Engine bridge, Lively-style helpers, etc.) and a RGBJunkie version that supports them.

## Get it running

1. Install the plugin via **Settings → Installed files** or a community link — [Installed files](installed-files)
2. **Rescan**, then browse **Effects** for wallpaper or screen-capture entries
3. Lay out LEDs on the [workspace](workspace-editor) so strips sit where the colors should land

## Make it look good

* Match **monitor** and capture region to where the physical strip actually is, when the effect lets you
* Heavy games or HDR can mess with sampling — **Pause effects** from the tray if you need every GPU cycle
* Colors look washed out? Try [calibration](troubleshooting-wrong-colors) once the effect is running

## Wallpaper Engine (community)

Some community plugins talk to **Wallpaper Engine** over the network. Turn on the plugin’s server in Wallpaper Engine, then read that plugin’s readme in your `plugins/` folder — each one is a little different.

## Related

* [Effects — browse and tune](effects-browse-and-tune)
* [Installed files](installed-files)
* [Troubleshooting — wrong colors](troubleshooting-wrong-colors)
