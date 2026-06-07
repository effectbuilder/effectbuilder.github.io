---
title: LED Studio — paint LEDs by hand
slug: led-studio
summary: Override effect colors on specific LEDs until you clear the paint.
category: How-To
tags: led studio, paint, colors, manual
published: 2026-06-06
draft: false
---
## Paint individual LEDs

**LED Studio** is for when you want specific LEDs to stay a specific color — status indicators, testing one corner of a strip, marking “this end is north”, that kind of thing.

Painted colors **override** whatever effect is running on real hardware until you clear them. The paint sticks through restarts and Scene loads too.

## Open it

**Settings → Colors → LED Studio**

Pick a component, choose a color, click LEDs in the preview (or use the tools on that tab).

## Good times to use it

* A few **indicator** LEDs that should stay red/green no matter the effect
* **Testing** one strip segment without touching global effect settings
* **Orientation** checks alongside **LED quadrants** on the workspace toolbar ([Workspace editor](workspace-editor))

## Clear the paint

* Clear one component from LED Studio
* **Clear all** wipes every painted LED — RGBJunkie will ask you to confirm

If hardware shows stuck colors after you change effects, check LED Studio before you dive into calibration.

## Related

* [Troubleshooting — wrong colors](troubleshooting-wrong-colors)
* [Color profiles](color-profiles)
* [Workspace editor](workspace-editor)
