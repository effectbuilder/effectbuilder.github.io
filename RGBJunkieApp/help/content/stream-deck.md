---
title: Stream Deck — control RGBJunkie from Elgato keys and dials
slug: stream-deck
summary: Install the RGBJunkie-Deck plugin, assign effects and scenes, and use dials for brightness on Stream Deck +.
category: How-To
tags: stream deck, elgato, shortcuts, deep links
published: 2026-06-30
draft: false
---
## RGBJunkie-Deck plugin

RGBJunkie ships a companion **Stream Deck** plugin you install separately from the desktop app.

1. Download **RGBJunkie-Deck** from the [GitHub releases page](https://github.com/effectbuilder/RGBJunkie-Deck/releases) (zip includes the compiled plugin and **install-deck-plugin.bat**).
2. Extract the zip and double-click **install-deck-plugin.bat**.
3. Open Stream Deck and look for **RGBJunkie** in the action list.

Requires **Stream Deck 6.4+** and a current **RGBJunkie** build with `rgbjunkie://` links registered.

## What you can assign

| Action | What it does |
| ------ | ------------ |
| **RGBJunkie Effect** | Pick an effect and optional **canvas tab** target |
| **Previous / Next Effect** | Step through your effect list (per canvas tab if you choose one) |
| **RGBJunkie Scene** | Load a saved Scene |
| **Previous / Next Scene** | Step through user Scenes only (skips internal data files) |
| **Toggle Lights** | Pause the effect and black out all device LEDs; press again to restore |
| **Brightness Up / Down** | Step master brightness ±5% |
| **Master Brightness (Dial)** | Stream Deck **+** only — rotate to dim/brighten; press dial for 100% |
| **Cycle Effect / Scene (Dial)** | Rotate to step effects or Scenes |
| **Pause + Brightness (Dial)** | Press to pause; rotate for brightness |
| **Effect Browser**, **Hardware**, **Installed**, **Logs**, **Plugins folder**, **Restart** | Open app views or folders |

Most actions use **silent** mode so RGBJunkie stays in the tray.

## Canvas tab targeting

For **Effect** and **Previous/Next Effect**, the property inspector can target:

* **Selected canvas** — whichever canvas tab is active in RGBJunkie
* A **specific canvas tab** — control a background tab without switching to it in the app

## Same links from shortcuts

Stream Deck uses the same **`rgbjunkie://`** URLs documented in [App links](app-links) and on **Documentation → App deep links**. You can test links from a browser or batch file when debugging.

## Related

* [App links](app-links)
* [Effects — browse and tune](effects-browse-and-tune)
* [Scene profiles](scene-profiles)
* [Canvas tabs](canvas-tabs)