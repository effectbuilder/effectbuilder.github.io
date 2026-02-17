// --- INDEXED DB MANAGER ---
const IDB = {
    dbName: 'SRGB_Library_DB',
    storeName: 'effects',
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = (e) => reject(e);
        });
    },

    async getAll() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async add(item) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.put(item);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async delete(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },

    async clear() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
};

// --- LIBRARY MANAGER ---
const Library = {
    KEY: 'srgb_effect_library_v1',
    fileQueue: [],
    activeWorkers: 0,
    concurrency: 5, // Process 5 at a time
    selectedIds: new Set(),
    sortOrder: 'date-desc', // Default sort

    async checkMigration() {
        const oldKey = 'srgb_effect_library_v1';
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
            try {
                const items = JSON.parse(oldData);
                if (Array.isArray(items) && items.length > 0) {
                    for (const item of items) await IDB.add(item);
                    localStorage.removeItem(oldKey);
                }
            } catch (e) { console.error("Migration failed", e); }
        }
    },

    async open() {
        this.selectedIds.clear();
        this.updateSelectionUI();
        document.getElementById('lib-modal').style.display = 'flex';
        document.getElementById('lib-sort').value = this.sortOrder; // Sync UI
        await this.render();
        this.initDragDrop();
    },

    close() {
        document.getElementById('lib-modal').style.display = 'none';
    },

    setSort(val) {
        this.sortOrder = val;
        this.render(); // Re-render with new sort order
    },

    async render() {
        const grid = document.getElementById('lib-grid');
        if (!grid) return;
        grid.innerHTML = "";

        try {
            const db = await IDB.getAll();
            const countEl = document.getElementById('lib-count');
            if (countEl) countEl.innerText = `(${db.length})`;

            if (db.length === 0) {
                // I18N Replacement
                const emptyMsg = typeof I18N !== 'undefined' ? I18N.t('lib_empty') : "No effects saved.";
                grid.innerHTML = `<p style='color:#666; width:100%; text-align:center; margin-top:50px;'>${emptyMsg}</p>`;
                return;
            }

            // --- SORTING LOGIC ---
            db.sort((a, b) => {
                const nameA = (a.title || a.name).toLowerCase();
                const nameB = (b.title || b.name).toLowerCase();

                switch (this.sortOrder) {
                    case 'date-desc': return b.date - a.date;
                    case 'date-asc': return a.date - b.date;
                    case 'alpha-asc': return nameA.localeCompare(nameB);
                    case 'alpha-desc': return nameB.localeCompare(nameA);
                    default: return 0;
                }
            });

            // Render Cards
            db.forEach(item => {
                this.addCardToGrid(item, grid);
            });
        } catch (e) {
            console.error("Render failed", e);
        }
    },

    // Helper to append a single card
    addCardToGrid(item, gridElement = null) {
        const grid = gridElement || document.getElementById('lib-grid');

        // Remove empty message if exists
        if (grid.querySelector('p')) grid.innerHTML = "";

        const card = document.createElement('div');
        card.className = `lib-card ${this.selectedIds.has(item.id) ? 'selected' : ''}`;
        card.id = `card-${item.id}`;

        const thumbSrc = item.thumb || "";
        const displayName = item.title || item.name;
        const displayDesc = item.desc || "";

        card.innerHTML = `
            <div class="lib-delete" onclick="event.stopPropagation(); Library.remove('${item.id}')">✖</div>
            <div class="lib-thumb-container" id="thumb-con-${item.id}">
                <img src="${thumbSrc}" class="lib-thumb">
            </div>
            <div class="lib-info">
                <div class="lib-title" title="${displayName}">${displayName}</div>
                <div class="lib-desc" title="${displayDesc}">${displayDesc}</div>
            </div>
        `;

        card.onclick = () => {
            this.toggleSelection(item.id);
        };

        grid.appendChild(card);
    },

    toggleSelection(id) {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
            document.getElementById(`card-${id}`).classList.remove('selected');
        } else {
            this.selectedIds.add(id);
            document.getElementById(`card-${id}`).classList.add('selected');
        }
        this.updateSelectionUI();
    },

    updateSelectionUI() {
        const btn = document.getElementById('btn-add-sel');
        const count = this.selectedIds.size;
        // I18N Replacement
        const label = typeof I18N !== 'undefined' ? I18N.t('add_selected') : "Add Selected";
        btn.innerText = `${label} (${count})`;

        if (count > 0) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    },

    async addSelectedToWorkspace() {
        const db = await IDB.getAll();
        const selected = db.filter(item => this.selectedIds.has(item.id));

        selected.forEach(item => {
            compositor.createLayer(item.title || item.name, item.html);
        });

        this.close();
    },

    async remove(id) {
        // I18N Replacement
        const msg = typeof I18N !== 'undefined' ? I18N.t('confirm_delete') : "Delete this effect?";
        if (!confirm(msg)) return;

        await IDB.delete(id);
        this.selectedIds.delete(id);
        const card = document.getElementById(`card-${id}`);
        if (card) card.remove();
        this.updateSelectionUI();

        // Update count
        const db = await IDB.getAll();
        document.getElementById('lib-count').innerText = `(${db.length})`;
    },

    async clearAll() {
        // I18N Replacement
        const msg = typeof I18N !== 'undefined' ? I18N.t('confirm_clear_lib') : "Delete ALL saved effects?";
        if (confirm(msg)) {
            await IDB.clear();
            this.selectedIds.clear();
            this.render();
            this.updateSelectionUI();
        }
    },

    // --- FILE HANDLING WITH DUPLICATE CHECK ---
    async handleFiles(files) {
        // 1. Get existing items to check duplicates
        const allItems = await IDB.getAll();
        const existingNames = new Set(allItems.map(i => i.name));

        const arr = Array.from(files).filter(file => {
            // DUPLICATE CHECK: Skip if name already exists
            if (existingNames.has(file.name)) {
                return false;
            }
            return true;
        });

        if (arr.length === 0) return;

        this.fileQueue.push(...arr);
        this.updateStatus();
        this.processQueue();
    },

    async processQueue() {
        while (this.fileQueue.length > 0 && this.activeWorkers < this.concurrency) {
            const file = this.fileQueue.shift();
            this.activeWorkers++;
            this.updateStatus();

            this.processOneFile(file).then((newItem) => {
                this.activeWorkers--;
                this.updateStatus();
                // Live Update: Add the new card immediately
                if (newItem && document.getElementById('lib-modal').style.display === 'flex') {
                    this.addCardToGrid(newItem);
                    // Update count
                    const countEl = document.getElementById('lib-count');
                    const cur = parseInt(countEl.innerText.replace('(', '').replace(')', '')) || 0;
                    countEl.innerText = `(${cur + 1})`;
                }
                this.processQueue();
            });
        }
    },

    updateStatus() {
        const el = document.getElementById('loading-indicator');
        const remaining = this.fileQueue.length + this.activeWorkers;
        const msg = typeof I18N !== 'undefined' ? I18N.t('processing') : "Processing...";
        if (remaining > 0) {
            el.style.display = 'inline-block';
            el.innerText = `${msg} ${remaining}`;
        } else {
            el.style.display = 'none';
        }
    },

    processOneFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                let htmlContent = e.target.result;
                const id = Date.now() + Math.random().toString(36).substr(2);

                // 1. Extract Meta
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, "text/html");
                let title = file.name;
                const titleTag = doc.querySelector('title');
                if (titleTag && titleTag.innerText) title = titleTag.innerText;
                let desc = "";
                const descTag = doc.querySelector('meta[description]') || doc.querySelector('meta[name="description"]');
                if (descTag) desc = descTag.getAttribute('description') || descTag.getAttribute('content');

                const metaTags = doc.querySelectorAll('meta[property]');

                // 2. Generate Setup Script (Engine + Variables)
                let setupScript = `
                <script>
                    console.log=function(){}; console.warn=function(){}; console.error=function(){};
                    window.onerror=function(){return true;};
                    
                    window.engine = { 
                        audio: { freq: new Array(128).fill(0), level: 0.5, density: 0.5 },
                        getSensorValue: () => 0 
                    };
                `;

                metaTags.forEach(meta => {
                    const prop = meta.getAttribute('property');
                    const def = meta.getAttribute('default');
                    const type = meta.getAttribute('type');
                    if (prop && def !== null) {
                        let val = `"${def}"`;
                        if (type === 'number') val = parseFloat(def);
                        else if (type === 'boolean') val = (def === 'true' || def === '1');
                        setupScript += `try{window["${prop}"] = ${val};}catch(e){}\n`;
                    }
                });

                setupScript += `
                    function _simAudio() {
                        if(!window.engine) return;
                        const t = Date.now()/1000;
                        const d = window.engine.audio.freq;
                        const beat = (Math.sin(t*Math.PI*4)+1)/2;
                        d[0] = Math.pow(beat,4)*255;
                        requestAnimationFrame(_simAudio);
                    }
                    _simAudio();
                <\/script>`;

                // 3. Inject
                let injectedHtml = htmlContent;
                if (injectedHtml.toLowerCase().includes('<head>')) {
                    injectedHtml = injectedHtml.replace(/<head>/i, '<head>' + setupScript);
                } else {
                    injectedHtml = setupScript + injectedHtml;
                }

                // 4. Render
                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.top = '-9999px';
                iframe.width = 640;
                iframe.height = 360;
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(injectedHtml);
                iframeDoc.close();

                // 5. Capture (200ms)
                setTimeout(() => {
                    let thumb = "";
                    try {
                        const cans = iframe.contentDocument.getElementsByTagName('canvas');
                        if (cans.length > 0) {
                            const srcCanvas = cans[0];
                            const tCanvas = document.createElement('canvas');
                            tCanvas.width = 320; tCanvas.height = 180;
                            const tCtx = tCanvas.getContext('2d');
                            tCtx.drawImage(srcCanvas, 0, 0, 320, 180);
                            thumb = tCanvas.toDataURL('image/jpeg', 0.85);
                        }
                    } catch (err) { }

                    const item = {
                        id: id,
                        name: file.name,
                        title: title,
                        desc: desc,
                        html: htmlContent, // Save clean
                        thumb: thumb,
                        date: Date.now()
                    };

                    IDB.add(item).finally(() => {
                        iframe.remove();
                        resolve(item); // Return item for live UI update
                    });

                }, 200);
            };
            reader.readAsText(file);
        });
    },

    initDragDrop() {
        const modalContent = document.getElementById('modal-content');
        modalContent.ondragover = (e) => { e.preventDefault(); modalContent.classList.add('drag-active'); };
        modalContent.ondragleave = (e) => { e.preventDefault(); modalContent.classList.remove('drag-active'); };
        modalContent.ondrop = (e) => {
            e.preventDefault();
            modalContent.classList.remove('drag-active');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleFiles(e.dataTransfer.files);
            }
        };
    }
};

