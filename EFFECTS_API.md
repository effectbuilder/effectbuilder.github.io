# RGBJunkie community effects API (desktop / Tauri)

Public HTTPS only (`https://rgbjunkie.com` or `https://www.rgbjunkie.com`). No auth.

## Catalog — `GET /effects-catalog.json`

- **Response:** `Content-Type: application/json; charset=utf-8`
- **Shape:** `{ "effects": [ ... ], "effectDefinitions": {} }`
- **Query:** `max` or `limit` (default `300`, cap `2000`).

### Each `effects[]` item

| Field | Required | Notes |
|--------|------------|--------|
| `id` | yes | Firestore project document id. |
| `name` | yes | Display title. |
| `fileName` | yes | e.g. `rgbjunkie-{id}.html` |
| `contentUrl` | yes | `GET` returns **JSON** — see Effect payload below. |
| `exportPlainUrl` | yes | Opens the Effect Builder with **`exportPlain=1`**: in the browser, downloads the export HTML as a **`.txt`** (`text/plain`) and shows the source in a plain `<pre>`. Same generator as the normal Export button (`buildExportPayload`). |
| `thumbnailUrl` | no | HTTPS image or `/effects/thumbnail.png?id=...` |
| `developer` | no | Author. |
| `description` | no | Parsed server-side from Firestore `configs` (meta `name === "description"`) or legacy `catalogDescription`. |
| `tags` | no | Parsed from `configs` (`name === "tags"`, comma/pipe-separated) or legacy `catalogTags`. |

### Example URLs

- JSON: `https://rgbjunkie.com/effects/effect.json?id=AbC123xYz`
- Plain export (browser): `https://rgbjunkie.com/?effectId=AbC123xYz&exportPlain=1`
- **Plain text (one line):** `GET /effects/effect-export-url.txt?id=AbC123xYz` — **`Content-Type: text/plain`**, body is **only** the `exportPlainUrl` (plus newline). Use from `curl`/scripts; it is **not** the HTML source (that still requires a browser or stored copy).

---

## Effect payload — `GET /effects/effect.json?id=<id>`

- **Success:** `200`, `Content-Type: application/json; charset=utf-8`
- **Body:** metadata plus **`exportPlainUrl`**. The full Firestore **`configs` / `objects`** blob is **not** included by default.
- **`html`:** always **`null`**. HTML is produced **only in the browser** when the user (or app WebView) opens **`exportPlainUrl`**.

### Default shape

```json
{
  "schemaVersion": 1,
  "id": "AbC123xYz",
  "name": "My Rainbow",
  "fileName": "rgbjunkie-AbC123xYz.html",
  "developer": "Ada",
  "description": "Short blurb",
  "tags": ["audio"],
  "html": null,
  "exportPlainUrl": "https://rgbjunkie.com/?effectId=AbC123xYz&exportPlain=1"
}
```

### Optional full workspace

`GET /effects/effect.json?id=<id>&includeWorkspace=1` adds **`workspace`**: `{ "configs": [ ], "objects": [ ] }` (large). For debugging or offline rebuild only.

### Desktop / automation note

A plain **`GET`** from PHP to **`exportPlainUrl`** returns the **shell HTML** of the app, **not** the generated document (JavaScript has not run). To obtain the string in code, use an environment that executes JS (embedded browser, user flow, or your own automation), or use **`includeWorkspace=1`** and rebuild from `workspace` client-side.

- **304:** send `If-None-Match` with the response **`ETag`** when re-fetching.

### Errors

JSON body `{ "error": "...", "message": "..." }` with `400` / `403` / `404` / `502` as appropriate.

---

## Thumbnail — `GET /effects/thumbnail.png?id=<id>`

PNG when the project stores a `data:` thumbnail.

---

## Firestore / builder

- Community list: `projects` with `isPublic == true`.
- **`exportPlain=1`** in **`js/main.js`**: skips the “Shared effect loaded!” toast and does **not** increment **`viewCount`** (same as treating the visit as an export helper).
- The catalog `runQuery` may request `configs` only so the server can read description/tags; **`configs` are not included in the catalog JSON response**.
- Composite index may be required for `isPublic` + `createdAt` (`runQuery`); if the catalog is empty, check server logs / Firestore console for index links.
