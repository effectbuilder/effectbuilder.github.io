import {
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from '../../js/firebase.js';

(function () {
    'use strict';

    var cfg = window.RGBJ_SUPPORTED_VALIDATIONS_ADMIN || {};
    var adminUid = cfg.adminUid || '';
    var apiUrl = cfg.apiUrl || '';
    var devicesJsonUrl = cfg.devicesJsonUrl || '';

    var loadingEl = document.getElementById('rgbj-sd-admin-loading');
    var deniedEl = document.getElementById('rgbj-sd-admin-denied');
    var appEl = document.getElementById('rgbj-sd-admin-app');
    var loginBtn = document.getElementById('rgbj-sd-admin-login');
    var logoutBtn = document.getElementById('rgbj-sd-admin-logout');
    var searchEl = document.getElementById('rgbj-sd-admin-search');
    var filterEl = document.getElementById('rgbj-sd-admin-filter');
    var countEl = document.getElementById('rgbj-sd-admin-count');
    var statusEl = document.getElementById('rgbj-sd-admin-status');
    var errEl = document.getElementById('rgbj-sd-admin-err');
    var listEl = document.getElementById('rgbj-sd-admin-list');

    var allDevices = [];
    var validationEntries = {};
    var busyPaths = {};
    var debTimer;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function showLoading(show) {
        if (loadingEl) loadingEl.classList.toggle('d-none', !show);
    }

    function showDenied(show) {
        if (deniedEl) deniedEl.classList.toggle('d-none', !show);
    }

    function showApp(show) {
        if (appEl) appEl.classList.toggle('d-none', !show);
    }

    function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg || '';
    }

    function setErr(msg) {
        if (!errEl) return;
        if (!msg) {
            errEl.classList.add('d-none');
            errEl.textContent = '';
            return;
        }
        errEl.textContent = msg;
        errEl.classList.remove('d-none');
    }

    function validationStatus(relativePath) {
        var row = validationEntries[relativePath];
        if (!row) return null;
        var s = row.status ? String(row.status).toLowerCase() : 'validated';
        return s === 'experimental' ? 'experimental' : 'validated';
    }

    function isMarked(relativePath) {
        return validationStatus(relativePath) !== null;
    }

    function countByStatus(status) {
        var n = 0;
        var keys = Object.keys(validationEntries);
        for (var i = 0; i < keys.length; i++) {
            if (validationStatus(keys[i]) === status) n++;
        }
        return n;
    }

    async function getIdToken() {
        var user = auth.currentUser;
        if (!user) throw new Error('Not signed in.');
        return user.getIdToken();
    }

    async function apiPost(payload) {
        var token = await getIdToken();
        var res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        var data = await res.json().catch(function () {
            return {};
        });
        if (!res.ok) {
            throw new Error(data.error || 'Save failed (HTTP ' + res.status + ').');
        }
        return data;
    }

    function deviceMatchesSearch(device, q) {
        if (!q) return true;
        var blob = [
            device.displayName,
            device.brand,
            device.relativePath,
            device.vendorIdHex,
            (device.productIdsHex || []).join(' '),
        ]
            .join(' ')
            .toLowerCase();
        var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
        for (var i = 0; i < toks.length; i++) {
            if (blob.indexOf(toks[i]) === -1) return false;
        }
        return true;
    }

    function filteredDevices() {
        var q = searchEl ? searchEl.value.trim() : '';
        var filter = filterEl ? filterEl.value : 'all';
        var out = [];
        for (var i = 0; i < allDevices.length; i++) {
            var d = allDevices[i];
            var path = d.relativePath;
            if (!path) continue;
            var status = validationStatus(path);
            if (filter === 'validated' && status !== 'validated') continue;
            if (filter === 'experimental' && status !== 'experimental') continue;
            if (filter === 'unmarked' && status !== null) continue;
            if (!deviceMatchesSearch(d, q)) continue;
            out.push(d);
        }
        return out;
    }

    function statusBadgeHtml(status) {
        if (status === 'validated') {
            return '<span class="sd-validated-badge sd-validated-badge--inline"><i class="bi bi-patch-check-fill" aria-hidden="true"></i> Validated</span>';
        }
        if (status === 'experimental') {
            return '<span class="sd-experimental-badge sd-experimental-badge--inline"><i class="bi bi-flask" aria-hidden="true"></i> Experimental</span>';
        }
        return '';
    }

    function renderList() {
        if (!listEl) return;
        var rows = filteredDevices();
        var validatedTotal = countByStatus('validated');
        var experimentalTotal = countByStatus('experimental');
        if (countEl) {
            countEl.textContent =
                rows.length +
                ' shown · ' +
                validatedTotal +
                ' validated · ' +
                experimentalTotal +
                ' experimental · ' +
                allDevices.length +
                ' total';
        }

        if (!rows.length) {
            listEl.innerHTML =
                '<p class="text-body-secondary mb-0">No devices match the current filters.</p>';
            return;
        }

        var html = [];
        for (var i = 0; i < rows.length; i++) {
            var d = rows[i];
            var path = d.relativePath;
            var status = validationStatus(path);
            var val = validationEntries[path] || null;
            var notes = val && val.notes ? String(val.notes) : '';
            var busy = !!busyPaths[path];
            var rowClass = 'sd-admin-row';
            if (status === 'validated') rowClass += ' sd-admin-row--validated';
            else if (status === 'experimental') rowClass += ' sd-admin-row--experimental';
            if (busy) rowClass += ' sd-admin-row--busy';
            html.push(
                '<article class="' +
                    rowClass +
                    '" data-path="' +
                    esc(path) +
                    '">' +
                    '<div class="sd-admin-row__head">' +
                    '<span class="sd-admin-row__name">' +
                    esc(d.displayName || path) +
                    '</span>' +
                    statusBadgeHtml(status) +
                    '<select class="form-select form-select-sm sd-admin-status"' +
                    (busy ? ' disabled' : '') +
                    ' aria-label="Validation status for ' +
                    esc(d.displayName || path) +
                    '">' +
                    '<option value=""' +
                    (status === null ? ' selected' : '') +
                    '>Not marked</option>' +
                    '<option value="validated"' +
                    (status === 'validated' ? ' selected' : '') +
                    '>Validated</option>' +
                    '<option value="experimental"' +
                    (status === 'experimental' ? ' selected' : '') +
                    '>Experimental</option>' +
                    '</select>' +
                    '</div>' +
                    '<div class="sd-admin-row__meta text-body-secondary small">' +
                    esc(d.brand || '—') +
                    ' · ' +
                    esc(d.deviceKind || 'other') +
                    (d.vendorIdHex ? ' · ' + esc(d.vendorIdHex) : '') +
                    '</div>' +
                    '<input type="text" class="form-control form-control-sm sd-admin-notes" placeholder="Optional test notes (e.g. RGBJunkie 0.3.75 on Win 11)" value="' +
                    esc(notes) +
                    '" maxlength="500"' +
                    (status ? '' : ' disabled') +
                    ' aria-label="Validation notes for ' +
                    esc(d.displayName || path) +
                    '">' +
                    '</article>'
            );
        }
        listEl.innerHTML = html.join('');
    }

    function statusSaveMessage(relativePath, status) {
        if (status === 'validated') return 'Saved ' + relativePath + ' as validated.';
        if (status === 'experimental') return 'Saved ' + relativePath + ' as experimental.';
        return 'Saved ' + relativePath + ' (mark removed).';
    }

    async function saveValidation(relativePath, status, notes) {
        busyPaths[relativePath] = true;
        renderList();
        setErr('');
        try {
            var result = await apiPost({
                relativePath: relativePath,
                status: status || '',
                notes: notes || '',
            });
            validationEntries =
                (result.store && result.store.entries) || validationEntries;
            setStatus(statusSaveMessage(relativePath, result.status || status || null));
        } catch (err) {
            setErr(err.message || String(err));
        } finally {
            delete busyPaths[relativePath];
            renderList();
        }
    }

    function onListChange(ev) {
        var row = ev.target.closest('[data-path]');
        if (!row) return;
        var path = row.getAttribute('data-path');
        if (!path) return;
        var notesEl = row.querySelector('.sd-admin-notes');

        if (ev.target.classList.contains('sd-admin-status')) {
            var status = ev.target.value || '';
            void saveValidation(path, status, notesEl ? notesEl.value : '');
            return;
        }

        if (ev.target.classList.contains('sd-admin-notes')) {
            if (!isMarked(path)) return;
            void saveValidation(path, validationStatus(path), ev.target.value);
        }
    }

    function scheduleRender() {
        clearTimeout(debTimer);
        debTimer = setTimeout(renderList, 120);
    }

    async function loadData() {
        setErr('');
        setStatus('Loading device catalog…');
        var deviceRes = await fetch(devicesJsonUrl);
        if (!deviceRes.ok) throw new Error('Device catalog HTTP ' + deviceRes.status);
        var deviceData = await deviceRes.json();
        allDevices = deviceData.entries || [];

        var valRes = await fetch(apiUrl);
        if (!valRes.ok) throw new Error('Validation registry HTTP ' + valRes.status);
        var valData = await valRes.json();
        validationEntries = valData.entries || {};

        setStatus('Ready — pick Validated or Experimental for each device you have tested.');
        renderList();
    }

    if (listEl) {
        listEl.addEventListener('change', onListChange);
        listEl.addEventListener('blur', onListChange, true);
    }
    if (searchEl) searchEl.addEventListener('input', scheduleRender);
    if (filterEl) filterEl.addEventListener('change', renderList);

    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            void signInWithPopup(auth, new GoogleAuthProvider()).catch(function (err) {
                setErr(err.message || String(err));
            });
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            void signOut(auth);
        });
    }

    onAuthStateChanged(auth, function (user) {
        showLoading(false);
        if (user && user.uid === adminUid) {
            showDenied(false);
            showApp(true);
            loadData().catch(function (err) {
                setErr(err.message || String(err));
                setStatus('');
            });
            return;
        }
        showApp(false);
        showDenied(true);
    });
})();
