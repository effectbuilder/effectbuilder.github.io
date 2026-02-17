/**
 * Internationalization (i18n) Module
 * Asynchronously loads JSON translation files from the /locales folder.
 */
const I18N = {
    cur: 'en',
    STORAGE_KEY: 'srgb_combiner_lang',
    strings: {}, // Holds the current translation data loaded from JSON

    /**
     * Initializes the language settings by checking local storage 
     * or browser defaults, then fetches the appropriate JSON file.
     */
    async init() {
        const savedLang = localStorage.getItem(this.STORAGE_KEY) || 'en';
        await this.setLanguage(savedLang);
    },

    /**
     * Fetches the requested language JSON file and updates the UI.
     * @param {string} lang - The language code (e.g., 'en', 'es', 'zh').
     */
    async setLanguage(lang) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) throw new Error(`Translation file for "${lang}" not found.`);
            
            this.strings = await response.json();
            this.cur = lang;
            localStorage.setItem(this.STORAGE_KEY, lang);
            
            this.updateStaticUI();
        } catch (e) {
            console.error("I18N Error:", e);
            if (lang !== 'en') await this.setLanguage('en');
        }
    },

    /**
     * Returns the translated string for a given key.
     * @param {string} key - The translation key.
     */
    t(key) {
        return this.strings[key] || key;
    },

    /**
     * Scans the DOM for elements with data-i18n or data-i18n-ph 
     * attributes and updates their content or placeholders.
     */
    updateStaticUI() {
        // Translate INNER TEXT via [data-i18n] tags
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Safety: Only update if translation exists and doesn't destroy nested logic spans
            if (el.id === 'lib-count-header') {
                el.firstChild.textContent = translation + " ";
            } else {
                el.innerText = translation;
            }
        });

        // Translate PLACEHOLDERS via [data-i18n-ph] tags
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            el.placeholder = this.t(key);
        });

        // Sync Layout Buttons (for consistency with generated layers)
        const layoutButtons = ['layered', 'side', 'vert', 'grid', 'pip'];
        layoutButtons.forEach(id => {
            const btn = document.getElementById(`btn-${id}`);
            if (btn) btn.innerText = this.t(`layout_${id}`);
        });

        // Update Library Sort Dropdown manually
        const sort = document.getElementById('lib-sort');
        if (sort) {
            sort.options[0].text = this.t('sort_new');
            sort.options[1].text = this.t('sort_old');
            sort.options[2].text = this.t('sort_az');
            sort.options[3].text = this.t('sort_za');
        }
    }
};