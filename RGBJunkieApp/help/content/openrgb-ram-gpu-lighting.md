---
title: OpenRGB, RAM, and GPU lighting
slug: openrgb-ram-gpu-lighting
summary: Optional OpenRGB helper for motherboard RAM, GPU, and other gear OpenRGB supports.
category: How-To
tags: openrgb, ram, gpu, motherboard
published: 2026-06-06
draft: false
---
## When you need OpenRGB

Some RAM, GPUs, and motherboards don’t have a dedicated RGBJunkie plugin — they go through **OpenRGB** instead. RGBJunkie can spin up a portable OpenRGB helper and map what it finds to your layout.

Totally **optional**. USB fans, strips, and WLED don’t need it.

## First run on Windows

First time through, RGBJunkie may **download** a portable OpenRGB build into your user folder (unless your install skips that). Let it finish, then **Rescan** in the Devices panel.

Download failed? Install OpenRGB yourself and point RGBJunkie at it — release notes or support docs have the details.

## Getting devices to show up

* **Run as administrator** only if OpenRGB docs for your board say so — most people don’t need it
* Quit vendor RGB suites (iCUE, Aura, Mystic Light…) that lock the same chips
* Once OpenRGB sees your sticks or GPU LEDs, assign components from the [Component Library](component-library) like any other channel

## One boss per controller

Only one app should drive a given RGB chip at a time. If OpenRGB and iCUE are fighting, nobody wins — close the other guy while you test.

## Related

* [Devices panel](devices-panel)
* [Troubleshooting — no lights](troubleshooting-no-lights)
* [Troubleshooting — wrong colors](troubleshooting-wrong-colors)
