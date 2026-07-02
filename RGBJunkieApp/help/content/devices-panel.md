---
title: Devices panel — channels, visibility, and Identify
slug: devices-panel
summary: Read the device tree, show or hide components, rescan USB, and flash a channel on your real hardware.
category: Getting Started
tags: devices, channels, setup, identify
published: 2026-06-06
draft: false
---
## Your gear, all in one tree

The **Devices** panel on the left is home base for everything RGBJunkie can drive — USB controllers, WLED on the network, and oddball stuff plugins add (wallpaper sync, RAM, GPU, you name it).

Each **device** splits into **channels**. Think of a channel as one output: a fan header, an ARGB strip, that sort of thing. Channels hold **components** on your canvas — unless you’ve got a fixed-layout keyboard or mouse, which already knows its LED map.

## Eye icons — hide the clutter

Those little **eye** icons are your friend when the canvas gets busy:

* **Device row** — show or hide everything on that device
* **Channel row** — just that channel
* **Component row** — one instance

Hiding something doesn’t delete it — it just gets out of the way while you focus elsewhere.

## Toolbar buttons

| Button | What it does |
| ------ | ------------ |
| **RGB Wizard** (magic wand) | Guided setup for channels still waiting on components. See [RGB Wizard](rgb-wizard). |
| **Rescan** (↻) | Plugged something in after launch? Hit this. Also good after driver or plugin changes. |
| **Filter** | Narrow the tree by name when you’ve got a lot going on. |
| **Show/hide all** | Toggle every component on the canvas at once. |
| **Expand / collapse** | Open or close the whole tree. |
| **Lock / unlock** | Lock what’s selected on the canvas, or unlock everything. |

## Add components to a channel

Hit **+ Add** on a **channel** row (not the device row) to open the [Component Library](component-library).

Keyboards and other fixed-layout gear skip this — they show up ready-made in the tree.

## Identify and select

Not sure which physical strip matches a row? **Identify** flashes that channel on the real hardware. Super handy.

Click a **channel name** or its colored **dot** to select its components on the canvas.

## Plugin settings and hardware output

The **gear** on a device row opens that plugin’s options — IP addresses, brightness caps, whatever that device needs. **Escape** closes it.

In **Settings → Hardware → Connected**, each device fold shows an **Output on / Output off** toggle. **Output off** stops RGBJunkie from sending colors to that device (useful for Stream Deck panels you want to leave alone, or gear you control elsewhere). The setting survives unplug and app restart.

## Move stuff between canvas tabs

From the device tree or a component’s menu, you can **move a component to another workspace tab** — same idea as pressing **1**–**9** on the keyboard. See [Canvas tabs](canvas-tabs).

## Related

* [RGB Wizard](rgb-wizard) — first-time channel setup
* [Component Library](component-library)
* [WLED setup](wled-setup)
* [Troubleshooting — no lights](troubleshooting-no-lights)