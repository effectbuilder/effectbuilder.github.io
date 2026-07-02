(function () {
    'use strict';

    var dataEl = document.getElementById('rgbj-help-search-data');
    var input = document.querySelector('[data-rgbj-help-search-input]');
    var resultsEl = document.querySelector('[data-rgbj-help-search-results]');
    var indexCards = Array.prototype.slice.call(document.querySelectorAll('[data-rgbj-help-index-card]'));
    var indexSections = Array.prototype.slice.call(document.querySelectorAll('[data-rgbj-help-index-section]'));
    var startHereEl = document.querySelector('[data-rgbj-help-start-here]');
    var noResultsEl = document.querySelector('[data-rgbj-help-index-empty]');

    var entries = [];
    if (dataEl) {
        try {
            entries = JSON.parse(dataEl.textContent || '[]');
        } catch (err) {
            entries = [];
        }
    }

    function normalizeQuery(value) {
        return String(value || '').trim().toLowerCase();
    }

    function scoreEntry(entry, query) {
        var title = String(entry.title || '').toLowerCase();
        var summary = String(entry.summary || '').toLowerCase();
        var category = String(entry.category || '').toLowerCase();
        var text = String(entry.text || '').toLowerCase();

        if (title.indexOf(query) !== -1) {
            return 100;
        }
        if (summary.indexOf(query) !== -1) {
            return 80;
        }
        if (category.indexOf(query) !== -1) {
            return 60;
        }
        if (text.indexOf(query) !== -1) {
            return 40;
        }
        return 0;
    }

    function filterEntries(query) {
        if (!query) {
            return [];
        }

        return entries
            .map(function (entry) {
                return { entry: entry, score: scoreEntry(entry, query) };
            })
            .filter(function (item) {
                return item.score > 0;
            })
            .sort(function (a, b) {
                return b.score - a.score || a.entry.title.localeCompare(b.entry.title);
            })
            .slice(0, 8)
            .map(function (item) {
                return item.entry;
            });
    }

    function renderResults(matches) {
        if (!resultsEl) {
            return;
        }

        resultsEl.innerHTML = '';

        if (matches.length === 0) {
            resultsEl.classList.add('d-none');
            resultsEl.classList.remove('is-open');
            return;
        }

        var fragment = document.createDocumentFragment();
        matches.forEach(function (entry) {
            var link = document.createElement('a');
            link.href = entry.url;
            link.className = 'rgbj-help-search__result';
            link.setAttribute('role', 'option');

            var title = document.createElement('span');
            title.className = 'rgbj-help-search__result-title';
            title.textContent = entry.title;

            var meta = document.createElement('span');
            meta.className = 'rgbj-help-search__result-meta';
            meta.textContent = entry.category + (entry.summary ? ' · ' + entry.summary : '');

            link.appendChild(title);
            link.appendChild(meta);
            fragment.appendChild(link);
        });

        resultsEl.appendChild(fragment);
        resultsEl.classList.remove('d-none');
        resultsEl.classList.add('is-open');
    }

    function filterIndexCards(query) {
        if (indexCards.length === 0) {
            return;
        }

        var visibleCount = 0;
        indexCards.forEach(function (card) {
            var haystack = card.getAttribute('data-search-text') || '';
            var show = !query || haystack.indexOf(query) !== -1;
            card.classList.toggle('d-none', !show);
            if (show) {
                visibleCount++;
            }
        });

        indexSections.forEach(function (section) {
            section.querySelectorAll('[data-rgbj-help-index-subgroup]').forEach(function (subgroup) {
                var subgroupCards = subgroup.querySelectorAll('[data-rgbj-help-index-card]:not(.d-none)');
                subgroup.classList.toggle('d-none', subgroupCards.length === 0);
            });

            var sectionCards = section.querySelectorAll('[data-rgbj-help-index-card]:not(.d-none)');
            section.classList.toggle('d-none', sectionCards.length === 0);
        });

        if (noResultsEl) {
            noResultsEl.classList.toggle('d-none', visibleCount > 0 || !query);
        }

        if (startHereEl) {
            startHereEl.classList.toggle('d-none', !!query);
        }
    }

    function applySearch() {
        var query = input ? normalizeQuery(input.value) : '';
        renderResults(filterEntries(query));
        filterIndexCards(query);
    }

    if (input && resultsEl) {
        input.addEventListener('input', applySearch);

        input.addEventListener('focus', function () {
            if (normalizeQuery(input.value)) {
                applySearch();
            }
        });

        document.addEventListener('click', function (event) {
            if (!event.target.closest('[data-rgbj-help-search]')) {
                resultsEl.classList.add('d-none');
                resultsEl.classList.remove('is-open');
            }
        });

        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                input.value = '';
                applySearch();
                resultsEl.classList.add('d-none');
                resultsEl.classList.remove('is-open');
            }
        });
    }

    var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.rgbj-help-toc__link'));
    if (tocLinks.length > 0) {
        var headingIds = tocLinks
            .map(function (link) {
                return (link.getAttribute('href') || '').replace(/^#/, '');
            })
            .filter(Boolean);

        var headings = headingIds
            .map(function (id) {
                return document.getElementById(id);
            })
            .filter(Boolean);

        if (headings.length > 0) {
            var tocSpyOffset = 120;
            var tocSpyScheduled = false;

            function pageScrollHeight() {
                return Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );
            }

            function pageScrollTop() {
                return window.pageYOffset
                    || document.documentElement.scrollTop
                    || document.body.scrollTop
                    || 0;
            }

            function isAtPageBottom(threshold) {
                var viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
                var scrollHeight = pageScrollHeight();

                if (scrollHeight <= viewportH + threshold) {
                    return false;
                }

                return pageScrollTop() + viewportH >= scrollHeight - threshold;
            }

            function setActiveTocLink(activeId) {
                tocLinks.forEach(function (link) {
                    var isActive = (link.getAttribute('href') || '') === '#' + activeId;
                    link.classList.toggle('is-active', isActive);
                });
            }

            function updateTocSpy() {
                var offset = tocSpyOffset;
                var viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
                var activeIndex = 0;

                for (var i = 0; i < headings.length; i++) {
                    if (headings[i].getBoundingClientRect().top <= offset) {
                        activeIndex = i;
                    }
                }

                var readingZoneEnd = viewportH * 0.45;
                if (isAtPageBottom(48)) {
                    readingZoneEnd = viewportH;
                }

                for (var j = headings.length - 1; j > activeIndex; j--) {
                    var rect = headings[j].getBoundingClientRect();

                    if (rect.top >= offset && rect.top < readingZoneEnd) {
                        activeIndex = j;
                        break;
                    }
                }

                setActiveTocLink(headings[activeIndex].id);
            }

            function scheduleTocSpy() {
                if (tocSpyScheduled) {
                    return;
                }

                tocSpyScheduled = true;
                requestAnimationFrame(function () {
                    tocSpyScheduled = false;
                    updateTocSpy();
                });
            }

            document.addEventListener('scroll', scheduleTocSpy, { passive: true, capture: true });
            window.addEventListener('resize', scheduleTocSpy, { passive: true });
            window.addEventListener('hashchange', scheduleTocSpy);
            scheduleTocSpy();
        }
    }
})();

