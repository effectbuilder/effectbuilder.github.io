---
title: Backup and restore your RGBJunkie data
slug: backup-restore
summary: Zip your profiles, plugins, effects, and settings from Settings → System.
category: How-To
tags: backup, restore, appdata, profiles
published: 2026-06-06
draft: false
---
## Don’t lose your Scenes

Scenes, plugins, WLED lists, community effects, settings — it all lives in your **RGBJunkie user folder** (on Windows: `%APPDATA%\RGBJunkie`). Wipe AppData or reinstall Windows without a backup and that work is gone.

Worth a zip every now and then.

## Create a backup

1. **Settings → System → Backup**
2. **Create backup**
3. RGBJunkie writes a zip to **Documents\RGBJunkie Backups** (or whatever path that page shows)

The zip grabs profiles, plugins, effects, components, cache, logs, Terms acceptance, media source settings — the whole kit.

## Open the backup folder

**Open backups folder** on the same Settings page. Or poke around via [App links](app-links) if you prefer.

## Restore (manual, but straightforward)

1. **Quit** RGBJunkie for real — tray → **Quit**
2. Extract your backup zip
3. Copy contents into your RGBJunkie user folder (merge/replace as needed)
4. Maybe make a fresh backup first if you’re overwriting a live install

## Before a big update

Backup before a major version jump or clean install. Cheap insurance. See [Check for updates](check-for-updates).

## Related

* [Scene profiles](scene-profiles)
* [Installed files](installed-files)
* [App links](app-links)
