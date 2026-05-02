/**
 * Site-wide i18n: loads JSON from /locales/{lang}.json and applies [data-i18n*] attributes.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'rgbjunkie_lang';
    var LOCALES_BASE = '/locales/';

    /** @type {{ code: string, labelKey: string }[]} labelKey resolved via t() so labels localize */
    var LANGUAGE_CODES = [
        { code: 'en', labelKey: 'lang_en' },
        { code: 'es', labelKey: 'lang_es' },
        { code: 'fr', labelKey: 'lang_fr' },
        { code: 'de', labelKey: 'lang_de' },
        { code: 'pt', labelKey: 'lang_pt' },
        { code: 'zh-CN', labelKey: 'lang_zh' },
        { code: 'hi', labelKey: 'lang_hi' }
    ];

    var I18N = {
        cur: 'en',
        strings: {},

        t: function (key, vars) {
            if (!key) return '';
            var s = this.strings[key];
            if (s === undefined || s === null || s === '') return key;
            if (vars && typeof vars === 'object' && !Array.isArray(vars)) {
                s = String(s).replace(/\{(\w+)\}/g, function (_, name) {
                    return vars[name] !== undefined && vars[name] !== null ? String(vars[name]) : '';
                });
            }
            return s;
        },

        init: async function () {
            if (this._initPromise) return this._initPromise;
            var self = this;
            this._initPromise = (async function () {
                var saved = localStorage.getItem(STORAGE_KEY);
                var lang = saved && LANGUAGE_CODES.some(function (l) { return l.code === saved; })
                    ? saved
                    : self.detectBrowserLang();
                await self.setLanguage(lang);
            })();
            return this._initPromise;
        },

        detectBrowserLang: function () {
            var langs = navigator.languages || [navigator.language || 'en'];
            for (var i = 0; i < langs.length; i++) {
                var tag = ((langs[i] || '') + '').trim();
                if (!tag) continue;
                var lower = tag.toLowerCase();
                var j;
                for (j = 0; j < LANGUAGE_CODES.length; j++) {
                    if (LANGUAGE_CODES[j].code.toLowerCase() === lower) return LANGUAGE_CODES[j].code;
                }
                var primary = lower.split('-')[0];
                for (j = 0; j < LANGUAGE_CODES.length; j++) {
                    var c = LANGUAGE_CODES[j].code.toLowerCase();
                    if (c === primary || c.split('-')[0] === primary) return LANGUAGE_CODES[j].code;
                }
            }
            return 'en';
        },

        setLanguage: async function (lang) {
            try {
                var response = await fetch(LOCALES_BASE + encodeURIComponent(lang) + '.json');
                if (!response.ok) throw new Error('Missing locale');
                this.strings = await response.json();
                this.cur = lang;
                localStorage.setItem(STORAGE_KEY, lang);
            } catch (e) {
                if (lang !== 'en') {
                    await this.setLanguage('en');
                    return;
                }
                console.warn('I18N: failed to load locale, using empty strings', e);
                this.strings = {};
                this.cur = 'en';
            }
            document.documentElement.lang = this.cur.indexOf('-') > -1 ? this.cur : this.cur;
            this.applyDocumentLanguage();
            this.updateStaticUI();
            this.populateLangSwitcher();
            this.refreshBootstrapTooltips();
            window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: this.cur } }));
        },

        refreshBootstrapTooltips: function () {
            if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) return;
            /** Dropdown toggles must not get Tooltips — they break outside-click close (BS dropdown + Tooltip conflict). */
            function skipTooltip(el) {
                var t = (el.getAttribute('data-bs-toggle') || '').toLowerCase();
                return t.indexOf('dropdown') !== -1;
            }
            document.querySelectorAll('[title]').forEach(function (el) {
                if (skipTooltip(el)) return;
                var inst = bootstrap.Tooltip.getInstance(el);
                if (inst) inst.dispose();
            });
            document.querySelectorAll('[title]').forEach(function (el) {
                if (skipTooltip(el)) return;
                if (!bootstrap.Tooltip.getInstance(el)) new bootstrap.Tooltip(el);
            });
        },

        applyDocumentLanguage: function () {
            var t = this.t.bind(this);
            var docKind = document.body && document.body.getAttribute('data-i18n-doc');
            if (docKind === 'showcase') {
                if (this.strings.showcase_meta_title) document.title = t('showcase_meta_title');
                var metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc && this.strings.showcase_meta_description) metaDesc.setAttribute('content', t('showcase_meta_description'));
                var ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle && this.strings.showcase_og_title) ogTitle.setAttribute('content', t('showcase_og_title'));
                var ogDesc = document.querySelector('meta[property="og:description"]');
                if (ogDesc && this.strings.showcase_og_description) ogDesc.setAttribute('content', t('showcase_og_description'));
                var twTitle = document.querySelector('meta[name="twitter:title"]');
                if (twTitle && this.strings.showcase_og_title) twTitle.setAttribute('content', t('showcase_og_title'));
                var twDesc = document.querySelector('meta[name="twitter:description"]');
                if (twDesc && this.strings.showcase_og_description) twDesc.setAttribute('content', t('showcase_og_description'));
                return;
            }
            if (docKind === 'builder') {
                if (this.strings.builder_page_title) document.title = t('builder_page_title');
                var ogTitleB = document.querySelector('meta[property="og:title"]');
                if (ogTitleB && this.strings.builder_og_title) ogTitleB.setAttribute('content', t('builder_og_title'));
                var ogDescB = document.querySelector('meta[property="og:description"]');
                if (ogDescB && this.strings.builder_og_description) ogDescB.setAttribute('content', t('builder_og_description'));
                var twTitleB = document.querySelector('meta[name="twitter:title"]');
                if (twTitleB && this.strings.builder_og_title) twTitleB.setAttribute('content', t('builder_og_title'));
                var twDescB = document.querySelector('meta[name="twitter:description"]');
                if (twDescB && this.strings.builder_og_description) twDescB.setAttribute('content', t('builder_og_description'));
                return;
            }
            if (docKind === 'builder-gallery') {
                if (this.strings.builder_gallery_page_title) document.title = t('builder_gallery_page_title');
                var ogTitleBg = document.querySelector('meta[property="og:title"]');
                if (ogTitleBg && this.strings.builder_gallery_og_title) ogTitleBg.setAttribute('content', t('builder_gallery_og_title'));
                var ogDescBg = document.querySelector('meta[property="og:description"]');
                if (ogDescBg && this.strings.builder_gallery_og_description) ogDescBg.setAttribute('content', t('builder_gallery_og_description'));
                var twTitleBg = document.querySelector('meta[name="twitter:title"]');
                if (twTitleBg && this.strings.builder_gallery_og_title) twTitleBg.setAttribute('content', t('builder_gallery_og_title'));
                var twDescBg = document.querySelector('meta[name="twitter:description"]');
                if (twDescBg && this.strings.builder_gallery_og_description) twDescBg.setAttribute('content', t('builder_gallery_og_description'));
                return;
            }
            if (docKind === 'gallery-effect') {
                if (this.strings.effect_gallery_page_title) document.title = t('effect_gallery_page_title');
                var ogTitleGe = document.querySelector('meta[property="og:title"]');
                if (ogTitleGe && this.strings.effect_gallery_og_title) ogTitleGe.setAttribute('content', t('effect_gallery_og_title'));
                var ogDescGe = document.querySelector('meta[property="og:description"]');
                if (ogDescGe && this.strings.effect_gallery_og_description) ogDescGe.setAttribute('content', t('effect_gallery_og_description'));
                return;
            }
            document.title = t('page_title');
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && this.strings.meta_description) metaDesc.setAttribute('content', t('meta_description'));
            var ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle && this.strings.og_title) ogTitle.setAttribute('content', t('og_title'));
            var ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc && this.strings.og_description) ogDesc.setAttribute('content', t('og_description'));
            var twTitle = document.querySelector('meta[name="twitter:title"]');
            if (twTitle && this.strings.og_title) twTitle.setAttribute('content', t('og_title'));
            var twDesc = document.querySelector('meta[name="twitter:description"]');
            if (twDesc && this.strings.og_description) twDesc.setAttribute('content', t('og_description'));
        },

        updateStaticUI: function () {
            var self = this;
            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                var key = el.getAttribute('data-i18n');
                if (!key) return;
                var text = self.t(key);
                if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
                var key = el.getAttribute('data-i18n-placeholder');
                if (key) el.placeholder = self.t(key);
            });
            document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
                var key = el.getAttribute('data-i18n-title');
                if (key) el.title = self.t(key);
            });
            document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
                var key = el.getAttribute('data-i18n-aria-label');
                if (key) el.setAttribute('aria-label', self.t(key));
            });
            document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
                var key = el.getAttribute('data-i18n-alt');
                if (key) el.setAttribute('alt', self.t(key));
            });
        },

        populateLangSwitcher: function () {
            var menu = document.getElementById('lang-switcher-menu');
            var label = document.getElementById('lang-switcher-label');
            var self = this;
            if (menu) {
                menu.innerHTML = '';
                LANGUAGE_CODES.forEach(function (entry) {
                    var li = document.createElement('li');
                    var a = document.createElement('a');
                    a.className = 'dropdown-item' + (entry.code === self.cur ? ' active' : '');
                    a.href = '#';
                    a.setAttribute('hreflang', entry.code);
                    a.textContent = self.t(entry.labelKey);
                    a.addEventListener('click', function (e) {
                        e.preventDefault();
                        self.setLanguage(entry.code);
                    });
                    li.appendChild(a);
                    menu.appendChild(li);
                });
            }
            if (label) {
                var curEntry = LANGUAGE_CODES.find(function (l) { return l.code === self.cur; });
                label.textContent = curEntry ? self.t(curEntry.labelKey) : self.cur;
            }
        }
    };

    window.I18N = I18N;
    window.t = function (key, second) {
        if (typeof second === 'object' && second !== null && !Array.isArray(second)) {
            return I18N.t(key, second);
        }
        var v = I18N.t(key);
        if (v === key && typeof second === 'string') return second;
        return v;
    };
    /** Used by main.js for runtime strings (including code outside DOMContentLoaded). */
    window.tr = function (key, vars) {
        return window.I18N ? window.I18N.t(key, vars) : key;
    };
})();
