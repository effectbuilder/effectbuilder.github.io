/**
 * Skydimo — loads JSON from ./locales/
 * Language preference is shared site-wide via localStorage key rgbjunkie_lang (same as js/i18n.js).
 */
const I18N = {
    cur: 'en',
    STORAGE_KEY: 'rgbjunkie_lang',
    LEGACY_KEYS: ['srgb_skydimo_lang', 'srgb_combiner_lang'],
    strings: {},

    readStoredLang() {
        let v = localStorage.getItem(this.STORAGE_KEY);
        if (v) return v;
        for (let i = 0; i < this.LEGACY_KEYS.length; i++) {
            v = localStorage.getItem(this.LEGACY_KEYS[i]);
            if (v) {
                localStorage.setItem(this.STORAGE_KEY, v);
                return v;
            }
        }
        return null;
    },

    localeFilename(lang) {
        if (lang === 'zh-CN') return 'zh';
        return lang;
    },

    async init() {
        const savedLang = this.readStoredLang() || 'en';
        await this.setLanguage(savedLang);
    },

    async setLanguage(lang) {
        const preferred = lang;
        const candidates = [];
        const mapped = this.localeFilename(preferred);
        if (mapped !== preferred) candidates.push(mapped);
        candidates.push(preferred);
        if (!candidates.includes('en')) candidates.push('en');

        let bundle = null;
        let fileUsed = 'en';
        for (let i = 0; i < candidates.length; i++) {
            const code = candidates[i];
            try {
                const response = await fetch(`./locales/${code}.json`);
                if (response.ok) {
                    bundle = await response.json();
                    fileUsed = code;
                    break;
                }
            } catch (e) {
                /* continue */
            }
        }
        if (!bundle) {
            console.error('I18N: could not load any locale');
            return;
        }

        this.strings = bundle;
        localStorage.setItem(this.STORAGE_KEY, preferred);

        if (fileUsed === 'en' && preferred !== 'en') {
            this.cur = 'en';
        } else if (preferred === 'zh-CN' && fileUsed === 'zh') {
            this.cur = 'zh';
        } else {
            this.cur = preferred;
        }

        this.updateStaticUI();
    },

    t(key) {
        return this.strings[key] || key;
    },

    updateStaticUI() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria-label');
            el.setAttribute('aria-label', this.t(key));
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('title', this.t(key));
        });

        document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
            const key = el.getAttribute('data-i18n-ph');
            el.placeholder = this.t(key);
        });

        if (this.strings.page_title) {
            document.title = this.strings.page_title;
        }

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && this.strings.page_meta_description) {
            metaDesc.setAttribute('content', this.strings.page_meta_description);
        }

        const htmlLang = { en: 'en', es: 'es', zh: 'zh-CN', hi: 'hi', ja: 'ja', 'zh-CN': 'zh-CN' };
        document.documentElement.lang = htmlLang[this.cur] || (this.cur === 'zh' ? 'zh-CN' : 'en');

        if (typeof window.translateSkydimoEffectSelect === 'function') {
            window.translateSkydimoEffectSelect();
        }
    }
};
