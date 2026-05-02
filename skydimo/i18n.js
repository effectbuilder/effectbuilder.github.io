/**
 * Skydimo page — loads JSON from ./locales/
 */
const I18N = {
    cur: 'en',
    STORAGE_KEY: 'srgb_skydimo_lang',
    strings: {},

    async init() {
        const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'en';
        await this.setLanguage(savedLang);
    },

    async setLanguage(lang) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) throw new Error(`Translation file for "${lang}" not found.`);

            this.strings = await response.json();
            this.cur = lang;
            localStorage.setItem(this.STORAGE_KEY, lang);

            this.updateStaticUI();
        } catch (e) {
            console.error('I18N Error:', e);
            if (lang !== 'en') await this.setLanguage('en');
        }
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

        const htmlLang = { en: 'en', es: 'es', zh: 'zh-CN', hi: 'hi', ja: 'ja' };
        document.documentElement.lang = htmlLang[this.cur] || 'en';

        if (typeof window.translateSkydimoEffectSelect === 'function') {
            window.translateSkydimoEffectSelect();
        }
    }
};
