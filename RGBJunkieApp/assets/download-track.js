/**
 * Log RGBJunkie App downloads to Firestore (requires /js/firebase.js loaded first).
 */
(function () {
    const COLLECTION = 'rgbjunkie-app-downloads';
    const DEFAULT_COOLDOWN_MS = 45000;

    function whenFirebaseReady(callback, attempts) {
        if (window.db && window.addDoc && window.collection && window.serverTimestamp) {
            callback();
            return;
        }
        if ((attempts || 0) >= 200) {
            console.warn('RGBJ download tracking: firebase.js not ready');
            return;
        }
        setTimeout(function () {
            whenFirebaseReady(callback, (attempts || 0) + 1);
        }, 25);
    }

    function cooldownMs() {
        const root = document.getElementById('rgbj-download-root');
        const sec = root ? parseInt(root.getAttribute('data-rgbj-cooldown') || '', 10) : NaN;
        return Number.isFinite(sec) && sec >= 0 ? sec * 1000 : DEFAULT_COOLDOWN_MS;
    }

    function storageKey(filePath) {
        return 'rgbj_dl_' + filePath;
    }

    function withinCooldown(filePath) {
        if (cooldownMs() === 0) {
            return false;
        }
        const last = parseInt(sessionStorage.getItem(storageKey(filePath)) || '0', 10);
        return Date.now() - last < cooldownMs();
    }

    function markLogged(filePath) {
        if (cooldownMs() > 0) {
            sessionStorage.setItem(storageKey(filePath), String(Date.now()));
        }
    }

    function parseLink(anchor) {
        const filePath = anchor.getAttribute('data-rgbj-file-path') || '';
        if (!filePath) {
            return null;
        }
        const version = anchor.getAttribute('data-rgbj-version') || '';
        const channel = anchor.getAttribute('data-rgbj-channel') || 'website';
        return {
            filePath,
            fileName: anchor.getAttribute('data-rgbj-file-name') || filePath.split('/').pop() || '',
            version: version === '' ? null : version,
            kind: anchor.getAttribute('data-rgbj-kind') || 'other',
            platform: anchor.getAttribute('data-rgbj-platform') || 'other',
            channel: channel === 'app-update' ? 'app-update' : 'website',
        };
    }

    async function logDownload(meta) {
        if (!window.db || !window.addDoc || !window.collection || !window.serverTimestamp) {
            console.warn('RGBJ download tracking: firebase.js not loaded');
            return;
        }
        if (withinCooldown(meta.filePath)) {
            return;
        }

        await window.addDoc(window.collection(window.db, COLLECTION), {
            createdAt: window.serverTimestamp(),
            filePath: meta.filePath,
            fileName: meta.fileName,
            version: meta.version,
            kind: meta.kind,
            platform: meta.platform,
            channel: meta.channel || 'website',
            userAgent: (navigator.userAgent || '').slice(0, 512),
            referer: (document.referrer || '').slice(0, 512),
        });
        markLogged(meta.filePath);
    }

    whenFirebaseReady(function () {
        document.addEventListener(
            'click',
            function (event) {
                const anchor = event.target.closest('a.rgbj-tracked-download');
                if (!anchor || !anchor.href) {
                    return;
                }

                const meta = parseLink(anchor);
                if (!meta) {
                    return;
                }

                event.preventDefault();
                const href = anchor.href;

                logDownload(meta)
                    .catch(function (err) {
                        console.warn('RGBJ download tracking failed:', err);
                    })
                    .finally(function () {
                        var thanksBase = window.RGBJ_DOWNLOAD_THANKS_URL || '';
                        if (thanksBase && meta.filePath) {
                            var sep = thanksBase.indexOf('?') >= 0 ? '&' : '?';
                            window.location.href =
                                thanksBase + sep + 'f=' + encodeURIComponent(meta.filePath);
                            return;
                        }
                        window.location.href = href;
                    });
            },
            true
        );
    });
})();
