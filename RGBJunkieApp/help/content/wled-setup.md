---
title: WLED — add network strips and panels
slug: wled-setup
summary: Add WLED controllers by IP, place segments on the canvas, and rescan after changes.
category: How-To
tags: wled, network, esp8266, esp32
published: 2026-06-06
draft: false
---
## Wi‑Fi strips, meet RGBJunkie

**WLED** runs on cheap ESP8266/ESP32 boards and drives addressable strips and matrices over your network. RGBJunkie talks to it like any other plugin device — once you’ve got the IP, you’re most of the way there.

## Add a WLED device

1. Grab the WLED **IP address** from the WLED web UI or your router.
2. In RGBJunkie, open **Settings → Hardware** or follow the WLED plugin flow to add it (exact steps vary a bit by plugin version).
3. No row yet? **Rescan** in the Devices panel.

WLED device lists live in your AppData folder — [App links](app-links) can open `profiles/devices/wled_devices.json` or your plugins folder if you want to peek.

## Channels and segments

Each WLED **segment** or output usually shows up as a **channel** in the Devices tree. Assign components from the [Component Library](component-library) the same way you would for USB gear.

## Plugin settings

**Gear** on the WLED device row — IP, timeouts, plugin-specific knobs. **Escape** to close.

## Tips

* Keep WLED firmware reasonably current — fewer surprises.
* Changed segments in the WLED app? **Rescan** in RGBJunkie.
* Your firewall has to let RGBJunkie reach the controller on the LAN.

## Related

* [Devices panel](devices-panel)
* [Troubleshooting — no lights](troubleshooting-no-lights)
* [Installed files](installed-files) — update the WLED plugin
