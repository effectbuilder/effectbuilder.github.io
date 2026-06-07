---
title: Installed files — plugins, components, and effects
slug: installed-files
summary: Add Git repos, import community files, and refresh lists after copying to AppData.
category: How-To
tags: plugins, components, effects, git, install
published: 2026-06-06
draft: false
---
## Your stuff, not the installer’s

**Settings → Installed files** shows what **you** added to your RGBJunkie user folder:

* **Plugins** — device drivers (`.js`)
* **Components** — layout JSON for fans, strips, cases
* **Effects** — HTML effect files

What shipped with the installer doesn’t show here — only your additions and community downloads.

## Install from GitHub or GitLab

1. Paste a public **GitHub** or **GitLab** repo URL.
2. Flip the repo **On** and pick a branch if it asks.
3. RGBJunkie pulls `.js` and `.json` into the right folders.

Or click an **Install in RGBJunkie** button on the web — see [App links](app-links).

## Drop files in by hand

Open the folders from Installed files or [App links](app-links), copy files in:

| Folder | File types |
| ------ | ---------- |
| `plugins/` | `.js`, `.mjs` |
| `components/` | `.json` |
| `effects/` | `.html`, `.htm` |

Then hit **Refresh lists** on the Installed files page.

## After you add plugins or components

**Rescan** in the Devices panel so new hardware plugins actually load.

Tweaking plugins yourself? **Settings → Engine → Hot-reload user plugins** watches the folder while you edit. Turn it off when you’re done — no need to leave it on 24/7.

## Import from another install

Installed files may offer import from a compatible third-party layout. Follow the on-screen steps — RGBJunkie walks you through it.

## Related

* [Component Library](component-library)
* [Effects — browse and tune](effects-browse-and-tune)
* [Backup your data](backup-restore)
* [App links](app-links)
