import {
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from '../../js/firebase.js';

(function () {
    'use strict';

    var cfg = window.RGBJ_HELP_EDITOR || {};
    var adminUid = cfg.adminUid || '';
    var apiUrl = cfg.apiUrl || '';
    var geminiUrl = cfg.geminiUrl || '';
    var uploadImageUrl = cfg.uploadImageUrl || '';
    var imagesUrl = cfg.imagesUrl || '';
    var geminiConfigured = !!cfg.geminiConfigured;
    var contentBaseUrl = cfg.contentBaseUrl || '';
    var codeFoldVisibleLines = typeof cfg.codeFoldVisibleLines === 'number' ? cfg.codeFoldVisibleLines : 12;
    var articles = Array.isArray(cfg.initialArticles) ? cfg.initialArticles.slice() : [];
    var deniedEl = document.getElementById('rgbj-help-editor-denied');
    var appEl = document.getElementById('rgbj-help-editor-app');
    var loginBtn = document.getElementById('rgbj-help-editor-login');
    var logoutBtn = document.getElementById('rgbj-help-editor-logout');
    var selectEl = document.getElementById('rgbj-help-editor-select');
    var slugEl = document.getElementById('rgbj-help-editor-slug');
    var statusEl = document.getElementById('rgbj-help-editor-status');
    var saveBtn = document.getElementById('rgbj-help-editor-save');
    var deleteBtn = document.getElementById('rgbj-help-editor-delete');
    var newBtn = document.getElementById('rgbj-help-editor-new');
    var reloadBtn = document.getElementById('rgbj-help-editor-reload');
    var viewLink = document.getElementById('rgbj-help-editor-view');
    var metaTitleEl = document.getElementById('rgbj-help-meta-title');
    var metaSummaryEl = document.getElementById('rgbj-help-meta-summary');
    var metaCategoryEl = document.getElementById('rgbj-help-meta-category');
    var metaTagsEl = document.getElementById('rgbj-help-meta-tags');
    var metaPublishedEl = document.getElementById('rgbj-help-meta-published');
    var metaDraftEl = document.getElementById('rgbj-help-meta-draft');
    var editorBodyEl = document.getElementById('rgbj-help-editor-body');
    var DEFAULT_CODE_BLOCK_LANGUAGE = 'html';
    var codeBlockTitleByIndex = [];
    var CODE_BLOCK_LANGUAGES = [
        { value: 'html', label: 'HTML' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'css', label: 'CSS' },
        { value: 'json', label: 'JSON' },
        { value: 'bash', label: 'Bash' },
        { value: 'php', label: 'PHP' },
        { value: 'python', label: 'Python' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'text', label: 'Plain text' },
    ];
    var frontmatterEl = document.getElementById('rgbj-help-editor-frontmatter');
    var geminiResultWrap = document.getElementById('rgbj-help-gemini-result-wrap');
    var geminiResultEl = document.getElementById('rgbj-help-gemini-result');
    var geminiPromptEl = document.getElementById('rgbj-help-gemini-prompt');
    var geminiRunBtn = document.getElementById('rgbj-help-gemini-run');
    var geminiApplySelectionBtn = document.getElementById('rgbj-help-gemini-apply-selection');
    var geminiApplyDocumentBtn = document.getElementById('rgbj-help-gemini-apply-document');
    var geminiApplySummaryBtn = document.getElementById('rgbj-help-gemini-apply-summary');
    var geminiApplyTitleBtn = document.getElementById('rgbj-help-gemini-apply-title');
    var geminiCopyBtn = document.getElementById('rgbj-help-gemini-copy');
    var geminiSelectAllBtn = document.getElementById('rgbj-help-gemini-select-all');
    var geminiResultLabel = document.getElementById('rgbj-help-gemini-result-label');
    var geminiSourceEl = document.getElementById('rgbj-help-gemini-source');

    var loadingEl = document.getElementById('rgbj-help-editor-loading');

    var editor = null;
    var currentSlug = '';
    var dirty = false;
    var geminiLastScope = '';
    var geminiBusy = false;
    var imageUploadBusy = false;
    var suppressEditorChange = false;
    var editorHeightObserver = null;
    var lastSyncedEditorHeight = 0;
    var lastPopupToolbarBtn = null;
    var statusHideTimer = null;
    var statusFadeTimer = null;
    var STATUS_SHOW_MS = 4500;
    var STATUS_FADE_MS = 400;
    var FRONTMATTER_OPEN_KEY = 'rgbj-help-editor-frontmatter-open';
    var selectedThematicBreak = null;
    var helpPanelDecorateTimer = null;
    var helpPanelSubmitting = false;
    var helpPanelInsertContext = null;

    var HELP_PANEL_TYPES = {
        info: 'information',
        information: 'information',
        note: 'information',
        caution: 'caution',
        warning: 'warning',
        danger: 'danger',
        important: 'danger',
    };

    var HELP_PANEL_LABELS = {
        information: 'Information',
        caution: 'Caution',
        warning: 'Warning',
        danger: 'Danger',
    };

    var HELP_PANEL_ICONS = {
        information: 'bi-info-circle',
        caution: 'bi-exclamation-triangle',
        warning: 'bi-exclamation-triangle-fill',
        danger: 'bi-exclamation-octagon',
    };

    function findHelpPanelMarkerParagraph(blockquote) {
        if (!blockquote) {
            return null;
        }

        return (
            blockquote.querySelector(':scope > p.rgbj-help-panel__marker-line') ||
            blockquote.querySelector(':scope > p:first-of-type')
        );
    }

    function decorateHelpPanels() {
        if (!editorBodyEl) {
            return;
        }

        editorBodyEl
            .querySelectorAll('.ProseMirror blockquote, .toastui-editor-contents blockquote')
            .forEach(function (blockquote) {
                var firstParagraph = findHelpPanelMarkerParagraph(blockquote);
                if (!firstParagraph) {
                    return;
                }

                var sourceText = firstParagraph.textContent || '';
                var match = sourceText.match(/^\[!([a-z]+)\]\s*(.*)$/is);
                if (!match) {
                    return;
                }

                var panelType = HELP_PANEL_TYPES[match[1].toLowerCase()];
                if (!panelType) {
                    return;
                }

                var remaining = String(match[2] || '').trim();
                if (remaining === '') {
                    firstParagraph.classList.add('rgbj-help-panel__marker-line');
                } else if (remaining !== '' && firstParagraph.getAttribute('data-rgbj-panel-parsed') !== panelType) {
                    suppressEditorChange = true;
                    try {
                        firstParagraph.textContent = remaining;
                        firstParagraph.setAttribute('data-rgbj-panel-parsed', panelType);
                    } finally {
                        suppressEditorChange = false;
                    }
                }
            });
    }

    function isBlockQuoteNode(node) {
        return !!(node && (node.type.name === 'blockQuote' || node.type.name === 'blockquote'));
    }

    function detectHelpPanelTypeFromBlockQuote(node) {
        if (!isBlockQuoteNode(node)) {
            return null;
        }

        var htmlAttrs = node.attrs.htmlAttrs || {};
        if (htmlAttrs['data-rgbj-panel']) {
            return normalizeHelpPanelType(htmlAttrs['data-rgbj-panel']);
        }

        for (var i = 0; i < node.childCount; i++) {
            var child = node.child(i);
            if (!child.isTextblock) {
                continue;
            }

            var match = String(child.textContent || '').match(/^\[!([a-z]+)\]\s*(.*)$/is);
            if (match) {
                return HELP_PANEL_TYPES[match[1].toLowerCase()] || null;
            }

            break;
        }

        return null;
    }

    function blockQuoteHasMarkerOnlyLine(node) {
        if (!node || node.childCount === 0) {
            return false;
        }

        var first = node.child(0);
        if (!first.isTextblock) {
            return false;
        }

        return /^\[!([a-z]+)\]\s*$/i.test(String(first.textContent || '').trim());
    }

    function buildHelpPanelHeaderWidget(panelType) {
        var header = document.createElement('div');
        header.className = 'rgbj-help-panel__header';
        header.contentEditable = 'false';

        var icon = document.createElement('i');
        icon.className = 'bi ' + HELP_PANEL_ICONS[panelType] + ' rgbj-help-panel__icon';
        icon.setAttribute('aria-hidden', 'true');

        var title = document.createElement('span');
        title.className = 'rgbj-help-panel__title';
        title.textContent = HELP_PANEL_LABELS[panelType];

        header.appendChild(icon);
        header.appendChild(title);
        return header;
    }

    function scheduleHelpPanelDecoration() {
        if (helpPanelDecorateTimer) {
            window.clearTimeout(helpPanelDecorateTimer);
        }

        helpPanelDecorateTimer = window.setTimeout(function () {
            helpPanelDecorateTimer = null;
            decorateHelpPanels();
        }, 0);
    }

    function normalizeHelpPanelType(rawType) {
        var panelType = HELP_PANEL_TYPES[String(rawType || '').toLowerCase()];
        return panelType || 'information';
    }

    function buildHelpPanelMarkdown(panelType, body) {
        panelType = normalizeHelpPanelType(panelType);
        body = String(body || '').trim() || 'Replace this text.';

        var lines = body.split(/\r?\n/);
        var markdown = '> [!' + panelType + ']\n';
        lines.forEach(function (line) {
            markdown += '> ' + line + '\n';
        });

        return markdown + '\n';
    }

    function getBlockQuoteNodeType(schema) {
        if (!schema || !schema.nodes) {
            return null;
        }

        return schema.nodes.blockQuote || schema.nodes.blockquote || null;
    }

    function createHelpPanelNodes(schema, panelType, body) {
        var blockquote = getBlockQuoteNodeType(schema);
        var paragraph = schema.nodes.paragraph;
        if (!blockquote || !paragraph) {
            return null;
        }

        panelType = normalizeHelpPanelType(panelType);
        body = String(body || '').trim() || 'Replace this text.';

        var children = [paragraph.create(null, schema.text('[!' + panelType + ']'))];
        body.split(/\r?\n/).forEach(function (line) {
            children.push(paragraph.create(null, schema.text(line)));
        });

        return {
            panelNode: blockquote.create(
                {
                    htmlAttrs: {
                        class: 'rgbj-help-panel rgbj-help-panel--' + panelType,
                        'data-rgbj-panel': panelType,
                        'data-rgbj-has-marker-line': '1',
                    },
                },
                children
            ),
            trailingParagraph: paragraph.create(),
        };
    }

    function insertHelpPanelIntoView(view, panelType, body, selectionRange) {
        if (!view) {
            return false;
        }

        var state = view.state;
        var nodes = createHelpPanelNodes(state.schema, panelType, body);
        if (!nodes) {
            return false;
        }

        var TextSelection = state.selection.constructor;
        var from =
            selectionRange && typeof selectionRange.from === 'number'
                ? selectionRange.from
                : state.selection.from;
        var to =
            selectionRange && typeof selectionRange.to === 'number'
                ? selectionRange.to
                : state.selection.to;
        var maxPos = state.doc.content.size;

        from = Math.max(0, Math.min(from, maxPos));
        to = Math.max(from, Math.min(to, maxPos));

        var panelNode = nodes.panelNode;
        var trailingParagraph = nodes.trailingParagraph;
        var tr = state.tr;

        if (from !== to) {
            tr = tr.deleteRange(from, to);
        }

        var insertAnchor = tr.mapping.map(from);
        insertAnchor = Math.max(0, Math.min(insertAnchor, tr.doc.content.size));
        if (insertAnchor === 0 && tr.doc.content.size > 1) {
            insertAnchor = 1;
        } else if (insertAnchor >= tr.doc.content.size && tr.doc.content.size > 1) {
            insertAnchor = tr.doc.content.size - 1;
        }
        var $from = tr.doc.resolve(insertAnchor);
        var replacedEmptyBlock = false;

        if ($from.parent.isTextblock && $from.parent.content.size === 0) {
            for (var depth = $from.depth; depth > 0; depth -= 1) {
                if ($from.node(depth - 1).type.name === 'doc') {
                    var replaceFrom = $from.before(depth);
                    var replaceTo = $from.after(depth);
                    try {
                        tr = tr.replaceWith(replaceFrom, replaceTo, [panelNode, trailingParagraph]);
                        tr = tr.setSelection(TextSelection.near(tr.doc.resolve(replaceFrom + 1), 1));
                        replacedEmptyBlock = true;
                    } catch (replaceErr) {
                        return false;
                    }
                    break;
                }
            }
        }

        if (!replacedEmptyBlock) {
            var insertPos = null;

            if ($from.depth === 0) {
                insertPos = 0;
            } else {
                for (var blockDepth = $from.depth; blockDepth > 0; blockDepth -= 1) {
                    if ($from.node(blockDepth - 1).type.name === 'doc' && $from.node(blockDepth).isBlock) {
                        insertPos = $from.after(blockDepth);
                        break;
                    }
                }
            }

            if (insertPos === null) {
                return false;
            }

            try {
                tr = tr.insert(insertPos, panelNode);
                tr = tr.insert(insertPos + panelNode.nodeSize, trailingParagraph);
                tr = tr.setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1), 1));
            } catch (insertErr) {
                return false;
            }
        }

        if (!tr.docChanged) {
            return false;
        }

        try {
            view.dispatch(tr);
        } catch (err) {
            return false;
        }

        return true;
    }

    function getEditorWwScrollEl() {
        if (!editorBodyEl) {
            return null;
        }

        return (
            editorBodyEl.querySelector('.toastui-editor-ww-container') ||
            editorBodyEl.querySelector('.toastui-editor-contents') ||
            editorBodyEl
        );
    }

    function focusEditorAfterHelpPanelInsert(panelType, body, done) {
        panelType = normalizeHelpPanelType(panelType);
        var bodyLine = String(body || '').split(/\r?\n/)[0];

        function finish() {
            var view = getWwEditorView();
            if (view) {
                view.focus();
            }
            if (typeof done === 'function') {
                done();
            }
        }

        window.setTimeout(function () {
            scheduleHelpPanelDecoration();
            if (restoreHelpPanelCursorFromDom(panelType, bodyLine)) {
                finish();
                return;
            }

            window.setTimeout(function () {
                restoreHelpPanelCursorFromDom(panelType, bodyLine);
                finish();
            }, 60);
        }, 0);
    }

    function refreshEditorFromMarkdown(markdown, options) {
        options = options || {};
        markdown = normalizeLineEndings(String(markdown || ''));
        markdown = repairNewTabLinksInMarkdown(markdown);
        markdown = normalizeHelpTablesInMarkdown(markdown);
        codeBlockTitleByIndex = extractCodeBlockTitlesFromMarkdown(markdown);

        var scrollEl = getEditorWwScrollEl();
        var savedScrollTop = scrollEl ? scrollEl.scrollTop : 0;

        editor.setMarkdown(absolutizeImagePathsForEditor(stripCodeFenceTitlesForEditor(markdown)), false);
        syncCodeBlockTitlesFromMarkdown(markdown);
        normalizeCodeBlockLanguageAttrs();
        sanitizeCodeBlocksInDocument();
        syncCodeBlockTitlesFromMarkdown(markdown);

        if (scrollEl) {
            scrollEl.scrollTop = savedScrollTop;
        }

        window.setTimeout(function () {
            lastSyncedEditorHeight = 0;
            refreshEditorImages();
            applyEditorSiteStyles();
            sanitizeCodeBlocksInDocument();
            normalizeCodeBlockLanguageAttrs();
            syncCodeBlockTitlesFromMarkdown(markdown);
            syncEditorHeight();
            syncTableToolbarState();
            decorateHelpPanels();
            if (scrollEl) {
                scrollEl.scrollTop = savedScrollTop;
            }
            if (typeof options.onSettled === 'function') {
                options.onSettled();
            }
        }, 100);
    }

    function getHelpPanelInsertRange() {
        var view = getWwEditorView();
        if (!view) {
            return null;
        }

        var maxPos = view.state.doc.content.size;
        if (helpPanelInsertContext) {
            var from = Math.max(0, Math.min(helpPanelInsertContext.from, maxPos));
            var to = Math.max(from, Math.min(helpPanelInsertContext.to, maxPos));
            return { from: from, to: to };
        }

        return {
            from: view.state.selection.from,
            to: view.state.selection.to,
        };
    }

    function splitMarkdownBodyBlocks(markdown) {
        markdown = normalizeLineEndings(String(markdown || ''));
        if (markdown.trim() === '') {
            return [''];
        }

        var blocks = [];
        var current = [];
        var lines = markdown.split('\n');
        var inFence = false;

        lines.forEach(function (line) {
            var trimmed = line.trim();
            if (/^```/.test(trimmed)) {
                inFence = !inFence;
                current.push(line);
                return;
            }

            if (!inFence && trimmed === '' && current.length) {
                blocks.push(current.join('\n'));
                current = [];
                return;
            }

            current.push(line);
        });

        if (current.length) {
            blocks.push(current.join('\n'));
        }

        return blocks.length ? blocks : [''];
    }

    function joinMarkdownBodyBlocks(blocks) {
        return blocks
            .map(function (block) {
                return String(block || '').trimEnd();
            })
            .filter(function (block, index, arr) {
                return block !== '' || arr.length === 1;
            })
            .join('\n\n');
    }

    function getMarkdownInsertPlan(view, range) {
        var doc = view.state.doc;
        var from = range.from;
        var targetIndex = doc.childCount;
        var replaceBlock = false;
        var found = false;

        doc.forEach(function (node, offset, index) {
            if (found) {
                return;
            }

            var end = offset + node.nodeSize;
            if (from >= offset && from <= end) {
                if (node.type.name === 'paragraph' && node.content.size === 0) {
                    targetIndex = index;
                    replaceBlock = true;
                } else {
                    targetIndex = index + 1;
                }
                found = true;
            }
        });

        return { index: targetIndex, replace: replaceBlock };
    }

    function restoreHelpPanelCursorFromDom(panelType, bodyLine) {
        var view = getWwEditorView();
        if (!view || !editorBodyEl) {
            return false;
        }

        panelType = normalizeHelpPanelType(panelType);
        bodyLine = String(bodyLine || '');

        decorateHelpPanels();

        var target =
            editorBodyEl.querySelector('blockquote[data-rgbj-panel-insert-active="1"]') ||
            null;

        if (!target) {
            var blockquotes = editorBodyEl.querySelectorAll('.ProseMirror blockquote, .toastui-editor-contents blockquote');
            for (var i = blockquotes.length - 1; i >= 0; i -= 1) {
                var candidate = blockquotes[i];
                var text = candidate.textContent || '';
                if (text.indexOf(bodyLine) !== -1 && text.indexOf('[!' + panelType) !== -1) {
                    target = candidate;
                    break;
                }
                if (
                    bodyLine &&
                    candidate.getAttribute('data-rgbj-panel') === panelType &&
                    text.indexOf(bodyLine) !== -1
                ) {
                    target = candidate;
                    break;
                }
            }
        }

        if (!target) {
            return false;
        }

        var TextSelection = view.state.selection.constructor;
        var focusEl = target.nextElementSibling;

        if (focusEl && focusEl.tagName === 'P') {
            try {
                var startPos = view.posAtDOM(focusEl, 0);
                if (startPos >= 0) {
                    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, startPos)));
                    target.removeAttribute('data-rgbj-panel-insert-active');
                    scrollHelpPanelIntoView(target, focusEl);
                    return true;
                }
            } catch (err) {
                // try fallback below
            }
        }

        var lastParagraph = target.querySelector('p:last-child');
        if (lastParagraph) {
            try {
                var endPos = view.posAtDOM(lastParagraph, lastParagraph.childNodes.length);
                if (endPos >= 0) {
                    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, endPos)));
                    target.removeAttribute('data-rgbj-panel-insert-active');
                    scrollHelpPanelIntoView(target, lastParagraph);
                    return true;
                }
            } catch (err2) {
                return false;
            }
        }

        return false;
    }

    function scrollHelpPanelIntoView(panelEl, cursorEl) {
        var scrollEl = getEditorWwScrollEl();
        var targetEl = cursorEl || panelEl;
        if (!targetEl) {
            return;
        }

        if (scrollEl && typeof scrollEl.scrollTo === 'function') {
            var scrollRect = scrollEl.getBoundingClientRect();
            var targetRect = targetEl.getBoundingClientRect();
            var nextTop =
                scrollEl.scrollTop +
                (targetRect.top - scrollRect.top) -
                Math.max(0, (scrollRect.height - targetRect.height) / 3);

            scrollEl.scrollTo({
                top: Math.max(0, nextTop),
                behavior: 'auto',
            });
            return;
        }

        if (typeof targetEl.scrollIntoView === 'function') {
            targetEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    function insertHelpPanelViaMarkdownAtCursor(panelType, body, range, onSettled) {
        if (!editor) {
            return false;
        }

        var view = getWwEditorView();
        if (!view || !range) {
            return false;
        }

        panelType = normalizeHelpPanelType(panelType);
        body = String(body || '').trim();
        if (body === '') {
            return false;
        }

        var plan = getMarkdownInsertPlan(view, range);
        var blocks = splitMarkdownBodyBlocks(editor.getMarkdown() || '');
        var panelMd = buildHelpPanelMarkdown(panelType, body).trimEnd();
        var blockIndex;

        if (plan.replace && plan.index < blocks.length) {
            blocks[plan.index] = panelMd;
            blockIndex = plan.index;
        } else {
            var insertAt = Math.max(0, Math.min(plan.index, blocks.length));
            blocks.splice(insertAt, 0, panelMd);
            blockIndex = insertAt;
            if (insertAt === blocks.length - 1) {
                blocks.push('');
            }
        }

        suppressEditorChange = true;
        try {
            refreshEditorFromMarkdown(joinMarkdownBodyBlocks(blocks), {
                onSettled: function () {
                    if (typeof onSettled === 'function') {
                        onSettled({ blockIndex: blockIndex });
                    }
                },
            });
        } catch (err) {
            return null;
        } finally {
            suppressEditorChange = false;
        }

        return { blockIndex: blockIndex };
    }

    function captureHelpPanelInsertContext() {
        var view = getWwEditorView();
        if (!view) {
            return;
        }

        helpPanelInsertContext = {
            from: view.state.selection.from,
            to: view.state.selection.to,
        };
    }

    function initHelpPanelSelectionTracking() {
        if (!editorBodyEl || editorBodyEl.dataset.rgbjHelpPanelSelectionInit) {
            return;
        }

        editorBodyEl.dataset.rgbjHelpPanelSelectionInit = '1';

        ['mouseup', 'keyup', 'click'].forEach(function (eventName) {
            editorBodyEl.addEventListener(
                eventName,
                function (event) {
                    if (!editorBodyEl.contains(event.target)) {
                        return;
                    }

                    window.setTimeout(captureHelpPanelInsertContext, 0);
                },
                true
            );
        });
    }

    function insertHelpPanel(panelType, body, onComplete) {
        if (!editor) {
            if (typeof onComplete === 'function') {
                onComplete(false);
            }
            return false;
        }

        panelType = normalizeHelpPanelType(panelType);
        body = String(body || '').trim();
        if (body === '') {
            if (typeof onComplete === 'function') {
                onComplete(false);
            }
            return false;
        }

        if (!helpPanelInsertContext) {
            captureHelpPanelInsertContext();
        }

        var range = getHelpPanelInsertRange();
        if (!range) {
            if (typeof onComplete === 'function') {
                onComplete(false);
            }
            return false;
        }

        var view = getWwEditorView();
        var insertPlan = view ? getMarkdownInsertPlan(view, range) : null;
        var focusBlockIndex =
            insertPlan && typeof insertPlan.index === 'number' ? insertPlan.index : null;

        window.__rgbjLastPanelInsert = {
            panelType: panelType,
            bodyLine: body.split(/\r?\n/)[0],
            blockIndex: focusBlockIndex,
        };

        if (view && insertHelpPanelIntoView(view, panelType, body, range)) {
            focusEditorAfterHelpPanelInsert(panelType, body, function () {
                window.__rgbjLastPanelInsert = null;
                if (typeof onComplete === 'function') {
                    onComplete(true);
                }
            });
            return true;
        }

        var markdownResult = insertHelpPanelViaMarkdownAtCursor(panelType, body, range, function () {
            focusEditorAfterHelpPanelInsert(panelType, body, function () {
                window.__rgbjLastPanelInsert = null;
                if (typeof onComplete === 'function') {
                    onComplete(true);
                }
            });
        });

        if (!markdownResult) {
            window.__rgbjLastPanelInsert = null;
            if (typeof onComplete === 'function') {
                onComplete(false);
            }
            return false;
        }

        return true;
    }

    function todayIsoDateLocal() {
        var d = new Date();
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');

        return y + '-' + m + '-' + day;
    }

    function buildArticleTemplate() {
        return [
            '---',
            'title: New help article',
            'slug: new-article',
            'summary: One sentence for the index card.',
            'category: General',
            'tags: ',
            'published: ' + todayIsoDateLocal(),
            'draft: true',
            '---',
            '',
            '# First section',
            '',
            'Write your article here.',
            '',
        ].join('\n');
    }

    function splitFrontMatter(markdown) {
        markdown = String(markdown || '');
        var match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
        if (!match) {
            return { front: '', body: markdown };
        }

        return {
            front: match[0],
            body: markdown.slice(match[0].length),
        };
    }

    function isTruthyYaml(value) {
        value = String(value || '').trim().toLowerCase();
        return value === '1' || value === 'true' || value === 'yes' || value === 'on';
    }

    function parseFrontMatterFields(yamlBlock) {
        var fields = {
            title: '',
            slug: '',
            summary: '',
            category: '',
            tags: '',
            published: '',
            draft: false,
        };
        var text = String(yamlBlock || '').trim();
        if (text === '') {
            return fields;
        }

        text = text.replace(/^---\r?\n?/, '').replace(/\r?\n?---\s*$/, '');

        text.split(/\r?\n/).forEach(function (line) {
            var colon = line.indexOf(':');
            if (colon === -1) {
                return;
            }

            var key = line.slice(0, colon).trim();
            var value = line.slice(colon + 1).trim();

            if (key === 'draft') {
                fields.draft = isTruthyYaml(value);
                return;
            }

            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                fields[key] = value;
            }
        });

        return fields;
    }

    function readMetaForm() {
        return {
            title: metaTitleEl ? metaTitleEl.value.trim() : '',
            slug: slugEl ? slugEl.value.trim() : '',
            summary: metaSummaryEl ? metaSummaryEl.value.trim() : '',
            category: metaCategoryEl ? metaCategoryEl.value.trim() : '',
            tags: metaTagsEl ? metaTagsEl.value.trim() : '',
            published: metaPublishedEl ? metaPublishedEl.value.trim() : '',
            draft: metaDraftEl ? metaDraftEl.checked : false,
        };
    }

    function populateMetaForm(yamlBlock) {
        var fields = parseFrontMatterFields(yamlBlock);

        if (metaTitleEl) {
            metaTitleEl.value = fields.title;
        }
        if (metaSummaryEl) {
            metaSummaryEl.value = fields.summary;
        }
        if (metaCategoryEl) {
            metaCategoryEl.value = fields.category;
        }
        if (metaTagsEl) {
            metaTagsEl.value = fields.tags;
        }
        if (metaPublishedEl) {
            metaPublishedEl.value = fields.published;
        }
        if (metaDraftEl) {
            metaDraftEl.checked = fields.draft;
        }
        if (slugEl && fields.slug) {
            slugEl.value = fields.slug;
        }
    }

    function buildFrontMatter(fields) {
        fields = fields || readMetaForm();
        var slug = slugEl ? slugEl.value.trim() : fields.slug;

        return [
            '---',
            'title: ' + fields.title,
            'slug: ' + slug,
            'summary: ' + fields.summary,
            'category: ' + fields.category,
            'tags: ' + fields.tags,
            'published: ' + fields.published,
            'draft: ' + (fields.draft ? 'true' : 'false'),
            '---',
            '',
        ].join('\n');
    }

    function getFrontMatterText() {
        return buildFrontMatter(readMetaForm());
    }

    function setFrontMatterText(text) {
        populateMetaForm(text);
    }

    function sanitizeHelpPanelMarkdownForSave(markdown) {
        markdown = normalizeLineEndings(String(markdown || ''));

        Object.keys(HELP_PANEL_LABELS).forEach(function (panelType) {
                var label = HELP_PANEL_LABELS[panelType];
                var labelPattern = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                markdown = markdown.replace(
                    new RegExp('(^|\\n)> ' + labelPattern + '\\s*\\r?\\n(?=> \\[!' + panelType + '\\])', 'gim'),
                    '$1'
                );

                markdown = markdown.replace(
                    new RegExp(
                        '((?:^|\\n)> \\[!' +
                            panelType +
                            '\\]\\s*\\r?\\n)> \\[!' +
                            panelType +
                            '\\]\\s*\\r?\\n',
                        'gim'
                    ),
                    '$1'
                );
            });

        return markdown;
    }

    function restoreHelpPanelMarkersBeforeSave() {
        if (!editorBodyEl) {
            return;
        }

        editorBodyEl
            .querySelectorAll('.ProseMirror blockquote[data-rgbj-panel], .toastui-editor-contents blockquote[data-rgbj-panel]')
            .forEach(function (blockquote) {
                var panelType = blockquote.getAttribute('data-rgbj-panel');
                if (!panelType) {
                    return;
                }

                var markerParagraph = null;
                if (blockquote.getAttribute('data-rgbj-has-marker-line') === '1') {
                    markerParagraph = findHelpPanelMarkerParagraph(blockquote);
                } else {
                    markerParagraph = blockquote.querySelector(':scope > p.rgbj-help-panel__marker-line');
                }

                var firstParagraph = markerParagraph || findHelpPanelMarkerParagraph(blockquote);
                if (!firstParagraph) {
                    return;
                }

                var sourceText = firstParagraph.textContent || '';
                if (/^\[!([a-z]+)\]/i.test(sourceText)) {
                    return;
                }

                suppressEditorChange = true;
                try {
                    firstParagraph.textContent = '[!' + panelType + ']' + (sourceText ? ' ' + sourceText : '');
                    firstParagraph.classList.remove('rgbj-help-panel__marker-line');
                    firstParagraph.removeAttribute('data-rgbj-panel-parsed');
                } finally {
                    suppressEditorChange = false;
                }
            });
    }

    function getArticleMarkdown() {
        restoreHelpPanelMarkersBeforeSave();
        var body = editor ? sanitizeMarkdownBodyForSave(editor.getMarkdown()) : '';
        body = sanitizeHelpPanelMarkdownForSave(body);
        scheduleHelpPanelDecoration();
        return getFrontMatterText() + body;
    }

    function setArticleMarkdown(fullMarkdown) {
        var parts = splitFrontMatter(fullMarkdown);
        setFrontMatterText(parts.front);
        if (editor) {
            suppressEditorChange = true;
            var body = normalizeLineEndings(parts.body.trim() === '' ? ' ' : parts.body);
            body = repairNewTabLinksInMarkdown(body);
            body = normalizeHelpTablesInMarkdown(body);
            body = expandSingleNewlineParagraphBreaks(body);
            codeBlockTitleByIndex = extractCodeBlockTitlesFromMarkdown(body);
            editor.setMarkdown(
                absolutizeImagePathsForEditor(stripCodeFenceTitlesForEditor(body)),
                false
            );
            syncCodeBlockTitlesFromMarkdown(body);
            normalizeCodeBlockLanguageAttrs();
            sanitizeCodeBlocksInDocument();
            syncCodeBlockTitlesFromMarkdown(body);
            window.setTimeout(function () {
                lastSyncedEditorHeight = 0;
                refreshEditorImages();
                applyEditorSiteStyles();
                sanitizeCodeBlocksInDocument();
                normalizeCodeBlockLanguageAttrs();
                syncCodeBlockTitlesFromMarkdown(body);
                syncEditorHeight();
                syncTableToolbarState();
                clearThematicBreakSelection();
                scheduleHelpPanelDecoration();
            }, 100);
            suppressEditorChange = false;
        }
    }

    function helpContentBaseUrl() {
        if (!contentBaseUrl) {
            return new URL('./', window.location.href).href;
        }

        try {
            return new URL(contentBaseUrl, window.location.origin).href;
        } catch (err) {
            return window.location.href;
        }
    }

    function resolveHelpImageUrl(path) {
        path = String(path || '').trim();
        if (path === '' || /^https?:\/\//i.test(path) || path.indexOf('data:') === 0) {
            return path;
        }

        try {
            if (path.charAt(0) === '/') {
                return new URL(path, window.location.origin).href;
            }

            return new URL(path, helpContentBaseUrl()).href;
        } catch (err) {
            return path;
        }
    }

    function isHelpVideoPath(path) {
        return /\.(mp4|webm|ogg)(\?|#|$)/i.test(String(path || ''));
    }

    function refreshEditorImages() {
        if (!editorBodyEl) {
            return;
        }

        editorBodyEl.querySelectorAll('.ProseMirror img, .toastui-editor-contents img, .ProseMirror video.rgbj-help-video, .toastui-editor-contents video.rgbj-help-video').forEach(function (mediaEl) {
            var src = mediaEl.getAttribute('src') || '';
            if (src === '' || /^https?:\/\//i.test(src) || src.indexOf('data:') === 0) {
                return;
            }

            mediaEl.setAttribute('src', resolveHelpImageUrl(src));
            if (mediaEl.tagName === 'IMG' && !mediaEl.complete) {
                mediaEl.addEventListener('load', syncEditorHeight, { once: true });
            }
        });

        syncEditorHeight();
    }

    function normalizeLineEndings(text) {
        return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    function htmlClipboardToPlainText(html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        var root = template.content;
        var blockTags = {
            div: true,
            p: true,
            li: true,
            tr: true,
            h1: true,
            h2: true,
            h3: true,
            h4: true,
            h5: true,
            h6: true,
            pre: true,
            blockquote: true,
            section: true,
            header: true,
            footer: true,
            table: true,
            thead: true,
            tbody: true,
            style: true,
            script: true,
            meta: true,
            title: true,
            head: true,
            body: true,
            html: true,
        };

        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent || '';
            }
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return '';
            }

            var tag = node.tagName.toLowerCase();
            if (tag === 'br') {
                return '\n';
            }

            var parts = [];
            node.childNodes.forEach(function (child) {
                parts.push(walk(child));
            });
            var text = parts.join('');
            if (blockTags[tag] && text !== '' && text.charAt(text.length - 1) !== '\n') {
                text += '\n';
            }
            return text;
        }

        return walk(root).replace(/\u00a0/g, ' ');
    }

    function readClipboardPlainText(event) {
        var clipboard = event.clipboardData || window.clipboardData;
        if (!clipboard) {
            return '';
        }

        var plain = clipboard.getData('text/plain');
        if (plain) {
            return normalizeLineEndings(plain);
        }

        var html = clipboard.getData('text/html');
        if (html) {
            return normalizeLineEndings(htmlClipboardToPlainText(html));
        }

        return '';
    }

    function isSelectionInCodeBlock() {
        if (!editor || !editor.wwEditor || !editor.wwEditor.view) {
            return false;
        }

        var $from = editor.wwEditor.view.state.selection.$from;
        for (var depth = $from.depth; depth > 0; depth -= 1) {
            if ($from.node(depth).type.name === 'codeBlock') {
                return true;
            }
        }

        return false;
    }

    function setCodeBlockLanguage(language) {
        if (!editor || !editor.wwEditor || !editor.wwEditor.view) {
            return false;
        }

        var view = editor.wwEditor.view;
        var state = view.state;
        var $from = state.selection.$from;

        for (var depth = $from.depth; depth > 0; depth -= 1) {
            if ($from.node(depth).type.name === 'codeBlock') {
                var pos = $from.before(depth);
                view.dispatch(state.tr.setNodeMarkup(pos, null, { language: language }));
                return true;
            }
        }

        return false;
    }

    function insertPlainTextAtSelection(text) {
        if (!editor || !editor.wwEditor || !editor.wwEditor.view || text === '') {
            return;
        }

        var view = editor.wwEditor.view;
        var selection = view.state.selection;
        view.dispatch(view.state.tr.insertText(text, selection.from, selection.to));
        markDirty();
        syncEditorHeight();
    }

    function looksLikeHtmlSource(text) {
        var sample = text.trim().slice(0, 512).toLowerCase();
        if (sample === '') {
            return false;
        }

        if (sample.indexOf('<!doctype') === 0 || sample.indexOf('<html') === 0) {
            return true;
        }

        return sample.indexOf('<') === 0 && /<(html|head|body|script|style|meta|!doctype)[\s>]/i.test(sample);
    }

    function insertHtmlSourceAsCodeBlock(text) {
        if (!editor) {
            return;
        }

        editor.exec('codeBlock');
        window.setTimeout(function () {
            setCodeBlockLanguage('html');
            insertPlainTextAtSelection(text);
        }, 0);
    }

    function handleEditorPaste(event) {
        var text = readClipboardPlainText(event);
        if (text === '') {
            return;
        }

        if (isSelectionInCodeBlock()) {
            event.preventDefault();
            event.stopPropagation();
            insertPlainTextAtSelection(text);
            window.setTimeout(sanitizeCodeBlocksInDocument, 0);
            return;
        }

        if (looksLikeHtmlSource(text)) {
            event.preventDefault();
            event.stopPropagation();
            insertHtmlSourceAsCodeBlock(text);
        }
    }

    function initCodeBlockPlainTextPaste() {
        if (!editorBodyEl || editorBodyEl.dataset.rgbjCodePasteInit) {
            return;
        }

        editorBodyEl.dataset.rgbjCodePasteInit = '1';
        editorBodyEl.addEventListener('paste', handleEditorPaste, true);
    }

    var codeBlockChromePluginKey = null;

    function isCodeBlockNode(node) {
        return !!(node && (node.type.name === 'codeBlock' || node.type.name === 'codeblock'));
    }

    function codeBlockNodeKey(node) {
        return String((node.textContent || '').length) + ':' + (node.textContent || '').slice(0, 96);
    }

    function codeBlockNodeText(node) {
        return String(node.textContent || '')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/<br\s*\/?>/gi, '\n');
    }

    function codeBlockNodeLineCount(node) {
        var text = codeBlockNodeText(node);
        if (text === '') {
            return 0;
        }

        return text.split('\n').length;
    }

    function findCodeBlockByKey(view, key) {
        var found = null;

        view.state.doc.descendants(function (node, pos) {
            if (isCodeBlockNode(node) && codeBlockNodeKey(node) === key) {
                found = { node: node, pos: pos };
            }
        });

        return found;
    }

    function getCodeBlockCleanLanguage(node) {
        var parsed = parseCodeFenceInfo(node.attrs.language);
        var lang = String(parsed.language || node.attrs.language || '').trim().toLowerCase();

        if (!lang || lang === 'plain') {
            return DEFAULT_CODE_BLOCK_LANGUAGE;
        }

        if (lang === 'text') {
            return 'text';
        }

        return lang;
    }

    function stripCodeFenceTitlesForEditor(body) {
        return String(body || '').replace(/```([^\n\r]*)\r?\n/g, function (match, info) {
            info = String(info || '').trim();
            if (info === '') {
                return match;
            }

            var parsed = parseCodeFenceInfo(info);
            var lang = parsed.language;

            if (!lang || lang === 'plain') {
                lang = DEFAULT_CODE_BLOCK_LANGUAGE;
            }

            return '```' + lang + '\n';
        });
    }

    function collectCodeBlockLanguageFixes(doc) {
        var fixes = [];
        var titlePatches = {};

        doc.descendants(function (node, pos) {
            if (!isCodeBlockNode(node)) {
                return;
            }

            var lang = String(node.attrs.language || '').trim();
            var parsed = parseCodeFenceInfo(lang);
            var hasEmbeddedTitle = lang.indexOf('title=') !== -1 || (lang.indexOf(' ') !== -1 && parsed.language !== lang);

            if (parsed.title) {
                titlePatches[codeBlockNodeKey(node)] = parsed.title;
            }

            if (!hasEmbeddedTitle && lang !== '') {
                return;
            }

            var nextLang = parsed.language;
            if (!nextLang || nextLang === 'plain') {
                nextLang = lang === 'text' ? 'text' : DEFAULT_CODE_BLOCK_LANGUAGE;
            }

            if (lang !== nextLang) {
                fixes.push({ pos: pos, language: nextLang });
            }
        });

        return { fixes: fixes, titlePatches: titlePatches };
    }

    function parseCodeFenceInfo(info) {
        info = String(info || '').trim();
        var title = '';
        var titleMatch = info.match(/\btitle=(["'])(.*?)\1/i);

        if (titleMatch) {
            title = titleMatch[2];
            info = info.replace(/\btitle=(["']).*?\1/i, '').trim();
        }

        return {
            language: info.split(/\s+/)[0] || '',
            title: title,
        };
    }

    function codeBlockTitleStorageKey(index) {
        return 'idx:' + index;
    }

    function getCodeBlockIndex(doc, targetNode) {
        var index = -1;
        var current = 0;

        doc.descendants(function (node) {
            if (!isCodeBlockNode(node)) {
                return;
            }

            if (node === targetNode) {
                index = current;
            }

            current += 1;
        });

        return index;
    }

    function resolveCodeBlockTitle(node, blockKey, pluginState, doc) {
        var index = getCodeBlockIndex(doc, node);
        var title = '';

        if (index >= 0) {
            if (pluginState && pluginState.titles && pluginState.titles[codeBlockTitleStorageKey(index)]) {
                title = String(pluginState.titles[codeBlockTitleStorageKey(index)]).trim();
            }

            if (title === '' && codeBlockTitleByIndex[index]) {
                title = String(codeBlockTitleByIndex[index]).trim();
            }
        }

        if (title === '' && pluginState && pluginState.titles && pluginState.titles[blockKey]) {
            title = String(pluginState.titles[blockKey]).trim();
        }

        return title;
    }

    function extractCodeBlockTitlesFromMarkdown(markdown) {
        var titles = [];
        var re = /```([^\n]*)\r?\n([\s\S]*?)```/g;
        var match;

        while ((match = re.exec(markdown)) !== null) {
            titles.push(parseCodeFenceInfo(match[1]).title || '');
        }

        return titles;
    }

    function getCodeBlockDisplayTitle(node, key, pluginState) {
        var custom =
            pluginState && pluginState.titles && pluginState.titles[key]
                ? String(pluginState.titles[key]).trim()
                : '';

        if (custom !== '') {
            return custom;
        }

        return codeBlockLanguageLabel(getCodeBlockCleanLanguage(node));
    }

    function getCodeBlockAtSelection(view) {
        if (!view) {
            return null;
        }

        var $from = view.state.selection.$from;
        for (var depth = $from.depth; depth > 0; depth -= 1) {
            if (isCodeBlockNode($from.node(depth))) {
                return { node: $from.node(depth), pos: $from.before(depth) };
            }
        }

        return null;
    }

    function updateCodeBlockLanguage(blockKey, language) {
        var view = getWwEditorView();
        if (!view || !blockKey) {
            return;
        }

        var found = findCodeBlockByKey(view, blockKey);
        if (!found) {
            return;
        }

        language = String(language || DEFAULT_CODE_BLOCK_LANGUAGE).trim() || DEFAULT_CODE_BLOCK_LANGUAGE;
        view.dispatch(view.state.tr.setNodeMarkup(found.pos, undefined, { language: language }));
        markDirty();
    }

    function updateCodeBlockTitle(blockKey, title, blockIndex) {
        var view = getWwEditorView();
        if (!view || !codeBlockChromePluginKey || !blockKey) {
            return;
        }

        title = String(title || '');
        var patch = {};
        patch[blockKey] = title;

        if (typeof blockIndex === 'number' && blockIndex >= 0) {
            patch[codeBlockTitleStorageKey(blockIndex)] = title;
            codeBlockTitleByIndex[blockIndex] = title;
        }

        view.dispatch(
            view.state.tr.setMeta(codeBlockChromePluginKey, {
                titles: patch,
            })
        );
    }

    function syncCodeBlockTitlesFromMarkdown(markdown) {
        var view = getWwEditorView();
        if (!view || !codeBlockChromePluginKey) {
            return;
        }

        var titlesByIndex = extractCodeBlockTitlesFromMarkdown(markdown);
        codeBlockTitleByIndex = titlesByIndex.slice();
        var patch = {};
        var blockIndex = 0;

        view.state.doc.descendants(function (node) {
            if (!isCodeBlockNode(node)) {
                return;
            }

            var title = titlesByIndex[blockIndex] || '';
            patch[codeBlockTitleStorageKey(blockIndex)] = title;
            if (title !== '') {
                patch[codeBlockNodeKey(node)] = title;
            }
            blockIndex += 1;
        });

        view.dispatch(
            view.state.tr.setMeta(codeBlockChromePluginKey, {
                titles: patch,
                titleByBlockIndex: titlesByIndex,
            })
        );
    }

    function initCodeBlockToolbarDefaultLanguage() {
        var toolbar = getEditorToolbar();
        if (!toolbar || toolbar.dataset.rgbjCodeBlockLangInit) {
            return;
        }

        toolbar.dataset.rgbjCodeBlockLangInit = '1';
        toolbar.addEventListener('click', function (event) {
            var btn = event.target.closest('button.codeblock');
            if (!btn || !toolbar.contains(btn)) {
                return;
            }

            window.setTimeout(function () {
                if (setCodeBlockLanguage(DEFAULT_CODE_BLOCK_LANGUAGE)) {
                    markDirty();
                }
            }, 0);
        });
    }

    function sanitizeCodeBlocksInDocument() {
        var view = getWwEditorView();
        if (!view) {
            return;
        }

        var tr = view.state.tr;
        var changed = false;

        view.state.doc.descendants(function (node, pos) {
            if (!isCodeBlockNode(node)) {
                return;
            }

            var clean = codeBlockNodeText(node);
            if (clean === node.textContent) {
                return;
            }

            var from = pos + 1;
            var to = pos + node.nodeSize - 1;
            if (from < to) {
                tr.replaceWith(from, to, view.state.schema.text(clean));
                changed = true;
            }
        });

        if (changed) {
            suppressEditorChange = true;
            view.dispatch(tr);
            suppressEditorChange = false;
        }
    }

    function normalizeCodeBlockLanguageAttrs() {
        var view = getWwEditorView();
        if (!view) {
            return;
        }

        var collected = collectCodeBlockLanguageFixes(view.state.doc);
        if (collected.fixes.length === 0 && Object.keys(collected.titlePatches).length === 0) {
            return;
        }

        var tr = view.state.tr;
        collected.fixes.forEach(function (fix) {
            tr.setNodeMarkup(fix.pos, undefined, { language: fix.language });
        });

        if (Object.keys(collected.titlePatches).length > 0 && codeBlockChromePluginKey) {
            tr.setMeta(codeBlockChromePluginKey, { titles: collected.titlePatches });
        }

        suppressEditorChange = true;
        view.dispatch(tr);
        suppressEditorChange = false;
    }

    function buildCodeFenceInfo(lang, title) {
        lang = String(lang || '').trim();
        title = String(title || '').trim();

        if (lang === 'text' || lang === 'plain') {
            lang = '';
        }

        var info = lang;
        if (title !== '') {
            info =
                (info !== '' ? info + ' ' : '') +
                'title="' +
                title.replace(/\\/g, '\\\\').replace(/"/g, '\\"') +
                '"';
        }

        return info;
    }

    function normalizeCodeBlockMarkdownRenderer(nodeInfo, context) {
        var result = context.origin();
        if (result && typeof result.text === 'string') {
            result.text = result.text
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n');
        }

        return result;
    }

    function exportCodeBlockMarkdownRenderer(nodeInfo, context) {
        var result = normalizeCodeBlockMarkdownRenderer(nodeInfo, context);
        if (!result) {
            return result;
        }

        var key = codeBlockNodeKey(nodeInfo.node);
        var view = getWwEditorView();
        var title = '';
        var cleanLang = getCodeBlockCleanLanguage(nodeInfo.node);
        var blockIndex = view ? getCodeBlockIndex(view.state.doc, nodeInfo.node) : -1;

        if (view && codeBlockChromePluginKey) {
            var pluginState = codeBlockChromePluginKey.getState(view.state) || { titles: {} };
            if (blockIndex >= 0 && pluginState.titles && pluginState.titles[codeBlockTitleStorageKey(blockIndex)] !== undefined) {
                title = String(pluginState.titles[codeBlockTitleStorageKey(blockIndex)] || '').trim();
            }
            if (title === '') {
                title = String((pluginState.titles && pluginState.titles[key]) || '').trim();
            }
        }

        if (title === '' && blockIndex >= 0 && codeBlockTitleByIndex[blockIndex]) {
            title = String(codeBlockTitleByIndex[blockIndex]).trim();
        }

        if (title === '') {
            title = parseCodeFenceInfo(nodeInfo.node.attrs.language).title || '';
        }

        var info = buildCodeFenceInfo(cleanLang === 'text' ? 'text' : cleanLang, title);
        result.delim = ['```' + info, '```'];
        result.attrs = Object.assign({}, result.attrs || {}, { language: cleanLang });

        return result;
    }

    function listItemContextFromPos($pos) {
        for (var depth = $pos.depth; depth > 0; depth -= 1) {
            if ($pos.node(depth).type.name !== 'listItem') {
                continue;
            }

            var listDepth = depth - 1;
            if (listDepth < 1) {
                return null;
            }

            var list = $pos.node(listDepth);
            var listType = list.type.name;
            if (listType !== 'bulletList' && listType !== 'orderedList' && listType !== 'taskList') {
                return null;
            }

            return {
                itemDepth: depth,
                listDepth: listDepth,
                listItem: $pos.node(depth),
                list: list,
                listPos: $pos.before(listDepth),
                listItemPos: $pos.before(depth),
                indexInList: $pos.index(listDepth),
                paraIndexInItem: $pos.index(depth),
            };
        }

        return null;
    }

    function listItemStartPos(listPos, list, index) {
        var pos = listPos + 1;
        for (var i = 0; i < index; i += 1) {
            pos += list.child(i).nodeSize;
        }

        return pos;
    }

    function endOfListItemContent(listItemPos, listItem) {
        var pos = listItemPos + 1;
        for (var i = 0; i < listItem.childCount - 1; i += 1) {
            pos += listItem.child(i).nodeSize;
        }

        var last = listItem.lastChild;
        if (!last) {
            return pos;
        }

        return pos + last.nodeSize - 1;
    }

    function endOfBlockBefore(doc, pos) {
        var $pos = doc.resolve(pos);
        var node = $pos.nodeBefore;
        if (!node) {
            return Math.max(0, pos - 1);
        }

        var nodeStart = pos - node.nodeSize;
        if (node.isTextblock) {
            return nodeStart + node.nodeSize - 1;
        }

        var lastEnd = nodeStart + 1;
        node.descendants(function (child, offset) {
            if (child.isTextblock) {
                lastEnd = nodeStart + 1 + offset + child.nodeSize - 1;
            }
        });

        return lastEnd;
    }

    function isEffectivelyEmptyTextblock(node) {
        return !!node && node.isTextblock && node.textContent.replace(/\u200b/g, '').trim() === '';
    }

    function handleEmptyListItemBackspace(view) {
        if (!view) {
            return false;
        }

        var state = view.state;
        var selection = state.selection;
        if (!selection.empty) {
            return false;
        }

        var $from = selection.$from;
        if (!isEffectivelyEmptyTextblock($from.parent)) {
            return false;
        }

        var ctx = listItemContextFromPos($from);
        if (!ctx) {
            return false;
        }

        var TextSelection = state.selection.constructor;
        var tr = state.tr;
        var targetPos;
        var listItemPos = ctx.listItemPos;
        var listItem = ctx.listItem;
        var list = ctx.list;
        var listPos = ctx.listPos;
        var indexInList = ctx.indexInList;
        var paraIndexInItem = ctx.paraIndexInItem;

        if (listItem.childCount > 1 && paraIndexInItem > 0) {
            var prevBlock = listItem.child(paraIndexInItem - 1);
            var prevBlockPos = listItemPos + 1;
            for (var p = 0; p < paraIndexInItem - 1; p += 1) {
                prevBlockPos += listItem.child(p).nodeSize;
            }

            targetPos = prevBlockPos + prevBlock.nodeSize - 1;
            tr.delete($from.before(), $from.after());
        } else if (list.childCount <= 1) {
            targetPos = endOfBlockBefore(state.doc, listPos);
            tr.delete(listPos, listPos + list.nodeSize);
        } else if (indexInList > 0) {
            var prevItem = list.child(indexInList - 1);
            var prevItemPos = listItemStartPos(listPos, list, indexInList - 1);
            targetPos = endOfListItemContent(prevItemPos, prevItem);
            tr.delete(listItemPos, listItemPos + listItem.nodeSize);
        } else {
            targetPos = endOfBlockBefore(state.doc, listPos);
            tr.delete(listItemPos, listItemPos + listItem.nodeSize);
        }

        if (!tr.docChanged) {
            return false;
        }

        var mapped = tr.mapping.map(targetPos, -1);
        mapped = Math.max(1, Math.min(mapped, tr.doc.content.size - 1));
        tr.setSelection(TextSelection.create(tr.doc, mapped));
        tr.scrollIntoView();
        view.dispatch(tr);
        markDirty();
        syncEditorHeight();
        return true;
    }

    function initListBackspaceHandler() {
        if (!editorBodyEl || editorBodyEl.dataset.rgbjListBackspaceInit) {
            return;
        }

        editorBodyEl.dataset.rgbjListBackspaceInit = '1';
        editorBodyEl.addEventListener(
            'keydown',
            function (event) {
                if (event.target.closest('.rgbj-help-editor-inline-image__caption-input')) {
                    return;
                }

                if (event.key !== 'Backspace' || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
                    return;
                }

                var view = getWwEditorView();
                if (!view) {
                    return;
                }

                var sel = view.state.selection;
                if (sel.node && sel.node.type.name === 'image') {
                    return;
                }

                if (!handleEmptyListItemBackspace(view)) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();
            },
            true
        );
    }

    function rgbjHelpListContinuationPlugin(context) {
        var Plugin = context.pmState.Plugin;
        var TextSelection = context.pmState.Selection;
        var InputRule = context.pmRules.InputRule;
        var inputRules = context.pmRules.inputRules;
        var Fragment = context.pmModel.Fragment;

        function listItemDepth($pos) {
            for (var depth = $pos.depth; depth > 0; depth -= 1) {
                if ($pos.node(depth).type.name === 'listItem') {
                    return depth;
                }
            }

            return -1;
        }

        function previousBlockSibling($pos) {
            var index = $pos.index($pos.depth - 1);
            if (index <= 0) {
                return null;
            }

            return $pos.node($pos.depth - 1).child(index - 1);
        }

        function isNumberedStepText(text) {
            return /^\d+\.\s+\S/.test(String(text || '').trim());
        }

        function isOrderedListAutoFormatContext($pos) {
            var prev = previousBlockSibling($pos);
            if (!prev) {
                return false;
            }

            if (prev.type.name === 'heading') {
                return true;
            }

            if (prev.type.name === 'orderedList') {
                return false;
            }

            if (prev.type.name === 'paragraph' && isNumberedStepText(prev.textContent)) {
                return true;
            }

            return false;
        }

        function createListItem(schema, text) {
            var content = text ? schema.text(text) : null;
            return schema.nodes.listItem.create(null, schema.nodes.paragraph.create(null, content));
        }

        function cursorInListParagraph(tr, listPos) {
            return TextSelection.near(tr.doc.resolve(listPos + 2));
        }

        function splitListItemAtSelection(state, dispatch) {
            var schema = state.schema;
            var listItemType = schema.nodes.listItem;
            if (!listItemType) {
                return false;
            }

            var selection = state.selection;
            var $from = selection.$from;
            var $to = selection.$to;
            if ($from.depth < 2 || !$from.sameParent($to)) {
                return false;
            }

            var listItem = $from.node(-1);
            if (listItem.type !== listItemType) {
                return false;
            }

            if ($from.parent.content.size === 0 && listItem.childCount === $from.indexAfter(-1)) {
                return false;
            }

            var tr = state.tr;
            var nextType = $to.pos === $from.end() ? listItem.contentMatchAt(0).defaultType : null;
            var typesAfter = nextType ? [null, { type: nextType }] : undefined;

            tr.delete($from.pos, $to.pos);
            tr.split($from.pos, 2, typesAfter);

            if (!tr.docChanged) {
                return false;
            }

            tr.setSelection(TextSelection.near(tr.doc.resolve($from.pos + 1)));
            dispatch(tr);
            return true;
        }

        function continueMarkdownListInParagraph(state, dispatch) {
            var schema = state.schema;
            var $from = state.selection.$from;
            if ($from.parent.type.name !== 'paragraph' || listItemDepth($from) >= 0) {
                return false;
            }

            var beforeCursor = state.doc.textBetween($from.start(), $from.pos, '\n', '\n');
            var afterCursor = state.doc.textBetween($from.pos, $from.end(), '\n', '\n');
            var bulletMatch = beforeCursor.match(/^(\s*)([-*+])\s+(.*)$/);
            var orderedMatch = beforeCursor.match(/^(\s*)(\d+)\.\s+(.*)$/);
            var match = bulletMatch || orderedMatch;

            if (!match) {
                return false;
            }

            if (orderedMatch && !isOrderedListAutoFormatContext($from)) {
                return false;
            }

            var currentText = match[3] + afterCursor;
            var items = Fragment.from([
                createListItem(schema, currentText),
                createListItem(schema, ''),
            ]);
            var listType = bulletMatch ? schema.nodes.bulletList : schema.nodes.orderedList;
            var listAttrs = orderedMatch ? { order: parseInt(orderedMatch[2], 10) || 1 } : null;
            var list = listType.create(listAttrs, items);
            var listPos = $from.before();
            var tr = state.tr.replaceWith(listPos, $from.after(), list);
            var secondItemPos = listPos + 1 + items.firstChild.nodeSize + 1;

            tr.setSelection(TextSelection.near(tr.doc.resolve(secondItemPos)));
            dispatch(tr);
            return true;
        }

        function startListFromInputRule(state, match, start, end, listTypeName) {
            var schema = state.schema;
            var listType = schema.nodes[listTypeName];
            if (!listType) {
                return null;
            }

            var listItem = createListItem(schema, '');
            var listAttrs = listTypeName === 'orderedList' ? { order: parseInt(match[2], 10) || 1 } : null;
            var list = listType.create(listAttrs, listItem);
            var tr = state.tr.replaceWith(start, end, list);

            tr.setSelection(cursorInListParagraph(tr, start));
            return tr;
        }

        return {
            wysiwygPlugins: [
                function () {
                    return inputRules({
                        rules: [
                            new InputRule(/^(\s*)([-*+])\s$/, function (state, match, start, end) {
                                return startListFromInputRule(state, match, start, end, 'bulletList');
                            }),
                            new InputRule(/^(\s*)(\d+)\.\s$/, function (state, match, start, end) {
                                if (!isOrderedListAutoFormatContext(state.selection.$from)) {
                                    return null;
                                }

                                return startListFromInputRule(state, match, start, end, 'orderedList');
                            }),
                        ],
                    });
                },
                function () {
                    return new Plugin({
                        priority: 200,
                        props: {
                            handleKeyDown: function (view, event) {
                                if (
                                    event.key !== 'Enter' ||
                                    event.shiftKey ||
                                    event.ctrlKey ||
                                    event.metaKey ||
                                    event.altKey
                                ) {
                                    return false;
                                }

                                if (splitListItemAtSelection(view.state, view.dispatch)) {
                                    event.preventDefault();
                                    return true;
                                }

                                if (continueMarkdownListInParagraph(view.state, view.dispatch)) {
                                    event.preventDefault();
                                    return true;
                                }

                                return false;
                            },
                        },
                    });
                },
            ],
        };
    }

    function rgbjHelpHardBreakShortcutPlugin(context) {
        var Plugin = context.pmState.Plugin;

        function canInsertHardBreak(state) {
            if (state.selection.node) {
                return false;
            }

            var $from = state.selection.$from;
            if (!$from.parent.isTextblock) {
                return false;
            }

            if ($from.parent.type.spec.code) {
                return false;
            }

            return !!state.schema.nodes.hardBreak;
        }

        function insertHardBreak(state, dispatch) {
            var hardBreak = state.schema.nodes.hardBreak;
            if (!hardBreak || !canInsertHardBreak(state)) {
                return false;
            }

            dispatch(state.tr.replaceSelectionWith(hardBreak.create()).scrollIntoView());
            return true;
        }

        return {
            wysiwygPlugins: [
                function () {
                    return new Plugin({
                        priority: 250,
                        props: {
                            handleKeyDown: function (view, event) {
                                if (event.key !== 'Enter' || event.shiftKey || event.altKey || !event.ctrlKey) {
                                    return false;
                                }

                                if (insertHardBreak(view.state, view.dispatch)) {
                                    event.preventDefault();
                                    markDirty();
                                    return true;
                                }

                                return false;
                            },
                        },
                    });
                },
            ],
        };
    }

    function blockContainsOnlyImage(node) {
        if (!node || !node.isBlock) {
            return false;
        }

        var hasImage = false;
        var hasMeaningfulText = false;

        node.descendants(function (child) {
            if (child.type.name === 'image') {
                hasImage = true;
            }

            if (child.isText && child.text.replace(/\u200b/g, '').trim() !== '') {
                hasMeaningfulText = true;
            }
        });

        return hasImage && !hasMeaningfulText;
    }

    function isEmptyEditorParagraph(node) {
        if (!node || node.type.name !== 'paragraph') {
            return false;
        }

        return node.textContent.replace(/\u200b/g, '').trim() === '';
    }

    function shouldCenterListImage($pos) {
        var inListItem = false;

        for (var depth = $pos.depth; depth > 0; depth -= 1) {
            if ($pos.node(depth).type.name === 'listItem') {
                inListItem = true;
                break;
            }
        }

        if (!inListItem || $pos.parent.type.name !== 'paragraph') {
            return false;
        }

        var para = $pos.parent;
        var indexInPara = $pos.index();

        if (para.childCount === 1) {
            return true;
        }

        if (indexInPara > 0) {
            var prev = para.child(indexInPara - 1);
            if (prev.type.name === 'hardBreak') {
                return true;
            }
        }

        return false;
    }

    function syncListImageLayoutClasses(view) {
        if (!view || !view.dom) {
            return;
        }

        view.state.doc.descendants(function (node, pos) {
            if (node.type.name !== 'image') {
                return;
            }

            var dom = view.nodeDOM(pos);
            if (!dom || !dom.classList || !dom.classList.contains('rgbj-help-editor-inline-image')) {
                return;
            }

            dom.classList.toggle(
                'rgbj-help-editor-inline-image--centered',
                shouldCenterListImage(view.state.doc.resolve(pos))
            );
        });
    }

    function rgbjHelpListImageLayoutPlugin(context) {
        var Plugin = context.pmState.Plugin;
        var PluginKey = context.pmState.PluginKey;

        return {
            wysiwygPlugins: [
                function () {
                    return new Plugin({
                        key: new PluginKey('rgbjHelpListImageLayout'),
                        view: function (view) {
                            syncListImageLayoutClasses(view);
                            return {
                                update: function (updatedView, prevState) {
                                    if (!prevState.doc.eq(updatedView.state.doc)) {
                                        syncListImageLayoutClasses(updatedView);
                                    }
                                },
                            };
                        },
                    });
                },
            ],
        };
    }

    function moveSelectionBeforeBlock(view, blockPos) {
        if (!view || typeof blockPos !== 'number') {
            return false;
        }

        var schema = view.state.schema;
        var TextSelection = view.state.selection.constructor;
        var tr = view.state.tr;

        if (blockPos > 0) {
            var prev = tr.doc.resolve(blockPos).nodeBefore;
            if (prev && isEmptyEditorParagraph(prev)) {
                tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(1, blockPos - 1)), -1));
                view.dispatch(tr);
                markDirty();
                return true;
            }
        }

        tr.insert(blockPos, schema.nodes.paragraph.create());
        tr.setSelection(TextSelection.near(tr.doc.resolve(blockPos + 1), -1));
        view.dispatch(tr);
        markDirty();
        syncEditorHeight();
        return true;
    }

    function moveSelectionAfterBlock(view, blockPos, blockNode) {
        if (!view || typeof blockPos !== 'number' || !blockNode) {
            return false;
        }

        var schema = view.state.schema;
        var TextSelection = view.state.selection.constructor;
        var tr = view.state.tr;
        var afterPos = blockPos + blockNode.nodeSize;

        if (afterPos < tr.doc.content.size) {
            var next = tr.doc.nodeAt(afterPos);
            if (next && isEmptyEditorParagraph(next)) {
                tr.setSelection(TextSelection.near(tr.doc.resolve(afterPos + 1), 1));
                view.dispatch(tr);
                markDirty();
                return true;
            }
        }

        tr.insert(afterPos, schema.nodes.paragraph.create());
        tr.setSelection(TextSelection.near(tr.doc.resolve(afterPos + 1), 1));
        view.dispatch(tr);
        markDirty();
        syncEditorHeight();
        return true;
    }

    function rgbjHelpInlineImagePlugin(context) {
        var Plugin = context.pmState.Plugin;
        var PluginKey = context.pmState.PluginKey;
        var inlineImagePluginKey = new PluginKey('rgbjHelpInlineImage');

        return {
            wysiwygPlugins: [
                function () {
                    return new Plugin({
                        key: inlineImagePluginKey,
                        appendTransaction: function (transactions, _oldState, newState) {
                            if (
                                !transactions.some(function (tr) {
                                    return tr.docChanged;
                                })
                            ) {
                                return null;
                            }

                            var tr = newState.tr;
                            var changed = false;

                            newState.doc.descendants(function (node, pos) {
                                if (node.type.name !== 'heading' || !blockContainsOnlyImage(node)) {
                                    return;
                                }

                                tr.setNodeMarkup(pos, newState.schema.nodes.paragraph, null);
                                changed = true;
                            });

                            if (!changed) {
                                return null;
                            }

                            tr.setSelection(newState.selection.map(tr.doc, tr.mapping));
                            return tr;
                        },
                    });
                },
            ],
            wysiwygNodeViews: {
                image: function (node, view, getPos) {
                    var wrap = document.createElement('span');
                    wrap.className =
                        'rgbj-help-image-wrap rgbj-help-image-wrap--inline rgbj-help-editor-inline-image';
                    wrap.setAttribute('contenteditable', 'false');

                    var mediaSlot = document.createElement('span');
                    mediaSlot.className = 'rgbj-help-editor-inline-image__media';

                    var img = document.createElement('img');
                    img.className =
                        'rgbj-help-image rgbj-help-image--preview rounded border border-secondary';
                    img.draggable = false;

                    var video = document.createElement('video');
                    video.className =
                        'rgbj-help-video rgbj-help-video--preview rounded border border-secondary';
                    video.controls = true;
                    video.playsInline = true;
                    video.preload = 'metadata';
                    video.style.display = 'none';

                    var captionInput = document.createElement('input');
                    captionInput.type = 'text';
                    captionInput.className =
                        'rgbj-help-editor-inline-image__caption-input form-control form-control-sm';
                    captionInput.placeholder = 'Add a caption…';
                    captionInput.setAttribute('aria-label', 'Caption');

                    mediaSlot.appendChild(img);
                    mediaSlot.appendChild(video);
                    wrap.appendChild(mediaSlot);
                    wrap.appendChild(captionInput);

                    function applyMedia(url, alt) {
                        var resolved = resolveHelpImageUrl(url || '');
                        var isVideo = isHelpVideoPath(resolved || url || '');

                        wrap.classList.toggle('rgbj-help-editor-inline-image--video', isVideo);

                        if (isVideo) {
                            img.style.display = 'none';
                            img.removeAttribute('src');
                            video.style.display = 'block';
                            video.src = resolved;
                        } else {
                            video.style.display = 'none';
                            video.removeAttribute('src');
                            img.style.display = 'block';
                            img.src = resolved;
                            img.alt = alt || '';
                        }
                    }

                    applyMedia(node.attrs.imageUrl || '', node.attrs.altText || '');
                    captionInput.value = node.attrs.altText || '';

                    function syncCaptionFromInput() {
                        if (typeof getPos !== 'function') {
                            return;
                        }

                        var pos = getPos();
                        if (typeof pos !== 'number') {
                            return;
                        }

                        var current = view.state.doc.nodeAt(pos);
                        if (!current || current.type.name !== 'image') {
                            return;
                        }

                        var captionText = captionInput.value.trim();
                        if ((current.attrs.altText || '') === captionText) {
                            return;
                        }

                        view.dispatch(
                            view.state.tr.setNodeMarkup(pos, undefined, {
                                imageUrl: current.attrs.imageUrl,
                                altText: captionText,
                            })
                        );
                        if (!isHelpVideoPath(current.attrs.imageUrl || '')) {
                            img.alt = captionText;
                        }
                        markDirty();
                    }

                    function focusAfterImageCaption() {
                        if (typeof getPos !== 'function') {
                            return;
                        }

                        var pos = getPos();
                        if (typeof pos !== 'number') {
                            return;
                        }

                        syncCaptionFromInput();

                        var doc = view.state.doc;
                        var $pos = doc.resolve(Math.min(pos, doc.content.size));
                        var TextSelection = view.state.selection.constructor;
                        var tr = view.state.tr;

                        for (var depth = $pos.depth; depth > 0; depth -= 1) {
                            if (!$pos.node(depth).isBlock) {
                                continue;
                            }

                            var afterPos = $pos.after(depth);
                            if (afterPos >= tr.doc.content.size) {
                                tr.insert(afterPos, view.state.schema.nodes.paragraph.create());
                            }

                            afterPos = Math.max(1, Math.min(afterPos + 1, tr.doc.content.size - 1));
                            tr.setSelection(TextSelection.near(tr.doc.resolve(afterPos), 1));
                            view.dispatch(tr);
                            view.focus();
                            return;
                        }
                    }

                    captionInput.addEventListener('mousedown', function (event) {
                        event.stopPropagation();
                    });
                    captionInput.addEventListener('focus', function () {
                        var state = view.state;
                        var sel = state.selection;
                        if (!sel.node || sel.node.type.name !== 'image') {
                            return;
                        }

                        if (typeof getPos !== 'function') {
                            return;
                        }

                        var pos = getPos();
                        if (typeof pos !== 'number') {
                            return;
                        }

                        var TextSelection = state.selection.constructor;
                        var $pos = state.doc.resolve(Math.min(pos, state.doc.content.size));
                        view.dispatch(state.tr.setSelection(TextSelection.near($pos, 1)));
                    });
                    captionInput.addEventListener('blur', syncCaptionFromInput);
                    captionInput.addEventListener('keydown', function (event) {
                        if (event.key === 'Backspace' || event.key === 'Delete') {
                            event.stopPropagation();
                            return;
                        }

                        if (event.key === 'Enter') {
                            event.preventDefault();
                            focusAfterImageCaption();
                            return;
                        }

                        if (event.key === 'Escape') {
                            event.preventDefault();
                            var pos = typeof getPos === 'function' ? getPos() : null;
                            var current = typeof pos === 'number' ? view.state.doc.nodeAt(pos) : null;
                            captionInput.value = current && current.attrs ? current.attrs.altText || '' : '';
                            captionInput.blur();
                        }
                    });

                    return {
                        dom: wrap,
                        update: function (updatedNode) {
                            if (updatedNode.type.name !== 'image') {
                                return false;
                            }

                            applyMedia(updatedNode.attrs.imageUrl || '', updatedNode.attrs.altText || '');

                            if (document.activeElement !== captionInput) {
                                captionInput.value = updatedNode.attrs.altText || '';
                            }

                            return true;
                        },
                        selectNode: function () {
                            wrap.classList.add('ProseMirror-selectednode');
                        },
                        deselectNode: function () {
                            wrap.classList.remove('ProseMirror-selectednode');
                        },
                        stopEvent: function (event) {
                            return (
                                captionInput.contains(event.target) ||
                                video.contains(event.target)
                            );
                        },
                        ignoreMutation: function () {
                            return true;
                        },
                    };
                },
            },
            toMarkdownRenderers: {
                image: function (nodeInfo, context) {
                    var result = context.origin ? context.origin() : {};
                    var alt = String(nodeInfo.node.attrs.altText || '');
                    var url = String(nodeInfo.node.attrs.imageUrl || '');

                    return Object.assign({}, result, {
                        text: alt,
                        attrs: Object.assign({}, result.attrs || {}, {
                            imageUrl: url,
                            destination: url,
                        }),
                    });
                },
            },
        };
    }
    function rgbjHelpBlockCursorAffordancePlugin(context) {
        var Plugin = context.pmState.Plugin;
        var PluginKey = context.pmState.PluginKey;
        var Decoration = context.pmView.Decoration;
        var DecorationSet = context.pmView.DecorationSet;
        var blockCursorPluginKey = new PluginKey('rgbjHelpBlockCursor');

        function isBlockCursorAffordanceTarget(node) {
            if (!node || !node.isBlock) {
                return false;
            }

            if (node.type.name === 'table') {
                return true;
            }

            return false;
        }

        function createCursorZone(side, blockPos) {
            var el = document.createElement('div');
            el.className = 'rgbj-help-block-cursor-zone rgbj-help-block-cursor-zone--' + side;
            el.setAttribute('data-rgbj-cursor-side', side);
            el.setAttribute('data-rgbj-block-pos', String(blockPos));
            el.setAttribute('aria-hidden', 'true');
            return el;
        }

        function buildDecorationSet(doc) {
            var decos = [];

            doc.forEach(function (node, offset) {
                if (!isBlockCursorAffordanceTarget(node)) {
                    return;
                }

                decos.push(
                    Decoration.widget(offset, createCursorZone('before', offset), {
                        side: -1,
                        key: 'rgbj-cursor-before-' + offset,
                    })
                );
                decos.push(
                    Decoration.widget(offset + node.nodeSize, createCursorZone('after', offset), {
                        side: 1,
                        key: 'rgbj-cursor-after-' + offset,
                    })
                );
            });

            return DecorationSet.create(doc, decos);
        }

        return {
            wysiwygPlugins: [
                function () {
                    return new Plugin({
                        key: blockCursorPluginKey,
                        state: {
                            init: function (_config, state) {
                                return buildDecorationSet(state.doc);
                            },
                            apply: function (tr, set) {
                                if (!tr.docChanged) {
                                    return set.map(tr.mapping, tr.doc);
                                }

                                return buildDecorationSet(tr.doc);
                            },
                        },
                        props: {
                            decorations: function (state) {
                                return blockCursorPluginKey.getState(state);
                            },
                            handleDOMEvents: {
                                mousedown: function (view, event) {
                                    var target = event.target;
                                    if (!target || !target.closest) {
                                        return false;
                                    }

                                    var zone = target.closest('.rgbj-help-block-cursor-zone');
                                    if (!zone || !view.dom.contains(zone)) {
                                        return false;
                                    }

                                    event.preventDefault();
                                    event.stopPropagation();

                                    clearThematicBreakSelection();

                                    var side = zone.getAttribute('data-rgbj-cursor-side');
                                    var blockPos = parseInt(zone.getAttribute('data-rgbj-block-pos'), 10);
                                    var blockNode = view.state.doc.nodeAt(blockPos);

                                    if (!blockNode) {
                                        return true;
                                    }

                                    if (side === 'before') {
                                        moveSelectionBeforeBlock(view, blockPos);
                                    } else {
                                        moveSelectionAfterBlock(view, blockPos, blockNode);
                                    }

                                    view.focus();
                                    return true;
                                },
                            },
                        },
                    });
                },
            ],
        };
    }

    function rgbjHelpCodeBlockChromePlugin(context) {
        var Plugin = context.pmState.Plugin;
        var PluginKey = context.pmState.PluginKey;
        var Decoration = context.pmView.Decoration;
        var DecorationSet = context.pmView.DecorationSet;

        codeBlockChromePluginKey = new PluginKey('rgbjHelpCodeBlockChrome');

        return {
            wysiwygPlugins: [
                function () {
                    return new Plugin({
                        key: codeBlockChromePluginKey,
                        state: {
                            init: function () {
                                return { expanded: {}, titles: {}, titleByBlockIndex: [] };
                            },
                            apply: function (tr, pluginState) {
                                var meta = tr.getMeta(codeBlockChromePluginKey);
                                if (!meta || (!meta.expanded && !meta.titles && !meta.titleByBlockIndex)) {
                                    return pluginState;
                                }

                                return {
                                    expanded: meta.expanded
                                        ? Object.assign({}, pluginState.expanded || {}, meta.expanded)
                                        : pluginState.expanded || {},
                                    titles: meta.titles
                                        ? Object.assign({}, pluginState.titles || {}, meta.titles)
                                        : pluginState.titles || {},
                                    titleByBlockIndex: meta.titleByBlockIndex
                                        ? meta.titleByBlockIndex.slice()
                                        : pluginState.titleByBlockIndex || [],
                                };
                            },
                        },
                        appendTransaction: function (_transactions, _oldState, newState) {
                            var collected = collectCodeBlockLanguageFixes(newState.doc);
                            if (collected.fixes.length === 0 && Object.keys(collected.titlePatches).length === 0) {
                                return null;
                            }

                            var tr = newState.tr;
                            collected.fixes.forEach(function (fix) {
                                tr.setNodeMarkup(fix.pos, undefined, { language: fix.language });
                            });

                            if (Object.keys(collected.titlePatches).length > 0) {
                                tr.setMeta(codeBlockChromePluginKey, { titles: collected.titlePatches });
                            }

                            return tr;
                        },
                        props: {
                            decorations: function (state) {
                                var pluginState = codeBlockChromePluginKey.getState(state) || {
                                    expanded: {},
                                    titles: {},
                                };
                                var expandedMap = pluginState.expanded || {};
                                var decos = [];

                                state.doc.descendants(function (node, pos) {
                                    if (!isCodeBlockNode(node)) {
                                        return;
                                    }

                                    var key = codeBlockNodeKey(node);
                                    var lines = codeBlockNodeLineCount(node);
                                    var isExpanded = !!expandedMap[key];
                                    var nodeClasses = 'rgbj-help-code-block-chrome';

                                    if (lines > codeFoldVisibleLines) {
                                        nodeClasses += ' rgbj-help-code-fold';
                                        if (!isExpanded) {
                                            nodeClasses += ' is-collapsed';
                                        }
                                    } else {
                                        nodeClasses += ' rgbj-help-code-block-chrome--footerless';
                                    }

                                    decos.push(
                                        Decoration.node(pos, pos + node.nodeSize, {
                                            class: nodeClasses,
                                            style: '--rgbj-code-fold-visible-lines: ' + codeFoldVisibleLines,
                                        })
                                    );

                                    decos.push(
                                        Decoration.widget(
                                            pos,
                                            function () {
                                                return buildCodeBlockBarWidget(node, key, pluginState, state);
                                            },
                                            { side: -1, key: 'rgbj-bar-' + key }
                                        )
                                    );

                                    if (lines > codeFoldVisibleLines) {
                                        var hiddenLines = lines - codeFoldVisibleLines;
                                        decos.push(
                                            Decoration.widget(
                                                pos + node.nodeSize,
                                                function () {
                                                    var footer = document.createElement('div');
                                                    footer.className =
                                                        'rgbj-help-code-block__footer rgbj-help-code-block__footer--widget';
                                                    footer.contentEditable = 'false';

                                                    var toggle = document.createElement('button');
                                                    toggle.type = 'button';
                                                    toggle.className =
                                                        'rgbj-help-code-fold__toggle rgbj-help-code-fold__toggle--widget';
                                                    toggle.contentEditable = 'false';
                                                    toggle.dataset.blockKey = key;
                                                    toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                                                    toggle.innerHTML = buildCodeBlockFoldToggleHtml(hiddenLines);
                                                    if (!isExpanded) {
                                                        toggle.classList.add('is-collapsed');
                                                    }

                                                    footer.appendChild(toggle);
                                                    return footer;
                                                },
                                                { side: 1, key: 'rgbj-toggle-' + key }
                                            )
                                        );
                                    }
                                });

                                return DecorationSet.create(state.doc, decos);
                            },
                        },
                    });
                },
            ],
            toMarkdownRenderers: {
                codeBlock: exportCodeBlockMarkdownRenderer,
                codeblock: exportCodeBlockMarkdownRenderer,
            },
        };
    }

    function toggleCodeBlockFold(blockKey) {
        var view = getWwEditorView();
        if (!view || !codeBlockChromePluginKey || !blockKey) {
            return;
        }

        var pluginState = codeBlockChromePluginKey.getState(view.state) || { expanded: {}, titles: {} };
        var expanded = pluginState.expanded || {};
        var patch = Object.assign({}, expanded);
        patch[blockKey] = !expanded[blockKey];

        view.dispatch(
            view.state.tr.setMeta(codeBlockChromePluginKey, {
                expanded: patch,
            })
        );
    }

    function codeBlockLanguageLabel(language) {
        var lang = String(language || '').trim().toLowerCase();
        if (!lang || lang === 'text' || lang === 'plain') {
            return 'Code';
        }

        var labels = {
            javascript: 'JavaScript',
            js: 'JavaScript',
            html: 'HTML',
            css: 'CSS',
            json: 'JSON',
            bash: 'Bash',
            shell: 'Shell',
            sh: 'Shell',
            php: 'PHP',
            python: 'Python',
            py: 'Python',
            markdown: 'Markdown',
            md: 'Markdown',
            xml: 'XML',
            yaml: 'YAML',
            yml: 'YAML',
        };

        return labels[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
    }

    function buildCodeBlockBarWidget(node, key, pluginState, state) {
        var bar = document.createElement('div');
        bar.className = 'rgbj-help-code-block__bar rgbj-help-code-block__bar--widget';
        bar.contentEditable = 'false';
        bar.dataset.blockKey = key;

        var blockIndex = getCodeBlockIndex(state.doc, node);
        if (blockIndex >= 0) {
            bar.dataset.blockIndex = String(blockIndex);
        }

        var titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'rgbj-help-code-block__title-input';
        titleInput.placeholder = 'Title (optional)';
        titleInput.autocomplete = 'off';
        titleInput.spellcheck = false;
        titleInput.dataset.blockKey = key;
        if (blockIndex >= 0) {
            titleInput.dataset.blockIndex = String(blockIndex);
        }
        titleInput.value = resolveCodeBlockTitle(node, key, pluginState, state.doc);

        var langSelect = document.createElement('select');
        langSelect.className = 'rgbj-help-code-block__language-select';
        langSelect.dataset.blockKey = key;
        langSelect.setAttribute('aria-label', 'Code block language');

        var currentLang = getCodeBlockCleanLanguage(node);
        CODE_BLOCK_LANGUAGES.forEach(function (optionDef) {
            var option = document.createElement('option');
            option.value = optionDef.value;
            option.textContent = optionDef.label;
            if (optionDef.value === currentLang) {
                option.selected = true;
            }
            langSelect.appendChild(option);
        });

        bar.appendChild(titleInput);
        bar.appendChild(langSelect);

        bar.addEventListener('mousedown', function (event) {
            event.stopPropagation();
        });

        return bar;
    }

    function buildCodeBlockFoldToggleHtml(hiddenLines) {
        var showLabel = hiddenLines === 1 ? 'Show 1 more line' : 'Show ' + hiddenLines + ' more lines';
        return (
            '<span class="rgbj-help-code-fold__toggle-show"><i class="bi bi-chevron-down" aria-hidden="true"></i> ' +
            showLabel +
            '</span>' +
            '<span class="rgbj-help-code-fold__toggle-hide"><i class="bi bi-chevron-up" aria-hidden="true"></i> Show less</span>'
        );
    }

    function initEditorCodeBlockChromeEvents() {
        if (!editorBodyEl || editorBodyEl.dataset.rgbjCodeChromeEvents) {
            return;
        }

        editorBodyEl.dataset.rgbjCodeChromeEvents = '1';

        editorBodyEl.addEventListener('click', function (event) {
            var toggle = event.target.closest('.rgbj-help-code-fold__toggle');
            if (toggle && editorBodyEl.contains(toggle) && toggle.dataset.blockKey) {
                event.preventDefault();
                toggleCodeBlockFold(toggle.dataset.blockKey);
            }
        });

        editorBodyEl.addEventListener(
            'blur',
            function (event) {
                var titleInput = event.target.closest('.rgbj-help-code-block__title-input');
                if (!titleInput || !editorBodyEl.contains(titleInput)) {
                    return;
                }

                var blockKey = titleInput.dataset.blockKey || '';
                var blockIndex = parseInt(titleInput.dataset.blockIndex || '-1', 10);
                if (!blockKey) {
                    return;
                }

                updateCodeBlockTitle(blockKey, titleInput.value, blockIndex);
                markDirty();
            },
            true
        );

        editorBodyEl.addEventListener('change', function (event) {
            var langSelect = event.target.closest('.rgbj-help-code-block__language-select');
            if (!langSelect || !editorBodyEl.contains(langSelect)) {
                return;
            }

            var blockKey = langSelect.dataset.blockKey || '';
            if (!blockKey) {
                return;
            }

            updateCodeBlockLanguage(blockKey, langSelect.value);
        });

        editorBodyEl.addEventListener(
            'mousedown',
            function (event) {
                if (event.target.closest('.rgbj-help-code-fold__toggle')) {
                    event.preventDefault();
                    return;
                }

                if (event.target.closest('.rgbj-help-code-block__bar--widget')) {
                    return;
                }

                var active = document.activeElement;
                if (active && active.classList && active.classList.contains('rgbj-help-code-block__title-input')) {
                    active.blur();
                }
            },
            true
        );
    }

    function normalizeCodeFencesInMarkdown(body) {
        return String(body || '').replace(/(```[^\n]*\r?\n[\s\S]*?```)/g, function (fence) {
            return fence.replace(/<br\s*\/?>/gi, '\n');
        });
    }

    function parseMarkdownTableRow(line) {
        line = String(line || '').trim();
        if (line.charAt(0) !== '|') {
            return [];
        }

        line = line.replace(/^\|/, '').replace(/\|$/, '');
        if (line === '') {
            return [''];
        }

        return line.split('|').map(function (cell) {
            return cell.trim();
        });
    }

    function isMarkdownTableSeparatorLine(line) {
        var cells = parseMarkdownTableRow(line);
        if (cells.length === 0) {
            return false;
        }

        return cells.every(function (cell) {
            return /^:?-+:?$/.test(cell);
        });
    }

    function splitTwoColumnTableCell(text) {
        text = String(text || '').trim();
        if (text === '') {
            return ['', ''];
        }

        var match = text.match(
            /^(.+?)\s+((?:Spaces|Lines|Moves|Mirrors|Resizes|Toggles|Treats|Turn|Adjust|Shows|Snaps|Breaks|Paints|Scales|Groups|Ungroups|While|Each|LED|Fill|Match|Group|Ungroup|Snap|Show|Center|Flip|Distribute|Align).+)$/
        );
        if (match) {
            return [match[1].trim(), match[2].trim()];
        }

        return [text, ''];
    }

    function formatMarkdownTableRow(cells) {
        return '| ' + cells.join(' | ') + ' |';
    }

    function normalizeHelpTableBlock(block) {
        if (block.length === 0) {
            return block;
        }

        var headerCells = parseMarkdownTableRow(block[0]);
        var columnCount = headerCells.length;
        if (columnCount === 0) {
            return block;
        }

        if (block.length >= 2 && !isMarkdownTableSeparatorLine(block[1])) {
            block.splice(
                1,
                0,
                formatMarkdownTableRow(
                    headerCells.map(function () {
                        return '---';
                    })
                )
            );
        }

        var dataStart = isMarkdownTableSeparatorLine(block[1]) ? 2 : 1;
        for (var i = dataStart; i < block.length; i += 1) {
            if (isMarkdownTableSeparatorLine(block[i])) {
                continue;
            }

            var cells = parseMarkdownTableRow(block[i]);
            if (cells.length >= columnCount) {
                continue;
            }

            if (columnCount === 2 && cells.length === 1) {
                cells = splitTwoColumnTableCell(cells[0]);
            }

            while (cells.length < columnCount) {
                cells.push('');
            }
            block[i] = formatMarkdownTableRow(cells.slice(0, columnCount));
        }

        return block;
    }

    function normalizeHelpTablesInMarkdown(body) {
        var lines = String(body || '').split('\n');
        var out = [];
        var index = 0;

        while (index < lines.length) {
            var line = lines[index];
            if (!/^\s*\|/.test(line)) {
                out.push(line);
                index += 1;
                continue;
            }

            var block = [];
            while (index < lines.length && /^\s*\|/.test(lines[index])) {
                block.push(lines[index]);
                index += 1;
            }

            out.push.apply(out, normalizeHelpTableBlock(block));
        }

        return out.join('\n');
    }

    function isMarkdownBlockStarterLine(line) {
        var trimmed = String(line || '').trim();
        return (
            trimmed === '' ||
            /^#{1,6}\s/.test(trimmed) ||
            /^>\s?/.test(trimmed) ||
            /^[-*+]\s/.test(trimmed) ||
            /^\d+\.\s/.test(trimmed) ||
            /^!\[/.test(trimmed) ||
            /^(```|~~~)/.test(trimmed) ||
            /^(?:-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed) ||
            /^\|/.test(trimmed)
        );
    }

    function expandSingleNewlineParagraphBreaks(body) {
        body = normalizeLineEndings(body);
        var lines = body.split('\n');
        var out = [];
        var inFence = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var trimmed = line.trim();

            if (/^```/.test(trimmed)) {
                inFence = !inFence;
                out.push(line);
                continue;
            }

            if (inFence) {
                out.push(line);
                continue;
            }

            if (trimmed !== '' && !isMarkdownBlockStarterLine(trimmed) && out.length > 0) {
                var prev = out[out.length - 1];
                if (prev && prev.trim() !== '' && !isMarkdownBlockStarterLine(prev)) {
                    if (/[.!?)]["']?\s*$/.test(prev.trim()) && /^[A-Z*]/.test(trimmed)) {
                        out.push('');
                    }
                }
            }

            out.push(line);
        }

        return out.join('\n');
    }

    function sanitizeMarkdownBodyForSave(body) {
        body = normalizeLineEndings(body);
        body = normalizeCodeFencesInMarkdown(body);
        body = normalizeHelpTablesInMarkdown(body);
        body = expandSingleNewlineParagraphBreaks(body);
        body = repairNewTabLinksInMarkdown(body);
        body = relativizeImagePathsForSave(body);
        body = body.replace(/\\(\.)/g, '$1');
        return body;
    }

    function absolutizeImagePathsForEditor(body) {
        return String(body || '').replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_match, alt, src) {
            src = String(src || '').trim();
            if (src === '' || /^https?:\/\//i.test(src) || src.indexOf('data:') === 0) {
                return _match;
            }

            return '![' + alt + '](' + resolveHelpImageUrl(src) + ')';
        });
    }

    function relativizeImagePathsForSave(body) {
        body = String(body || '');
        if (!contentBaseUrl) {
            return body;
        }

        try {
            var base = new URL(helpContentBaseUrl());
            return body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_match, alt, src) {
                src = String(src || '').trim();
                if (src === '' || !/^https?:\/\//i.test(src)) {
                    return _match;
                }

                try {
                    var url = new URL(src);
                    if (url.origin !== window.location.origin) {
                        return _match;
                    }

                    var relative = url.pathname;
                    if (relative.indexOf(base.pathname) === 0) {
                        relative = relative.slice(base.pathname.length).replace(/^\//, '');
                    } else {
                        return _match;
                    }

                    return '![' + alt + '](' + relative + ')';
                } catch (err) {
                    return _match;
                }
            });
        } catch (err) {
            return body;
        }
    }

    function markDirty() {
        dirty = true;
        setStatus('Unsaved changes.');
    }

    function setStatus(message, isError) {
        if (!statusEl) {
            return;
        }

        if (statusHideTimer) {
            window.clearTimeout(statusHideTimer);
            statusHideTimer = null;
        }
        if (statusFadeTimer) {
            window.clearTimeout(statusFadeTimer);
            statusFadeTimer = null;
        }

        statusEl.textContent = message;
        statusEl.classList.remove('is-hiding');
        statusEl.classList.add('is-visible');
        statusEl.classList.toggle('is-error', !!isError);
        statusEl.classList.toggle('is-success', !isError && /^Saved /.test(message));
        statusEl.classList.toggle('is-selectable', !!isError);
        statusEl.title = isError && message.length > 120 ? message : '';

        if (isError || message === 'Unsaved changes.') {
            return;
        }

        statusHideTimer = window.setTimeout(function () {
            statusEl.classList.add('is-hiding');
            statusFadeTimer = window.setTimeout(function () {
                statusEl.classList.remove('is-visible', 'is-hiding', 'is-success', 'is-error', 'is-selectable');
                statusEl.textContent = '';
                statusEl.title = '';
            }, STATUS_FADE_MS);
        }, STATUS_SHOW_MS);
    }

    function showLoading(show) {
        loadingEl.classList.toggle('d-none', !show);
    }

    function showDenied(show) {
        deniedEl.classList.toggle('d-none', !show);
    }

    function showApp(show) {
        appEl.classList.toggle('d-none', !show);
    }

    async function getIdToken() {
        var user = auth.currentUser;
        if (!user) {
            throw new Error('Not signed in.');
        }
        return user.getIdToken();
    }

    async function apiFetch(path, options) {
        options = options || {};
        var headers = Object.assign({}, options.headers || {});
        if (options.auth !== false) {
            var token = await getIdToken();
            headers.Authorization = 'Bearer ' + token;
            headers['X-RGBJ-Auth'] = token;
        }
        if (options.body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        var url = apiUrl + (path || '');
        var response = await fetch(url, {
            method: options.method || 'GET',
            headers: headers,
            body: options.body,
        });

        var raw = await response.text();
        var data = {};
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch (parseErr) {
                if (!response.ok) {
                    throw new Error('Server error (' + response.status + ').');
                }
                throw new Error('Unexpected server response. Check that the Help API is reachable.');
            }
        }

        if (!response.ok) {
            throw new Error(data.error || 'Request failed (' + response.status + ').');
        }

        return data;
    }

    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(String(reader.result || ''));
            };
            reader.onerror = function () {
                reject(new Error('Could not read image file.'));
            };
            reader.readAsDataURL(file);
        });
    }

    async function uploadImageApiFetch(body) {
        var token = await getIdToken();
        var response = await fetch(uploadImageUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
                'X-RGBJ-Auth': token,
            },
            body: JSON.stringify(body),
        });

        var raw = await response.text();
        var data = {};
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch (parseErr) {
                if (!response.ok) {
                    throw new Error('Server error (' + response.status + ').');
                }
                throw new Error('Unexpected upload response.');
            }
        }

        if (!response.ok) {
            throw new Error(data.error || 'Upload failed (' + response.status + ').');
        }

        return data;
    }

    function closeEditorPopup() {
        if (editor && editor.eventEmitter && typeof editor.eventEmitter.emit === 'function') {
            editor.eventEmitter.emit('closePopup');
            return;
        }

        var popup = editorBodyEl ? editorBodyEl.querySelector('.toastui-editor-popup') : null;
        var cancelBtn = popup ? popup.querySelector('.toastui-editor-close-button') : null;
        if (cancelBtn) {
            cancelBtn.click();
        }
    }

    function insertImageMarkdown(markdownSnippet, options) {
        options = options || {};

        if (!editor) {
            return;
        }

        var snippet = String(markdownSnippet || '').trim();
        if (snippet === '') {
            return;
        }

        var match = snippet.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (match) {
            editor.exec('addImage', {
                imageUrl: resolveHelpImageUrl(match[2]),
                altText: match[1] || '',
            });
        } else {
            editor.insertText(snippet);
        }

        markDirty();

        if (options && options.closePopup) {
            closeEditorPopup();
        }
    }

    async function uploadImageFile(file) {
        if (!file || !file.type) {
            throw new Error('Only image or video files can be uploaded.');
        }

        var isImage = file.type.indexOf('image/') === 0;
        var isVideo = file.type.indexOf('video/') === 0;
        if (!isImage && !isVideo) {
            throw new Error('Only image or video files can be uploaded.');
        }

        var dataUrl = await fileToBase64(file);
        return uploadImageApiFetch({
            data: dataUrl,
            mime: file.type,
            name: file.name || (isVideo ? 'pasted-video' : 'pasted-image'),
        });
    }

    async function uploadPastedImage(file) {
        if (!editor || !uploadImageUrl || imageUploadBusy) {
            return;
        }

        imageUploadBusy = true;
        setStatus('Uploading…');

        try {
            var result = await uploadImageFile(file);
            insertImageMarkdown(result.markdown || ('![](' + (result.path || '') + ')'));
            var label = result.type === 'video' ? 'Video' : 'Image';
            setStatus(label + ' saved to ' + (result.path || result.filename) + '. Save the article to keep the Markdown link.');
            refreshOpenImageLibrary();
        } catch (err) {
            setStatus(err.message || 'Upload failed.', true);
        } finally {
            imageUploadBusy = false;
        }
    }

    function handleImageBlobHook(blob, callback) {
        if (!uploadImageUrl || imageUploadBusy) {
            return;
        }

        imageUploadBusy = true;
        setStatus('Uploading…');

        var defaultType = blob && blob.type ? blob.type : 'image/png';
        var defaultExt = (defaultType.split('/')[1] || 'png').replace(/[^a-z0-9]+/gi, '');
        var file = blob instanceof File
            ? blob
            : new File([blob], 'pasted-media.' + (defaultExt || 'bin'), { type: defaultType });

        uploadImageFile(file)
            .then(function (result) {
                var alt = pathInfoName(result.filename || result.path || 'media');
                callback(resolveHelpImageUrl(result.path || result.url), alt);
                var label = result.type === 'video' ? 'Video' : 'Image';
                setStatus(label + ' saved to ' + (result.path || result.filename) + '. Save the article to keep the Markdown link.');
                refreshOpenImageLibrary();
            })
            .catch(function (err) {
                setStatus(err.message || 'Upload failed.', true);
            })
            .finally(function () {
                imageUploadBusy = false;
            });
    }

    function pathInfoName(path) {
        var name = String(path || '').split('/').pop() || 'image';
        return name.replace(/\.[^.]+$/, '');
    }

    function formatImageSize(bytes) {
        bytes = Number(bytes) || 0;
        if (bytes < 1024) {
            return bytes + ' B';
        }
        if (bytes < 1024 * 1024) {
            return Math.round(bytes / 1024) + ' KB';
        }
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async function deleteImage(filename) {
        if (!imagesUrl || !filename) {
            return;
        }

        if (!window.confirm('Delete “' + filename + '” from the server? Articles that reference it will show broken media.')) {
            return;
        }

        setStatus('Deleting file…');

        try {
            var token = await getIdToken();
            var response = await fetch(imagesUrl + '?filename=' + encodeURIComponent(filename), {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + token,
                    'X-RGBJ-Auth': token,
                },
            });
            var data = await response.json().catch(function () {
                return {};
            });
            if (!response.ok) {
                throw new Error(data.error || 'Delete failed (' + response.status + ').');
            }

            await refreshOpenImageLibrary();
            setStatus('Deleted ' + filename + '.');
        } catch (err) {
            setStatus(err.message || 'Could not delete file.', true);
        }
    }

    function refreshOpenImageLibrary() {
        if (!editorBodyEl) {
            return;
        }

        var grid = editorBodyEl.querySelector(
            '.rgbj-help-image-popup [data-rgbj-panel="library"] .rgbj-help-images-grid'
        );
        if (grid) {
            loadImageLibrary(grid, { closePopupOnInsert: true });
        }
    }

    async function loadImageLibrary(gridEl, options) {
        options = options || {};

        if (!gridEl || !imagesUrl) {
            return;
        }

        gridEl.innerHTML = '<p class="small text-body-secondary mb-0">Loading media…</p>';

        try {
            var token = await getIdToken();
            var response = await fetch(imagesUrl, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    'X-RGBJ-Auth': token,
                },
            });
            var data = await response.json().catch(function () {
                return {};
            });
            if (!response.ok) {
                throw new Error(data.error || 'Could not load media library.');
            }

            var images = Array.isArray(data.images) ? data.images : [];
            if (images.length === 0) {
                gridEl.innerHTML = '<p class="small text-body-secondary mb-0">No media yet. Upload a file or paste an image into the editor.</p>';
                return;
            }

            gridEl.innerHTML = '';
            images.forEach(function (image) {
                var isVideo = image.type === 'video' || isHelpVideoPath(image.path || image.filename || '');
                var item = document.createElement('div');
                item.className = 'rgbj-help-images-grid__item' + (isVideo ? ' rgbj-help-images-grid__item--video' : '');

                var deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.className = 'rgbj-help-images-grid__delete';
                deleteBtn.title = 'Delete ' + image.filename;
                deleteBtn.setAttribute('aria-label', 'Delete ' + image.filename);
                deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                deleteBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    deleteImage(image.filename);
                });

                var pickBtn = document.createElement('button');
                pickBtn.type = 'button';
                pickBtn.className = 'rgbj-help-images-grid__pick';
                pickBtn.title = 'Insert ' + image.path;

                var thumbWrap = document.createElement('div');
                thumbWrap.className = 'rgbj-help-images-grid__thumb';

                if (isVideo) {
                    var videoThumb = document.createElement('video');
                    videoThumb.src = image.url;
                    videoThumb.muted = true;
                    videoThumb.playsInline = true;
                    videoThumb.preload = 'metadata';
                    videoThumb.setAttribute('aria-hidden', 'true');
                    thumbWrap.appendChild(videoThumb);

                    var badge = document.createElement('span');
                    badge.className = 'rgbj-help-images-grid__badge';
                    badge.textContent = 'Video';
                    thumbWrap.appendChild(badge);
                } else {
                    var thumb = document.createElement('img');
                    thumb.src = image.url;
                    thumb.alt = '';
                    thumb.loading = 'lazy';
                    thumb.decoding = 'async';
                    thumbWrap.appendChild(thumb);
                }

                var caption = document.createElement('span');
                caption.className = 'rgbj-help-images-grid__caption';
                caption.textContent = image.filename;

                var meta = document.createElement('span');
                meta.className = 'rgbj-help-images-grid__meta';
                meta.textContent = formatImageSize(image.size);

                pickBtn.appendChild(thumbWrap);
                pickBtn.appendChild(caption);
                pickBtn.appendChild(meta);
                pickBtn.addEventListener('click', function () {
                    insertImageMarkdown(
                        image.markdown || ('![](' + image.path + ')'),
                        { closePopup: !!options.closePopupOnInsert }
                    );
                    setStatus('Inserted ' + image.path + '. Save the article to keep the link.');
                });

                item.appendChild(deleteBtn);
                item.appendChild(pickBtn);
                gridEl.appendChild(item);
            });
        } catch (err) {
            gridEl.innerHTML = '<p class="small text-danger mb-0">' + (err.message || 'Could not load media library.') + '</p>';
        }
    }

    var imagePopupBodyEl = null;
    var imagePopupActiveTab = 'file';

    function setImagePopupTab(tabName) {
        if (!imagePopupBodyEl) {
            return;
        }

        imagePopupActiveTab = tabName;

        imagePopupBodyEl.querySelectorAll('[data-rgbj-tab]').forEach(function (tab) {
            var isActive = tab.getAttribute('data-rgbj-tab') === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        imagePopupBodyEl.querySelectorAll('[data-rgbj-panel]').forEach(function (panel) {
            panel.style.display = panel.getAttribute('data-rgbj-panel') === tabName ? 'block' : 'none';
        });

        var sharedFields = imagePopupBodyEl.querySelector('.rgbj-help-image-popup__shared');
        var buttonRow = imagePopupBodyEl.querySelector('.toastui-editor-button-container');
        if (sharedFields) {
            sharedFields.style.display = tabName === 'library' ? 'none' : 'block';
        }
        if (buttonRow) {
            buttonRow.style.display = tabName === 'library' ? 'none' : 'block';
        }

        if (tabName === 'library') {
            var libraryGrid = imagePopupBodyEl.querySelector('[data-rgbj-panel="library"] .rgbj-help-images-grid');
            if (libraryGrid) {
                loadImageLibrary(libraryGrid, { closePopupOnInsert: true });
            }
        }
    }

    function resetImagePopupForm() {
        if (!imagePopupBodyEl) {
            return;
        }

        imagePopupActiveTab = 'file';
        var urlInput = imagePopupBodyEl.querySelector('#rgbj-help-image-url');
        var altInput = imagePopupBodyEl.querySelector('#rgbj-help-image-alt');
        var fileInput = imagePopupBodyEl.querySelector('#rgbj-help-image-file');
        var fileNameEl = imagePopupBodyEl.querySelector('.toastui-editor-file-name');

        if (urlInput) {
            urlInput.value = '';
            urlInput.classList.remove('wrong');
        }
        if (altInput) {
            altInput.value = '';
        }
        if (fileInput) {
            fileInput.value = '';
        }
        if (fileNameEl) {
            fileNameEl.textContent = 'No file';
            fileNameEl.classList.add('wrong');
            fileNameEl.classList.remove('has-file');
        }

        setImagePopupTab('file');
    }

    function submitImagePopup() {
        if (!editor || !imagePopupBodyEl || imagePopupActiveTab === 'library') {
            return;
        }

        var altInput = imagePopupBodyEl.querySelector('#rgbj-help-image-alt');
        var altText = altInput ? altInput.value.trim() : '';

        if (imagePopupActiveTab === 'url') {
            var urlInput = imagePopupBodyEl.querySelector('#rgbj-help-image-url');
            var imageUrl = urlInput ? urlInput.value.trim() : '';
            urlInput.classList.remove('wrong');

            if (imageUrl === '') {
                if (urlInput) {
                    urlInput.classList.add('wrong');
                }
                return;
            }

            editor.exec('addImage', {
                imageUrl: imageUrl,
                altText: altText,
            });
            markDirty();
            closeEditorPopup();
            return;
        }

        var fileInput = imagePopupBodyEl.querySelector('#rgbj-help-image-file');
        var files = fileInput ? fileInput.files : null;
        if (!files || !files.length) {
            var fileNameEl = imagePopupBodyEl.querySelector('.toastui-editor-file-name');
            if (fileNameEl) {
                fileNameEl.classList.add('wrong');
            }
            return;
        }

        if (!editor.eventEmitter || typeof editor.eventEmitter.emit !== 'function') {
            return;
        }

        editor.eventEmitter.emit('addImageBlobHook', files[0], function (url, text) {
            editor.exec('addImage', {
                imageUrl: url,
                altText: altText || text,
            });
            markDirty();
            closeEditorPopup();
        }, 'ui');
    }

    function buildImagePopupBody() {
        var container = document.createElement('div');
        container.className = 'rgbj-help-image-popup';
        container.setAttribute('aria-label', 'Insert image or video');

        var tabs = document.createElement('div');
        tabs.className = 'toastui-editor-tabs';
        tabs.setAttribute('aria-role', 'tabpanel');

        [
            { id: 'file', label: 'File' },
            { id: 'url', label: 'URL' },
            { id: 'library', label: 'Library' },
        ].forEach(function (tabInfo, index) {
            var tab = document.createElement('div');
            tab.className = 'tab-item' + (index === 0 ? ' active' : '');
            tab.setAttribute('data-rgbj-tab', tabInfo.id);
            tab.setAttribute('aria-role', 'tab');
            tab.setAttribute('aria-label', tabInfo.label);
            tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
            tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
            tab.textContent = tabInfo.label;
            tab.addEventListener('click', function (event) {
                event.preventDefault();
                setImagePopupTab(tabInfo.id);
            });
            tabs.appendChild(tab);
        });

        var urlPanel = document.createElement('div');
        urlPanel.setAttribute('data-rgbj-panel', 'url');
        urlPanel.style.display = 'none';
        urlPanel.innerHTML =
            '<label for="rgbj-help-image-url">Image or video URL</label>' +
            '<input id="rgbj-help-image-url" type="text" autocomplete="off">';

        var filePanel = document.createElement('div');
        filePanel.setAttribute('data-rgbj-panel', 'file');
        filePanel.className = 'rgbj-help-image-popup__file-panel';
        filePanel.innerHTML =
            '<label for="rgbj-help-image-file">Select image or video file</label>' +
            '<span class="toastui-editor-file-name wrong">No file</span>' +
            '<button type="button" class="toastui-editor-file-select-button">Choose a file</button>' +
            '<input id="rgbj-help-image-file" type="file" accept="image/*,video/mp4,video/webm,video/ogg">';

        var libraryPanel = document.createElement('div');
        libraryPanel.setAttribute('data-rgbj-panel', 'library');
        libraryPanel.className = 'rgbj-help-image-library-panel';
        libraryPanel.style.display = 'none';

        var libraryHeader = document.createElement('div');
        libraryHeader.className = 'rgbj-help-image-library-panel__header';

        var libraryHint = document.createElement('p');
        libraryHint.className = 'small text-body-secondary mb-0 rgbj-help-image-library-panel__hint';
        libraryHint.innerHTML = 'Files in <code>help/content/images/</code> and <code>help/content/media/</code>. Click a thumbnail to insert.';

        var libraryRefreshBtn = document.createElement('button');
        libraryRefreshBtn.type = 'button';
        libraryRefreshBtn.className = 'btn btn-sm btn-outline-secondary';
        libraryRefreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Refresh';
        libraryRefreshBtn.addEventListener('click', function () {
            var grid = libraryPanel.querySelector('.rgbj-help-images-grid');
            if (grid) {
                loadImageLibrary(grid, { closePopupOnInsert: true });
            }
        });

        libraryHeader.appendChild(libraryHint);
        libraryHeader.appendChild(libraryRefreshBtn);

        var libraryGrid = document.createElement('div');
        libraryGrid.className = 'rgbj-help-images-grid';

        libraryPanel.appendChild(libraryHeader);
        libraryPanel.appendChild(libraryGrid);

        var sharedFields = document.createElement('div');
        sharedFields.className = 'rgbj-help-image-popup__shared';
        sharedFields.innerHTML =
            '<label for="rgbj-help-image-alt">Caption</label>' +
            '<input id="rgbj-help-image-alt" type="text" autocomplete="off" placeholder="Optional caption shown below the image or video">';

        var buttonRow = document.createElement('div');
        buttonRow.className = 'toastui-editor-button-container';

        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'toastui-editor-close-button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', function (event) {
            event.preventDefault();
            closeEditorPopup();
        });

        var okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'toastui-editor-ok-button';
        okBtn.textContent = 'OK';
        okBtn.addEventListener('click', function (event) {
            event.preventDefault();
            submitImagePopup();
        });

        buttonRow.appendChild(cancelBtn);
        buttonRow.appendChild(okBtn);

        container.appendChild(tabs);
        container.appendChild(urlPanel);
        container.appendChild(filePanel);
        container.appendChild(libraryPanel);
        container.appendChild(sharedFields);
        container.appendChild(buttonRow);

        var fileInput = filePanel.querySelector('#rgbj-help-image-file');
        var fileNameEl = filePanel.querySelector('.toastui-editor-file-name');
        var fileButton = filePanel.querySelector('.toastui-editor-file-select-button');

        if (fileButton && fileInput) {
            fileButton.addEventListener('click', function (event) {
                event.preventDefault();
                fileInput.click();
            });
            fileInput.addEventListener('change', function () {
                if (!fileNameEl) {
                    return;
                }
                if (fileInput.files && fileInput.files.length) {
                    fileNameEl.textContent = fileInput.files[0].name;
                    fileNameEl.classList.remove('wrong');
                    fileNameEl.classList.add('has-file');
                    return;
                }
                fileNameEl.textContent = 'No file';
                fileNameEl.classList.add('wrong');
                fileNameEl.classList.remove('has-file');
            });
        }

        imagePopupBodyEl = container;
        return container;
    }

    function buildImageToolbarItem() {
        return {
            name: 'image',
            tooltip: 'Insert image or video',
            className: 'image toastui-editor-toolbar-icons',
            popup: {
                className: 'toastui-editor-popup-add-image',
                body: buildImagePopupBody(),
                style: { width: '520px' },
            },
        };
    }

    function initImagePopupLibrary() {
        var toolbar = getEditorToolbar();
        var imageBtn = toolbar ? toolbar.querySelector('button.image') : null;
        if (!imageBtn || imageBtn.dataset.rgbjImagePopupInit) {
            return;
        }

        imageBtn.dataset.rgbjImagePopupInit = '1';
        imageBtn.addEventListener('click', function () {
            window.setTimeout(resetImagePopupForm, 0);
        });
    }

    var linkPopupBodyEl = null;
    var linkEditContext = null;

    function escapeHtmlAttr(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function escapeHtmlText(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function getLinkMarkTextNode(nodeInfo) {
        if (!nodeInfo) {
            return null;
        }

        if (nodeInfo.node && nodeInfo.node.isText) {
            return nodeInfo.node;
        }

        if (nodeInfo.parent && nodeInfo.parent.isText) {
            return nodeInfo.parent;
        }

        return null;
    }

    function buildLinkInnerHtmlFromTextNode(textNode, linkType) {
        if (!textNode || !textNode.isText) {
            return '';
        }

        var text = String(textNode.text || '');
        if (text === '') {
            return '';
        }

        var marks = textNode.marks.filter(function (mark) {
            return mark.type !== linkType;
        });
        var inner = escapeHtmlText(text);
        var hasCode = marks.some(function (mark) {
            return mark.type.name === 'code';
        });
        var hasStrong = marks.some(function (mark) {
            return mark.type.name === 'strong';
        });
        var hasEm = marks.some(function (mark) {
            return mark.type.name === 'em';
        });

        if (hasCode) {
            return '<code>' + inner + '</code>';
        }

        if (hasStrong) {
            inner = '<strong>' + inner + '</strong>';
        }

        if (hasEm) {
            inner = '<em>' + inner + '</em>';
        }

        return inner;
    }

    function repairNewTabLinksInMarkdown(body) {
        body = String(body || '');

        body = body.replace(
            /<a\s+[^>]*?\shref=(["'])([^"']+)\1[^>]*\starget\s*=\s*["']?_blank[^>]*>\s*<\/a>`([^`]+)`<a\s+[^>]*?\shref=\1[^"']+\1[^>]*\starget\s*=\s*["']?_blank[^>]*>\s*<\/a>/gi,
            function (_match, _quote, url, codeText) {
                return (
                    '<a href="' +
                    url +
                    '" target="_blank" rel="noopener noreferrer"><code>' +
                    escapeHtmlText(codeText) +
                    '</code></a>'
                );
            }
        );

        body = body.replace(
            /<a\s+[^>]*?\shref=(["'])([^"']+)\1[^>]*\starget\s*=\s*["']?_blank[^>]*>\s*<\/a>([^<`]+?)<a\s+[^>]*?\shref=\1[^"']+\1[^>]*\starget\s*=\s*["']?_blank[^>]*>\s*<\/a>/gi,
            function (_match, _quote, url, plainText) {
                return (
                    '<a href="' +
                    url +
                    '" target="_blank" rel="noopener noreferrer">' +
                    escapeHtmlText(plainText) +
                    '</a>'
                );
            }
        );

        body = body.replace(
            /(<a\s+[^>]*?\starget\s*=\s*["']?_blank[^>]*><code>([^<]+)<\/code><\/a>)`([^`]+)`/gi,
            function (match, anchor, innerText, backtickText) {
                return innerText === backtickText ? anchor : match;
            }
        );

        return body;
    }

    function getLinkMarkRange(doc, pos, markType) {
        if (!markType) {
            return null;
        }

        pos = Math.max(0, Math.min(pos, doc.content.size));
        var $pos = doc.resolve(pos);
        if (!$pos.parent || !$pos.parent.isTextblock) {
            return null;
        }

        var parent = $pos.parent;
        var parentStart = $pos.start();
        var segment = parent.childAfter($pos.parentOffset);

        if (!segment.node || !markType.isInSet(segment.node.marks)) {
            segment = parent.childBefore($pos.parentOffset);
        }

        if (!segment.node || !markType.isInSet(segment.node.marks)) {
            return null;
        }

        var startIndex = segment.index;
        var endIndex = startIndex + 1;
        var from = parentStart + segment.offset;
        var to = from + segment.node.nodeSize;

        while (startIndex > 0 && markType.isInSet(parent.child(startIndex - 1).marks)) {
            startIndex -= 1;
            from -= parent.child(startIndex).nodeSize;
        }

        while (endIndex < parent.childCount && markType.isInSet(parent.child(endIndex).marks)) {
            to += parent.child(endIndex).nodeSize;
            endIndex += 1;
        }

        return { from: from, to: to };
    }

    function findLinkMarkInRange(doc, from, to, markType) {
        var found = null;

        doc.nodesBetween(from, to, function (node) {
            if (found || !node.isText) {
                return;
            }

            found = markType.isInSet(node.marks);
        });

        return found;
    }

    function getLinkEditContext(view) {
        if (!view) {
            return {
                from: 0,
                to: 0,
                linkUrl: '',
                linkText: '',
                openInNewTab: false,
            };
        }

        var state = view.state;
        var linkType = state.schema.marks.link;
        if (!linkType) {
            return {
                from: state.selection.from,
                to: state.selection.to,
                linkUrl: '',
                linkText: state.doc.textBetween(state.selection.from, state.selection.to, ' '),
                openInNewTab: false,
            };
        }

        var from = state.selection.from;
        var to = state.selection.to;
        var range = getLinkMarkRange(state.doc, from, linkType);

        if (!range && to > from) {
            range = getLinkMarkRange(state.doc, to - 1, linkType);
        }

        if (range) {
            from = range.from;
            to = range.to;
        }

        var linkMark = findLinkMarkInRange(state.doc, from, to, linkType);

        if (!linkMark) {
            return {
                from: state.selection.from,
                to: state.selection.to,
                linkUrl: '',
                linkText: state.doc.textBetween(state.selection.from, state.selection.to, ' '),
                openInNewTab: false,
            };
        }

        var htmlAttrs = linkMark.attrs.htmlAttrs || null;
        return {
            from: from,
            to: to,
            linkUrl: String(linkMark.attrs.linkUrl || ''),
            linkText: state.doc.textBetween(from, to, ''),
            openInNewTab: !!(htmlAttrs && htmlAttrs.target === '_blank'),
        };
    }

    function resetLinkPopupForm() {
        if (!linkPopupBodyEl) {
            return;
        }

        linkEditContext = getLinkEditContext(getWwEditorView());

        var urlInput = linkPopupBodyEl.querySelector('#rgbj-help-link-url');
        var textInput = linkPopupBodyEl.querySelector('#rgbj-help-link-text');
        var newTabInput = linkPopupBodyEl.querySelector('#rgbj-help-link-new-tab');

        if (urlInput) {
            urlInput.value = linkEditContext.linkUrl || '';
            urlInput.classList.remove('wrong');
        }
        if (textInput) {
            textInput.value = linkEditContext.linkText || '';
        }
        if (newTabInput) {
            newTabInput.checked = !!linkEditContext.openInNewTab;
        }
    }

    function submitLinkPopup() {
        if (!editor || !linkPopupBodyEl) {
            return;
        }

        var urlInput = linkPopupBodyEl.querySelector('#rgbj-help-link-url');
        var textInput = linkPopupBodyEl.querySelector('#rgbj-help-link-text');
        var newTabInput = linkPopupBodyEl.querySelector('#rgbj-help-link-new-tab');
        var linkUrl = urlInput ? urlInput.value.trim() : '';
        var linkText = textInput ? textInput.value.trim() : '';
        var openInNewTab = !!(newTabInput && newTabInput.checked);

        if (urlInput) {
            urlInput.classList.remove('wrong');
        }

        if (linkUrl === '') {
            if (urlInput) {
                urlInput.classList.add('wrong');
            }
            return;
        }

        if (linkText === '') {
            linkText = linkUrl;
        }

        var context = linkEditContext || getLinkEditContext(getWwEditorView());
        editor.exec('rgbjAddLink', {
            linkUrl: linkUrl,
            linkText: linkText,
            openInNewTab: openInNewTab,
            from: context.from,
            to: context.to,
        });
        markDirty();
        closeEditorPopup();
    }

    function buildLinkPopupBody() {
        var container = document.createElement('div');
        container.className = 'rgbj-help-link-popup';
        container.setAttribute('aria-label', 'Insert or edit link');
        container.innerHTML =
            '<label for="rgbj-help-link-url">Link URL</label>' +
            '<input id="rgbj-help-link-url" type="text" autocomplete="off" placeholder="https://example.com">' +
            '<label for="rgbj-help-link-text">Link text</label>' +
            '<input id="rgbj-help-link-text" type="text" autocomplete="off" placeholder="Text shown in the article">' +
            '<label class="rgbj-help-link-popup__new-tab">' +
            '<input id="rgbj-help-link-new-tab" type="checkbox"> Open in new tab' +
            '</label>';

        var buttonRow = document.createElement('div');
        buttonRow.className = 'toastui-editor-button-container';

        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'toastui-editor-close-button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', function (event) {
            event.preventDefault();
            closeEditorPopup();
        });

        var okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'toastui-editor-ok-button';
        okBtn.textContent = 'OK';
        okBtn.addEventListener('click', function (event) {
            event.preventDefault();
            submitLinkPopup();
        });

        buttonRow.appendChild(cancelBtn);
        buttonRow.appendChild(okBtn);
        container.appendChild(buttonRow);

        linkPopupBodyEl = container;
        return container;
    }

    function buildLinkToolbarItem() {
        return {
            name: 'link',
            tooltip: 'Insert link',
            className: 'link toastui-editor-toolbar-icons',
            popup: {
                className: 'toastui-editor-popup-add-link',
                body: buildLinkPopupBody(),
                style: { width: '420px' },
            },
        };
    }

    function initLinkPopupForm() {
        var toolbar = getEditorToolbar();
        var linkBtn = toolbar ? toolbar.querySelector('button.link') : null;
        if (!linkBtn || linkBtn.dataset.rgbjLinkPopupInit) {
            return;
        }

        linkBtn.dataset.rgbjLinkPopupInit = '1';
        linkBtn.addEventListener('click', function () {
            window.setTimeout(resetLinkPopupForm, 0);
        });
    }

    var helpPanelPopupBodyEl = null;

    function selectHelpPanelType(panelType) {
        if (!helpPanelPopupBodyEl) {
            return;
        }

        helpPanelPopupBodyEl.querySelectorAll('.rgbj-help-panel-picker__btn').forEach(function (btn) {
            var isMatch = btn.getAttribute('data-type') === panelType;
            btn.classList.toggle('is-selected', isMatch);
            btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        });
    }

    function resetHelpPanelPopupForm() {
        if (!helpPanelPopupBodyEl || !editor) {
            return;
        }

        var bodyEl = helpPanelPopupBodyEl.querySelector('#rgbj-help-panel-body');
        var selected = (editor.getSelectedText() || '').trim();
        if (bodyEl) {
            bodyEl.value = selected;
            bodyEl.classList.remove('wrong');
        }

        selectHelpPanelType('information');
    }

    function submitHelpPanelPopup() {
        if (helpPanelSubmitting) {
            return;
        }

        var popupRoot = helpPanelPopupBodyEl;
        if (!popupRoot && editorBodyEl) {
            popupRoot = editorBodyEl.querySelector('.rgbj-help-panel-popup');
        }
        if (!editor || !popupRoot) {
            setStatus('Alert panel dialog is not ready. Reload the editor page.', true);
            return;
        }

        var bodyEl = popupRoot.querySelector('#rgbj-help-panel-body');
        var selectedBtn = popupRoot.querySelector('.rgbj-help-panel-picker__btn.is-selected');
        var panelType = selectedBtn ? selectedBtn.getAttribute('data-type') : 'information';
        var body = bodyEl ? bodyEl.value.trim() : '';

        if (bodyEl) {
            bodyEl.classList.remove('wrong');
        }

        if (body === '') {
            if (bodyEl) {
                bodyEl.classList.add('wrong');
                bodyEl.focus();
            }
            return;
        }

        helpPanelSubmitting = true;

        insertHelpPanel(panelType, body, function (inserted) {
            helpPanelSubmitting = false;

            if (!inserted) {
                setStatus('Could not insert the panel. Click in the article and try again.', true);
                return;
            }

            helpPanelInsertContext = null;
            markDirty();
            closeEditorPopup();
            setStatus('Alert panel inserted.');
        });
    }

    function buildHelpPanelPopupBody() {
        var container = document.createElement('div');
        container.className = 'rgbj-help-panel-popup';
        container.setAttribute('aria-label', 'Insert alert panel');

        var typeLabel = document.createElement('p');
        typeLabel.className = 'rgbj-help-panel-popup__label';
        typeLabel.textContent = 'Panel type';
        container.appendChild(typeLabel);

        var typeRow = document.createElement('div');
        typeRow.className = 'rgbj-help-panel-popup__types';
        typeRow.setAttribute('role', 'group');
        typeRow.setAttribute('aria-label', 'Panel type');

        [
            { type: 'information', label: 'Information', icon: 'bi-info-circle' },
            { type: 'caution', label: 'Caution', icon: 'bi-exclamation-triangle' },
            { type: 'warning', label: 'Warning', icon: 'bi-exclamation-triangle-fill' },
            { type: 'danger', label: 'Danger', icon: 'bi-exclamation-octagon' },
        ].forEach(function (item) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className =
                'rgbj-help-panel-picker__btn rgbj-help-panel-picker__btn--' + item.type;
            btn.setAttribute('data-type', item.type);
            btn.setAttribute('aria-pressed', item.type === 'information' ? 'true' : 'false');
            btn.innerHTML =
                '<i class="bi ' +
                item.icon +
                '" aria-hidden="true"></i><span>' +
                item.label +
                '</span>';
            if (item.type === 'information') {
                btn.classList.add('is-selected');
            }
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                selectHelpPanelType(item.type);
            });
            typeRow.appendChild(btn);
        });

        container.appendChild(typeRow);

        var bodyLabel = document.createElement('label');
        bodyLabel.setAttribute('for', 'rgbj-help-panel-body');
        bodyLabel.textContent = 'Message';
        container.appendChild(bodyLabel);

        var bodyInput = document.createElement('textarea');
        bodyInput.id = 'rgbj-help-panel-body';
        bodyInput.className = 'rgbj-help-panel-popup__body-input';
        bodyInput.rows = 4;
        bodyInput.placeholder = 'What should readers know? Each line becomes a paragraph in the panel.';
        bodyInput.addEventListener('keydown', function (event) {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                submitHelpPanelPopup();
            }
        });
        container.appendChild(bodyInput);

        var buttonRow = document.createElement('div');
        buttonRow.className = 'toastui-editor-button-container';

        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'toastui-editor-close-button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', function (event) {
            event.preventDefault();
            closeEditorPopup();
        });

        var okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'toastui-editor-ok-button';
        okBtn.textContent = 'Insert';
        okBtn.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            submitHelpPanelPopup();
        });

        buttonRow.appendChild(cancelBtn);
        buttonRow.appendChild(okBtn);
        container.appendChild(buttonRow);

        helpPanelPopupBodyEl = container;
        return container;
    }

    function buildHelpPanelToolbarItem() {
        return {
            name: 'helpPanel',
            tooltip: 'Insert alert panel',
            className: 'rgbj-help-panel-tool toastui-editor-toolbar-icons',
            style: {
                backgroundImage: 'none',
                fontSize: '15px',
                fontWeight: '700',
            },
            text: '!',
            popup: {
                className: 'toastui-editor-popup-add-panel',
                body: buildHelpPanelPopupBody(),
                style: { width: '460px' },
            },
        };
    }

    function initHelpPanelPopupForm() {
        if (editorBodyEl && !editorBodyEl.dataset.rgbjHelpPanelSubmitInit) {
            editorBodyEl.dataset.rgbjHelpPanelSubmitInit = '1';
            editorBodyEl.addEventListener(
                'click',
                function (event) {
                    var okBtn = event.target.closest('.rgbj-help-panel-popup .toastui-editor-ok-button');
                    if (!okBtn) {
                        return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    submitHelpPanelPopup();
                },
                true
            );
        }

        var toolbar = getEditorToolbar();
        var panelBtn = toolbar ? toolbar.querySelector('button.rgbj-help-panel-tool') : null;
        if (!panelBtn || panelBtn.dataset.rgbjHelpPanelPopupInit) {
            return;
        }

        panelBtn.dataset.rgbjHelpPanelPopupInit = '1';
        panelBtn.addEventListener(
            'mousedown',
            function () {
                captureHelpPanelInsertContext();
            },
            true
        );
        panelBtn.addEventListener('click', function () {
            window.setTimeout(resetHelpPanelPopupForm, 0);
        });
    }

    function collectNonLinkMarksInRange(doc, from, to, linkType) {
        var marks = [];
        var seen = {};

        doc.nodesBetween(from, to, function (node) {
            if (!node.isText) {
                return;
            }

            node.marks.forEach(function (mark) {
                if (mark.type === linkType) {
                    return;
                }

                var key = mark.type.name + ':' + JSON.stringify(mark.attrs || {});
                if (seen[key]) {
                    return;
                }

                seen[key] = true;
                marks.push(mark);
            });
        });

        return marks;
    }

    function rgbjHelpTablePlugin() {
        return {
            toHTMLRenderers: {
                table: function (_node, context) {
                    var result = context.origin ? context.origin() : null;
                    if (!result || !context.entering) {
                        return result;
                    }

                    result.attributes = Object.assign({}, result.attributes || {}, {
                        class: 'rgbj-help-table',
                    });

                    return result;
                },
            },
        };
    }

    function rgbjHelpLinkPlugin() {
        return {
            wysiwygCommands: {
                rgbjAddLink: function (payload, state, dispatch) {
                    payload = payload || {};
                    var linkUrl = String(payload.linkUrl || '').trim();
                    var linkText = String(payload.linkText || '').trim();
                    var openInNewTab = !!payload.openInNewTab;
                    var from = typeof payload.from === 'number' ? payload.from : state.selection.from;
                    var to = typeof payload.to === 'number' ? payload.to : state.selection.to;

                    if (linkUrl === '') {
                        return false;
                    }

                    if (linkText === '') {
                        linkText = linkUrl;
                    }

                    var linkType = state.schema.marks.link;
                    if (!linkType) {
                        return false;
                    }

                    from = Math.max(0, Math.min(from, state.doc.content.size));
                    to = Math.max(from, Math.min(to, state.doc.content.size));

                    var expanded = getLinkMarkRange(state.doc, from, linkType);
                    if (expanded) {
                        from = expanded.from;
                        to = expanded.to;
                    }

                    var attrs = {
                        linkUrl: linkUrl,
                        htmlAttrs: openInNewTab
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : null,
                    };
                    var linkMark = linkType.create(attrs);
                    var tr = state.tr;
                    var currentText = from < to ? state.doc.textBetween(from, to, '') : '';

                    if (from < to && linkText === currentText) {
                        tr.removeMark(from, to, linkType);
                        tr.addMark(from, to, linkMark);
                        dispatch(tr.scrollIntoView());
                        return true;
                    }

                    var marks = [linkMark];
                    if (from < to) {
                        marks = collectNonLinkMarksInRange(state.doc, from, to, linkType).concat(marks);
                    }

                    tr.replaceRangeWith(from, to, state.schema.text(linkText, marks));
                    dispatch(tr.scrollIntoView());
                    return true;
                },
            },
            toMarkdownRenderers: {
                link: function (nodeInfo, context) {
                    var result = context.origin ? context.origin() : {};
                    var node = nodeInfo.node;
                    var htmlAttrs = node.attrs.htmlAttrs;

                    if (!htmlAttrs || htmlAttrs.target !== '_blank') {
                        return result;
                    }

                    var linkType = node.type;
                    var textNode = getLinkMarkTextNode(nodeInfo);
                    var innerHtml = buildLinkInnerHtmlFromTextNode(textNode, linkType);

                    if (innerHtml === '') {
                        return result;
                    }

                    var url = String(node.attrs.linkUrl || '');

                    return {
                        rawHTML:
                            '<a href="' +
                            escapeHtmlAttr(url) +
                            '" target="_blank" rel="noopener noreferrer">' +
                            innerHtml +
                            '</a>',
                    };
                },
            },
        };
    }

    function rgbjHelpPanelPlugin(context) {
        var wysiwygCommands = {
            rgbjInsertHelpPanel: function (payload, state, dispatch) {
                payload = payload || {};
                var view = {
                    state: state,
                    dispatch: dispatch,
                    focus: function () {},
                };
                var range = null;

                if (typeof payload.from === 'number') {
                    range = {
                        from: payload.from,
                        to: typeof payload.to === 'number' ? payload.to : payload.from,
                    };
                }

                if (!insertHelpPanelIntoView(view, payload.panelType, payload.body, range)) {
                    return false;
                }

                return true;
            },
        };

        if (!context || !context.pmState || !context.pmView) {
            return { wysiwygCommands: wysiwygCommands };
        }

        var Plugin = context.pmState.Plugin;
        var PluginKey = context.pmState.PluginKey;
        var Decoration = context.pmView.Decoration;
        var DecorationSet = context.pmView.DecorationSet;
        var helpPanelPluginKey = new PluginKey('rgbjHelpPanel');

        return {
            wysiwygPlugins: [
                function () {
                    return new Plugin({
                        key: helpPanelPluginKey,
                        appendTransaction: function (_transactions, _oldState, newState) {
                            var tr = null;

                            newState.doc.descendants(function (node, pos) {
                                var panelType = detectHelpPanelTypeFromBlockQuote(node);
                                if (!panelType) {
                                    return;
                                }

                                var prevAttrs = node.attrs.htmlAttrs || {};
                                var nextClass = 'rgbj-help-panel rgbj-help-panel--' + panelType;
                                var nextHtmlAttrs = Object.assign({}, prevAttrs, {
                                    class: nextClass,
                                    'data-rgbj-panel': panelType,
                                });

                                if (blockQuoteHasMarkerOnlyLine(node)) {
                                    nextHtmlAttrs['data-rgbj-has-marker-line'] = '1';
                                } else {
                                    delete nextHtmlAttrs['data-rgbj-has-marker-line'];
                                }

                                if (
                                    prevAttrs.class === nextHtmlAttrs.class &&
                                    prevAttrs['data-rgbj-panel'] === nextHtmlAttrs['data-rgbj-panel'] &&
                                    prevAttrs['data-rgbj-has-marker-line'] === nextHtmlAttrs['data-rgbj-has-marker-line']
                                ) {
                                    return;
                                }

                                tr = tr || newState.tr;
                                tr.setNodeMarkup(
                                    pos,
                                    undefined,
                                    Object.assign({}, node.attrs, { htmlAttrs: nextHtmlAttrs })
                                );
                            });

                            return tr;
                        },
                        props: {
                            decorations: function (state) {
                                var decos = [];

                                state.doc.descendants(function (node, pos) {
                                    var panelType = detectHelpPanelTypeFromBlockQuote(node);
                                    if (!panelType) {
                                        return;
                                    }

                                    var nodeAttrs = {
                                        class: 'rgbj-help-panel rgbj-help-panel--' + panelType,
                                        'data-rgbj-panel': panelType,
                                    };

                                    if (blockQuoteHasMarkerOnlyLine(node)) {
                                        nodeAttrs['data-rgbj-has-marker-line'] = '1';

                                        var markerNode = node.child(0);
                                        var markerPos = pos + 1;
                                        decos.push(
                                            Decoration.node(markerPos, markerPos + markerNode.nodeSize, {
                                                class: 'rgbj-help-panel__marker-line',
                                            })
                                        );
                                    }

                                    decos.push(
                                        Decoration.node(pos, pos + node.nodeSize, nodeAttrs)
                                    );

                                    decos.push(
                                        Decoration.widget(
                                            pos + 1,
                                            function () {
                                                return buildHelpPanelHeaderWidget(panelType);
                                            },
                                            { side: -1, key: 'rgbj-help-panel-header-' + pos }
                                        )
                                    );
                                });

                                return DecorationSet.create(state.doc, decos);
                            },
                        },
                    });
                },
            ],
            wysiwygCommands: wysiwygCommands,
        };
    }

    async function geminiApiFetch(body) {
        var token = await getIdToken();
        var response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
                'X-RGBJ-Auth': token,
            },
            body: JSON.stringify(body),
        });

        var raw = await response.text();
        var data = {};
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch (parseErr) {
                if (!response.ok) {
                    throw new Error('Server error (' + response.status + ').');
                }
                throw new Error('Unexpected Gemini API response.');
            }
        }

        if (!response.ok) {
            var summary = data.error || 'Gemini request failed (' + response.status + ').';
            var err = new Error(summary);
            err.geminiDetail = (data.detail && String(data.detail).trim() !== '') ? String(data.detail).trim() : summary;
            throw err;
        }

        return data;
    }

    function cleanGeminiText(text) {
        text = (text || '').trim();
        if (/^```[\s\S]*```$/.test(text)) {
            text = text.replace(/^```[^\n]*\n/, '').replace(/\n```$/, '').trim();
        }
        return text;
    }

    function setGeminiApplyButtonsVisible(scope) {
        if (geminiApplySelectionBtn) {
            geminiApplySelectionBtn.classList.toggle('d-none', scope !== 'selection');
        }
        if (geminiApplyDocumentBtn) {
            geminiApplyDocumentBtn.classList.toggle('d-none', scope !== 'document');
        }
        if (geminiApplySummaryBtn) {
            geminiApplySummaryBtn.classList.toggle('d-none', scope !== 'summary');
        }
        if (geminiApplyTitleBtn) {
            geminiApplyTitleBtn.classList.toggle('d-none', scope !== 'title');
        }
    }

    function showGeminiPanel(text, mode, scope) {
        if (!geminiResultWrap || !geminiResultEl) {
            return;
        }

        var isError = mode === 'error';
        geminiLastScope = isError ? '' : (scope || '');
        geminiResultEl.value = text;
        geminiResultEl.classList.toggle('rgbj-help-gemini-result--error', isError);
        geminiResultWrap.classList.remove('d-none');

        if (geminiResultLabel) {
            geminiResultLabel.textContent = isError
                ? 'Error details (select text or use Copy)'
                : 'Suggestion';
        }

        setGeminiApplyButtonsVisible(isError ? '' : scope);
        if (geminiSelectAllBtn) {
            geminiSelectAllBtn.classList.toggle('d-none', !isError);
        }

        if (isError) {
            geminiResultEl.focus();
            geminiResultEl.select();
        }
    }

    function showGeminiResult(text, scope) {
        showGeminiPanel(text, 'success', scope);
    }

    function showGeminiError(message) {
        showGeminiPanel(message, 'error', '');
    }

    function setFrontMatterField(field, value) {
        var el = null;
        if (field === 'title') {
            el = metaTitleEl;
        } else if (field === 'summary') {
            el = metaSummaryEl;
        } else if (field === 'category') {
            el = metaCategoryEl;
        } else if (field === 'tags') {
            el = metaTagsEl;
        } else if (field === 'published') {
            el = metaPublishedEl;
        } else if (field === 'slug') {
            el = slugEl;
        } else if (field === 'draft') {
            if (metaDraftEl) {
                metaDraftEl.checked = isTruthyYaml(value);
                markDirty();
                return true;
            }
        }

        if (!el) {
            setStatus('Unknown metadata field: ' + field + '.', true);
            return false;
        }

        el.value = String(value || '');
        markDirty();
        return true;
    }

    async function runGemini(action) {
        if (!geminiConfigured || !editor || geminiBusy) {
            return;
        }

        var selection = editor.getSelectedText();
        var prompt = geminiPromptEl ? geminiPromptEl.value.trim() : '';

        if (action === 'custom' && prompt === '') {
            setStatus('Enter a custom prompt first.', true);
            return;
        }

        geminiBusy = true;
        if (geminiRunBtn) {
            geminiRunBtn.disabled = true;
        }
        setStatus('Asking Gemini…');

        try {
            var data = await geminiApiFetch({
                action: action,
                markdown: getArticleMarkdown(),
                selection: selection,
                prompt: prompt,
            });

            var text = cleanGeminiText(data.text || '');
            if (text === '') {
                throw new Error('Gemini returned an empty response.');
            }

            showGeminiResult(text, data.scope || '');
            setStatus('Gemini suggestion ready.');
        } catch (err) {
            var detail = err.geminiDetail || err.message || 'Gemini request failed.';
            showGeminiError(detail);
            setStatus('Gemini failed — see error details in the Gemini Helper popup.', true);
        } finally {
            geminiBusy = false;
            if (geminiRunBtn) {
                geminiRunBtn.disabled = false;
            }
        }
    }

    function buildGeminiToolbarItem() {
        var container = document.createElement('div');
        container.className = 'rgbj-help-gemini-popup';

        if (geminiSourceEl) {
            while (geminiSourceEl.firstChild) {
                container.appendChild(geminiSourceEl.firstChild);
            }
        }

        return {
            name: 'gemini',
            tooltip: 'Gemini Helper',
            className: 'gemini toastui-editor-toolbar-icons rgbj-help-gemini-tool',
            style: {
                backgroundImage: 'none',
                color: '#67ccff',
                fontSize: '15px',
                fontWeight: '700',
            },
            text: '✦',
            popup: {
                className: 'rgbj-help-gemini-toolbar-popup',
                body: container,
                style: { width: 'min(520px, 92vw)' },
            },
        };
    }

    function initGemini() {
        if (!geminiConfigured) {
            return;
        }

        document.querySelectorAll('.rgbj-help-gemini-action').forEach(function (btn) {
            btn.addEventListener('click', function () {
                runGemini(btn.getAttribute('data-action') || 'custom');
            });
        });

        if (geminiRunBtn) {
            geminiRunBtn.addEventListener('click', function () {
                runGemini('custom');
            });
        }

        if (geminiPromptEl) {
            geminiPromptEl.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    runGemini('custom');
                }
            });
        }

        if (geminiApplySelectionBtn) {
            geminiApplySelectionBtn.addEventListener('click', function () {
                if (!editor || !geminiResultEl) {
                    return;
                }
                editor.insertText(geminiResultEl.value);
                markDirty();
                setStatus('Selection updated.');
            });
        }

        if (geminiApplyDocumentBtn) {
            geminiApplyDocumentBtn.addEventListener('click', function () {
                if (!editor || !geminiResultEl) {
                    return;
                }
                if (!window.confirm('Replace the entire article with Gemini\'s suggestion?')) {
                    return;
                }
                setArticleMarkdown(geminiResultEl.value);
                dirty = true;
                syncSlugFromEditor();
                setStatus('Article replaced. Review and Save.');
            });
        }

        if (geminiApplySummaryBtn) {
            geminiApplySummaryBtn.addEventListener('click', function () {
                if (!geminiResultEl) {
                    return;
                }
                if (setFrontMatterField('summary', geminiResultEl.value.trim())) {
                    setStatus('Summary field updated.');
                }
            });
        }

        if (geminiApplyTitleBtn) {
            geminiApplyTitleBtn.addEventListener('click', function () {
                if (!geminiResultEl) {
                    return;
                }
                if (setFrontMatterField('title', geminiResultEl.value.trim())) {
                    setStatus('Title field updated.');
                }
            });
        }

        if (geminiCopyBtn) {
            geminiCopyBtn.addEventListener('click', function () {
                if (!geminiResultEl) {
                    return;
                }
                navigator.clipboard.writeText(geminiResultEl.value).then(function () {
                    setStatus('Copied to clipboard.');
                }).catch(function () {
                    geminiResultEl.focus();
                    geminiResultEl.select();
                    setStatus('Select the text and press Ctrl+C to copy.', true);
                });
            });
        }

        if (geminiSelectAllBtn) {
            geminiSelectAllBtn.addEventListener('click', function () {
                if (!geminiResultEl) {
                    return;
                }
                geminiResultEl.focus();
                geminiResultEl.select();
            });
        }
    }

    function syncEditorHeight() {
        if (!editorBodyEl) {
            return;
        }

        var defaultUi = editorBodyEl.querySelector('.toastui-editor-defaultUI');
        if (!defaultUi) {
            return;
        }

        if (editor && typeof editor.setHeight === 'function' && editor.getHeight() !== 'auto') {
            editor.setHeight('auto');
        }

        editorBodyEl.style.height = 'auto';
        editorBodyEl.style.minHeight = '240px';

        window.requestAnimationFrame(function () {
            if (!editorBodyEl || !defaultUi.isConnected) {
                return;
            }

            var measured = defaultUi.offsetHeight;
            var next = Math.max(240, measured);

            if (next === lastSyncedEditorHeight) {
                return;
            }

            lastSyncedEditorHeight = next;
            editorBodyEl.style.minHeight = next + 'px';
        });
    }

    function initEditorHeightSync() {
        if (!editorBodyEl) {
            return;
        }

        if (typeof ResizeObserver !== 'undefined') {
            if (editorHeightObserver) {
                editorHeightObserver.disconnect();
            }

            var defaultUi = editorBodyEl.querySelector('.toastui-editor-defaultUI');
            var prose = editorBodyEl.querySelector('.ProseMirror');
            if (!defaultUi || !prose) {
                window.setTimeout(initEditorHeightSync, 50);
                return;
            }

            editorHeightObserver = new ResizeObserver(function () {
                syncEditorHeight();
            });
            editorHeightObserver.observe(defaultUi);
            editorHeightObserver.observe(prose);
        }

        syncEditorHeight();
    }

    function getEditorTheme() {
        return document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'light' : 'dark';
    }

    function applyEditorSiteStyles() {
        if (!editorBodyEl) {
            return;
        }

        var siteFont = window.getComputedStyle(document.body).fontFamily;
        if (siteFont) {
            editorBodyEl.style.setProperty('--rgbj-editor-font', siteFont);
        }

        editorBodyEl.querySelectorAll('.toastui-editor-contents, .ProseMirror').forEach(function (el) {
            el.classList.add('rgbj-help-article__body');
            if (siteFont) {
                el.style.setProperty('font-family', siteFont, 'important');
            }
        });

        scheduleHelpPanelDecoration();
    }

    function initMetaForm() {
        [
            metaTitleEl,
            metaSummaryEl,
            metaCategoryEl,
            metaTagsEl,
            metaPublishedEl,
            metaDraftEl,
            slugEl,
        ].forEach(function (el) {
            if (!el) {
                return;
            }
            el.addEventListener('input', markDirty);
            el.addEventListener('change', markDirty);
        });
    }

    function readFrontmatterOpenPreference() {
        try {
            var saved = localStorage.getItem(FRONTMATTER_OPEN_KEY);
            if (saved === '0') {
                return false;
            }
            if (saved === '1') {
                return true;
            }
        } catch (err) {
            // localStorage may be unavailable in some browsers or privacy modes
        }

        return true;
    }

    function saveFrontmatterOpenPreference(isOpen) {
        try {
            localStorage.setItem(FRONTMATTER_OPEN_KEY, isOpen ? '1' : '0');
        } catch (err) {
            // localStorage may be unavailable in some browsers or privacy modes
        }
    }

    function initFrontmatterPanel() {
        if (!frontmatterEl || frontmatterEl.dataset.rgbjFrontmatterInit) {
            return;
        }

        frontmatterEl.dataset.rgbjFrontmatterInit = '1';
        frontmatterEl.open = readFrontmatterOpenPreference();

        frontmatterEl.addEventListener('toggle', function () {
            saveFrontmatterOpenPreference(frontmatterEl.open);
        });
    }

    function isCursorInTable() {
        if (!editorBodyEl) {
            return false;
        }

        var prose = editorBodyEl.querySelector('.ProseMirror');
        if (!prose) {
            return false;
        }

        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
            return false;
        }

        var node = sel.anchorNode;
        if (!node) {
            return false;
        }

        if (node.nodeType === 3) {
            node = node.parentElement;
        }

        return !!(node && node.closest && node.closest('td, th'));
    }

    function syncTableToolbarState() {
        if (!editorBodyEl) {
            return;
        }

        var inTable = isCursorInTable();
        editorBodyEl.querySelectorAll('.rgbj-help-table-tool').forEach(function (btn) {
            btn.disabled = !inTable;
        });
    }

    function initTableToolbarStateSync() {
        syncTableToolbarState();

        if (!editorBodyEl) {
            return;
        }

        ['click', 'keyup', 'mouseup'].forEach(function (eventName) {
            editorBodyEl.addEventListener(eventName, syncTableToolbarState);
        });
    }

    function getWwEditorView() {
        if (!editor || !editor.wwEditor || !editor.wwEditor.view) {
            return null;
        }

        return editor.wwEditor.view;
    }

    function getHeadingLevelAtCursor() {
        var view = getWwEditorView();
        if (!view) {
            return 0;
        }

        var $from = view.state.selection.$from;
        for (var depth = $from.depth; depth > 0; depth -= 1) {
            var node = $from.node(depth);
            if (node.type.name === 'heading') {
                var level = parseInt(node.attrs.level, 10);
                return level >= 1 && level <= 6 ? level : 1;
            }
        }

        return 0;
    }

    function getHeadingToolbarLabel(level) {
        if (level >= 1 && level <= 6) {
            return 'H' + level;
        }

        return 'Text';
    }

    function getHeadingShortcutHint(level) {
        return 'Ctrl+Alt+' + level;
    }

    function getHeadingToolbarTitle(level) {
        if (level >= 1 && level <= 6) {
            return 'Heading ' + level + ' — click to change (' + getHeadingShortcutHint(level) + ')';
        }

        return 'Paragraph — click to set a heading (' + getHeadingShortcutHint(0) + ')';
    }

    function isEditorHeadingShortcutTarget(element) {
        if (!element || !editorBodyEl || !editorBodyEl.contains(element)) {
            return false;
        }

        if (element.closest('.rgbj-help-editor-inline-image__caption-input')) {
            return false;
        }

        if (element.closest('.rgbj-help-code-block-chrome pre, .rgbj-help-code-block-chrome code')) {
            return false;
        }

        if (element.closest('input, textarea, select') && !element.closest('.ProseMirror')) {
            return false;
        }

        return true;
    }

    function cursorInImageOnlyBlock(view) {
        if (!view) {
            return false;
        }

        var $from = view.state.selection.$from;
        for (var depth = $from.depth; depth > 0; depth -= 1) {
            if (blockContainsOnlyImage($from.node(depth))) {
                return true;
            }
        }

        return false;
    }

    function applyHeadingLevelAtCursor(level) {
        if (!editor) {
            return false;
        }

        var view = getWwEditorView();
        if (!view || cursorInImageOnlyBlock(view)) {
            return false;
        }

        editor.exec('heading', { level: level });
        scheduleHeadingToolbarSync();
        markDirty();
        syncEditorHeight();
        return true;
    }

    function parseHeadingShortcutLevel(event) {
        if (!event || (!event.ctrlKey && !event.metaKey) || !event.altKey || event.shiftKey) {
            return null;
        }

        var key = event.key;
        if (key.length === 1 && key >= '0' && key <= '6') {
            return parseInt(key, 10);
        }

        var digitMatch = /^Digit([0-6])$/.exec(event.code || '');
        if (digitMatch) {
            return parseInt(digitMatch[1], 10);
        }

        var numpadMatch = /^Numpad([0-6])$/.exec(event.code || '');
        if (numpadMatch) {
            return parseInt(numpadMatch[1], 10);
        }

        return null;
    }

    function handleHeadingShortcut(event) {
        var level = parseHeadingShortcutLevel(event);
        if (level === null) {
            return false;
        }

        var target = document.activeElement || event.target;
        if (!isEditorHeadingShortcutTarget(target)) {
            return false;
        }

        if (!applyHeadingLevelAtCursor(level)) {
            return false;
        }

        event.preventDefault();
        event.stopPropagation();
        return true;
    }

    function initHeadingShortcuts() {
        if (document.documentElement.dataset.rgbjHeadingShortcutsInit) {
            return;
        }

        document.documentElement.dataset.rgbjHeadingShortcutsInit = '1';
        document.addEventListener(
            'keydown',
            function (event) {
                if (!appEl || appEl.classList.contains('d-none') || !editor) {
                    return;
                }

                if (!handleHeadingShortcut(event)) {
                    return;
                }

                event.stopImmediatePropagation();
            },
            true
        );
    }

    function ensureHeadingToolbarButton() {
        var toolbar = getEditorToolbar();
        if (!toolbar) {
            return null;
        }

        var btn = toolbar.querySelector('button.heading');
        if (!btn) {
            return null;
        }

        btn.classList.add('rgbj-help-heading-tool');
        btn.style.setProperty('background', 'none', 'important');
        btn.style.setProperty('background-image', 'none', 'important');
        btn.style.setProperty('background-size', '0', 'important');

        var label = btn.querySelector('.rgbj-help-heading-tool__label');
        if (!label) {
            label = document.createElement('span');
            label.className = 'rgbj-help-heading-tool__label';
            label.setAttribute('aria-hidden', 'true');
            btn.appendChild(label);
        }

        return btn;
    }

    function syncHeadingToolbarLabel() {
        var btn = ensureHeadingToolbarButton();
        if (!btn) {
            return;
        }

        var label = btn.querySelector('.rgbj-help-heading-tool__label');
        if (!label) {
            return;
        }

        var level = getHeadingLevelAtCursor();
        label.textContent = getHeadingToolbarLabel(level);
        btn.title = getHeadingToolbarTitle(level);
        btn.setAttribute('aria-label', btn.title);
        btn.classList.toggle('rgbj-help-heading-tool--heading', level > 0);
        btn.dataset.rgbjHeadingLevel = String(level);
    }

    var headingToolbarSyncScheduled = false;

    function scheduleHeadingToolbarSync() {
        if (headingToolbarSyncScheduled) {
            return;
        }

        headingToolbarSyncScheduled = true;
        window.requestAnimationFrame(function () {
            headingToolbarSyncScheduled = false;
            ensureHeadingToolbarButton();
            syncHeadingToolbarLabel();
        });
    }

    function initHeadingToolbarLabel() {
        var toolbar = getEditorToolbar();
        if (!toolbar) {
            window.setTimeout(initHeadingToolbarLabel, 50);
            return;
        }

        if (!toolbar.dataset.rgbjHeadingLabelInit) {
            toolbar.dataset.rgbjHeadingLabelInit = '1';

            if (typeof MutationObserver !== 'undefined') {
                var headingToolbarObserver = new MutationObserver(function (mutations) {
                    var needsSync = mutations.some(function (mutation) {
                        return mutation.type === 'childList';
                    });
                    if (needsSync) {
                        scheduleHeadingToolbarSync();
                    }
                });
                headingToolbarObserver.observe(toolbar, { childList: true, subtree: true });
            }

            if (editor && editor.eventEmitter && typeof editor.eventEmitter.listen === 'function') {
                editor.eventEmitter.listen('changeToolbarState', syncHeadingToolbarLabel);
            }

            if (editor && typeof editor.on === 'function') {
                editor.on('change', syncHeadingToolbarLabel);
            }

            if (editorBodyEl) {
                ['keyup', 'mouseup', 'focusin'].forEach(function (eventName) {
                    editorBodyEl.addEventListener(eventName, syncHeadingToolbarLabel);
                });
            }
        }

        syncHeadingToolbarLabel();
    }

    function clearThematicBreakSelection() {
        if (selectedThematicBreak && selectedThematicBreak.dom) {
            selectedThematicBreak.dom.classList.remove('rgbj-help-hr-selected');
        }

        selectedThematicBreak = null;
    }

    function selectThematicBreak(hit) {
        clearThematicBreakSelection();
        hit.dom.classList.add('rgbj-help-hr-selected');
        selectedThematicBreak = {
            nodePos: hit.nodePos,
            nodeSize: hit.node.nodeSize,
            dom: hit.dom,
        };
    }

    function getThematicBreakFromTarget(view, target) {
        if (!view || !target) {
            return null;
        }

        var el = target.nodeType === 1 ? target : target.parentElement;
        if (!el || !el.closest) {
            return null;
        }

        var hr = el.tagName === 'HR' ? el : el.closest('hr');
        if (!hr || !view.dom.contains(hr)) {
            return null;
        }

        var wrapper = hr.parentElement;
        if (!wrapper) {
            return null;
        }

        var pos = view.posAtDOM(wrapper, 0);
        var doc = view.state.doc;
        var $pos = doc.resolve(pos);
        var node = $pos.nodeAfter;

        if (node && node.type.name === 'thematicBreak') {
            return { nodePos: pos, node: node, dom: wrapper };
        }

        for (var depth = $pos.depth; depth >= 0; depth -= 1) {
            node = $pos.node(depth);
            if (node.type.name === 'thematicBreak') {
                return {
                    nodePos: $pos.before(depth),
                    node: node,
                    dom: wrapper,
                };
            }
        }

        return null;
    }

    function initHorizontalRuleSelection() {
        if (!editorBodyEl || editorBodyEl.dataset.rgbjHrSelectInit) {
            return;
        }

        editorBodyEl.dataset.rgbjHrSelectInit = '1';

        editorBodyEl.addEventListener('mousedown', function (event) {
            var view = getWwEditorView();
            if (!view) {
                return;
            }

            var hit = getThematicBreakFromTarget(view, event.target);
            if (hit) {
                event.preventDefault();
                selectThematicBreak(hit);
                view.focus();
                return;
            }

            clearThematicBreakSelection();
        });

        editorBodyEl.addEventListener('keydown', function (event) {
            if (!selectedThematicBreak) {
                return;
            }

            if (event.key !== 'Delete' && event.key !== 'Backspace') {
                return;
            }

            var view = getWwEditorView();
            if (!view) {
                return;
            }

            event.preventDefault();
            var pos = selectedThematicBreak.nodePos;
            var size = selectedThematicBreak.nodeSize;
            view.dispatch(view.state.tr.delete(pos, pos + size));
            clearThematicBreakSelection();
            markDirty();
            syncEditorHeight();
        });
    }

    // SVG paths from @wordpress/icons (Gutenberg table block toolbar).
    function gutenbergTableIcon(pathD) {
        return (
            '<svg class="rgbj-help-table-tool__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
            '<path fill="currentColor" d="' +
            pathD +
            '"/>' +
            '</svg>'
        );
    }

    var tableToolbarIcons = {
        addRowUp: gutenbergTableIcon(
            'M21 5c0-1.1-.9-2-2-2H5c-1 0-1.9.8-2 1.8V19.2c.1.9.9 1.7 1.8 1.8H19c1.1 0 2-.9 2-2V5ZM4.5 14V5c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v9h-15Zm4 5.5H5c-.3 0-.5-.2-.5-.5v-3.5h4v4Zm5.5 0h-4v-4h4v4Zm5.5-.5c0 .3-.2.5-.5.5h-3.5v-4h4V19ZM11.2 10h-3V8.5h3v-3h1.5v3h3V10h-3v3h-1.5v-3Z'
        ),
        addRowDown: gutenbergTableIcon(
            'M19 3H4.8c-.9.1-1.7.9-1.8 1.8V19.2c.1 1 1 1.8 2 1.8h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-9 1.5h4v4h-4v-4ZM4.5 5c0-.3.2-.5.5-.5h3.5v4h-4V5Zm15 14c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-9h15v9Zm0-10.5h-4v-4H19c.3 0 .5.2.5.5v3.5Zm-8.3 10h1.5v-3h3V14h-3v-3h-1.5v3h-3v1.5h3v3Z'
        ),
        deleteRow: gutenbergTableIcon(
            'M19 3H4.8c-.9.1-1.7.9-1.8 1.8V19.2c.1 1 1 1.8 2 1.8h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm.5 16c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-9h15v9Zm0-10.5h-15V5c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v3.5Zm-9.6 9.4 2.1-2.1 2.1 2.1 1.1-1.1-2.1-2.1 2.1-2.1-1.1-1.1-2.1 2.1-2.1-2.1-1.1 1.1 2.1 2.1-2.1 2.1 1.1 1.1Z'
        ),
        addColLeft: gutenbergTableIcon(
            'M19 3H5c-1.1 0-2 .9-2 2v14c0 1 .8 1.9 1.8 2H19.2c.9-.1 1.7-.9 1.8-1.8V5c0-1.1-.9-2-2-2Zm-5 16.5H5c-.3 0-.5-.2-.5-.5V5c0-.3.2-.5.5-.5h9v15Zm5.5-.5c0 .3-.2.5-.5.5h-3.5v-4h4V19Zm0-5h-4v-4h4v4Zm0-5.5h-4v-4H19c.3 0 .5.2.5.5v3.5Zm-11 7.3H10v-3h3v-1.5h-3v-3H8.5v3h-3v1.5h3v3Z'
        ),
        addColRight: gutenbergTableIcon(
            'M19 3H5c-1.1 0-2 .9-2 2v14.2c.1.9.9 1.7 1.8 1.8H19.2c1-.1 1.8-1 1.8-2V5c0-1.1-.9-2-2-2ZM8.5 19.5H5c-.3 0-.5-.2-.5-.5v-3.5h4v4Zm0-5.5h-4v-4h4v4Zm0-5.5h-4V5c0-.3.2-.5.5-.5h3.5v4Zm11 10.5c0 .3-.2.5-.5.5h-9v-15h9c.3 0 .5.2.5.5v14Zm-4-10.8H14v3h-3v1.5h3v3h1.5v-3h3v-1.5h-3v-3Z'
        ),
        deleteCol: gutenbergTableIcon(
            'M19 3H5c-1.1 0-2 .9-2 2v14.2c.1.9.9 1.7 1.8 1.8H19.2c1-.1 1.8-1 1.8-2V5c0-1.1-.9-2-2-2ZM8.5 19.5H5c-.3 0-.5-.2-.5-.5V5c0-.3.2-.5.5-.5h3.5v15Zm11-.5c0 .3-.2.5-.5.5h-9v-15h9c.3 0 .5.2.5.5v14ZM16.9 8.8l-2.1 2.1-2.1-2.1-1.1 1.1 2.1 2.1-2.1 2.1 1.1 1.1 2.1-2.1 2.1 2.1 1.1-1.1-2.1-2.1L18 9.9l-1.1-1.1Z'
        ),
    };

    function createTableToolbarItem(name, tooltip, command, iconKey, options) {
        options = options || {};
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rgbj-help-table-tool' + (options.danger ? ' rgbj-help-table-tool--danger' : '');
        btn.title = tooltip;
        btn.setAttribute('aria-label', tooltip);
        btn.innerHTML = tableToolbarIcons[iconKey] || '';
        btn.disabled = true;

        btn.addEventListener('mousedown', function (event) {
            event.preventDefault();
        });

        btn.addEventListener('click', function (event) {
            event.preventDefault();
            if (!editor || btn.disabled) {
                return;
            }

            editor.exec(command);
            markDirty();
            syncEditorHeight();
            window.setTimeout(syncTableToolbarState, 0);
        });

        return {
            name: name,
            tooltip: tooltip,
            el: btn,
        };
    }

    var toolbarTooltips = {
        heading: 'Heading',
        bold: 'Bold',
        italic: 'Italic',
        strike: 'Strikethrough',
        hr: 'Horizontal line',
        hrline: 'Horizontal line',
        quote: 'Blockquote',
        helpPanel: 'Insert alert panel',
        'rgbj-help-panel-tool': 'Insert alert panel',
        ul: 'Bullet list',
        'bullet-list': 'Bullet list',
        ol: 'Numbered list',
        'ordered-list': 'Numbered list',
        task: 'Task list',
        'task-list': 'Task list',
        table: 'Insert table',
        link: 'Insert link',
        image: 'Insert image',
        gemini: 'Gemini Helper',
        code: 'Inline code',
        codeblock: 'Code block',
        'code-block': 'Code block',
    };

    function toolbarGroup() {
        return Array.prototype.slice.call(arguments);
    }

    function getEditorToolbar() {
        return editorBodyEl ? editorBodyEl.querySelector('.toastui-editor-defaultUI-toolbar') : null;
    }

    function applyNativeToolbarTitles() {
        var toolbar = getEditorToolbar();
        if (!toolbar) {
            return;
        }

        toolbar.querySelectorAll('button.toastui-editor-toolbar-icons').forEach(function (btn) {
            Array.prototype.forEach.call(btn.classList, function (cls) {
                if (toolbarTooltips[cls] && cls !== 'heading') {
                    btn.title = toolbarTooltips[cls];
                }
            });
        });
    }

    function getToolbarButtonForPopup(toolbar, popup) {
        if (!toolbar || !popup) {
            return null;
        }

        if (popup.classList.contains('toastui-editor-popup-add-heading')) {
            return toolbar.querySelector('button.heading');
        }
        if (popup.classList.contains('toastui-editor-popup-add-link') || popup.querySelector('.rgbj-help-link-popup')) {
            return toolbar.querySelector('button.link');
        }
        if (popup.classList.contains('toastui-editor-popup-add-image') || popup.querySelector('.rgbj-help-image-popup')) {
            return toolbar.querySelector('button.image');
        }
        if (popup.classList.contains('toastui-editor-popup-add-table')) {
            return toolbar.querySelector('button.table');
        }
        if (popup.classList.contains('toastui-editor-popup-add-panel') || popup.querySelector('.rgbj-help-panel-popup')) {
            return toolbar.querySelector('button.rgbj-help-panel-tool');
        }
        if (popup.classList.contains('rgbj-help-gemini-toolbar-popup') || popup.querySelector('.rgbj-help-gemini-popup')) {
            return toolbar.querySelector('button.gemini');
        }

        return null;
    }

    function popupShouldOpenBelow(popup) {
        return (
            popup.classList.contains('toastui-editor-popup-add-link') ||
            popup.classList.contains('toastui-editor-popup-add-image') ||
            popup.classList.contains('toastui-editor-popup-add-table') ||
            popup.classList.contains('toastui-editor-popup-add-panel') ||
            popup.classList.contains('rgbj-help-gemini-toolbar-popup') ||
            !!popup.querySelector('.rgbj-help-link-popup') ||
            !!popup.querySelector('.rgbj-help-image-popup') ||
            !!popup.querySelector('.rgbj-help-panel-popup') ||
            !!popup.querySelector('.rgbj-help-gemini-popup')
        );
    }

    var openPopupResizeObserver = null;
    var popupRepositionLock = false;
    var popupRepositionScheduled = false;
    var popupRepositionBtn = null;

    function schedulePopupRepositionOnce(btn) {
        popupRepositionBtn = btn || popupRepositionBtn;
        if (popupRepositionScheduled) {
            return;
        }

        popupRepositionScheduled = true;
        window.requestAnimationFrame(function () {
            popupRepositionScheduled = false;
            repositionToastPopupNearButton(popupRepositionBtn);
        });
    }

    function observeOpenPopupSize(popup, btn) {
        if (typeof ResizeObserver === 'undefined' || !popup) {
            return;
        }

        if (openPopupResizeObserver) {
            openPopupResizeObserver.disconnect();
            openPopupResizeObserver = null;
        }

        openPopupResizeObserver = new ResizeObserver(function () {
            schedulePopupRepositionOnce(btn);
        });
        openPopupResizeObserver.observe(popup);
    }

    function getActivePopupToolbarButton() {
        var toolbar = getEditorToolbar();
        if (!toolbar || !editorBodyEl) {
            return lastPopupToolbarBtn;
        }

        var popup = editorBodyEl.querySelector('.toastui-editor-defaultUI .toastui-editor-popup');
        if (!popup) {
            return lastPopupToolbarBtn;
        }

        var mappedBtn = getToolbarButtonForPopup(toolbar, popup);
        if (mappedBtn) {
            return mappedBtn;
        }

        if (lastPopupToolbarBtn && toolbar.contains(lastPopupToolbarBtn)) {
            return lastPopupToolbarBtn;
        }

        return toolbar.querySelector('button.toastui-editor-toolbar-icons.active') || lastPopupToolbarBtn;
    }

    function schedulePopupReposition(btn) {
        schedulePopupRepositionOnce(btn);
        [50, 150, 350].forEach(function (delay) {
            window.setTimeout(function () {
                schedulePopupRepositionOnce(btn);
            }, delay);
        });
    }

    function repositionToastPopupNearButton(btn) {
        if (popupRepositionLock) {
            return;
        }

        btn = btn || getActivePopupToolbarButton();
        if (!editorBodyEl || !btn) {
            return;
        }

        var defaultUi = editorBodyEl.querySelector('.toastui-editor-defaultUI');
        if (!defaultUi) {
            return;
        }

        var popup = defaultUi.querySelector('.toastui-editor-popup');
        if (!popup) {
            if (openPopupResizeObserver) {
                openPopupResizeObserver.disconnect();
                openPopupResizeObserver = null;
            }
            return;
        }

        var mappedBtn = getToolbarButtonForPopup(getEditorToolbar(), popup);
        if (mappedBtn) {
            btn = mappedBtn;
        }

        var btnRect = btn.getBoundingClientRect();
        var popupWidth = popup.offsetWidth || 520;
        var popupHeight = popup.offsetHeight || 0;
        var gap = 6;
        var margin = 8;
        var left = btnRect.left;

        if (left + popupWidth > window.innerWidth - margin) {
            left = Math.max(margin, btnRect.right - popupWidth);
        }
        left = Math.max(margin, Math.min(left, window.innerWidth - popupWidth - margin));

        var top = btnRect.bottom + gap;
        if (!popupShouldOpenBelow(popup) && popupHeight > 0 && top + popupHeight > window.innerHeight - margin) {
            top = Math.max(margin, btnRect.top - popupHeight - gap);
        }

        var leftPx = left + 'px';
        var topPx = top + 'px';
        var styleChanged = popup.style.position !== 'fixed'
            || popup.style.left !== leftPx
            || popup.style.top !== topPx
            || popup.style.right !== 'auto'
            || popup.style.bottom !== 'auto'
            || popup.style.margin !== '0'
            || popup.style.transform !== 'none'
            || popup.style.zIndex !== '1045'
            || !popup.classList.contains('rgbj-help-popup-fixed');

        if (!styleChanged) {
            return;
        }

        popupRepositionLock = true;
        try {
            popup.style.position = 'fixed';
            popup.style.left = leftPx;
            popup.style.top = topPx;
            popup.style.right = 'auto';
            popup.style.bottom = 'auto';
            popup.style.margin = '0';
            popup.style.transform = 'none';
            popup.style.zIndex = '1045';
            popup.classList.add('rgbj-help-popup-fixed');
        } finally {
            popupRepositionLock = false;
        }

        observeOpenPopupSize(popup, btn);
    }

    function repositionOpenEditorPopup() {
        if (!editorBodyEl) {
            return;
        }

        var defaultUi = editorBodyEl.querySelector('.toastui-editor-defaultUI');
        if (!defaultUi || !defaultUi.querySelector('.toastui-editor-popup')) {
            return;
        }

        schedulePopupRepositionOnce(getActivePopupToolbarButton());
    }

    function initPopupToolbarButtons() {
        var toolbar = getEditorToolbar();
        if (!toolbar || toolbar.dataset.rgbjPopupFix) {
            return;
        }

        toolbar.dataset.rgbjPopupFix = '1';
        toolbar.addEventListener('click', function (event) {
            var btn = event.target.closest('button.toastui-editor-toolbar-icons');
            if (!btn || !toolbar.contains(btn)) {
                return;
            }

            lastPopupToolbarBtn = btn;
            schedulePopupReposition(btn);
        });

        var defaultUi = editorBodyEl.querySelector('.toastui-editor-defaultUI');
        if (!defaultUi || typeof MutationObserver === 'undefined') {
            return;
        }

        var popupObserver = new MutationObserver(function () {
            if (defaultUi.querySelector('.toastui-editor-popup')) {
                schedulePopupRepositionOnce(getActivePopupToolbarButton());
            }
        });
        popupObserver.observe(defaultUi, { childList: true, subtree: true });

        if (!document.documentElement.dataset.rgbjPopupScrollInit) {
            document.documentElement.dataset.rgbjPopupScrollInit = '1';
            document.addEventListener('scroll', repositionOpenEditorPopup, { passive: true, capture: true });
            window.addEventListener('resize', repositionOpenEditorPopup);
        }
    }

    function initPinnedEditorToolbar() {
        if (!editorBodyEl || editorBodyEl.dataset.rgbjPinInit) {
            return;
        }

        var toolbar = getEditorToolbar();
        var pane = editorBodyEl.closest('.rgbj-help-editor-pane--edit');
        if (!toolbar || !pane) {
            window.setTimeout(initPinnedEditorToolbar, 50);
            return;
        }

        editorBodyEl.dataset.rgbjPinInit = '1';

        var anchor = document.createElement('div');
        anchor.className = 'rgbj-help-toolbar-pin-anchor';
        anchor.setAttribute('aria-hidden', 'true');
        toolbar.parentNode.insertBefore(anchor, toolbar);

        var spacer = document.createElement('div');
        spacer.className = 'rgbj-help-toolbar-pin-spacer';
        spacer.hidden = true;
        toolbar.after(spacer);

        function updatePinnedToolbar() {
            var topOffset = 0;
            var anchorTop = anchor.getBoundingClientRect().top;
            var paneRect = pane.getBoundingClientRect();
            var toolbarH = toolbar.offsetHeight;
            var shouldPin = anchorTop <= topOffset && paneRect.bottom > topOffset + toolbarH;
            var wasPinned = toolbar.classList.contains('is-pinned');

            if (shouldPin) {
                if (!wasPinned) {
                    spacer.style.height = toolbarH + 'px';
                    spacer.hidden = false;
                    toolbar.classList.add('is-pinned');
                }

                toolbar.style.top = topOffset + 'px';
                toolbar.style.width = paneRect.width + 'px';
                toolbar.style.left = paneRect.left + 'px';
            } else {
                toolbar.classList.remove('is-pinned');
                toolbar.style.top = '';
                toolbar.style.width = '';
                toolbar.style.left = '';
                spacer.hidden = true;
            }

            if (wasPinned !== toolbar.classList.contains('is-pinned')) {
                schedulePopupRepositionOnce();
            } else if (editorBodyEl.querySelector('.toastui-editor-defaultUI .toastui-editor-popup')) {
                schedulePopupRepositionOnce();
            }
        }

        document.addEventListener('scroll', updatePinnedToolbar, { passive: true, capture: true });
        window.addEventListener('resize', updatePinnedToolbar);

        if (typeof ResizeObserver !== 'undefined') {
            var pinResizeObserver = new ResizeObserver(function () {
                updatePinnedToolbar();
            });
            pinResizeObserver.observe(pane);
            pinResizeObserver.observe(toolbar);
        }

        updatePinnedToolbar();
    }

    function buildTableToolbarItems() {
        return [
            createTableToolbarItem('tableAddRowUp', 'Insert row before', 'addRowToUp', 'addRowUp'),
            createTableToolbarItem('tableAddRowDown', 'Insert row after', 'addRowToDown', 'addRowDown'),
            createTableToolbarItem('tableRemoveRow', 'Delete row', 'removeRow', 'deleteRow', { danger: true }),
            createTableToolbarItem('tableAddColLeft', 'Insert column before', 'addColumnToLeft', 'addColLeft'),
            createTableToolbarItem('tableAddColRight', 'Insert column after', 'addColumnToRight', 'addColRight'),
            createTableToolbarItem('tableRemoveCol', 'Delete column', 'removeColumn', 'deleteCol', { danger: true }),
        ];
    }

    function getCodeSyntaxHighlightPlugin() {
        if (
            typeof toastui === 'undefined' ||
            !toastui.Editor ||
            !toastui.Editor.plugin ||
            !toastui.Editor.plugin.codeSyntaxHighlight ||
            typeof Prism === 'undefined'
        ) {
            return null;
        }

        return toastui.Editor.plugin.codeSyntaxHighlight;
    }

    function initEditorToolbarEnhancements() {
        applyNativeToolbarTitles();
        initHeadingToolbarLabel();
        initPopupToolbarButtons();
        initPinnedEditorToolbar();
    }

    function initEditor() {
        if (editor || typeof toastui === 'undefined' || !toastui.Editor || !editorBodyEl) {
            return;
        }

        var geminiToolbarItem = buildGeminiToolbarItem();
        var linkToolbarItem = buildLinkToolbarItem();
        var imageToolbarItem = buildImageToolbarItem();
        var helpPanelToolbarItem = buildHelpPanelToolbarItem();
        var codeSyntaxHighlight = getCodeSyntaxHighlightPlugin();
        var editorOptions = {
            el: editorBodyEl,
            height: 'auto',
            minHeight: '240px',
            theme: getEditorTheme(),
            initialEditType: 'wysiwyg',
            hideModeSwitch: true,
            usageStatistics: false,
            autofocus: true,
            toolbarItems: [
                toolbarGroup('heading', 'bold', 'italic', 'strike'),
                toolbarGroup('hr', 'quote', helpPanelToolbarItem),
                toolbarGroup('ul', 'ol', 'task'),
                toolbarGroup('table').concat(buildTableToolbarItems()),
                toolbarGroup(linkToolbarItem, imageToolbarItem, geminiToolbarItem),
                toolbarGroup('code', 'codeblock'),
            ],
            hooks: {
                addImageBlobHook: handleImageBlobHook,
            },
            events: {
                change: function () {
                    if (suppressEditorChange) {
                        return;
                    }
                    markDirty();
                    syncEditorHeight();
                    syncTableToolbarState();
                    scheduleHelpPanelDecoration();
                },
            },
        };

        editorOptions.plugins = [
            rgbjHelpListContinuationPlugin,
            rgbjHelpHardBreakShortcutPlugin,
            rgbjHelpListImageLayoutPlugin,
            rgbjHelpTablePlugin,
            rgbjHelpLinkPlugin,
            rgbjHelpPanelPlugin,
            rgbjHelpInlineImagePlugin,
            rgbjHelpBlockCursorAffordancePlugin,
            rgbjHelpCodeBlockChromePlugin,
        ];
        if (codeSyntaxHighlight) {
            editorOptions.plugins.unshift([codeSyntaxHighlight, { highlighter: Prism }]);
        }

        editor = new toastui.Editor(editorOptions);

        applyEditorSiteStyles();
        syncEditorHeight();

        var defaultUi = editorBodyEl.querySelector('.toastui-editor-defaultUI');
        if (defaultUi && getEditorTheme() === 'dark' && !defaultUi.classList.contains('toastui-editor-dark')) {
            defaultUi.classList.add('toastui-editor-dark');
        }

        initEditorHeightSync();
        initEditorToolbarEnhancements();
        initHeadingShortcuts();
        initCodeBlockPlainTextPaste();
        initCodeBlockToolbarDefaultLanguage();
        initEditorCodeBlockChromeEvents();
        initTableToolbarStateSync();
        initHorizontalRuleSelection();
        initListBackspaceHandler();
        initLinkPopupForm();
        initHelpPanelPopupForm();
        initHelpPanelSelectionTracking();
        initImagePopupLibrary();
        initGemini();

        window.setTimeout(function () {
            syncEditorHeight();
        }, 150);
    }

    function groupArticlesByCategory(items) {
        var grouped = {};

        items.forEach(function (article) {
            var category = String(article.category || '').trim();
            if (category === '') {
                category = 'General';
            }
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(article);
        });

        return Object.keys(grouped)
            .sort(function (a, b) {
                return a.localeCompare(b, undefined, { sensitivity: 'base' });
            })
            .map(function (category) {
                return {
                    category: category,
                    articles: grouped[category],
                };
            });
    }

    function populateSelect() {
        var previousSlug = selectEl.value;

        selectEl.innerHTML = '';
        var placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = articles.length ? 'Choose an article…' : 'No articles yet';
        selectEl.appendChild(placeholder);

        groupArticlesByCategory(articles).forEach(function (group) {
            var optgroup = document.createElement('optgroup');
            optgroup.label = group.category;

            group.articles.forEach(function (article) {
                var option = document.createElement('option');
                option.value = article.slug;
                option.textContent = article.title + (article.draft ? ' (draft)' : '');
                optgroup.appendChild(option);
            });

            selectEl.appendChild(optgroup);
        });

        if (previousSlug && selectEl.querySelector('option[value="' + CSS.escape(previousSlug) + '"]')) {
            selectEl.value = previousSlug;
        }
    }

    async function loadArticleList() {
        try {
            var data = await apiFetch('');
            if (Array.isArray(data.articles) && data.articles.length > 0) {
                articles = data.articles;
                populateSelect();
            }
        } catch (err) {
            if (articles.length === 0) {
                throw err;
            }
            setStatus('Using cached article list. API sync failed: ' + err.message, true);
        }
    }

    function syncSlugFromEditor() {
        var fields = readMetaForm();
        if (fields.slug && slugEl) {
            slugEl.value = fields.slug;
        }
    }

    function getArticleViewUrl(article) {
        if (!article || !article.url) {
            return '';
        }

        var published = String(article.published || '').trim();
        if (article.draft || published === '') {
            var joiner = article.url.indexOf('?') >= 0 ? '&' : '?';
            return article.url + joiner + 'preview=1';
        }

        return article.url;
    }

    function updateViewLink(slug) {
        if (!viewLink) {
            return;
        }
        var article = articles.find(function (item) {
            return item.slug === slug;
        });
        var viewUrl = getArticleViewUrl(article);
        if (viewUrl) {
            viewLink.href = viewUrl;
            viewLink.classList.remove('d-none');
        } else {
            viewLink.classList.add('d-none');
        }

        syncDeleteButtonState();
    }

    function syncDeleteButtonState() {
        if (!deleteBtn) {
            return;
        }

        deleteBtn.disabled = !currentSlug;
    }

    function rememberEditorSlug(slug) {
        try {
            if (slug) {
                sessionStorage.setItem('rgbj-help-editor-slug', slug);
            } else {
                sessionStorage.removeItem('rgbj-help-editor-slug');
            }
        } catch (err) {
            // sessionStorage may be unavailable in some browsers or privacy modes
        }

        var url = new URL(window.location.href);
        if (slug) {
            url.searchParams.set('slug', slug);
        } else {
            url.searchParams.delete('slug');
        }
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }

    function readInitialSlug() {
        var params = new URLSearchParams(window.location.search);
        var fromUrl = (params.get('slug') || '').trim();
        if (fromUrl) {
            return fromUrl;
        }

        try {
            return (sessionStorage.getItem('rgbj-help-editor-slug') || '').trim();
        } catch (err) {
            return '';
        }
    }

    async function openSlug(slug) {
        if (!slug) {
            return;
        }

        if (dirty && !window.confirm('Discard unsaved changes?')) {
            selectEl.value = currentSlug;
            return;
        }

        setStatus('Loading…');
        var data = await apiFetch('?slug=' + encodeURIComponent(slug));
        currentSlug = data.slug;
        slugEl.value = data.slug;
        selectEl.value = data.slug;
        setArticleMarkdown(data.markdown || '');
        dirty = false;
        rememberEditorSlug(data.slug);
        updateViewLink(data.slug);
        setStatus('Loaded ' + data.filename + '.');
    }

    async function saveArticle() {
        var slug = slugEl.value.trim();
        if (!slug) {
            setStatus('Enter a slug before saving.', true);
            return;
        }

        if (metaPublishedEl && !metaPublishedEl.value.trim()) {
            metaPublishedEl.value = todayIsoDateLocal();
            dirty = true;
        }

        saveBtn.disabled = true;
        setStatus('Saving…');

        try {
            var result = await apiFetch('', {
                method: 'POST',
                body: JSON.stringify({
                    slug: slug,
                    markdown: getArticleMarkdown(),
                    previousSlug: currentSlug || '',
                }),
            });

            currentSlug = result.slug;
            slugEl.value = result.slug;
            dirty = false;
            rememberEditorSlug(result.slug);
            await loadArticleList();
            selectEl.value = currentSlug;
            updateViewLink(currentSlug);
            setStatus('Saved ' + result.filename + '.');
        } catch (err) {
            setStatus(err.message || 'Save failed.', true);
        } finally {
            saveBtn.disabled = false;
        }
    }

    async function deleteArticle() {
        if (!currentSlug) {
            setStatus('Open a saved article before deleting.', true);
            return;
        }

        var title = metaTitleEl ? metaTitleEl.value.trim() : '';
        var label = title || currentSlug;
        if (
            !window.confirm(
                'Delete “' +
                    label +
                    '” permanently? This removes help/content/' +
                    currentSlug +
                    '.md from the server.'
            )
        ) {
            return;
        }

        deleteBtn.disabled = true;
        setStatus('Deleting…');

        try {
            await apiFetch('?slug=' + encodeURIComponent(currentSlug), {
                method: 'DELETE',
            });

            var deletedSlug = currentSlug;
            currentSlug = '';
            dirty = false;
            rememberEditorSlug('');
            await loadArticleList();
            newArticle();
            setStatus('Deleted ' + deletedSlug + '.md.');
        } catch (err) {
            setStatus(err.message || 'Delete failed.', true);
            syncDeleteButtonState();
        }
    }

    function newArticle() {
        if (dirty && !window.confirm('Discard unsaved changes?')) {
            return;
        }

        currentSlug = '';
        slugEl.value = 'new-article';
        selectEl.value = '';
        rememberEditorSlug('');
        setArticleMarkdown(buildArticleTemplate());
        dirty = true;
        viewLink.classList.add('d-none');
        syncDeleteButtonState();
        setStatus('New article template loaded. Set slug and metadata, then Save.');
    }

    selectEl.addEventListener('change', function () {
        if (selectEl.value) {
            openSlug(selectEl.value).catch(function (err) {
                setStatus(err.message, true);
            });
        }
    });

    saveBtn.addEventListener('click', function () {
        saveArticle();
    });

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
            deleteArticle();
        });
    }

    document.addEventListener(
        'keydown',
        function (event) {
            if (!(event.ctrlKey || event.metaKey) || String(event.key).toLowerCase() !== 's') {
                return;
            }
            if (!appEl || appEl.classList.contains('d-none') || !editor) {
                return;
            }

            // Toast UI binds Mod-s to strikethrough — intercept before the editor sees it.
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            saveArticle();
        },
        true
    );

    newBtn.addEventListener('click', newArticle);

    reloadBtn.addEventListener('click', function () {
        if (currentSlug) {
            openSlug(currentSlug).catch(function (err) {
                setStatus(err.message, true);
            });
        } else {
            loadArticleList().catch(function (err) {
                setStatus(err.message, true);
            });
        }
    });

    loginBtn.addEventListener('click', function () {
        signInWithPopup(auth, new GoogleAuthProvider()).catch(function (err) {
            setStatus(err.message || 'Sign-in failed.', true);
        });
    });

    logoutBtn.addEventListener('click', function () {
        signOut(auth);
    });

    window.addEventListener('beforeunload', function (event) {
        if (dirty) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    onAuthStateChanged(auth, function (user) {
        showLoading(false);

        if (user && user.uid === adminUid) {
            showDenied(false);
            initFrontmatterPanel();
            showApp(true);
            initEditor();
            initMetaForm();
            populateSelect();

            loadArticleList()
                .then(function () {
                    var initial = readInitialSlug();
                    if (initial) {
                        return openSlug(initial);
                    }
                    setStatus(articles.length ? 'Ready.' : 'No articles found in help/content/.');
                })
                .catch(function (err) {
                    setStatus(err.message, true);
                });
            return;
        }

        showApp(false);
        showDenied(true);
    });
})();