// --- LOCAL STORAGE MANAGER ---
const Persistence = {
    KEY: 'srgb_combiner_state_v1',
    save() {
        if (!compositor) return;
        const state = {
            meta: {
                // Save the actual values, not translated UI labels
                title: document.getElementById('meta-title').value,
                publisher: document.getElementById('meta-publisher').value,
                desc: document.getElementById('meta-desc').value
            },
            layout: compositor.layout,
            layers: compositor.layers.map(l => ({
                name: l.name,
                content: l.content,
                enabled: l.enabled,
                opacity: l.opacity,
                blend: l.blend
            }))
        };
        localStorage.setItem(this.KEY, JSON.stringify(state));
    },
    load() {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) return;
        try {
            const state = JSON.parse(raw);
            if (state.meta) {
                // Setting .value directly ensures translated placeholders don't interfere
                document.getElementById('meta-title').value = state.meta.title || "";
                document.getElementById('meta-publisher').value = state.meta.publisher || "";
                document.getElementById('meta-desc').value = state.meta.desc || "";
            }
            if (state.layers && Array.isArray(state.layers)) {
                state.layers.forEach(l => {
                    compositor.createLayer(l.name, l.content, {
                        enabled: l.enabled,
                        opacity: l.opacity,
                        blend: l.blend
                    });
                });
            }
            if (state.layout) compositor.setLayout(state.layout);

            // CRITICAL: Re-trigger I18N after loading to update placeholders
            if (typeof I18N !== 'undefined') I18N.updateStaticUI();
        } catch (e) { console.error(e); }
    },
    clear() {
        // I18N Replacement
        const msg = typeof I18N !== 'undefined' ? I18N.t('confirm_reset_proj') : "Clear project workspace?";
        if (confirm(msg)) {
            localStorage.removeItem(this.KEY);
            location.reload();
        }
    }
};

