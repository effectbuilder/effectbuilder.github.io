---
title: Component Library — add and replace components
slug: component-library
summary: Search the catalog, pick the right fan or strip model, and place components on a channel.
category: How-To
tags: components, library, layout, catalog
published: 2026-06-06
draft: false
---
## Open the library

A few ways in:

* **+ Add** on a **channel** row in the Devices panel
* **RGB Wizard** — after you pick a breathing color, the library opens for that channel ([RGB Wizard](rgb-wizard))

Changed your mind? **Escape** closes the library without adding anything.

## Find the right product

1. **Search** by brand or model — “Lian Li”, “QL120”, whatever you’ve got on the desk.
2. Browse **tags** and **filters** if you’re not sure of the exact name.
3. No product photo? You might see a rendered **LED layout** thumbnail instead — handy for LED count and shape.

Click a row to add that component to the channel.

## How many on this channel?

When the **RGB Wizard** is running, RGBJunkie asks how many of that component live on the channel (**1–32**). It drops that many instances on the canvas in a neat grid — drag them into place like puzzle pieces.

Opening the library with **+ Add** alone adds one instance unless the wizard is active.

## Picked the wrong model?

Right-click a component on the canvas and choose **Replace**. You keep its position; only the product model swaps out.

## Just dropped in new component JSON?

If you copied files in via [Installed files](installed-files):

1. **Refresh lists** in **Settings → Installed files**
2. **Rescan** in the Devices panel if you added plugins too

Your custom component files live in the [AppData components folder](app-links).

## Fixed-layout devices

Keyboards and mice with a baked-in LED map don’t use the library for their main layout — they’re already in the tree, good to go.

## Related

* [RGB Wizard](rgb-wizard)
* [Workspace editor](workspace-editor) — arrange things after you place them
* [Installed files](installed-files)
