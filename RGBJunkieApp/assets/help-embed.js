(function () {
    'use strict';

    if (!/\bembed=1\b/.test(window.location.search)) {
        return;
    }

    document.documentElement.classList.add('rgbj-help-embed-root');

    function notifyParentNav() {
        if (window.parent === window) {
            return;
        }

        try {
            window.parent.postMessage(
                {
                    type: 'rgbj-help-embed-nav',
                    url: window.location.href,
                },
                '*'
            );
        } catch (err) {
            /* ignore */
        }
    }

    notifyParentNav();
    window.addEventListener('pageshow', notifyParentNav);

    document.addEventListener('click', function (event) {
        var target = event.target;
        if (!target || !target.closest) {
            return;
        }

        var link = target.closest('a[href]');
        if (!link || link.target === '_blank' || link.hasAttribute('download')) {
            return;
        }

        var href = link.getAttribute('href') || '';
        if (href === '' || href.charAt(0) === '#') {
            return;
        }

        var url;
        try {
            url = new URL(href, window.location.href);
        } catch (err) {
            return;
        }

        if (url.origin !== window.location.origin) {
            return;
        }

        if (url.pathname.indexOf('/help') === -1) {
            return;
        }

        if (url.searchParams.get('embed') === '1') {
            return;
        }

        url.searchParams.set('embed', '1');
        event.preventDefault();
        var nextHref = url.pathname + url.search + url.hash;
        try {
            window.parent.postMessage(
                {
                    type: 'rgbj-help-embed-nav',
                    url: url.href,
                },
                '*'
            );
        } catch (err) {
            /* ignore */
        }
        window.location.href = nextHref;
    });
})();
