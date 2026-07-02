---
title: App links — open folders and install from the web
slug: app-links
summary: Use rgbjunkie.com handoff links to open AppData, install plugins, or jump to Settings.
category: Reference
tags: deep links, appdata, plugins, handoff
published: 2026-06-06
draft: false
---
## Skip digging through AppData

Links on **rgbjunkie.com** (or `rgbjunkie://` URLs) can open RGBJunkie or your **user data folder** without `%APPDATA%` archaeology.

RGBJunkie needs to be installed and registered for the link scheme. Clicked a link and nothing happened? Launch the app once from the Start menu, then try again.

When RGBJunkie is **already running**, website handoff links apply silently — no User Account Control prompt. If the app is **closed**, Windows may ask once to start RGBJunkie (the installed app runs as administrator so it can talk to USB lighting devices).

## Open your user data folder

These handoff links work in any browser:

| Link | Opens |
| ---- | ----- |
| [Open RGBJunkie user folder](handoff:open/appdata) | Root of your AppData folder |
| [plugins/](handoff:open/appdata/plugins) | Installed plugins |
| [effects/](handoff:open/appdata/effects) | User effects |
| [components/](handoff:open/appdata/components) | User components |
| [profiles/scenes/](handoff:open/appdata/profiles/scenes) | Scene files |
| [logs/](handoff:open/appdata/logs) | Log files |

Handy while following [Installed files](installed-files), [Backup your data](backup-restore), or [Send a support report](send-support-report).

## Install a plugin from GitHub

Community pages sometimes have **Install in RGBJunkie** buttons. Under the hood they look like:

```
https://www.rgbjunkie.com/RGBJunkieApp/s?p=addon/install&url=https://github.com/owner/repo
```

Only **https** on **github.com** or **gitlab.com**. Files land in your user folder and show up under **Settings → Installed files**.

## Jump straight into the app

Website handoff examples:

| Handoff `p=` value | Opens |
| ------------------ | ----- |
| `effect/applyprevious` / `effect/applynext` | Step through effects (`workspace=` optional for a canvas tab) |
| `scene/applyprevious` / `scene/applynext` | Step through saved Scenes |
| `brightness/set/50` | Set master brightness to 50% |
| `brightness/adjust?delta=+5` | Nudge brightness |
| `effect/togglepause` | Pause or resume the active effect |
| `lights/toggle` | Pause and black out all LEDs (toggle) |
| `view/settings/installed` | **Settings → Installed files** |
| `view/settings/hardware` | **Settings → Hardware** |
| `view/settings/colors` | **Settings → Colors** |
| `view/effects` | Browse effects |
| `view/logs` | Logs in Settings |

Add **`-silentlaunch-`** or `silent=1` if you want the action without popping the main window out of the tray.

## Apply a Scene or effect from a link

```
https://www.rgbjunkie.com/RGBJunkieApp/s?p=scene/apply/My%20Scene
https://www.rgbjunkie.com/RGBJunkieApp/s?p=effect/apply/Rainbow%20Rise
```

Scene names must match the picker in RGBJunkie (no `.json` on the end).

## Related

* [Installed files](installed-files)
* [Scene profiles](scene-profiles)
* [Documentation → App deep links](/RGBJunkieApp/docs/app-deep-links/)
