/**
 * Show Download stats nav link when signed in as the configured admin (Firebase Auth).
 */
(function () {
    const cfg = window.RGBJ_ADMIN_NAV;
    const adminUid = cfg && cfg.adminUid;

    function whenAuthReady(callback, attempts) {
        if (window.auth && window.onAuthStateChanged) {
            callback();
            return;
        }
        if ((attempts || 0) >= 200) {
            return;
        }
        setTimeout(function () {
            whenAuthReady(callback, (attempts || 0) + 1);
        }, 25);
    }

    function setStatsNavVisible(visible) {
        document.querySelectorAll('.rgbj-admin-stats-nav').forEach(function (el) {
            el.classList.toggle('d-none', !visible);
        });
        document.querySelectorAll('.rgbj-help-admin-only').forEach(function (el) {
            el.classList.toggle('d-none', !visible);
        });
    }

    if (!adminUid) {
        return;
    }

    whenAuthReady(function () {
        window.onAuthStateChanged(window.auth, function (user) {
            setStatsNavVisible(Boolean(user && user.uid === adminUid));
        });
    });
})();
