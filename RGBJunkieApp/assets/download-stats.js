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

    function aggregate(docs) {
        const now = Date.now();
        const sevenAgo = now - 7 * 86400000;
        const daysAgo = now - DAYS * 86400000;

        let allTime = 0;
        let last7 = 0;
        let last30 = 0;
        const byFile = new Map();
        const byDay = new Map();
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

                const day = dayKey(createdAt);
                if (day) {
                    byDay.set(day, (byDay.get(day) || 0) + 1);
                }
            }

            if (recent.length < 20) {
                recent.push({
                    created_at: formatTs(createdAt),
                    file_name: d.fileName || '',
                    version: d.version ?? null,
                    channel: d.channel === 'app-update' ? 'app-update' : 'website',
                });
            }
        });

        const byFileList = Array.from(byFile.values())
            .sort(function (a, b) {
                return b.downloads - a.downloads || String(b.file_path).localeCompare(String(a.file_path));
            })
            .slice(0, 25);

        const byDayList = Array.from(byDay.entries())
            .map(function (entry) {
                return { day: entry[0], downloads: entry[1] };
            })
            .sort(function (a, b) {
                return a.day < b.day ? 1 : -1;
            });

        return {
            totals: { all_time: allTime, last_7_days: last7, last_30_days: last30 },
            by_file: byFileList,
            by_day: byDayList,
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

    function render(summary) {
        el('rgbj-stat-all-time').textContent = summary.totals.all_time.toLocaleString();
        el('rgbj-stat-7d').textContent = summary.totals.last_7_days.toLocaleString();
        el('rgbj-stat-30d').textContent = summary.totals.last_30_days.toLocaleString();

        const fileBody = el('rgbj-stats-by-file');
        if (fileBody) {
            fileBody.innerHTML = '';
            if (summary.by_file.length === 0) {
                fileBody.innerHTML =
                    '<tr><td colspan="5" class="text-body-secondary">No downloads logged yet.</td></tr>';
            } else {
                summary.by_file.forEach(function (row) {
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
        }

        const dayBody = el('rgbj-stats-by-day');
        if (dayBody) {
            dayBody.innerHTML = '';
            if (summary.by_day.length === 0) {
                dayBody.innerHTML = '<tr><td colspan="2" class="text-body-secondary">No data yet.</td></tr>';
            } else {
                summary.by_day.forEach(function (row) {
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
        }

        const recentList = el('rgbj-stats-recent');
        if (recentList) {
            recentList.innerHTML = '';
            if (summary.recent.length === 0) {
                recentList.innerHTML =
                    '<li class="list-group-item bg-body-tertiary text-body-secondary small">No downloads yet.</li>';
            } else {
                summary.recent.forEach(function (row) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item bg-body-tertiary small';
                    li.innerHTML =
                        '<span class="text-body-secondary">' +
                        escapeHtml(row.created_at) +
                        '</span> · ' +
                        escapeHtml(row.file_name) +
                        (row.version
                            ? ' <span class="text-body-secondary">(v' + escapeHtml(String(row.version)) + ')</span>'
                            : '') +
                        ' <span class="badge text-bg-secondary">' +
                        escapeHtml(row.channel || 'website') +
                        '</span>';
                    recentList.appendChild(li);
                });
            }
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
