---
title: Troubleshooting — no lights
slug: troubleshooting-no-lights
summary: When nothing lights up — checks for mute, visibility, USB, and conflicting software.
category: Troubleshooting
tags: troubleshooting, usb, hardware, no output
published: 2026-06-06
draft: false
---
## Nothing? Walk through this list

Most “dead strip” moments come down to one of these. Go in order — you’ll usually find it before the bottom.

1. **Output not muted** — **Settings → Hardware → Connected**. Make sure the device isn’t silenced.
2. **Rescan** — click **↻** in the Devices panel after plugging in gear or installing a driver.
3. **Device in the tree?** — expand device and channel; **Identify** flashes that channel on real hardware so you know you’re looking at the right row.
4. **Components assigned** — empty channels need something from the [Component Library](component-library) or [RGB Wizard](rgb-wizard).
5. **Eye icons** — device, channel, or component might be hidden on the canvas.
6. **Effect running** — pick an effect; make sure **Pause** is off and **Brightness** isn’t at zero.
7. **Right Scene, right tab** — load the Scene you expect; check the active **canvas tab**.

> [!CAUTION]
> Close other RGB apps (iCUE, SignalRGB, OpenRGB GUI, vendor tools) before troubleshooting — they often lock the device and make it look like RGBJunkie isn't working.

## USB and “something else owns my controller”

Other RGB apps love to grab USB devices and not let go. Close them, then try again.

If USB access is blocked on your PC, running RGBJunkie **as Administrator** once can help (not everyone needs this).

Unplug, replug, **Rescan**. Classic, but it works.

Our [supported gear list](supported-devices) shows what we test most often.

## WLED and network strips

Network gear has to be added and reachable — see [WLED setup](wled-setup). Double-check the IP in plugin settings (gear on the device row).

## Still stuck?

* **Settings → System → Logs** and [send a support report](send-support-report)
* Tell us the device, your RGBJunkie version (**Settings → About**), and whether vendor software lights the same hardware at the same time

## Related

* [Troubleshooting — wrong colors](troubleshooting-wrong-colors)
* [Devices panel](devices-panel)
* [Check for updates](check-for-updates)
