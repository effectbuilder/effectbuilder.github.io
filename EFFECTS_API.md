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
| `exportPlainUrl` | yes | Opens the Effect Builder with **`exportPlain=1`**: downloads export HTML as **`.txt`** and shows source in `<pre>`. |
| `thumbnailUrl` | no | HTTPS image or `/effects/thumbnail.png?id=...` |
| `developer` | no | Author. |
| `description` | no | Parsed server-side from Firestore `configs` (meta `name === "description"`) or legacy `catalogDescription`. |
| `tags` | no | Parsed from `configs` (`name === "tags"`, comma/pipe-separated) or legacy `catalogTags`. |

### Example URLs

- JSON: `https://rgbjunkie.com/effects/effect.json?id=AbC123xYz`
- Plain export (browser): `https://rgbjunkie.com/?effectId=AbC123xYz&exportPlain=1`
- **Plain text (one line):** `GET /effects/effect-export-url.txt?id=AbC123xYz` — **`Content-Type: text/plain`**, body is only **`exportPlainUrl`** (not the HTML document).

---

## Effect payload — `GET /effects/effect.json?id=<id>`

- **Success:** `200`, `Content-Type: application/json; charset=utf-8`
- **`html`:** full self-contained HTML string when the Firestore document has **`exportedHtml`** (written by the Effect Builder on save, share, zip export, or via **Admin → Backfill**). Otherwise **`null`**.
- **`exportPlainUrl`:** always present; browser-only fallback when **`html`** is missing.
- **`workspace`** is omitted by default; use **`includeWorkspace=1`** for large `configs` / `objects` (debug only).

### Example shape (when stored export exists)

```json
{
  "schemaVersion": 1,
  "id": "AbC123xYz",
  "name": "My Rainbow",
  "fileName": "rgbjunkie-AbC123xYz.html",
  "developer": "Ada",
  "description": "Short blurb",
  "tags": ["audio"],
  "html": "<!DOCTYPE html>\\n<html>...",
  "exportPlainUrl": "https://rgbjunkie.com/?effectId=AbC123xYz&exportPlain=1"
}
```

### Firestore fields (Effect Builder)

| Field | Type | When set |
|-------|------|----------|
| `exportedHtmlGzip` | bytes | gzip-compressed UTF-8 export HTML (preferred; keeps the whole document under the **~1 MiB** Firestore limit). |
| `exportedHtmlEncoding` | string | `"gzip"` |
| `exportedHtml` | string | **Legacy** plain storage (no longer written; removed on next save when gzip is written). |
| `exportedHtmlUpdatedAt` | timestamp | Same as above. |

**Size:** The entire `projects/{id}` document must stay under **1,048,576 bytes**. Export HTML is stored **gzipped** as `exportedHtmlGzip`. If the doc is still too large (e.g. huge embedded thumbnail), trim other fields or raise the issue in support tooling.

### Admin backfill (`/admin/`)

Signed-in **admin UID** (same as in `admin/admin.js`) can run **Backfill all public effects**: for each public project id, a hidden iframe loads  
`{builder}/?effectId={id}&adminBackfillExport=1`  
so the builder runs `buildExportPayload` and **`updateDoc`** on that project.

**Firestore rules** must allow the admin user to update **`exportedHtml`** on documents where `request.auth.uid` is not the owner. Example pattern (replace `ADMIN_UID`):

```
match /projects/{projectId} {
  allow update: if request.auth != null && (
    request.auth.uid == resource.data.userId
    || request.auth.uid == 'ADMIN_UID'
  );
}
```

Tighten further with `request.resource.data.diff(resource.data).affectedKeys().hasOnly([...])` if you only want those two fields writable by admin.

### Desktop / automation note

- **`GET`** `exportPlainUrl` without JS still returns only the **app shell**, not generated HTML.
- **`GET`** `effect.json` returns **`html`** whenever **`exportedHtml`** is populated server-side.

- **304:** send `If-None-Match` with the response **`ETag`** when re-fetching.

### Errors

JSON body `{ "error": "...", "message": "..." }` with `400` / `403` / `404` / `502` as appropriate.

---

## Thumbnail — `GET /effects/thumbnail.png?id=<id>`

PNG when the project stores a `data:` thumbnail.

---

## Firestore / builder

- Community list: `projects` with `isPublic == true`.
- **`exportPlain=1`** and **`adminBackfillExport=1`**: skip “Shared effect loaded!” toast and **do not** increment **`viewCount`**.
- Catalog `runQuery` may request `configs` only for description/tags; **`configs` are not in the catalog JSON**.
- Composite index may be required for `isPublic` + `createdAt`.
