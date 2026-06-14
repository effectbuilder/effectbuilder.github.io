import { auth, onAuthStateChanged } from '../../js/firebase.js';

(function () {
    'use strict';

    var cfg = window.RGBJ_SUPPORTED_PAGE || {};
    var adminUid = cfg.adminUid || '';
    var adminUrl = cfg.adminUrl || '';
    var wrap = document.getElementById('sd-admin-link-wrap');
    if (!wrap || !adminUid || !adminUrl) return;

    onAuthStateChanged(auth, function (user) {
        wrap.classList.toggle('d-none', !(user && user.uid === adminUid));
    });
})();
