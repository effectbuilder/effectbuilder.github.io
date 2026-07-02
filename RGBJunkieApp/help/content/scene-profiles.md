---
title: Save and switch Scene profiles
slug: scene-profiles
summary: Keep your layout, devices, canvas tabs, and effect sliders together in one Scene file.
category: Getting Started
tags: scenes, profiles, saving
published: 2026-06-06
draft: false
---
# What is a Scene?

A **Scene** is a snapshot of your whole workspace:

* Device layout and components
* Canvas tabs and their order
* Effect choices and slider values

Gaming look, work look, stream look — switch without rebuilding from scratch every time.

And it’s not just effect sliders. Scenes remember **which components** sit on each channel too. Want fans in a straight row for one effect but in real LED positions for another? Save two Scenes. RGBJunkie keeps the whole picture.

## Save a Scene

1. Set up components, layout, and effects the way you want them.
2. In the bar **above the workspace canvas tabs**, click **Save**.
    ![Scene panel](images/image-10.png)
3. Enter a name when prompted — even if a scene is already selected, Save always asks so you can overwrite or save a copy.

Scene files live under <a href="handoff:open/appdata/profiles/scenes"><code>profiles/scenes</code></a> in your RGBJunkie AppData folder.

## Load a Scene

Use the **Scene picker** in the same bar above the canvas tabs. Pick one and RGBJunkie restores the saved layout and effect settings.

**Keep devices** (toggle next to Save) controls whether loading a Scene replaces USB device layout rows or only updates effects and canvas layout. Turn it **on** when you want to keep the hardware list you already have connected.

> **Tip:** **Settings → Help** has more Scene tricks and keyboard shortcuts in your language.

## Related

* [Backup your data](backup-restore) — zip your scenes before a reinstall
* [App links](app-links) — open `profiles/scenes` from a browser link
* [Canvas tabs](canvas-tabs) — what each tab stores in a Scene
* [Check for updates](check-for-updates) after a new build
