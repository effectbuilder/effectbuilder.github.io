/**
 * Internationalization — loads ./locales/{lang}.json
 * Language preference is shared site-wide via localStorage key rgbjunkie_lang (same as js/i18n.js).
 */
const I18N = {
    cur: 'en',
    /** Canonical key shared with /js/i18n.js (Effect Builder, showcase, etc.) */
    STORAGE_KEY: 'rgbjunkie_lang',
    LEGACY_KEYS: ['srgb_combiner_lang', 'srgb_skydimo_lang'],
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

    /** Map site locale codes to JSON filenames available under ./locales/ */
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

        document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
            const key = el.getAttribute('data-i18n-ph');
            el.placeholder = this.t(key);
        });

        const layoutButtons = ['layered', 'side', 'vert', 'grid', 'pip'];
        layoutButtons.forEach((id) => {
            const btn = document.getElementById(`btn-${id}`);
            if (btn) btn.innerText = this.t(`layout_${id}`);
        });

        const sort = document.getElementById('lib-sort');
        if (sort) {
            sort.options[0].text = this.t('sort_new');
            sort.options[1].text = this.t('sort_old');
            sort.options[2].text = this.t('sort_az');
            sort.options[3].text = this.t('sort_za');
        }
    }
};