(function () {
    'use strict';

    var cfg = window.RGBJ_HELP_ADMIN || {};
    var adminCfg = window.RGBJ_ADMIN_NAV || {};
    var deleteButtons = Array.prototype.slice.call(document.querySelectorAll('.rgbj-help-article-delete'));

    if (!cfg.apiUrl || !adminCfg.adminUid || deleteButtons.length === 0) {
        return;
    }

    function whenAuthReady(callback, attempts) {
        if (window.auth && window.onAuthStateChanged) {
            callback();
            return;
        }
        if ((attempts || 0) >= 200) {
            return;
        }
        window.setTimeout(function () {
            whenAuthReady(callback, (attempts || 0) + 1);
        }, 25);
    }

    async function deleteArticle(slug, title) {
        var label = title || slug;
        if (
            !window.confirm(
                'Delete “' + label + '” permanently? The Markdown file will be removed from the server.'
            )
        ) {
            return;
        }

        var user = window.auth && window.auth.currentUser;
        if (!user || user.uid !== adminCfg.adminUid) {
            window.alert('Sign in with the administrator Google account to delete articles.');
            return;
        }

        var token = await user.getIdToken();
        var response = await fetch(cfg.apiUrl + '?slug=' + encodeURIComponent(slug), {
            method: 'DELETE',
            headers: {
                Authorization: 'Bearer ' + token,
                'X-RGBJ-Auth': token,
            },
        });

        var raw = await response.text();
        var data = {};
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch (err) {
                if (!response.ok) {
                    throw new Error('Server error (' + response.status + ').');
                }
                throw new Error('Unexpected server response.');
            }
        }

        if (!response.ok) {
            throw new Error(data.error || 'Delete failed (' + response.status + ').');
        }

        window.location.href = cfg.helpIndexUrl || '/RGBJunkieApp/help/';
    }

    whenAuthReady(function () {
        deleteButtons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                var slug = button.getAttribute('data-slug') || '';
                if (!slug) {
                    return;
                }

                deleteArticle(slug, button.getAttribute('data-title') || slug).catch(function (err) {
                    window.alert(err.message || 'Could not delete article.');
                });
            });
        });
    });

    function initCodeBlockFolds() {
        document.querySelectorAll('.rgbj-help-code-fold').forEach(function (fold) {
            if (fold.dataset.rgbjFoldInit) {
                return;
            }

            fold.dataset.rgbjFoldInit = '1';
            var toggle = fold.querySelector('.rgbj-help-code-fold__toggle');
            if (!toggle) {
                return;
            }

            toggle.addEventListener('click', function () {
                var collapsed = fold.classList.toggle('is-collapsed');
                toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            });
        });
    }

    function markCopyButtonCopied(button) {
        var label = button.querySelector('span');
        var icon = button.querySelector('.bi');
        var previousLabel = label ? label.textContent : 'Copy';
        var previousIconClass = icon ? icon.className : '';

        button.classList.add('is-copied');
        if (label) {
            label.textContent = 'Copied';
        }
        if (icon) {
            icon.className = 'bi bi-check2';
        }

        window.setTimeout(function () {
            button.classList.remove('is-copied');
            if (label) {
                label.textContent = previousLabel;
            }
            if (icon) {
                icon.className = previousIconClass;
            }
        }, 2000);
    }

    function copyTextToClipboard(text, button) {
        function onSuccess() {
            markCopyButtonCopied(button);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onSuccess).catch(fallbackCopy);
            return;
        }

        fallbackCopy();

        function fallbackCopy() {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', 'readonly');
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                if (document.execCommand('copy')) {
                    onSuccess();
                }
            } catch (err) {
                /* ignore */
            }

            document.body.removeChild(textarea);
        }
    }

    function initCodeBlockCopyButtons() {
        document.querySelectorAll('.rgbj-help-code-block__copy').forEach(function (button) {
            if (button.dataset.rgbjCopyInit) {
                return;
            }

            button.dataset.rgbjCopyInit = '1';
            button.addEventListener('click', function () {
                var block = button.closest('.rgbj-help-code-block');
                var code = block ? block.querySelector('code') : null;
                if (!code) {
                    return;
                }

                copyTextToClipboard(code.textContent || '', button);
            });
        });
    }

    function initHelpCodeBlocks() {
        initCodeBlockFolds();
        initCodeBlockCopyButtons();
    }

    initHelpCodeBlocks();
})();
