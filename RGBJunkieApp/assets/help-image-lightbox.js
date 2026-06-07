(function () {
    'use strict';

    var overlay = null;
    var imgEl = null;
    var closeBtn = null;

    function isZoomLink(link) {
        return link && link.classList && link.classList.contains('rgbj-help-image__zoom');
    }

    function isInHelpContent(link) {
        return !!link.closest('.rgbj-help-article__body, .rgbj-help-editor-preview__body');
    }

    function ensureOverlay() {
        if (overlay) {
            return;
        }

        overlay = document.createElement('div');
        overlay.className = 'rgbj-help-lightbox';
        overlay.hidden = true;
        overlay.innerHTML =
            '<button type="button" class="rgbj-help-lightbox__close" aria-label="Close full-size image">'
            + '<span aria-hidden="true">&times;</span></button>'
            + '<div class="rgbj-help-lightbox__stage">'
            + '<img class="rgbj-help-lightbox__img" src="" alt="">'
            + '</div>';

        document.body.appendChild(overlay);
        imgEl = overlay.querySelector('.rgbj-help-lightbox__img');
        closeBtn = overlay.querySelector('.rgbj-help-lightbox__close');

        closeBtn.addEventListener('click', closeLightbox);
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay || event.target.classList.contains('rgbj-help-lightbox__stage')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && overlay && !overlay.hidden) {
                closeLightbox();
            }
        });
    }

    function openLightbox(href, alt) {
        ensureOverlay();
        imgEl.src = href;
        imgEl.alt = alt || '';
        overlay.hidden = false;
        document.body.classList.add('rgbj-help-lightbox-open');
        closeBtn.focus();
    }

    function closeLightbox() {
        if (!overlay) {
            return;
        }

        overlay.hidden = true;
        imgEl.removeAttribute('src');
        imgEl.alt = '';
        document.body.classList.remove('rgbj-help-lightbox-open');
    }

    document.addEventListener('click', function (event) {
        var link = event.target.closest('a.rgbj-help-image__zoom');
        if (!isZoomLink(link) || !isInHelpContent(link)) {
            return;
        }

        event.preventDefault();

        var previewImg = link.querySelector('img');
        var alt = previewImg ? previewImg.getAttribute('alt') || '' : '';
        openLightbox(link.href, alt);
    });
})();
