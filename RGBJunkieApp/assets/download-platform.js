/**
 * Show one platform's downloads by default; link to reveal the other.
 */
(function () {
    var root = document.getElementById('rgbj-download-root');
    if (!root) {
        return;
    }

    var panels = root.querySelectorAll('.rgbj-download-panel');
    var toggle = document.getElementById('rgbj-download-other-toggle');
    var hasWindows = root.dataset.hasWindows === '1';
    var hasLinux = root.dataset.hasLinux === '1';

    if (!toggle || panels.length < 2) {
        return;
    }

    function detectPlatform() {
        var ua = navigator.userAgent || '';
        var platform = '';

        if (navigator.userAgentData && navigator.userAgentData.platform) {
            platform = navigator.userAgentData.platform;
        } else if (navigator.platform) {
            platform = navigator.platform;
        }

        if (/Win/i.test(platform) || /Windows/i.test(ua)) {
            return 'windows';
        }
        if (/Linux/i.test(platform) || (/Linux/i.test(ua) && !/Android/i.test(ua))) {
            return 'linux';
        }
        return 'all';
    }

    function otherPlatform(current) {
        return current === 'windows' ? 'linux' : 'windows';
    }

    function platformLabel(id) {
        return id === 'windows' ? 'Windows' : 'Linux';
    }

    function setVisible(platform, showAll) {
        panels.forEach(function (panel) {
            var match = showAll || platform === 'all' || panel.getAttribute('data-rgbj-platform') === platform;
            panel.classList.toggle('rgbj-download-panel--hidden', !match);
            panel.setAttribute('aria-hidden', match ? 'false' : 'true');
        });

        document.querySelectorAll('[data-rgbj-download-tip]').forEach(function (el) {
            var tipPlatform = el.getAttribute('data-rgbj-download-tip');
            var show = showAll || platform === 'all' || tipPlatform === platform;
            el.classList.toggle('d-none', !show);
        });

        root.querySelectorAll('.rgbj-download-version-note').forEach(function (el) {
            el.classList.toggle('d-none', platform === 'windows' && !showAll);
        });
    }

    var detected = detectPlatform();
    if (detected === 'all' || (detected === 'windows' && !hasWindows) || (detected === 'linux' && !hasLinux)) {
        detected = hasWindows ? 'windows' : 'linux';
    }

    var showingAll = detected === 'all';
    if (detected === 'all') {
        showingAll = true;
        detected = 'windows';
    }

    toggle.classList.remove('d-none');

    function updateToggle(focused) {
        var other = otherPlatform(focused);
        if (showingAll) {
            toggle.textContent = 'Show ' + platformLabel(focused) + ' download only';
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            toggle.textContent = 'Also available for ' + platformLabel(other);
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    function apply() {
        if (showingAll) {
            setVisible('all', true);
        } else {
            setVisible(detected, false);
        }
        updateToggle(detected);
    }

    apply();

    toggle.addEventListener('click', function () {
        showingAll = !showingAll;
        apply();
    });
})();
