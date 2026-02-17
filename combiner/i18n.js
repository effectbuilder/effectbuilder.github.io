/**
 * Internationalization (i18n) Module
 * Handles language detection and text replacement.
 */
const I18N = {
    cur: 'en',
    STORAGE_KEY: 'srgb_combiner_lang',
    locales: {
        en: {
            title: "SRGB Effect Combiner",
            meta_header: "1. Metadata",
            meta_title_p: "Effect Title",
            meta_pub_p: "Publisher Name",
            meta_desc_p: "Description",
            source_header: "2. Source Files",
            btn_add_files: "Add HTML Effects",
            btn_open_lib: "Open Effect Library",
            layout_header: "3. Preview Layout",
            layers_header: "4. Layers",
            btn_reset: "Reset",
            btn_export: "Export .ZIP",
            lib_header: "Library",
            lib_empty: "No effects saved.<br><br>Drag & drop .html files here to add them.",
            sort_new: "Newest First",
            sort_old: "Oldest First",
            sort_az: "Name (A-Z)",
            sort_za: "Name (Z-A)",
            processing: "Processing...",
            add_selected: "Add Selected",
            confirm_delete: "Delete this effect?",
            confirm_clear_lib: "Delete ALL saved effects?",
            confirm_reset_proj: "Clear project workspace?",
            blend_normal: "Normal",
            blend_screen: "Screen",
            blend_overlay: "Overlay",
            blend_multiply: "Multiply",
            blend_difference: "Difference",
            blend_lighter: "Lighter",
            btn_clear_lib: "🗑 Clear",
            layer_enabled: "Enabled",
            layer_opacity: "Opacity",
            layer_blend: "Blend Mode",
            layer_controls: "Detected Controls:",
            layout_layered: "Layered",
            layout_side: "Side/Side",
            layout_vert: "Vertical",
            layout_grid: "Grid",
            layout_pip: "Picture in Picture"
        },
        es: {
            title: "Combinador de Efectos SRGB",
            meta_header: "1. Metadatos",
            meta_title_p: "Título del Efecto",
            meta_pub_p: "Nombre del Editor",
            meta_desc_p: "Descripción",
            source_header: "2. Archivos Fuente",
            btn_add_files: "Añadir Efectos HTML",
            btn_open_lib: "Abrir Biblioteca de Efectos",
            layout_header: "3. Diseño de Previsualización",
            layers_header: "4. Capas",
            btn_reset: "Reiniciar",
            btn_export: "Exportar .ZIP",
            lib_header: "Biblioteca",
            lib_empty: "No hay efectos guardados.<br><br>Arrastra y suelta archivos .html aquí.",
            sort_new: "Más nuevos primero",
            sort_old: "Más antiguos primero",
            sort_az: "Nombre (A-Z)",
            sort_za: "Nombre (Z-A)",
            processing: "Procesando...",
            add_selected: "Añadir seleccionados",
            confirm_delete: "¿Eliminar este efecto?",
            confirm_clear_lib: "¿Eliminar TODOS los efectos guardados?",
            confirm_reset_proj: "¿Limpiar el espacio de trabajo del proyecto?",
            blend_normal: "Normal",
            blend_screen: "Pantalla (Aclarar)",
            blend_overlay: "Superponer",
            blend_multiply: "Multiplicar",
            blend_difference: "Diferencia",
            blend_lighter: "Aclarar",
            btn_clear_lib: "🗑 Limpiar",
            layer_enabled: "Habilitado",
            layer_opacity: "Opacidad",
            layer_blend: "Modo de Mezcla",
            layer_controls: "Controles Detectados:",
            layout_layered: "En Capas",
            layout_side: "Lado a Lado",
            layout_vert: "Vertical",
            layout_grid: "Cuadrícula",
            layout_pip: "Imagen en Imagen"
        },
        zh: {
            title: "SRGB 特效合并器",
            meta_header: "1. 元数据",
            meta_title_p: "特效标题",
            meta_pub_p: "发布者名称",
            meta_desc_p: "描述",
            source_header: "2. 源文件",
            btn_add_files: "添加 HTML 特效",
            btn_open_lib: "打开特效库",
            layout_header: "3. 预览布局",
            layers_header: "4. 图层",
            btn_reset: "重置",
            btn_export: "导出 .ZIP",
            lib_header: "库",
            lib_empty: "未保存特效。<br><br>将 .html 文件拖放到此处添加。",
            sort_new: "最新优先",
            sort_old: "最早优先",
            sort_az: "名称 (A-Z)",
            sort_za: "名称 (Z-A)",
            processing: "正在处理...",
            add_selected: "添加所选",
            confirm_delete: "删除此特效？",
            confirm_clear_lib: "删除所有已保存特效？",
            confirm_reset_proj: "清空项目工作区？",
            blend_normal: "正常",
            blend_screen: "滤色",
            blend_overlay: "叠加",
            blend_multiply: "正片叠底",
            blend_difference: "差值",
            blend_lighter: "变亮",
            btn_clear_lib: "🗑 清空数据库",
            layer_enabled: "启用",
            layer_opacity: "不透明度",
            layer_blend: "混合模式",
            layer_controls: "检测到的控制：",
            layout_layered: "分层",
            layout_side: "并排",
            layout_vert: "垂直",
            layout_grid: "网格",
            layout_pip: "画中画"
        },
        hi: {
            title: "SRGB प्रभाव कम्बाइनर",
            meta_header: "1. मेटाडेटा",
            meta_title_p: "प्रभाव शीर्षक",
            meta_pub_p: "प्रकाशक का नाम",
            meta_desc_p: "विवरण",
            source_header: "2. स्रोत फ़ाइलें",
            btn_add_files: "HTML प्रभाव जोड़ें",
            btn_open_lib: "प्रभाव लाइब्रेरी खोलें",
            layout_header: "3. पूर्वावलोकन लेआउट",
            layers_header: "4. लेयर्स",
            btn_reset: "रीसेट करें",
            btn_export: ".ZIP निर्यात करें",
            lib_header: "लाइब्रेरी",
            lib_empty: "कोई प्रभाव सहेजा नहीं गया।",
            sort_new: "नवीनतम पहले",
            sort_old: "सबसे पुराना पहले",
            sort_az: "नाम (A-Z)",
            sort_za: "नाम (Z-A)",
            processing: "प्रसंस्करण हो रहा है...",
            add_selected: "चयनित जोड़ें",
            confirm_delete: "इस प्रभाव को हटाएं?",
            confirm_clear_lib: "सभी सहेजे गए प्रभावों को हटाएं?",
            confirm_reset_proj: "प्रोजेक्ट कार्यक्षेत्र साफ़ करें?",
            blend_normal: "सामान्य",
            blend_screen: "स्क्रीन",
            blend_overlay: "ओवरले",
            blend_multiply: "मल्टीप्लाई",
            blend_difference: "डिफरेंस",
            blend_lighter: "लाइटर",
            btn_clear_lib: "🗑 डेटाबेस साफ़ करें",
            layer_enabled: "सक्षम",
            layer_opacity: "अपारदर्शिता",
            layer_blend: "ब्लेंड मोड",
            layer_controls: "पता लगाए गए नियंत्रण:",
            layout_layered: "स्तरित",
            layout_side: "अगल-बगल",
            layout_vert: "लंबवत",
            layout_grid: "ग्रिड",
            layout_pip: "पिक्चर इन पिक्चर"
        },
        ja: {
            title: "SRGB エフェクトコンバイナー",
            meta_header: "1. メタデータ",
            meta_title_p: "エフェクト名",
            meta_pub_p: "パブリッシャー名",
            meta_desc_p: "説明",
            source_header: "2. ソースファイル",
            btn_add_files: "HTMLエフェクトを追加",
            btn_open_lib: "エフェクトライブラリを開く",
            layout_header: "3. プレビューレイアウト",
            layers_header: "4. レイヤー",
            btn_reset: "リセット",
            btn_export: ".ZIPを書き出し",
            lib_header: "ライブラリ",
            lib_empty: "保存されたエフェクトはありません。",
            sort_new: "新しい順",
            sort_old: "古い順",
            sort_az: "名前順 (A-Z)",
            sort_za: "名前順 (Z-A)",
            processing: "処理中...",
            add_selected: "選択項目を追加",
            confirm_delete: "このエフェクトを削除しますか？",
            confirm_clear_lib: "すべてのエフェクトを削除しますか？",
            confirm_reset_proj: "プロジェクトをクリアしますか？",
            blend_normal: "通常",
            blend_screen: "スクリーン",
            blend_overlay: "オーバーレイ",
            blend_multiply: "乗算",
            blend_difference: "差分",
            blend_lighter: "比較(明)",
            btn_clear_lib: "🗑 データベースを消去",
            layer_enabled: "有効",
            layer_opacity: "不透明度",
            layer_blend: "ブレンドモード",
            layer_controls: "検出されたコントロール:",
            layout_layered: "レイヤー",
            layout_side: "左右並列",
            layout_vert: "垂直並列",
            layout_grid: "グリッド",
            layout_pip: "ピクチャー・イン・ピクチャー"
        }
    },

    t(key) {
        return (this.locales[this.cur] && this.locales[this.cur][key]) 
            || this.locales['en'][key] 
            || key;
    },

    init() {
        const savedLang = localStorage.getItem(this.STORAGE_KEY);
        if (savedLang && this.locales[savedLang]) {
            this.cur = savedLang;
        } else {
            const browserLang = navigator.language.split('-')[0];
            if (this.locales[browserLang]) {
                this.cur = browserLang;
            }
        }
        this.updateStaticUI();
    },

    setLanguage(lang) {
        if (this.locales[lang]) {
            this.cur = lang;
            localStorage.setItem(this.STORAGE_KEY, lang);
            this.updateStaticUI();
        }
    },

    updateStaticUI() {
        // Translate INNER TEXT
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            // Safety: Only update if translation exists and doesn't destroy nested logic spans
            if(el.id === 'lib-count-header') {
                el.firstChild.textContent = translation + " ";
            } else {
                el.innerText = translation;
            }
        });

        // Translate PLACEHOLDERS
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            el.placeholder = this.t(key);
        });

        // Update Sort Select
        const sort = document.getElementById('lib-sort');
        if(sort) {
            sort.options[0].text = this.t('sort_new');
            sort.options[1].text = this.t('sort_old');
            sort.options[2].text = this.t('sort_az');
            sort.options[3].text = this.t('sort_za');
        }
    }
};