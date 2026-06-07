---
title: RAM and GPU lighting
slug: ram-gpu-lighting
summary: Built-in RAM and graphics-card RGB on Windows — no separate helper app required.
category: How-To
tags: ram, gpu, motherboard, pawnio, smbus
published: 2026-06-06
draft: false
---
## RAM lighting (Windows)

RGBJunkie can drive RGB on supported **memory modules** directly. Open **Settings → Hardware → RAM** to see status, install the SMBus driver modules if prompted, and run **Scan now**.

On startup and when you **Rescan** in the Devices panel, matching kits are added automatically — you do not pick a driver yourself. Once a module appears in the tree, assign components from the [Component Library](component-library) like any other channel.

> [!INFORMATION]
> RAM RGB via SMBus is **Windows only**. Linux and macOS builds skip this scan.

If nothing shows up:

* Quit other RGB suites (iCUE, Aura, Mystic Light, SignalRGB, vendor tools) that may lock the same chips
* In **Settings → Hardware → RAM**, use **Install SMBus modules**, then **Scan now**
* If Windows blocked the driver, install [PawnIO](https://github.com/namazso/PawnIO/releases) as Administrator and restart RGBJunkie as Administrator
* Unplug/replug is rarely needed for RAM — a **Rescan** after closing conflicting apps is usually enough

## Graphics card RGB

Open **Settings → Hardware → GPU**. RGBJunkie looks for NVIDIA, AMD, and Intel cards and tries matching vendor profiles (ASUS, MSI, Gigabyte, EVGA, and others) when your card supports on-board RGB.

Click **Scan now** after a driver or card change. Not every GPU has addressable LEDs — the panel tells you whether a card is ready.

## One boss per controller

Only one app should drive a given RGB chip at a time. If a vendor suite and RGBJunkie are both running, colors may freeze or look wrong — close the other app while you test.

## Related

* [Devices panel](devices-panel)
* [Troubleshooting — no lights](troubleshooting-no-lights)
* [Troubleshooting — wrong colors](troubleshooting-wrong-colors)