// --- COMPOSITOR ---
class Compositor {
    constructor() {
        this.masterCanvas = document.getElementById('master-canvas');
        this.ctx = this.masterCanvas.getContext('2d');
        this.width = 640;
        this.height = 360;
        this.masterCanvas.width = this.width;
        this.masterCanvas.height = this.height;
        this.layers = [];
        this.layout = 'LAYERED';
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    handleUpload(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.createLayer(file.name, e.target.result);
                Persistence.save();
            };
            reader.readAsText(file);
        });
    }

    createLayer(name, htmlContent, restoredState = null) {
        const id = Date.now() + Math.random();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        let niceName = name;
        if (doc.querySelector('title') && doc.querySelector('title').innerText) {
            niceName = doc.querySelector('title').innerText;
        }

        const metaTags = doc.querySelectorAll('meta[property]');
        const extractedProps = [];
        metaTags.forEach(tag => {
            const prop = tag.getAttribute('property');
            if (prop) extractedProps.push({
                name: prop, label: tag.getAttribute('label') || prop, type: tag.getAttribute('type') || 'text',
                min: tag.getAttribute('min'), max: tag.getAttribute('max'), default: tag.getAttribute('default'), values: tag.getAttribute('values')
            });
        });

        const iframe = document.createElement('iframe');
        iframe.id = `frame-${id}`;
        document.getElementById('hidden-sandbox').appendChild(iframe);
        iframe.contentWindow.engine = { audio: { freq: new Array(128).fill(0) }, getSensorValue: () => 0 };

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open(); iframeDoc.write(htmlContent); iframeDoc.close();

        let defaultBlend = (this.layout === 'LAYERED' && this.layers.length > 0) ? 'screen' : 'source-over';

        const layer = {
            id: id, name: niceName, content: htmlContent, props: extractedProps,
            iframe: iframe, window: iframe.contentWindow, sourceCanvas: null,
            enabled: restoredState ? restoredState.enabled : true,
            opacity: restoredState ? restoredState.opacity : 1.0,
            blend: restoredState ? restoredState.blend : defaultBlend,
            rect: { x: 0, y: 0, w: this.width, h: this.height }
        };
        this.layers.push(layer);
        this.updateLayout();
        this.renderUI();
    }

    removeLayer(index) {
        const layer = this.layers[index];
        if (layer) {
            layer.iframe.remove();
            this.layers.splice(index, 1);
            this.updateLayout();
            this.renderUI();
            Persistence.save();
        }
    }

    moveLayer(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.layers.length) return;
        const temp = this.layers[index];
        this.layers[index] = this.layers[newIndex];
        this.layers[newIndex] = temp;
        this.updateLayout();
        this.renderUI();
        Persistence.save();
    }

    setLayout(mode) {
        this.layout = mode;
        this.layers.forEach(l => l.enabled = true);
        if (mode === 'SIDE_BY_SIDE' || mode === 'VERTICAL' || mode === 'GRID') {
            this.layers.forEach(l => l.blend = 'source-over');
        }
        this.updateLayout();
        document.querySelectorAll('.layout-grid button, #btn-pip').forEach(b => b.classList.remove('active'));
        if (mode === 'LAYERED') document.getElementById('btn-layered').classList.add('active');
        if (mode === 'SIDE_BY_SIDE') document.getElementById('btn-side').classList.add('active');
        if (mode === 'VERTICAL') document.getElementById('btn-vert').classList.add('active');
        if (mode === 'GRID') document.getElementById('btn-grid').classList.add('active');
        if (mode === 'PIP') document.getElementById('btn-pip').classList.add('active');
        this.renderUI();
        Persistence.save();
    }

    updateLayerProp(index, key, value) {
        if (this.layers[index]) {
            this.layers[index][key] = value;
            Persistence.save();
        }
    }

    updateLayout() {
        const w = this.width;
        const h = this.height;
        const count = this.layers.length;

        // Grid calculations
        let gridCols = Math.ceil(Math.sqrt(count));
        let gridRows = Math.ceil(count / gridCols);

        this.layers.forEach((layer, index) => {
            // Default rect is full screen (used for Background/Layer 0)
            let r = { x: 0, y: 0, w: w, h: h };

            if (this.layout === 'SIDE_BY_SIDE' && count > 0) {
                const sw = w / count;
                r = { x: sw * index, y: 0, w: sw, h: h };
            }
            else if (this.layout === 'VERTICAL' && count > 0) {
                const sh = h / count;
                r = { x: 0, y: sh * index, w: w, h: sh };
            }
            else if (this.layout === 'GRID') {
                const col = index % gridCols;
                const row = Math.floor(index / gridCols);
                const cw = w / gridCols;
                const ch = h / gridRows;
                r = { x: col * cw, y: row * ch, w: cw, h: ch };
            }
            else if (this.layout === 'PIP') {
                // Index 0 is background. Index > 0 are PiP overlays.
                if (index > 0) {
                    const pad = 10;
                    // Shrink thumbnails if we have many layers (6+ layers = smaller thumbs)
                    const scale = count > 5 ? 0.15 : 0.25;
                    const pw = w * scale;
                    const ph = h * scale;

                    const si = index - 1; // Stack Index (0-based for the PiPs)

                    // Calculate how many fit in one vertical column
                    // Math.max(1, ...) prevents division by zero if window is tiny
                    const maxPerCol = Math.max(1, Math.floor((h - pad) / (ph + pad)));

                    const col = Math.floor(si / maxPerCol); // 0 = rightmost col, 1 = next col left
                    const row = si % maxPerCol;             // 0 = bottom, 1 = above bottom...

                    r = {
                        x: w - (pw + pad) * (col + 1),
                        y: h - ph - pad - (row * (ph + pad)),
                        w: pw,
                        h: ph
                    };
                }
            }
            layer.rect = r;
        });
    }

    loop() {
        const time = Date.now() / 1000;
        const bass = (Math.sin(time * 10) + 1) * 120;
        const fakeAudio = new Array(200).fill(bass);

        this.layers.forEach(layer => {
            if (layer.window && layer.window.engine && layer.window.engine.audio) {
                if (layer.window.engine.audio.freq.length < 200) {
                    layer.window.engine.audio.freq = new Array(200).fill(0);
                }
                for (let i = 0; i < 200; i++) layer.window.engine.audio.freq[i] = fakeAudio[i];
                layer.window.engine.audio.level = -20;
                layer.window.engine.audio.density = 0.5;
            }
        });

        const w = this.width;
        const h = this.height;
        this.ctx.fillStyle = "#000";
        this.ctx.clearRect(0, 0, w, h);

        this.layers.forEach((l, i) => {
            if (!l.canvas) {
                const cans = l.window.document.getElementsByTagName('canvas');
                if (cans.length) l.canvas = cans[0];
            }
            if (l.canvas) {
                const r = l.rect;
                this.ctx.globalAlpha = l.opacity;
                this.ctx.globalCompositeOperation = l.blend === 'source-over' ? 'source-over' : l.blend;
                try { this.ctx.drawImage(l.canvas, r.x, r.y, r.w, r.h); } catch (e) { }
            }
        });
        requestAnimationFrame(this.loop);
    }

    renderUI() {
        const container = document.getElementById('layer-list');
        container.innerHTML = '';

        // I18N Helper
        const t = (k) => typeof I18N !== 'undefined' ? I18N.t(k) : k;

        this.layers.forEach((layer, idx) => {
            const div = document.createElement('div');
            div.className = 'control-group';
            const propsList = layer.props.map(p => p.label).join(', ');

            div.innerHTML = `
    <div class="card-header">
        <span class="layer-title">${idx + 1}. ${layer.name.substring(0, 15)}...</span>
        <div class="actions">
            <button class="icon-btn" onclick="compositor.moveLayer(${idx}, -1)">▲</button>
            <button class="icon-btn" onclick="compositor.moveLayer(${idx}, 1)">▼</button>
            <button class="icon-btn btn-close" onclick="compositor.removeLayer(${idx})">✖</button>
        </div>
    </div>
    <label>
        <input type="checkbox" ${layer.enabled ? 'checked' : ''} 
        onchange="compositor.updateLayerProp(${idx}, 'enabled', this.checked); compositor.renderUI();"> 
        <span data-i18n="layer_enabled">Enabled</span>
    </label>
    <label>
        <span data-i18n="layer_opacity">Opacity</span>: 
        <span id="op-val-${idx}">${Math.round(layer.opacity * 100)}%</span>
    </label>
    <input type="range" min="0" max="1" step="0.05" value="${layer.opacity}" 
        oninput="compositor.updateLayerProp(${idx}, 'opacity', parseFloat(this.value)); document.getElementById('op-val-${idx}').innerText = Math.round(this.value*100) + '%'">
    
    <label data-i18n="layer_blend">Blend Mode</label>
    <select onchange="compositor.updateLayerProp(${idx}, 'blend', this.value)">
        <option value="source-over" ${layer.blend === 'source-over' ? 'selected' : ''} data-i18n="blend_normal">Normal</option>
        <option value="screen" ${layer.blend === 'screen' ? 'selected' : ''} data-i18n="blend_screen">Screen</option>
        <option value="overlay" ${layer.blend === 'overlay' ? 'selected' : ''} data-i18n="blend_overlay">Overlay</option>
        <option value="multiply" ${layer.blend === 'multiply' ? 'selected' : ''} data-i18n="blend_multiply">Multiply</option>
        <option value="difference" ${layer.blend === 'difference' ? 'selected' : ''} data-i18n="blend_difference">Difference</option>
        <option value="lighter" ${layer.blend === 'lighter' ? 'selected' : ''} data-i18n="blend_lighter">Lighter</option>
    </select>

    <div style="margin-top:8px; border-top:1px solid #444; padding-top:5px;">
        <span style="font-size:0.7rem; color:#888;" data-i18n="layer_controls">Detected Controls:</span><br>
        <span class="prop-badge">${propsList || "None"}</span>
    </div>
`;

            // IMPORTANT: After injecting the HTML, tell the scanner to look for new tags
            I18N.updateStaticUI();
            container.appendChild(div);
        });
    }
}

