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
| `contentUrl` | yes | `GET` returns **JSON** (not raw HTML) — see below. |
| `thumbnailUrl` | no | HTTPS image or `/effects/thumbnail.png?id=...` |
| `developer` | no | Author. |
| `description` | no | Parsed server-side from Firestore `configs` (meta `name === "description"`) or legacy `catalogDescription`. |
| `tags` | no | Parsed from `configs` (`name === "tags"`, comma/pipe-separated) or legacy `catalogTags`. |

### Example `contentUrl`

`https://rgbjunkie.com/effects/effect.json?id=AbC123xYz`

---

## Effect payload — `GET /effects/effect.json?id=<id>`

- **Success:** `200`, `Content-Type: application/json; charset=utf-8`
- **Body:** one JSON object. **`html` is always present** (currently `null`). **`workspace`** holds `configs` + `objects` from Firestore so the **desktop app can generate the full HTML** using the same rules as the Effect Builder export (`buildExportPayload` / zip export), without storing large HTML in the database.

### Shape

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
  "workspace": {
    "configs": [ ],
    "objects": [ ]
  }
}
```

- After fetching, the Tauri app should set **`html`** locally (e.g. run bundled export logic on `workspace`) before writing a `.html` file or loading an iframe.
- **304:** send `If-None-Match` with the response **`ETag`** when re-fetching.

### Errors

JSON body `{ "error": "...", "message": "..." }` with `400` / `403` / `404` / `502` as appropriate.

---

## Thumbnail — `GET /effects/thumbnail.png?id=<id>`

Unchanged: PNG when the project stores a `data:` thumbnail.

---

## Firestore / builder

- Community list: `projects` with `isPublic == true`.
- **Website JavaScript is unchanged**; all behavior is implemented in PHP under the repo root (`effects-*.php`, `effect-*.php`).
- The catalog `runQuery` may request `configs` only so the server can read description/tags; **`configs` are not included in the catalog JSON response**.
- Composite index may be required for `isPublic` + `createdAt` (`runQuery`); if the catalog is empty, check server logs / Firestore console for index links.
