/**
 * Browser-only catalog: reads Firestore `srgb-components` via ./firebase.js
 * https://rgbjunkie.com/builder/components-catalog.html
 */
import {
    db,
    collection,
    query,
    orderBy,
    limit,
    startAfter,
    getDocs,
    FieldPath
} from './firebase.js';

const SITE_ORIGIN = 'https://rgbjunkie.com';

/** First defined, non-empty string (or number coerced for LedCount path). */
function pick(...candidates) {
    for (const c of candidates) {
        if (c === undefined || c === null) continue;
        if (typeof c === 'string' && c.trim() === '') continue;
        return c;
    }
    return null;
}

function tsToIso(ts) {
    if (!ts || typeof ts.toDate !== 'function') return null;
    try {
        return ts.toDate().toISOString();
    } catch {
        return null;
    }
}

/**
 * Normalized catalog entry (PascalCase SignalRGB-style fields + stable ids).
 * @param {*} docSnap Firestore QueryDocumentSnapshot
 * @param {boolean} includeDataImages
 * @param {{ stripIds?: boolean }} opts If stripIds, omit id/shareId/catalogId (for nested wrapper).
 */
function buildNormalizedComponent(docSnap, includeDataImages, opts = {}) {
    const d = docSnap.data() || {};
    const shareId = String(docSnap.id);

    let imageUrl = pick(d.ImageUrl, d.imageUrl, d.imageURL, d.image_url, d.Image);
    const hasEmbeddedImage = !!(imageUrl && String(imageUrl).startsWith('data:'));
    if (hasEmbeddedImage && !includeDataImages) {
        imageUrl = null;
    }

    const ledRaw = pick(
        d.LedCount,
        d.ledCount,
        Array.isArray(d.leds) ? d.leds.length : undefined
    );
    const ledCountNum = typeof ledRaw === 'number' && !Number.isNaN(ledRaw)
        ? ledRaw
        : parseInt(String(ledRaw || 0), 10) || 0;

    const base = {
        ProductName: pick(d.ProductName, d.productName, d.name) ?? null,
        DisplayName: pick(d.DisplayName, d.displayName, d.display_name, d.name) ?? null,
        Brand: pick(d.Brand, d.brand) ?? null,
        Type: pick(d.Type, d.type) ?? null,
        ImageUrl: imageUrl ?? null,
        LedCount: ledCountNum,
        Description: pick(d.Description, d.description) ?? null,
        CreatorId: pick(d.CreatorId, d.creatorId, d.ownerId) ?? null,
        CreatorName: pick(d.CreatorName, d.creatorName, d.ownerName) ?? null,
        LikeCount: typeof d.likeCount === 'number' ? d.likeCount : (typeof d.LikeCount === 'number' ? d.LikeCount : 0),
        ViewCount: typeof d.viewCount === 'number' ? d.viewCount : (typeof d.ViewCount === 'number' ? d.ViewCount : 0),
        DownloadCount: typeof d.downloadCount === 'number' ? d.downloadCount : (typeof d.DownloadCount === 'number' ? d.DownloadCount : 0),
        CreatedAt: tsToIso(d.createdAt ?? d.CreatedAt),
        UpdatedAt: tsToIso(d.lastUpdated ?? d.LastUpdated ?? d.updatedAt)
    };

    const baseUrl = SITE_ORIGIN.replace(/\/$/, '');
    base.BuilderUrl = `${baseUrl}/builder/?id=${encodeURIComponent(shareId)}`;
    base.SignalrgbJsonUrl = `${baseUrl}/builder/?id=${encodeURIComponent(shareId)}&export=rgbjunkie`;

    if (opts.stripIds) {
        return base;
    }

    return {
        id: shareId,
        shareId,
        catalogId: shareId,
        ...base
    };
}

/**
 * @param {object[]} normalizedList from buildNormalizedComponent(..., { stripIds: false })
 * @param {string} format array | components | items | data | nested
 */
function wrapCatalogOutput(normalizedList, format) {
    const f = (format || 'components').toLowerCase();
    switch (f) {
        case 'array':
            return normalizedList;
        case 'items':
            return { items: normalizedList };
        case 'data':
            return { data: { components: normalizedList } };
        case 'nested':
            return normalizedList.map((entry) => {
                const sid = entry.id || entry.shareId || entry.catalogId;
                const { id: _i, shareId: _s, catalogId: _c, ...rest } = entry;
                return {
                    id: String(sid),
                    component: { ...rest }
                };
            });
        case 'components':
        default:
            return { components: normalizedList };
    }
}

