(function () {
    var root = document.getElementById('supported-devices-root');
    if (!root) return;

    var amazonLogo = root.getAttribute('data-amazon-logo') || '/RGBJunkieApp/images/amazon-wordmark-on-dark.svg';
    var dataUrl = root.getAttribute('data-devices-json') || 'supported-devices-data.json';
    var validationsUrl = root.getAttribute('data-validations-json') || '';

    var KIND_LABELS = {
        keyboard: 'Keyboard',
        mouse: 'Mouse',
        mousepad: 'Mousepad',
        gpu: 'Graphics / GPU',
        motherboard: 'Motherboard',
        ram: 'RAM',
        lightingcontroller: 'LED / lighting controller',
        headphones: 'Headset',
        'headset-stand': 'Headset stand',
        speakers: 'Speakers',
        microphone: 'Microphone',
        aio: 'AIO / cooler',
        case: 'Case',
        dongle: 'Dongle / receiver',
        gamepad: 'Gamepad',
        network: 'Network',
        virtual: 'Virtual',
        unknown: 'Unknown',
        other: 'Other',
    };

    function kindLabel(k) {
        return KIND_LABELS[k] || (k ? k.charAt(0).toUpperCase() + k.slice(1) : 'Other');
    }

    function tokensFromQuery(q) {
        return String(q || '')
            .toLowerCase()
            .split(/[\s,;&]+/)
            .map(function (t) { return t.replace(/^0x/, '').trim(); })
            .filter(Boolean);
    }

    function entryMatches(entry, q) {
        if (!q || !String(q).trim()) return true;
        var blob = entry.searchBlob || '';
        var toks = tokensFromQuery(q);
        if (!toks.length) return true;
        for (var i = 0; i < toks.length; i++) {
            if (blob.indexOf(toks[i]) === -1) return false;
        }
        return true;
    }

    function entryMatchesBrand(entry, brandKey) {
        if (!brandKey) return true;
        var b = entry.brand != null ? String(entry.brand).trim() : '';
        if (brandKey === '__none__') return b === '';
        return b === brandKey;
    }

    function fillBrandSelect(entries) {
        var sel = document.getElementById('sd-brand');
        if (!sel) return;
        while (sel.options.length > 1) sel.remove(1);
        var seen = {};
        var hasEmpty = false;
        var names = [];
        for (var i = 0; i < entries.length; i++) {
            var b = entries[i].brand != null ? String(entries[i].brand).trim() : '';
            if (!b) {
                hasEmpty = true;
                continue;
            }
            if (!seen[b]) {
                seen[b] = true;
                names.push(b);
            }
        }
        names.sort(function (a, b) {
            return a.localeCompare(b, undefined, { sensitivity: 'base' });
        });
        if (hasEmpty) {
            var o0 = document.createElement('option');
            o0.value = '__none__';
            o0.textContent = '— (no brand)';
            sel.appendChild(o0);
        }
        for (var j = 0; j < names.length; j++) {
            var o = document.createElement('option');
            o.value = names[j];
            o.textContent = names[j];
            sel.appendChild(o);
        }
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    var validationEntries = {};
    var viewMode = 'all';

    function entryValidationStatus(entry) {
        var path = entry && entry.relativePath;
        if (!path || !validationEntries[path]) return null;
        var row = validationEntries[path];
        var s = row.status ? String(row.status).toLowerCase() : 'validated';
        return s === 'experimental' ? 'experimental' : 'validated';
    }

    function isEntryValidated(entry) {
        return entryValidationStatus(entry) === 'validated';
    }

    function isEntryExperimental(entry) {
        return entryValidationStatus(entry) === 'experimental';
    }

    function validationNotes(entry) {
        var path = entry && entry.relativePath;
        if (!path) return '';
        var row = validationEntries[path];
        return row && row.notes ? String(row.notes) : '';
    }

    function validatedCount() {
        var n = 0;
        for (var i = 0; i < allEntries.length; i++) {
            if (isEntryValidated(allEntries[i])) n++;
        }
        return n;
    }

    function experimentalCount() {
        var n = 0;
        for (var i = 0; i < allEntries.length; i++) {
            if (isEntryExperimental(allEntries[i])) n++;
        }
        return n;
    }

    function validationBadgeHtml(entry) {
        var status = entryValidationStatus(entry);
        var notes = validationNotes(entry);
        var title = notes ? ' title="' + esc(notes) + '"' : '';
        if (status === 'validated') {
            return (
                '<span class="sd-validated-badge"' +
                title +
                '><i class="bi bi-patch-check-fill" aria-hidden="true"></i> Validated</span>'
            );
        }
        if (status === 'experimental') {
            return (
                '<span class="sd-experimental-badge"' +
                title +
                '><i class="bi bi-flask" aria-hidden="true"></i> Experimental</span>'
            );
        }
        return '';
    }

    function syncViewTabs() {
        var tabs = root.querySelectorAll('[data-sd-view]');
        for (var i = 0; i < tabs.length; i++) {
            var btn = tabs[i];
            var mode = btn.getAttribute('data-sd-view') || 'all';
            var active = mode === viewMode;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        }
        var summary = document.getElementById('sd-validated-summary');
        if (summary) {
            var vCount = validatedCount();
            var eCount = experimentalCount();
            if (viewMode === 'validated') {
                summary.textContent =
                    vCount === 1
                        ? '1 device has been tested and confirmed working with RGBJunkie.'
                        : vCount + ' devices have been tested and confirmed working with RGBJunkie.';
                summary.classList.remove('d-none');
            } else if (viewMode === 'experimental') {
                summary.textContent =
                    eCount === 1
                        ? '1 device has early or partial support in RGBJunkie — check notes on the card if present.'
                        : eCount + ' devices have early or partial support in RGBJunkie — check notes on the card if present.';
                summary.classList.remove('d-none');
            } else if (vCount > 0 || eCount > 0) {
                var parts = [];
                if (vCount > 0) parts.push(vCount + ' validated');
                if (eCount > 0) parts.push(eCount + ' experimental');
                summary.textContent = parts.join(' · ') + ' · ' + allEntries.length + ' total in catalog.';
                summary.classList.remove('d-none');
            } else {
                summary.textContent = '';
                summary.classList.add('d-none');
            }
        }
    }

    function setViewMode(mode) {
        viewMode = mode === 'validated' || mode === 'experimental' ? mode : 'all';
        syncViewTabs();
        try {
            var u = new URL(window.location.href);
            if (viewMode === 'all') u.searchParams.delete('view');
            else u.searchParams.set('view', viewMode);
            history.replaceState(null, '', u.pathname + u.search + u.hash);
        } catch (err) { /* ignore */ }
        applyFilters();
    }

    function vidCell(entry) {
        if (entry.vendorIdHex == null && entry.vendorId == null) {
            return '<span class="sd-muted">—</span>';
        }
        return '<div class="sd-mono">' + esc(entry.vendorIdHex || '') + '</div>';
    }

    function pidsCell(entry) {
        var pairs = entry.usbPairs;
        if (!pairs || !pairs.length) {
            var pids = entry.productIdsHex || [];
            if (!pids.length) return '<span class="sd-muted">—</span>';
            pairs = pids.map(function (pidHex) {
                return { pidHex: pidHex, label: null };
            });
        }
        var lines = [];
        for (var i = 0; i < pairs.length; i++) {
            var pid = esc(pairs[i].pidHex);
            var lab = pairs[i].label
                ? '<span class="sd-pid-name sd-muted">(' + esc(pairs[i].label) + ')</span>'
                : '';
            var mod = i % 3;
            lines.push(
                '<div class="sd-pid-row"><span class="sd-pid-pill sd-pid-pill--' +
                    mod +
                    '">' +
                    pid +
                    '</span>' +
                    lab +
                    '</div>'
            );
        }
        return lines.join('');
    }

    function thumbCell(entry) {
        var src = entry.imageUrl;
        if (!src) return '<span class="sd-muted">—</span>';
        return '<img alt="" loading="lazy" width="150" height="150" src="' + esc(src) + '" />';
    }

    function shopCell(entry) {
        var href = entry.amazonUrl;
        if (!href || typeof href !== 'string') return '<span class="sd-muted">—</span>';
        return (
            '<a class="sd-amazon-link" href="' +
            esc(href) +
            '" target="_blank" rel="nofollow sponsored noopener noreferrer" title="Search for this device on Amazon (US)">' +
            '<img class="sd-amazon-logo-img" src="' +
            esc(amazonLogo) +
            '" alt="" width="96" height="29" loading="lazy" decoding="async" />' +
            '<span class="sd-amazon-link-text">View on Amazon</span></a>'
        );
    }

    function permalinkHref(entry) {
        var id = entry.permalinkId;
        if (!id || typeof id !== 'string') return '';
        return '#sd-' + id;
    }

    function render(rows, markPermalinkId) {
        var list = document.getElementById('sd-list');
        if (!list) return;
        list.innerHTML = '';
        for (var i = 0; i < rows.length; i++) {
            var e = rows[i];
            var card = document.createElement('article');
            card.className = 'sd-device-card';
            if (e.permalinkId && typeof e.permalinkId === 'string') {
                card.id = 'sd-' + e.permalinkId;
            }
            if (markPermalinkId && e.permalinkId === markPermalinkId) {
                card.classList.add('sd-permalink-target');
            }
            var ph = permalinkHref(e);
            var share =
                ph !== ''
                    ? '<a class="sd-card-share sd-permalink text-decoration-none" href="' +
                      esc(ph) +
                      '" title="Open a page that shows only this device" aria-label="Share link to this device">' +
                      '<i class="bi bi-share-fill sd-card-share__icon" aria-hidden="true"></i>' +
                      '<span class="visually-hidden">Share</span></a>'
                    : '';
            var nameUpper = esc(String(e.displayName || '')).toUpperCase();
            var badge = validationBadgeHtml(e);
            var techBlock =
                '<div class="sd-tech-block">' +
                '<div class="sd-meta-grid sd-meta-grid--tech">' +
                '<span class="sd-mlabel">Brand</span><div class="sd-mval">' +
                esc(e.brand || '—') +
                '</div>' +
                '<span class="sd-mlabel">Type</span><div class="sd-mval">' +
                esc(kindLabel(e.deviceKind)) +
                '</div>' +
                '<span class="sd-mlabel">USB vendor</span><div class="sd-mval">' +
                vidCell(e) +
                '</div>' +
                '<span class="sd-mlabel">Transport</span><div class="sd-mval">' +
                esc(e.transportType || '—') +
                '</div>' +
                '</div></div>';
            var head =
                '<div class="sd-device-card__head">' +
                '<div class="sd-device-card__thumb">' +
                thumbCell(e) +
                '</div>' +
                '<div class="sd-device-card__hero">' +
                '<div class="sd-device-card__head-top">' +
                '<p class="sd-device-card__name">' +
                nameUpper +
                badge +
                '</p>' +
                share +
                '</div>' +
                techBlock +
                '</div></div>';
            var sheet =
                '<div class="sd-device-card__sheet">' +
                '<div class="sd-pids-wrap">' +
                '<span class="sd-mlabel">Product codes</span>' +
                '<div class="sd-device-card__pids">' +
                pidsCell(e) +
                '</div></div></div>';
            var shop = '<div class="sd-device-card__shop">' + shopCell(e) + '</div>';
            card.innerHTML = head + sheet + shop;
            list.appendChild(card);
        }
    }

    var allEntries = [];
    var debTimer;

    function getPermalinkIdFromHash() {
        var m = /^#sd-(.+)$/.exec(window.location.hash || '');
        return m ? m[1] : '';
    }

    function clearPermalinkHash() {
        try {
            var u = new URL(window.location.href);
            history.replaceState(null, '', u.pathname + u.search);
        } catch (err) {
            try {
                window.location.hash = '';
            } catch (e2) { /* ignore */ }
        }
    }

    function findEntryByPermalinkId(pid) {
        for (var i = 0; i < allEntries.length; i++) {
            if (allEntries[i].permalinkId === pid) return allEntries[i];
        }
        return null;
    }

    function syncPermalinkBanner(perm, linkedEntry) {
        var banner = document.getElementById('sd-permalink-banner');
        var textEl = document.getElementById('sd-permalink-banner-text');
        var btn = document.getElementById('sd-permalink-clear');
        if (!banner || !textEl || !btn) return;
        banner.classList.remove('alert-info', 'alert-warning');
        if (perm && linkedEntry) {
            banner.classList.add('alert-info');
            textEl.innerHTML = 'Showing one device: <strong>' + esc(linkedEntry.displayName) + '</strong>';
            btn.classList.remove('d-none');
            banner.classList.remove('d-none');
        } else if (perm && !linkedEntry) {
            banner.classList.add('alert-warning');
            textEl.textContent = 'No saved device matched that link. Showing the full list instead.';
            btn.classList.remove('d-none');
            banner.classList.remove('d-none');
        } else {
            textEl.innerHTML = '';
            btn.classList.add('d-none');
            banner.classList.add('d-none');
        }
    }

    function applyFilters() {
        var searchEl = document.getElementById('sd-search');
        var kindEl = document.getElementById('sd-kind');
        var brandEl = document.getElementById('sd-brand');
        if (!searchEl || !kindEl || !brandEl) return;

        var q = searchEl.value;
        var kind = kindEl.value;
        var brand = brandEl.value;
        var perm = getPermalinkIdFromHash();
        var linkedEntry = perm ? findEntryByPermalinkId(perm) : null;
        var linkedOnly = !!(perm && linkedEntry);
        var out = [];
        var markId = '';

        if (linkedOnly) {
            out = [linkedEntry];
            markId = linkedEntry.permalinkId;
        } else {
            for (var i = 0; i < allEntries.length; i++) {
                var e = allEntries[i];
                if (viewMode === 'validated' && !isEntryValidated(e)) continue;
                if (viewMode === 'experimental' && !isEntryExperimental(e)) continue;
                if (kind && e.deviceKind !== kind) continue;
                if (!entryMatchesBrand(e, brand)) continue;
                if (!entryMatches(e, q)) continue;
                out.push(e);
            }
        }

        searchEl.disabled = !!linkedOnly;
        kindEl.disabled = !!linkedOnly;
        brandEl.disabled = !!linkedOnly;

        syncPermalinkBanner(perm, linkedEntry);
        syncViewTabs();
        render(out, markId);

        var countEl = document.getElementById('sd-count');
        if (countEl) {
            if (linkedOnly) {
                countEl.textContent = '1 device (shared link) · ' + allEntries.length + ' total';
            } else if (viewMode === 'validated') {
                countEl.textContent = out.length + ' validated shown · ' + validatedCount() + ' total validated';
            } else if (viewMode === 'experimental') {
                countEl.textContent =
                    out.length + ' experimental shown · ' + experimentalCount() + ' total experimental';
            } else {
                countEl.textContent = out.length + ' / ' + allEntries.length + ' shown';
            }
        }

        try {
            var u = new URL(window.location.href);
            if (q.trim()) u.searchParams.set('search', q.trim());
            else u.searchParams.delete('search');
            if (brand) u.searchParams.set('brand', brand);
            else u.searchParams.delete('brand');
            history.replaceState(null, '', u.pathname + u.search + u.hash);
        } catch (err) { /* ignore */ }

        if (linkedOnly && markId) {
            requestAnimationFrame(function () {
                var card = document.getElementById('sd-' + markId);
                if (card) {
                    card.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    card.classList.remove('sd-row-flash');
                    void card.offsetWidth;
                    card.classList.add('sd-row-flash');
                    setTimeout(function () {
                        card.classList.remove('sd-row-flash');
                    }, 1600);
                }
            });
        }
    }

    function scheduleApply() {
        clearTimeout(debTimer);
        debTimer = setTimeout(applyFilters, 120);
    }

    var clearBtn = document.getElementById('sd-permalink-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            clearPermalinkHash();
            applyFilters();
        });
    }

    var searchInput = document.getElementById('sd-search');
    if (searchInput) searchInput.addEventListener('input', scheduleApply);
    if (document.getElementById('sd-kind')) {
        document.getElementById('sd-kind').addEventListener('change', applyFilters);
    }
    if (document.getElementById('sd-brand')) {
        document.getElementById('sd-brand').addEventListener('change', applyFilters);
    }

    window.addEventListener('hashchange', applyFilters);

    var viewTabButtons = root.querySelectorAll('[data-sd-view]');
    for (var vi = 0; vi < viewTabButtons.length; vi++) {
        viewTabButtons[vi].addEventListener('click', function () {
            setViewMode(this.getAttribute('data-sd-view') || 'all');
        });
    }

    var validationsPromise = validationsUrl
        ? fetch(validationsUrl)
              .then(function (r) {
                  if (!r.ok) return { entries: {} };
                  return r.json();
              })
              .catch(function () {
                  return { entries: {} };
              })
        : Promise.resolve({ entries: {} });

    Promise.all([
        fetch(dataUrl).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        }),
        validationsPromise,
    ])
        .then(function (results) {
            var data = results[0];
            var valData = results[1];
            validationEntries = (valData && valData.entries) || {};
            allEntries = data.entries || [];
            var metaEl = document.getElementById('meta-updated');
            if (metaEl && data.meta && data.meta.generatedAt) {
                var d = new Date(data.meta.generatedAt);
                metaEl.textContent = isNaN(d.getTime())
                    ? 'Device list updated ' + data.meta.generatedAt + '.'
                    : 'Device list updated ' + d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + '.';
            }

            var kinds = data.meta && data.meta.deviceKinds ? data.meta.deviceKinds : [];
            var sel = document.getElementById('sd-kind');
            if (sel) {
                for (var i = 0; i < kinds.length; i++) {
                    var k = kinds[i];
                    var opt = document.createElement('option');
                    opt.value = k;
                    opt.textContent = kindLabel(k);
                    sel.appendChild(opt);
                }
            }
            fillBrandSelect(allEntries);

            var params = new URLSearchParams(window.location.search);
            var qs = params.get('search');
            if (qs && searchInput) searchInput.value = qs;
            var viewParam = params.get('view');
            if (viewParam === 'validated' || viewParam === 'experimental') {
                viewMode = viewParam;
            }
            var bq = params.get('brand');
            if (bq !== null && bq !== '') {
                var brandSel = document.getElementById('sd-brand');
                if (brandSel) {
                    for (var bi = 0; bi < brandSel.options.length; bi++) {
                        if (brandSel.options[bi].value === bq) {
                            brandSel.value = bq;
                            break;
                        }
                    }
                }
            }
            applyFilters();
        })
        .catch(function () {
            var el = document.getElementById('sd-err');
            if (el) {
                el.classList.remove('d-none');
                el.textContent =
                    'The device list could not be loaded. Please refresh the page, or try again later.';
            }
        });
})();
