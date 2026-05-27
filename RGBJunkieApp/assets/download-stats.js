/**
 * Admin download stats — loads /js/firebase.js dynamically (same project as main site).
 */
(function () {
    const cfg = window.RGBJ_DOWNLOAD_STATS;
    const firebaseModuleUrl = window.RGBJ_FIREBASE_MODULE || '/js/firebase.js';

    const COLLECTION = (cfg && cfg.collection) || 'rgbjunkie-app-downloads';
    const DAYS = (cfg && cfg.days) || 30;

    let auth = null;
    let db = null;
    let GoogleAuthProvider = null;
    let signInWithPopup = null;
    let signInWithRedirect = null;
    let getRedirectResult = null;
    let signOutFn = null;
    let onAuthStateChanged = null;
    let collection = null;
    let getDocs = null;
    let query = null;
    let orderBy = null;
    let limit = null;

    /** @type {ReturnType<typeof aggregate>|null} */
    let statsSummary = null;
    const tableSortState = {};

    function el(id) {
        return document.getElementById(id);
    }

    function showStatus(message, isError) {
        const node = el('rgbj-stats-status');
        if (!node) {
            return;
        }
        node.textContent = message;
        node.className = 'alert small ' + (isError ? 'alert-danger' : 'alert-info');
        node.hidden = false;
    }

    function formatAuthError(err) {
        if (!err) {
            return 'Sign-in failed';
        }
        const code = err.code || '';
        const map = {
            'auth/popup-blocked': 'Popup was blocked. Allow popups or wait for redirect sign-in.',
            'auth/popup-closed-by-user': 'Sign-in cancelled.',
            'auth/cancelled-popup-request': 'Sign-in cancelled.',
            'auth/unauthorized-domain':
                'This URL is not in Firebase authorized domains (add localhost in Authentication → Settings).',
            'auth/operation-not-allowed': 'Google sign-in is disabled in Firebase Authentication.',
            'auth/network-request-failed': 'Network error. Check your connection.',
        };
        if (code && map[code]) {
            return map[code] + (err.message ? ' (' + err.message + ')' : '');
        }
        return err.message || String(err);
    }

    function hideLoading() {
        const loading = el('rgbj-stats-loading');
        if (loading) {
            loading.hidden = true;
        }
        const content = el('rgbj-stats-content');
        if (content) {
            content.hidden = false;
        }
    }

    function formatTs(ts) {
        if (!ts) {
            return '';
        }
        const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
        if (Number.isNaN(d.getTime())) {
            return String(ts);
        }
        return d.toISOString().slice(0, 19).replace('T', ' ');
    }

    function dayKey(ts) {
        const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
        return d.toISOString().slice(0, 10);
    }

    function formatLocation(row) {
        const parts = [];
        if (row.city) {
            parts.push(row.city);
        }
        if (row.region) {
            parts.push(row.region);
        }
        if (row.country) {
            parts.push(row.country);
        }
        if (parts.length > 0) {
            return parts.join(', ');
        }
        if (row.isp) {
            return row.isp;
        }
        return '—';
    }

    function platformLabel(userAgent, platform) {
        const ua = String(userAgent || '');
        if (ua.indexOf('RGBJunkieDesktop/') === 0) {
            return 'desktop app';
        }
        if (platform && platform !== 'other') {
            return platform;
        }
        if (/Windows/i.test(ua)) {
            return 'Windows';
        }
        if (/Linux/i.test(ua)) {
            return 'Linux';
        }
        if (/Mac OS|Macintosh/i.test(ua)) {
            return 'macOS';
        }
        return platform || '—';
    }

    function locationSortKey(row) {
        return [row.city, row.region, row.country, row.isp].filter(Boolean).join(', ');
    }

    function parseVersionParts(version) {
        const raw = String(version == null ? '' : version)
            .trim()
            .replace(/^v/i, '');
        if (raw === '') {
            return [];
        }
        return raw.split('.').map(function (part) {
            const n = parseInt(part, 10);
            return Number.isFinite(n) ? n : 0;
        });
    }

    function compareVersions(a, b, dir) {
        const partsA = parseVersionParts(a);
        const partsB = parseVersionParts(b);
        if (partsA.length === 0 && partsB.length === 0) {
            return 0;
        }
        if (partsA.length === 0) {
            return dir === 'asc' ? -1 : 1;
        }
        if (partsB.length === 0) {
            return dir === 'asc' ? 1 : -1;
        }
        const len = Math.max(partsA.length, partsB.length);
        for (let i = 0; i < len; i += 1) {
            const diff = (partsA[i] || 0) - (partsB[i] || 0);
            if (diff !== 0) {
                return dir === 'asc' ? diff : -diff;
            }
        }
        return 0;
    }

    function compareSortValues(a, b, type, dir) {
        const mul = dir === 'asc' ? 1 : -1;
        if (type === 'number') {
            return ((Number(a) || 0) - (Number(b) || 0)) * mul;
        }
        if (type === 'version') {
            const cmp = compareVersions(a, b, dir);
            return cmp !== 0 ? cmp : String(a || '').localeCompare(String(b || '')) * mul;
        }
        return String(a == null ? '' : a).localeCompare(String(b == null ? '' : b), undefined, {
            sensitivity: 'base',
            numeric: true,
        }) * mul;
    }

    function sortRows(rows, sortKey, sortType, dir) {
        const sorted = rows.slice();
        sorted.sort(function (rowA, rowB) {
            const cmp = compareSortValues(rowA[sortKey], rowB[sortKey], sortType, dir);
            if (cmp !== 0) {
                return cmp;
            }
            return String(rowA.file_name || rowA.country || rowA.day || '').localeCompare(
                String(rowB.file_name || rowB.country || rowB.day || '')
            );
        });
        return sorted;
    }

    function getTableSort(tableId) {
        if (!tableSortState[tableId]) {
            const table = document.querySelector('.rgbj-stats-sortable[data-stats-table="' + tableId + '"]');
            const defaultKey = table ? table.getAttribute('data-default-sort') || '' : '';
            const defaultDir = table && table.getAttribute('data-default-dir') === 'asc' ? 'asc' : 'desc';
            tableSortState[tableId] = { key: defaultKey, dir: defaultDir };
        }
        return tableSortState[tableId];
    }

    function setTableSort(tableId, sortKey, sortType) {
        const state = getTableSort(tableId);
        if (state.key === sortKey) {
            state.dir = state.dir === 'asc' ? 'desc' : 'asc';
        } else {
            state.key = sortKey;
            state.dir = sortType === 'string' ? 'asc' : 'desc';
        }
    }

    function updateSortHeaders(table) {
        const tableId = table.getAttribute('data-stats-table');
        if (!tableId) {
            return;
        }
        const state = getTableSort(tableId);
        table.querySelectorAll('th[data-sort]').forEach(function (th) {
            const key = th.getAttribute('data-sort');
            const isActive = key === state.key;
            th.classList.toggle('rgbj-sort-active', isActive);
            th.classList.toggle('rgbj-sort-asc', isActive && state.dir === 'asc');
            th.classList.toggle('rgbj-sort-desc', isActive && state.dir === 'desc');
            th.setAttribute('aria-sort', isActive ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none');
        });
    }

    function bindSortableTables() {
        document.querySelectorAll('.rgbj-stats-sortable').forEach(function (table) {
            if (table.getAttribute('data-sort-bound') === '1') {
                updateSortHeaders(table);
                return;
            }
            table.setAttribute('data-sort-bound', '1');
            const tableId = table.getAttribute('data-stats-table');
            table.querySelectorAll('th[data-sort]').forEach(function (th) {
                th.addEventListener('click', function () {
                    const sortKey = th.getAttribute('data-sort');
                    const sortType = th.getAttribute('data-sort-type') || 'string';
                    if (!tableId || !sortKey) {
                        return;
                    }
                    setTableSort(tableId, sortKey, sortType);
                    updateSortHeaders(table);
                    renderTables();
                });
            });
            updateSortHeaders(table);
        });
    }

    function aggregate(docs) {
        const now = Date.now();
        const sevenAgo = now - 7 * 86400000;
        const daysAgo = now - DAYS * 86400000;

        let allTime = 0;
        let last7 = 0;
        let last30 = 0;
        const byFile = new Map();
        const byDay = new Map();
        const byDayAll = new Map();
        const byCountry = new Map();
        const byChannel = new Map();
        const byPlatform = new Map();
        const recent = [];

        docs.forEach(function (docSnap) {
            const d = docSnap.data();
            const createdAt = d.createdAt;
            const t =
                createdAt && typeof createdAt.toDate === 'function'
                    ? createdAt.toDate().getTime()
                    : createdAt
                      ? new Date(createdAt).getTime()
                      : 0;

            allTime += 1;
            const day = dayKey(createdAt);
            if (day) {
                byDayAll.set(day, (byDayAll.get(day) || 0) + 1);
            }
            if (t >= sevenAgo) {
                last7 += 1;
            }
            if (t >= daysAgo) {
                last30 += 1;
                const filePath = d.filePath || '';
                const fileName = d.fileName || filePath.split('/').pop() || '';
                const key = filePath || fileName;
                const channel = d.channel === 'app-update' ? 'app-update' : 'website';
                const fileKey = key + '|' + channel;
                const prev = byFile.get(fileKey) || {
                    file_name: fileName,
                    file_path: filePath,
                    version: d.version ?? null,
                    kind: d.kind || 'other',
                    platform: d.platform || 'other',
                    channel: channel,
                    downloads: 0,
                };
                prev.downloads += 1;
                byFile.set(fileKey, prev);

                if (day) {
                    byDay.set(day, (byDay.get(day) || 0) + 1);
                }

                const country = String(d.country || '').trim() || 'Unknown';
                byCountry.set(country, (byCountry.get(country) || 0) + 1);
                byChannel.set(channel, (byChannel.get(channel) || 0) + 1);
                const platform = d.platform || 'other';
                byPlatform.set(platform, (byPlatform.get(platform) || 0) + 1);
            }

            if (recent.length < 500) {
                const recentRow = {
                    created_at: formatTs(createdAt),
                    created_at_ts: t,
                    file_name: d.fileName || '',
                    version: d.version ?? null,
                    channel: d.channel === 'app-update' ? 'app-update' : 'website',
                    platform: d.platform || 'other',
                    ip: d.ip || '',
                    country: d.country || '',
                    region: d.region || '',
                    city: d.city || '',
                    isp: d.isp || '',
                    user_agent: d.userAgent || '',
                    accept_language: d.acceptLanguage || '',
                };
                recentRow.location = locationSortKey(recentRow);
                recent.push(recentRow);
            }
        });

        const byFileList = Array.from(byFile.values());
        const byDayList = Array.from(byDay.entries()).map(function (entry) {
            return { day: entry[0], downloads: entry[1] };
        });
        const byDayAllList = Array.from(byDayAll.entries()).map(function (entry) {
            return { day: entry[0], downloads: entry[1] };
        });
        const byCountryList = Array.from(byCountry.entries()).map(function (entry) {
            return { country: entry[0], downloads: entry[1] };
        });
        const byChannelList = Array.from(byChannel.entries()).map(function (entry) {
            return { channel: entry[0], downloads: entry[1] };
        });
        const byPlatformList = Array.from(byPlatform.entries()).map(function (entry) {
            return { platform: entry[0], downloads: entry[1] };
        });

        return {
            totals: { all_time: allTime, last_7_days: last7, last_30_days: last30 },
            by_file: byFileList,
            by_day: byDayList,
            by_day_all: byDayAllList,
            by_country: byCountryList,
            by_channel: byChannelList,
            by_platform: byPlatformList,
            recent: recent,
        };
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderFileTable() {
        const fileBody = el('rgbj-stats-by-file');
        if (!fileBody || !statsSummary) {
            return;
        }
        const sort = getTableSort('file');
        const th = document.querySelector(
            '.rgbj-stats-sortable[data-stats-table="file"] th[data-sort="' + sort.key + '"]'
        );
        const sortType = th ? th.getAttribute('data-sort-type') || 'string' : 'string';
        const rows = sortRows(statsSummary.by_file, sort.key, sortType, sort.dir).slice(0, 25);

        fileBody.innerHTML = '';
        if (rows.length === 0) {
            fileBody.innerHTML =
                '<tr><td colspan="5" class="text-body-secondary">No downloads logged yet.</td></tr>';
            return;
        }
        rows.forEach(function (row) {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td class="font-monospace small">' +
                escapeHtml(row.file_name) +
                '</td><td>' +
                escapeHtml(row.kind) +
                '</td><td>' +
                escapeHtml(row.channel || 'website') +
                '</td><td>' +
                (row.version ? 'v' + escapeHtml(String(row.version)) : '—') +
                '</td><td class="text-end">' +
                row.downloads.toLocaleString() +
                '</td>';
            fileBody.appendChild(tr);
        });
    }

    function renderCountryTable() {
        const countryBody = el('rgbj-stats-by-country');
        if (!countryBody || !statsSummary) {
            return;
        }
        const sort = getTableSort('country');
        const th = document.querySelector(
            '.rgbj-stats-sortable[data-stats-table="country"] th[data-sort="' + sort.key + '"]'
        );
        const sortType = th ? th.getAttribute('data-sort-type') || 'string' : 'string';
        const rows = sortRows(statsSummary.by_country, sort.key, sortType, sort.dir).slice(0, 15);

        countryBody.innerHTML = '';
        if (rows.length === 0) {
            countryBody.innerHTML =
                '<tr><td colspan="2" class="text-body-secondary">No country data yet (needs server-side logging).</td></tr>';
            return;
        }
        rows.forEach(function (row) {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' +
                escapeHtml(row.country) +
                '</td><td class="text-end">' +
                row.downloads.toLocaleString() +
                '</td>';
            countryBody.appendChild(tr);
        });
    }

    function renderDayTable() {
        const dayBody = el('rgbj-stats-by-day');
        if (!dayBody || !statsSummary) {
            return;
        }
        const sort = getTableSort('day');
        const th = document.querySelector(
            '.rgbj-stats-sortable[data-stats-table="day"] th[data-sort="' + sort.key + '"]'
        );
        const sortType = th ? th.getAttribute('data-sort-type') || 'string' : 'string';
        const rows = sortRows(statsSummary.by_day, sort.key, sortType, sort.dir);

        dayBody.innerHTML = '';
        if (rows.length === 0) {
            dayBody.innerHTML = '<tr><td colspan="2" class="text-body-secondary">No data yet.</td></tr>';
            return;
        }
        rows.forEach(function (row) {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' +
                escapeHtml(row.day) +
                '</td><td class="text-end">' +
                row.downloads.toLocaleString() +
                '</td>';
            dayBody.appendChild(tr);
        });
    }

    function renderRecentTable() {
        const recentBody = el('rgbj-stats-recent');
        if (!recentBody || !statsSummary) {
            return;
        }
        const sort = getTableSort('recent');
        const th = document.querySelector(
            '.rgbj-stats-sortable[data-stats-table="recent"] th[data-sort="' + sort.key + '"]'
        );
        const sortType = th ? th.getAttribute('data-sort-type') || 'string' : 'string';
        const rows = sortRows(statsSummary.recent, sort.key, sortType, sort.dir).slice(0, 50);

        recentBody.innerHTML = '';
        if (rows.length === 0) {
            recentBody.innerHTML =
                '<tr><td colspan="4" class="text-body-secondary">No downloads yet.</td></tr>';
            return;
        }
        rows.forEach(function (row) {
            const tr = document.createElement('tr');
            const fileLine =
                escapeHtml(row.file_name) +
                (row.version
                    ? ' <span class="text-body-secondary">v' + escapeHtml(String(row.version)) + '</span>'
                    : '') +
                '<br><span class="text-body-secondary">' +
                escapeHtml(row.channel || 'website') +
                ' · ' +
                escapeHtml(platformLabel(row.user_agent, row.platform)) +
                '</span>';
            const ipCell = row.ip
                ? '<span class="font-monospace">' + escapeHtml(row.ip) + '</span>'
                : '<span class="text-body-secondary">—</span>';
            let locLine = formatLocation(row);
            if (row.isp && locLine !== '—' && locLine.indexOf(row.isp) === -1) {
                locLine += '<br><span class="text-body-secondary small">' + escapeHtml(row.isp) + '</span>';
            }
            tr.innerHTML =
                '<td class="text-nowrap small text-body-secondary">' +
                escapeHtml(row.created_at) +
                '</td><td class="small">' +
                fileLine +
                '</td><td class="small">' +
                ipCell +
                '</td><td class="small">' +
                locLine +
                '</td>';
            recentBody.appendChild(tr);
        });
    }

    function renderTables() {
        renderFileTable();
        renderCountryTable();
        renderDayTable();
        renderRecentTable();
    }

    function render(summary) {
        statsSummary = summary;
        el('rgbj-stat-all-time').textContent = summary.totals.all_time.toLocaleString();
        el('rgbj-stat-7d').textContent = summary.totals.last_7_days.toLocaleString();
        el('rgbj-stat-30d').textContent = summary.totals.last_30_days.toLocaleString();

        bindSortableTables();
        renderTables();
        if (typeof window.rgbjStatsRenderCharts === 'function') {
            window.rgbjStatsRenderCharts(summary);
        }
    }

    async function loadStats(user) {
        if (!cfg || user.uid !== cfg.adminUid) {
            showStatus('This Google account is not authorized to view download stats.', true);
            return;
        }

        showStatus('Loading from Firestore…', false);

        const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(10000));
        const snap = await getDocs(q);
        const summary = aggregate(snap.docs);
        hideLoading();
        render(summary);
        showStatus(
            'Signed in as ' +
                (user.displayName || user.email || user.uid) +
                ' · ' +
                snap.size.toLocaleString() +
                ' events loaded',
            false
        );
    }

    function setSignedOutUi() {
        const signInPanel = el('rgbj-stats-signin-panel');
        if (signInPanel) {
            signInPanel.hidden = false;
        }
        const signOutBtn = el('rgbj-stats-signout');
        if (signOutBtn) {
            signOutBtn.classList.add('d-none');
        }
        const loading = el('rgbj-stats-loading');
        if (loading) {
            loading.hidden = false;
            loading.textContent = 'Sign in to load stats.';
        }
        const content = el('rgbj-stats-content');
        if (content) {
            content.hidden = true;
        }
        if (typeof window.rgbjStatsDestroyCharts === 'function') {
            window.rgbjStatsDestroyCharts();
        }
    }

    function setSignedInUi() {
        const signInPanel = el('rgbj-stats-signin-panel');
        if (signInPanel) {
            signInPanel.hidden = true;
        }
        const signOutBtn = el('rgbj-stats-signout');
        if (signOutBtn) {
            signOutBtn.classList.remove('d-none');
        }
    }

    async function signInWithGoogle() {
        const btn = el('rgbj-stats-signin');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        if (btn) {
            btn.disabled = true;
        }
        showStatus('Opening Google sign-in…', false);

        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            const code = err && err.code ? err.code : '';
            if (
                code === 'auth/popup-blocked' ||
                code === 'auth/popup-closed-by-user' ||
                code === 'auth/cancelled-popup-request'
            ) {
                showStatus('Redirecting to Google sign-in…', false);
                await signInWithRedirect(auth, provider);
                return;
            }
            showStatus(formatAuthError(err), true);
        } finally {
            if (btn) {
                btn.disabled = false;
            }
        }
    }

    function bindSignIn() {
        const btn = el('rgbj-stats-signin');
        if (!btn) {
            showStatus('Sign-in button not found on page.', true);
            return;
        }
        btn.addEventListener('click', function () {
            signInWithGoogle().catch(function (err) {
                showStatus(formatAuthError(err), true);
            });
        });

        const signOutBtn = el('rgbj-stats-signout');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', function () {
                signOutFn(auth).catch(function (err) {
                    showStatus(formatAuthError(err), true);
                });
            });
        }
    }

    async function loadFirebase() {
        const mod = await import(firebaseModuleUrl);
        auth = mod.auth;
        db = mod.db;
        GoogleAuthProvider = mod.GoogleAuthProvider;
        signInWithPopup = mod.signInWithPopup;
        signInWithRedirect = mod.signInWithRedirect;
        getRedirectResult = mod.getRedirectResult;
        signOutFn = mod.signOut;
        onAuthStateChanged = mod.onAuthStateChanged;
        collection = mod.collection;
        getDocs = mod.getDocs;
        query = mod.query;
        orderBy = mod.orderBy;
        limit = mod.limit;
    }

    async function init() {
        if (!cfg || !cfg.adminUid) {
            showStatus('Stats config missing (admin_uid in download-stats-secret.php).', true);
            return;
        }

        showStatus('Loading Firebase…', false);

        try {
            await loadFirebase();
        } catch (err) {
            console.error(err);
            showStatus(
                'Could not load ' +
                    firebaseModuleUrl +
                    '. Open that URL in your browser — it should be JavaScript, not 404.',
                true
            );
            return;
        }

        bindSignIn();
        showStatus('Sign in with Google (admin account) to view download stats.', false);

        try {
            await getRedirectResult(auth);
        } catch (err) {
            showStatus(formatAuthError(err), true);
        }

        onAuthStateChanged(auth, function (user) {
            if (!user) {
                setSignedOutUi();
                showStatus('Sign in with Google (admin account) to view download stats.', false);
                return;
            }

            setSignedInUi();
            loadStats(user).catch(function (err) {
                console.error(err);
                let msg = (err && err.message) || 'Could not load stats.';
                if (err && err.code === 'permission-denied') {
                    msg =
                        'Firestore denied read access for rgbjunkie-app-downloads. ' +
                        'In Firebase Console → Firestore → Rules, add the match block from firestore.rules.example ' +
                        '(admin UID ' +
                        (cfg.adminUid || '') +
                        '). Signed in as ' +
                        user.uid +
                        '.';
                } else if (err && err.code === 'failed-precondition') {
                    msg =
                        'Firestore index required. Run: firebase deploy --only firestore:indexes (from repo root).';
                }
                showStatus(msg, true);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init().catch(function (err) {
                console.error(err);
                showStatus('Failed to initialize: ' + (err.message || err), true);
            });
        });
    } else {
        init().catch(function (err) {
            console.error(err);
            showStatus('Failed to initialize: ' + (err.message || err), true);
        });
    }
})();
