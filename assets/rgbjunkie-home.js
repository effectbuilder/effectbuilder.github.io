(function () {
    const STORAGE_KEY = 'rgbj-hub-effect-builder-hint-dismissed';
    const hints = Array.from(document.querySelectorAll('[data-hub-builder-hint]'));
    const tile = document.getElementById('hub-effect-builder-tile');
    const card = tile?.querySelector('.rgbj-hub-card--effect-builder');

    if (hints.length === 0 || !tile || !card) {
        return;
    }

    function dismissHint() {
        hints.forEach((hint) => {
            hint.hidden = true;
            hint.classList.remove('is-visible');
        });
        document.body.classList.remove('rgbj-hub-hint-active');
        tile.classList.remove('rgbj-hub-tile-wrap--highlight');
        card.classList.remove('rgbj-hub-card--spotlight');
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            /* ignore */
        }
    }

    function showHint() {
        hints.forEach((hint) => {
            hint.hidden = false;
            hint.classList.add('is-visible');
        });
        document.body.classList.add('rgbj-hub-hint-active');
        tile.classList.add('rgbj-hub-tile-wrap--highlight');
        card.classList.add('rgbj-hub-card--spotlight');
    }

    let dismissed = false;
    try {
        dismissed = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        dismissed = false;
    }

    if (!dismissed) {
        showHint();
    }

    hints.forEach((hint) => {
        hint.querySelectorAll('[data-hub-hint-dismiss]').forEach((el) => {
            el.addEventListener('click', dismissHint);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.body.classList.contains('rgbj-hub-hint-active')) {
            dismissHint();
        }
    });
})();
