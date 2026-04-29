/**
 * Browser-only catalog: reads Firestore `srgb-components` via the same Firebase Web SDK as the builder.
 * No Node/npm required — open https://rgbjunkie.com/builder/components-catalog.html
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

function tsToIso(ts) {
    if (!ts || typeof ts.toDate !== 'function') return null;
    try {
        return ts.toDate().toISOString();
    } catch {
        return null;
    }
}

function mapComponentDoc(docSnap, includeDataImages) {
    const d = docSnap.data() || {};
    const id = docSnap.id;

    let imageUrl = typeof d.imageUrl === 'string' ? d.imageUrl : null;
    const hasEmbeddedImage = !!(imageUrl && imageUrl.startsWith('data:'));
    if (hasEmbeddedImage && !includeDataImages) {
        imageUrl = null;
    }

    const base = SITE_ORIGIN.replace(/\/$/, '');
    const builderUrl = `${base}/builder/?id=${encodeURIComponent(id)}`;
    const signalrgbJsonUrl = `${base}/builder/?id=${encodeURIComponent(id)}&export=rgbjunkie`;

    return {
        id,
        productName: d.name ?? null,
        displayName: d.displayName ?? d.name ?? null,
        description: d.description != null ? d.description : null,
        brand: d.brand ?? null,
        type: d.type ?? null,
        ledCount: typeof d.ledCount === 'number' ? d.ledCount : (Array.isArray(d.leds) ? d.leds.length : 0),
        creator: {
            id: d.ownerId ?? null,
            name: d.ownerName ?? null
        },
        stats: {
            likes: d.likeCount ?? 0,
            views: d.viewCount ?? 0,
            downloads: d.downloadCount ?? 0
        },
        imageUrl,
        hasEmbeddedImage,
        urls: {
            builder: builderUrl,
            signalrgbJson: signalrgbJsonUrl
        },
        createdAt: tsToIso(d.createdAt),
        updatedAt: tsToIso(d.lastUpdated)
    };
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
        snap.forEach((d) => out.push(d));
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.size < take) {
            break;
        }
    }
    return out;
}

let lastPayload = null;

async function buildCatalog() {
    const maxInput = document.getElementById('max-docs');
    const includeCb = document.getElementById('include-data-images');
    const statusEl = document.getElementById('catalog-status');
    const raw = parseInt(String(maxInput && maxInput.value ? maxInput.value : '2000'), 10);
    const maxDocs = Math.min(Number.isFinite(raw) ? raw : 2000, 5000);
    const includeDataImages = !!(includeCb && includeCb.checked);

    statusEl.textContent = 'Fetching from Firestore…';
    lastPayload = null;

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
    const components = snapshots.map((d) => mapComponentDoc(d, includeDataImages));

    lastPayload = {
        generatedAt: new Date().toISOString(),
        count: components.length,
        maxRequested: maxDocs,
        truncated,
        sort: sortUsed,
        siteOrigin: SITE_ORIGIN,
        components
    };

    statusEl.textContent = `Done. ${components.length} component(s)${truncated ? ' (limit reached — run again or raise max)' : ''}.`;
    document.getElementById('btn-download').disabled = false;
    document.getElementById('btn-copy').disabled = false;

    const preview = document.getElementById('json-preview');
    if (preview) {
        preview.textContent = JSON.stringify(lastPayload, null, 2);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('download') === '1') {
        triggerDownload();
    }
}

function triggerDownload() {
    if (!lastPayload) return;
    const blob = new Blob([JSON.stringify(lastPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rgbjunkie-components-catalog-${new Date().toISOString().slice(0, 10)}.json`;
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
    if (!lastPayload) return;
    try {
        await navigator.clipboard.writeText(JSON.stringify(lastPayload, null, 2));
        document.getElementById('catalog-status').textContent = 'JSON copied to clipboard.';
    } catch (e) {
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
if (bootParams.get('autostart') === '1' || bootParams.get('download') === '1') {
    buildCatalog().catch((err) => {
        console.error(err);
        document.getElementById('catalog-status').textContent = `Error: ${err.message || err}`;
    });
}
