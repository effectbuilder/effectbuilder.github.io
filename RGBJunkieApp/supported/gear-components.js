(function () {
    var root = document.getElementById('gear-components-root');
    if (!root) return;

    var gearUrl = root.getAttribute('data-gear-json') || '_supported-data.json';
    var amazonLogo = root.getAttribute('data-amazon-logo') || '/RGBJunkieApp/images/amazon-wordmark-on-dark.svg';
    var AMAZON_TAG = 'rgbjunkie-20';

    function prettyName(slug) {
        return String(slug).replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function normalizeItem(item) {
        if (item && typeof item === 'object' && item.name) {
            return { name: String(item.name), amazonUrl: item.amazonUrl ? String(item.amazonUrl) : '' };
        }
        return { name: String(item), amazonUrl: '' };
    }

    function amazonSearchQuery(vendor, slug) {
        var name = prettyName(slug);
        var brand = String(vendor || '').trim();
        var parts = [];
        if (name) parts.push(name);
        if (brand && brand !== '-' && name.toLowerCase().indexOf(brand.toLowerCase()) === -1) {
            parts.push(brand);
        }
        var q = parts.join(' ').replace(/\s+/g, ' ').trim();
        return q.length ? q : 'RGB PC lighting';
    }

    function buildAmazonUrl(vendor, slug, existingUrl) {
        var href = existingUrl ? String(existingUrl).trim() : '';
        if (!href) {
            href = 'https://www.amazon.com/s?k=' + encodeURIComponent(amazonSearchQuery(vendor, slug));
        }
        try {
            var u = new URL(href, window.location.href);
            if (/amazon\./i.test(u.hostname)) {
                u.searchParams.set('tag', AMAZON_TAG);
                return u.toString();
            }
        } catch (e) { /* keep href */ }
        if (/[?&]tag=/i.test(href)) {
            return href.replace(/([?&])tag=[^&]*/i, '$1tag=' + AMAZON_TAG);
        }
        return href + (href.indexOf('?') >= 0 ? '&' : '?') + 'tag=' + AMAZON_TAG;
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escAttr(s) {
        return esc(s).replace(/'/g, '&#39;');
    }

    function gearLineHtml(vendor, item) {
        var norm = normalizeItem(item);
        var text = prettyName(norm.name).toLowerCase() + ' ' + String(vendor).toLowerCase();
        var href = buildAmazonUrl(vendor, norm.name, norm.amazonUrl);
        return (
            '<li class="list-group-item bg-body-tertiary text-body-secondary py-2 px-3 gear-line d-flex align-items-center justify-content-between gap-2" data-text="' +
            escAttr(text) +
            '">' +
            '<span class="gear-line__name">' +
            esc(prettyName(norm.name)) +
            '</span>' +
            '<a class="gear-amazon-link" href="' +
            escAttr(href) +
            '" target="_blank" rel="nofollow sponsored noopener noreferrer" title="Search on Amazon (US)">' +
            '<img class="gear-amazon-logo" src="' +
            escAttr(amazonLogo) +
            '" alt="" width="72" height="22" loading="lazy" decoding="async">' +
            '<span class="visually-hidden">Amazon</span></a></li>'
        );
    }

    function slugId(prefix, vendor) {
        return prefix + '-' + String(vendor).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function buildAccordion(prefix, dataObj, mount) {
        var vendors = Object.keys(dataObj || {}).sort(function (a, b) {
            return a.localeCompare(b, undefined, { sensitivity: 'base' });
        });
        if (!vendors.length) {
            mount.innerHTML = '<p class="text-warning mb-0">No layout components found.</p>';
            return;
        }
        var accId = 'acc-' + prefix;
        var html = '<div class="accordion accordion-flush" id="' + accId + '">';
        vendors.forEach(function (vendor, idx) {
            var items = dataObj[vendor] || [];
            var collapseId = slugId('c', vendor + '-' + prefix + '-' + idx);
            var headingId = 'h-' + collapseId;
            var list = items.map(function (item) {
                return gearLineHtml(vendor, item);
            }).join('');
            html +=
                '<div class="accordion-item border-secondary bg-body-tertiary gear-vendor" data-vendor="' +
                escAttr(vendor.toLowerCase()) +
                '">' +
                '<h2 class="accordion-header" id="' +
                headingId +
                '">' +
                '<button class="accordion-button collapsed py-3" type="button" data-bs-toggle="collapse" data-bs-target="#' +
                collapseId +
                '" aria-expanded="false" aria-controls="' +
                collapseId +
                '">' +
                '<span class="fw-semibold">' +
                esc(vendor) +
                '</span> <span class="badge bg-secondary ms-2 gear-count">' +
                items.length +
                '</span></button></h2>' +
                '<div id="' +
                collapseId +
                '" class="accordion-collapse collapse" aria-labelledby="' +
                headingId +
                '">' +
                '<div class="accordion-body p-0"><ul class="list-group list-group-flush border-top border-secondary">' +
                list +
                '</ul></div></div></div>';
        });
        html += '</div>';
        mount.innerHTML = html;
    }

    function countVisible(mount) {
        var n = 0;
        mount.querySelectorAll('.gear-vendor').forEach(function (block) {
            if (block.style.display === 'none') return;
            block.querySelectorAll('.gear-line').forEach(function (li) {
                if (li.style.display !== 'none') n++;
            });
        });
        return n;
    }

    function applyFilter(q, mount) {
        var ql = q.trim().toLowerCase();
        mount.querySelectorAll('.gear-vendor').forEach(function (block) {
            var v = block.getAttribute('data-vendor') || '';
            var any = false;
            block.querySelectorAll('.gear-line').forEach(function (li) {
                var t = li.getAttribute('data-text') || '';
                var show = !ql || t.indexOf(ql) !== -1 || v.indexOf(ql) !== -1;
                li.style.display = show ? '' : 'none';
                if (show) any = true;
            });
            block.style.display = any ? '' : 'none';
            var badge = block.querySelector('.gear-count');
            if (badge) {
                var c = 0;
                block.querySelectorAll('.gear-line').forEach(function (li) {
                    if (li.style.display !== 'none') c++;
                });
                badge.textContent = String(c);
            }
        });
    }

    function totalItems(obj) {
        var n = 0;
        Object.keys(obj || {}).forEach(function (k) {
            n += (obj[k] && obj[k].length) || 0;
        });
        return n;
    }

    var mount = document.getElementById('components-mount');
    var badge = document.getElementById('badge-components');
    var search = document.getElementById('gear-search');
    if (!mount) return;

    fetch(gearUrl)
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function (data) {
            if (data.amazonTag) AMAZON_TAG = String(data.amazonTag);
            var components = data.components || {};
            buildAccordion('cmp', components, mount);
            if (badge) badge.textContent = String(totalItems(components));
            if (search) {
                search.addEventListener('input', function () {
                    applyFilter(search.value, mount);
                    if (badge) badge.textContent = String(countVisible(mount));
                });
            }
        })
        .catch(function () {
            mount.innerHTML =
                '<div class="alert alert-warning mb-0">Layout component list could not be loaded.</div>';
        });
})();