// --- EXPORTER ---
const exporter = {
    async download() {
        if (typeof JSZip === 'undefined') {
            alert("JSZip library not loaded.");
            return;
        }

        const title = document.getElementById('meta-title').value;
        const pub = document.getElementById('meta-publisher').value;
        const desc = document.getElementById('meta-desc').value;

        const layoutMap = { 'LAYERED': 'Layered', 'SIDE_BY_SIDE': 'Side by Side', 'VERTICAL': 'Vertical', 'GRID': 'Grid', 'PIP': 'PiP' };
        const currentLayoutName = layoutMap[compositor.layout] || 'Layered';
        const filenameBase = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const previewBlob = await new Promise(resolve => {
            document.getElementById('master-canvas').toBlob(blob => resolve(blob), 'image/png');
        });

        // I18N Helper for export labels
        const t = (k) => typeof I18N !== 'undefined' ? I18N.t(k) : k;

        // 1. Meta Tags
        let metaTags = `
    <title>${title}</title>
    <meta description="${desc}">
    <meta publisher="${pub}">
    <meta property="layoutMode" label="Layout Mode" type="combobox" values="Layered,Side by Side,Vertical,Grid,PiP" default="${currentLayoutName}">`;

        compositor.layers.forEach((l, i) => {
            metaTags += `\n    `;
            metaTags += `\n    <meta property="layer_${i}_opacity" label="[${i + 1}] ${t('layer_opacity')}" type="number" min="0" max="100" default="${l.opacity * 100}">`;
            metaTags += `\n    <meta property="layer_${i}_blend" label="[${i + 1}] ${t('layer_blend')}" type="combobox" values="Normal,Screen,Overlay,Multiply,Difference,Lighter" default="${this.mapBlend(l.blend)}">`;

            if (l.props.length > 0) {
                metaTags += `\n    `;
                l.props.forEach(p => {
                    const uniqueName = `layer_${i}_${p.name}`;
                    const uniqueLabel = `[${i + 1}] ${p.label}`;
                    let tag = `\n    <meta property="${uniqueName}" label="${uniqueLabel}" type="${p.type}"`;
                    if (p.min) tag += ` min="${p.min}"`;
                    if (p.max) tag += ` max="${p.max}"`;
                    if (p.default) tag += ` default="${p.default}"`;
                    if (p.values) tag += ` values="${p.values}"`;
                    tag += `>`;
                    metaTags += tag;
                });
            }
        });

        const layerData = compositor.layers.map(l => {
            return {
                name: l.name,
                propNames: l.props.map(p => p.name),
                content: btoa(unescape(encodeURIComponent(l.content)))
            };
        });

        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    ${metaTags}
    <style>
        body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }
        canvas { display: block; width: 100vw; height: 100vh; }
        #sandbox { position: absolute; visibility: hidden; }
        iframe { border: none; width: 100vw; height: 100vh; } 
    </style>
</head>
<body>
    <canvas id="master"></canvas>
    <div id="sandbox"></div>

<` + `script>
    // BROWSER COMPATIBILITY
    if (typeof window.engine === 'undefined') {
        const metaTags = document.querySelectorAll('meta[property]');
        metaTags.forEach(meta => {
            const propName = meta.getAttribute('property');
            const propType = meta.getAttribute('type');
            const defaultVal = meta.getAttribute('default');
            if (propName) {
                let finalValue = defaultVal;
                if (propType === 'number') finalValue = parseFloat(defaultVal);
                else if (propType === 'boolean') finalValue = (defaultVal === 'true' || defaultVal === '1');
                window[propName] = finalValue;
            }
        });
        window.engine = { 
            audio: { freq: new Array(200).fill(0), level: -20, density: 0.5 },
            getSensorValue: () => 0 
        };
        function simulateAudio() {
            const time = Date.now() / 1000; 
            const dataArray = new Array(200).fill(0);
            const beat = (Math.sin(time * Math.PI * 4) + 1) / 2; 
            const bassVal = Math.pow(beat, 4) * 255; 
            dataArray[0] = bassVal; dataArray[1] = bassVal; dataArray[2] = bassVal;
            for (let i = 10; i < 40; i++) {
                const wave = (Math.sin(time * 8 + i * 0.5) + 1) / 2;
                dataArray[i] = wave * 150 + (Math.random() * 50); 
            }
            window.engine.audio.freq = dataArray;
            requestAnimationFrame(simulateAudio);
        }
        simulateAudio();
    }

    const RAW_LAYERS = ${JSON.stringify(layerData)};
    
    const app = {
        canvas: document.getElementById('master'),
        ctx: document.getElementById('master').getContext('2d'),
        layers: [],
        
        init() {
            RAW_LAYERS.forEach((lData, i) => {
                const iframe = document.createElement('iframe');
                document.getElementById('sandbox').appendChild(iframe);
                
                // --- FIX FOR EXPORT: Pre-seed complete mock engine ---
                iframe.contentWindow.engine = { 
                    audio: { freq: new Array(200).fill(0), level: -20, density: 0.5 },
                    getSensorValue: () => 0 
                };

                const doc = iframe.contentWindow.document;
                const html = decodeURIComponent(escape(atob(lData.content)));
                doc.open();
                doc.write(html);
                doc.close();
                
                this.layers.push({ 
                    window: iframe.contentWindow, 
                    canvas: null,
                    propNames: lData.propNames
                });
            });
            this.loop();
        },

        getLayoutRect(index, count, mode, w, h) {
            let r = { x: 0, y: 0, w: w, h: h };
            let gridCols = Math.ceil(Math.sqrt(count));
            let gridRows = Math.ceil(count / gridCols);

            if (mode === 'Side by Side' && count > 0) {
                const sw = w / count;
                r = { x: sw * index, y: 0, w: sw, h: h };
            }
            else if (mode === 'Vertical' && count > 0) {
                const sh = h / count;
                r = { x: 0, y: sh * index, w: w, h: sh };
            }
            else if (mode === 'Grid') {
                const col = index % gridCols;
                const row = Math.floor(index / gridCols);
                const cw = w / gridCols;
                const ch = h / gridRows;
                r = { x: col * cw, y: row * ch, w: cw, h: ch };
            }
            else if (mode === 'PiP') {
                if (index > 0) {
                    const pad = 10;
                    const scale = count > 5 ? 0.15 : 0.25;
                    const pw = w * scale;
                    const ph = h * scale;
                    
                    const si = index - 1;
                    const maxPerCol = Math.max(1, Math.floor((h - pad) / (ph + pad)));
                    
                    const col = Math.floor(si / maxPerCol);
                    const row = si % maxPerCol;

                    r = { 
                        x: w - (pw + pad) * (col + 1), 
                        y: h - ph - pad - (row * (ph + pad)), 
                        w: pw, 
                        h: ph 
                    };
                }
            }
            return r;
        },

        mapBlend(val) {
            if(val === 'Normal') return 'source-over';
            if(val === 'Lighter') return 'lighter';
            return val.charAt(0).toUpperCase() + val.slice(1);
        },

        loop() {
            if (window.engine && window.engine.audio) {
                const data = window.engine.audio.freq;
                // Sync data to all children
                this.layers.forEach(l => {
                    if (l.window.engine && l.window.engine.audio) {
                        // Safe copy
                        const len = Math.min(data.length, l.window.engine.audio.freq.length);
                        for(let k=0; k<len; k++) l.window.engine.audio.freq[k] = data[k];
                        
                        // Sync extras if available
                        if(window.engine.audio.level !== undefined) l.window.engine.audio.level = window.engine.audio.level;
                        if(window.engine.audio.density !== undefined) l.window.engine.audio.density = window.engine.audio.density;
                    }
                });
            }

            const w = this.canvas.width = window.innerWidth;
            const h = this.canvas.height = window.innerHeight;
            let mode = "${currentLayoutName}"; 
            if (window.layoutMode) mode = window.layoutMode;
            
            this.ctx.fillStyle = "#000";
            this.ctx.fillRect(0,0,w,h);

            this.layers.forEach((l, i) => {
                const opacity = (window["layer_" + i + "_opacity"] ?? 100) / 100.0;
                let blend = window["layer_" + i + "_blend"] || "Normal";
                
                if (mode === 'Side by Side' || mode === 'Vertical' || mode === 'Grid') {
                    blend = 'Normal';
                }

                if(l.propNames) {
                    l.propNames.forEach(prop => {
                        const globalName = "layer_" + i + "_" + prop;
                        if(window[globalName] !== undefined) {
                            l.window[prop] = window[globalName];
                        }
                    });
                }

                if (!l.canvas) {
                    const cans = l.window.document.getElementsByTagName('canvas');
                    if(cans.length) l.canvas = cans[0];
                }

                if (l.canvas) {
                    const r = this.getLayoutRect(i, this.layers.length, mode, w, h);
                    this.ctx.globalAlpha = opacity;
                    this.ctx.globalCompositeOperation = this.mapBlend(blend);
                    this.ctx.drawImage(l.canvas, r.x, r.y, r.w, r.h);
                }
            });

            requestAnimationFrame(() => this.loop());
        }
    };
    
    window.onload = () => app.init();
<` + `/script>
</body>
</html>`;

        const zip = new JSZip();
        zip.file(`${filenameBase}.html`, htmlContent);
        zip.file(`${filenameBase}.png`, previewBlob);

        zip.generateAsync({ type: "blob" }).then(function (content) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = `${filenameBase}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    },

    mapBlend(val) {
        if (val === 'source-over') return 'Normal';
        if (val === 'lighter') return 'Lighter';
        return val.charAt(0).toUpperCase() + val.slice(1);
    },
};

// --- LANGUAGE SWITCHER FUNCTION ---
function changeLanguage(lang) {
    if (typeof I18N === 'undefined') return;

    // Use the unified setter that handles storage
    I18N.setLanguage(lang);

    // Refresh dynamic components
    if (compositor) {
        compositor.renderUI();
    }

    if (document.getElementById('lib-modal').style.display === 'flex') {
        Library.render();
        Library.updateSelectionUI();
    }
}

// --- INITIALIZATION ---
let compositor;

window.onload = async () => {
    // 1. Initialize I18N and WAIT for JSON to load
    if (typeof I18N !== 'undefined') {
        await I18N.init();

        // SYNC DROPDOWN: Ensure the selector shows the correct saved language
        const selector = document.getElementById('lang-selector');
        if (selector) {
            selector.value = I18N.cur;
        }
    }

    // 2. Initialize other systems
    try {
        await IDB.init();
        await Library.checkMigration();
    } catch (e) { console.error(e); }

    compositor = new Compositor();

    // 3. Load User Project Data
    Persistence.load();
};