async function fetchComponentDocsClient(maxDocs, orderField, direction) {
    const col = collection(db, 'srgb-components');
    const out = [];
    let lastDoc = null;
    const pageSize = 200;

    while (out.length < maxDocs) {
        const take = Math.min(pageSize, maxDocs - out.length);
        const parts = [orderBy(orderField, direction)];
        if (lastDoc) {
            parts.push(startAfter(lastDoc));
        }
        parts.push(limit(take));
        const snap = await getDocs(query(col, ...parts));
        if (snap.empty) {
            break;
        }
        snap.forEach((doc) => out.push(doc));
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.size < take) {
            break;
        }
    }
    return out;
}

/** Value written to file / preview (raw array or chosen wrapper only). */
let lastDownloadPayload = null;

function getFormatFromPage() {
    const sel = document.getElementById('catalog-format');
    if (sel && sel.value) return sel.value;
    return new URLSearchParams(window.location.search).get('format') || 'components';
}

async function buildCatalog() {
    const maxInput = document.getElementById('max-docs');
    const includeCb = document.getElementById('include-data-images');
    const statusEl = document.getElementById('catalog-status');
    const raw = parseInt(String(maxInput && maxInput.value ? maxInput.value : '2000'), 10);
    const maxDocs = Math.min(Number.isFinite(raw) ? raw : 2000, 5000);
    const includeDataImages = !!(includeCb && includeCb.checked);
    const format = getFormatFromPage();

    statusEl.textContent = 'Fetching from Firestore…';
    lastDownloadPayload = null;

    let snapshots;
    let sortUsed = 'lastUpdated_desc';
    try {
        snapshots = await fetchComponentDocsClient(maxDocs, 'lastUpdated', 'desc');
    } catch (e) {
        console.warn('Catalog: lastUpdated query failed, using documentId:', e);
        statusEl.textContent = 'Using document-id order (fallback)…';
        snapshots = await fetchComponentDocsClient(maxDocs, FieldPath.documentId(), 'asc');
        sortUsed = 'documentId_asc';
    }

    const truncated = snapshots.length >= maxDocs;
    const normalized = snapshots.map((d) => buildNormalizedComponent(d, includeDataImages, { stripIds: false }));
    lastDownloadPayload = wrapCatalogOutput(normalized, format);

    statusEl.textContent = `Done. ${normalized.length} component(s), format “${format}”${truncated ? ' (limit reached)' : ''}. Sort: ${sortUsed}.`;
    document.getElementById('btn-download').disabled = false;
    document.getElementById('btn-copy').disabled = false;

    const preview = document.getElementById('json-preview');
    if (preview) {
        preview.textContent = JSON.stringify(lastDownloadPayload, null, 2);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('download') === '1') {
        triggerDownload();
    }
}

function triggerDownload() {
    if (lastDownloadPayload === null || lastDownloadPayload === undefined) return;
    const blob = new Blob([JSON.stringify(lastDownloadPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fmt = getFormatFromPage() || 'components';
    a.download = `rgbjunkie-components-${fmt}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('btn-build').addEventListener('click', () => {
    buildCatalog().catch((err) => {
        console.error(err);
        document.getElementById('catalog-status').textContent = `Error: ${err.message || err}`;
    });
});

document.getElementById('btn-download').addEventListener('click', triggerDownload);

document.getElementById('btn-copy').addEventListener('click', async () => {
    if (lastDownloadPayload === null || lastDownloadPayload === undefined) return;
    try {
        await navigator.clipboard.writeText(JSON.stringify(lastDownloadPayload, null, 2));
        document.getElementById('catalog-status').textContent = 'JSON copied to clipboard.';
    } catch {
        document.getElementById('catalog-status').textContent = 'Copy failed — use Download or select the preview text.';
    }
});

const bootParams = new URLSearchParams(window.location.search);
if (bootParams.get('max')) {
    const el = document.getElementById('max-docs');
    if (el) el.value = bootParams.get('max');
}
if (bootParams.get('includeDataImages') === '1') {
    const c = document.getElementById('include-data-images');
    if (c) c.checked = true;
}
if (bootParams.get('format')) {
    const sel = document.getElementById('catalog-format');
    if (sel) sel.value = bootParams.get('format');
}
if (bootParams.get('autostart') === '1' || bootParams.get('download') === '1') {
    buildCatalog().catch((err) => {
        console.error(err);
        document.getElementById('catalog-status').textContent = `Error: ${err.message || err}`;
    });
}
