// --- 1. FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// --- 2. FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBIzgQqxHMTdCsW0UG4MOEuFWwjEYAFYbk",
    authDomain: "effect-builder.firebaseapp.com",
    projectId: "effect-builder",
    storageBucket: "effect-builder.appspot.com",
    messagingSenderId: "638106955712",
    appId: "1:638106955712:web:e98ee4cd023fd84d466225",
    measurementId: "G-4TBX7711GH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 3. HELPER FUNCTIONS ---

function getSafeDocId(filename) {
    return filename.replace(/\./g, '_');
}

// Optimized: Fetch just one doc (used when downloading)
async function getDownloadCount(filename) {
    const docId = getSafeDocId(filename);
    const docRef = doc(db, "showcase_stats", docId);
    try {
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data().downloads || 0) : 0;
    } catch (error) {
        console.warn("Could not fetch count for", filename);
        return 0;
    }
}

async function incrementDownloadCount(filename) {
    const docId = getSafeDocId(filename);
    const docRef = doc(db, "showcase_stats", docId);
    
    // Optimistic UI Update
    const countSpan = document.getElementById(`count-${getSafeDocId(filename)}`);
    if(countSpan) {
        let current = parseInt(countSpan.textContent) || 0;
        countSpan.textContent = current + 1;
    }

    try {
        await updateDoc(docRef, { downloads: increment(1) });
    } catch (error) {
        try {
            await setDoc(docRef, { downloads: 1 });
        } catch (e) {
            console.error("Error setting initial count:", e);
        }
    }
}

// --- EXISTING CODE STARTS HERE ---

document.addEventListener('DOMContentLoaded', function () {
    // --- CONFIGURATION ---
    // Note: The order here represents the "Newest Added" sort order (Assuming you append new files to the end)
    const effectFilenames = [
        "SwirlCirclesAudio.html", "RotatingBeam.html", "NoiseMap.html", "Policing.html",
        "MovingPanes.html", "SpectrumCycling.html", "Sunrise.html", "Stack.html",
        "Mosaic.html", "Marquee.html", "Swap.html", "Mask.html", "ZigZag.html",
        "AudioBubbles.html", "Wavy.html", "Visor.html", "StarryNight.html",
        "Spiral.html", "Sequence.html", "SmoothBlink.html", "SparkleFade.html",
        "RandomMarquee.html", "RotatingRainbow.html", "RandomSpin.html",
        "RadialRainbow.html", "Rain.html", "RainbowWave.html", "Lightning.html",
        "MotionPoints.html", "GradientWave.html", "FractalMotion.html",
        "Hypnotoad.html", "Fill.html", "DoubleRotatingRainbow.html",
        "BreathingCircle.html", "BubbleCollision.html", "ColorWheel.html",
        "CustomMarque.html", "CrossingBeams.html", "Comet.html",
        "CustomGradientWave.html", "CustomBlink.html", "Clock.html",
        "Bubbles.html", "Breathing.html", "BouncingBall.html", "Bloom.html",
        "AudioVUMeter.html", "AudioVisualizer.html", "AudioSync.html",
        "AudioStar.html", "AudioSine.html", "AudioParty.html", "Ambient.html",
        "ParticleSwarm.html", "NeonHex.html", "fractal_explorer.html",
        "audio_eclipse.html", "RetroWave.html", "infinity_spiral.html",
        "PRFlag.html", "SolarSystem.html", "tunnel.html",
        "particle_eq_bars.html", "laserShapes.html", "concertLasers.html",
        "ink_drops.html", "starfield.html", "digital_noiseform.html",
        "bouncingCubes.html", "clouds.html", "polyPlanet.html",
        "serenityWaves.html", "systemBouncer.html", "picasso.html",
        "void_and_silk.html", "SouthPark.html", "spirograph.html", "Borealis.html"
    ];

    const effectsFolder = "effects";
    const projectListContainer = document.getElementById('showcase-project-list');
    
    // --- STATE MANAGEMENT ---
    let allEffects = []; // Stores the full list of effect objects
    let statsLoaded = false; // Flag to check if we have popularity data
    
    // UI Elements
    const searchInput = document.getElementById('effect-search-input');
    const sortSelect = document.getElementById('sort-order');
    const tagFilterSelect = document.getElementById('tag-filter');
    const totalCountBadge = document.getElementById('total-count-badge');

    // --- MODAL VARIABLES ---
    const codePreviewModalEl = document.getElementById('code-preview-modal');
    const codePreviewModal = codePreviewModalEl ? new bootstrap.Modal(codePreviewModalEl) : null;
    const codePreviewTitle = document.getElementById('code-preview-title');
    const codePreviewContent = document.getElementById('code-preview-content');
    
    const effectViewModalEl = document.getElementById('effect-view-modal');
    const effectViewModal = effectViewModalEl ? new bootstrap.Modal(effectViewModalEl) : null;
    const effectViewTitle = document.getElementById('effect-view-title');
    const effectIframe = document.getElementById('effect-iframe');
    const effectIframeContainer = document.getElementById('effect-iframe-container');
    const effectDownloadBtn = document.getElementById('effect-download-btn');
    const effectShareBtn = document.getElementById('effect-share-btn');

    async function fetchEffectMetadata(filename, index) {
        const effectUrl = `${effectsFolder}/${filename}`;
        const staticUrl = effectUrl.replace(/\.html$/, '.png');

        try {
            const response = await fetch(effectUrl);
            if (!response.ok) throw new Error(`Failed to fetch ${effectUrl}: ${response.statusText}`);
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            // --- META ATTRIBUTES ---
            const getCustomMeta = (attrName) => {
                const el = doc.querySelector(`meta[${attrName}]`) || doc.querySelector(`meta[name="${attrName}"]`);
                return el ? (el.getAttribute(attrName) || el.getAttribute('content')) : null;
            };

            const title = getCustomMeta('title') || doc.querySelector('title')?.textContent || 'Untitled Effect';
            const description = getCustomMeta('description') || getCustomMeta('og:description') || 'No description available.';
            const author = getCustomMeta('publisher') || getCustomMeta('author') || 'Unknown Author';

            // --- PROPERTIES ---
            const propertyMetas = doc.querySelectorAll('meta[property]');
            let structuredControls = [];

            if (propertyMetas.length > 0) {
                propertyMetas.forEach(meta => {
                    const prop = meta.getAttribute('property');
                    if (!prop) return;

                    const label = meta.getAttribute('label') || prop;
                    const type = meta.getAttribute('type'); 
                    const tooltip = meta.getAttribute('tooltip') || '';
                    const def = meta.getAttribute('default') || '-';
                    
                    let valueDesc = '';
                    if (type === 'number') {
                        valueDesc = `${meta.getAttribute('min')} to ${meta.getAttribute('max')} (Default: ${def})`;
                    } else if (type === 'boolean') {
                        valueDesc = `Toggle (True/False)`;
                    } else if (type === 'list') {
                        const values = meta.getAttribute('values');
                        const valList = values ? values.split(',') : [];
                        valueDesc = valList.length > 3 ? 
                            `Select: ${valList.slice(0,3).join(', ')}...` : 
                            `Select: ${valList.join(', ')}`;
                    } else if (type === 'color') {
                        valueDesc = `Color Picker (Hex)`;
                    } else {
                        valueDesc = `Default: ${def}`;
                    }

                    structuredControls.push({
                        label, variable: prop, values: valueDesc, description: tooltip
                    });
                });
            }

            // --- TAG DETECTION ---
            let tags = [];
            const tagsMeta = getCustomMeta('tags') || getCustomMeta('keywords');
            if (tagsMeta) tags = tagsMeta.split(',').map(t => t.trim()).filter(t => t.length > 0);

            const textToAnalyze = `${title} ${description} ${filename}`.toLowerCase();
            const addTag = (t) => { if (!tags.some(x => x.toLowerCase() === t.toLowerCase())) tags.push(t); };

            if (textToAnalyze.match(/audio|sound|music|beat|freq|mic|visualizer|spect|vu meter|rhythm/)) {
                const audioMeta = doc.querySelector('meta[property="audio_reactive"]');
                if (audioMeta || !tags.some(t => t.toLowerCase().includes('sound'))) {
                   if(!tags.includes('Sound Responsive')) tags.unshift('Sound Responsive');
                }
            }
            if (textToAnalyze.match(/mouse|click|drag|interactive|cursor|touch/)) addTag('Interactive');
            if (textToAnalyze.match(/rainbow|color cycle|gradient|hues|spectrum/)) addTag('Rainbow');
            if (textToAnalyze.match(/fractal|mandelbrot|julia|math|geometry/)) addTag('Fractal');
            if (textToAnalyze.match(/particle|swarm|dots|dust|starfield/)) addTag('Particles');
            
            if (structuredControls.length > 0 && !tags.includes('Customizable')) {
                tags.push('Customizable');
            }

            return {
                title, description, author, effectUrl, staticUrl, filename,
                tags,
                structuredControls,
                originalIndex: index, // For "Newest" sort
                downloads: 0 // Placeholder
            };

        } catch (error) {
            console.error(`Error processing ${filename}:`, error);
            return null;
        }
    }

    // --- MAIN DATA FLOW ---

    async function initializeGallery() {
        // 1. Fetch Metadata
        const effects = await Promise.all(effectFilenames.map((f, i) => fetchEffectMetadata(f, i)));
        allEffects = effects.filter(effect => effect !== null);
        
        // 2. Build Filter Options
        populateTagFilter();

        // 3. Render Initial Grid (Alphabetical default)
        updateGalleryDisplay();

        // 4. Background Fetch Stats
        fetchAndAttachStats();
    }

    async function fetchAndAttachStats() {
        const promises = allEffects.map(async (effect) => {
            const count = await getDownloadCount(effect.filename);
            effect.downloads = count;
            
            // Update individual badge if visible
            const badge = document.getElementById(`count-${getSafeDocId(effect.filename)}`);
            if(badge) badge.textContent = count;
        });

        await Promise.allSettled(promises);
        statsLoaded = true;
        
        // If the user has selected "Most Popular" while we were loading, re-sort now
        if(sortSelect.value === 'downloads') {
            updateGalleryDisplay();
        }
    }

    function populateTagFilter() {
        const uniqueTags = new Set();
        allEffects.forEach(e => e.tags.forEach(t => uniqueTags.add(t)));
        
        const sortedTags = Array.from(uniqueTags).sort();
        
        sortedTags.forEach(tag => {
            const opt = document.createElement('option');
            opt.value = tag;
            opt.textContent = tag;
            tagFilterSelect.appendChild(opt);
        });
    }

    // --- FILTERING & SORTING LOGIC ---

    function updateGalleryDisplay() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedTag = tagFilterSelect.value;
        const sortMode = sortSelect.value;

        // 1. Filter
        let filtered = allEffects.filter(e => {
            const matchesSearch = !searchTerm || 
                e.title.toLowerCase().includes(searchTerm) || 
                e.description.toLowerCase().includes(searchTerm) ||
                e.tags.some(t => t.toLowerCase().includes(searchTerm));
            
            const matchesTag = !selectedTag || e.tags.includes(selectedTag);

            return matchesSearch && matchesTag;
        });

        // 2. Sort
        filtered.sort((a, b) => {
            if (sortMode === 'name-asc') return a.title.localeCompare(b.title);
            if (sortMode === 'name-desc') return b.title.localeCompare(a.title);
            if (sortMode === 'downloads') return b.downloads - a.downloads; // Descending downloads
            if (sortMode === 'newest') return b.originalIndex - a.originalIndex; // High index = newer
            return 0;
        });

        // 3. Render
        renderGrid(filtered);
        totalCountBadge.textContent = `${filtered.length} Effects`;
    }

    function renderGrid(effects) {
        projectListContainer.innerHTML = '';
        if (effects.length === 0) {
            projectListContainer.innerHTML = `<div class="col-12 text-center text-muted py-5"><h3><i class="bi bi-search"></i></h3><p>No effects found matching your criteria.</p></div>`;
            return;
        }

        effects.forEach(effect => {
            const col = document.createElement('div');
            col.className = 'col';
            const card = document.createElement('div');
            card.className = 'card h-100 shadow-sm';

            // Image Container
            const previewContainer = document.createElement('div');
            previewContainer.className = 'card-img-top position-relative overflow-hidden';
            previewContainer.style.height = '180px';
            previewContainer.style.backgroundColor = '#000';
            
            // --- LAZY LOADING FIX: USE IMG TAG ---
            const img = document.createElement('img');
            img.src = effect.staticUrl;
            img.loading = "lazy"; // Enables browser lazy loading
            img.alt = effect.title;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover"; // Replicates background-size: cover
            previewContainer.appendChild(img);

            // Hover Iframe Logic
            let previewIframe = null;
            let hoverTimeout;

            card.addEventListener('mouseenter', () => {
                hoverTimeout = setTimeout(() => {
                    img.style.opacity = '0'; // Hide image
                    if (!previewIframe) {
                        previewIframe = document.createElement('iframe');
                        previewIframe.src = effect.effectUrl;
                        previewIframe.style.width = '320px';
                        previewIframe.style.height = '200px';
                        previewIframe.style.border = 'none';
                        previewIframe.setAttribute('scrolling', 'no');
                        previewIframe.style.transform = 'scale(0.9) translate(-50%, -50%)';
                        previewIframe.style.transformOrigin = 'top left';
                        previewIframe.style.position = 'absolute';
                        previewIframe.style.top = '50%';
                        previewIframe.style.left = '50%';
                        previewIframe.style.pointerEvents = 'none';
                        previewContainer.appendChild(previewIframe);
                    }
                }, 200); // 200ms delay to prevent accidental triggers
            });

            card.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                img.style.opacity = '1'; // Show image
                if (previewIframe) { previewIframe.remove(); previewIframe = null; }
            });

            previewContainer.style.cursor = 'pointer';
            previewContainer.addEventListener('click', () => {
                handleViewEffect(effect);
                window.location.hash = effect.filename;
            });

            // Tags HTML
            let tagsHtml = '';
            if (effect.tags.length > 0) {
                tagsHtml = `<div class="mb-2">`;
                effect.tags.slice(0, 3).forEach(tag => { 
                    let cls = 'bg-secondary';
                    if (tag.toLowerCase().includes('sound')) cls = 'bg-info text-dark';
                    else if (tag === 'Customizable') cls = 'bg-warning text-dark';
                    else if (tag === 'Interactive') cls = 'bg-success';
                    tagsHtml += `<span class="badge ${cls} me-1 small">${tag}</span>`;
                });
                if (effect.tags.length > 3) tagsHtml += `<span class="badge bg-light text-dark border me-1 small">+${effect.tags.length - 3}</span>`;
                tagsHtml += `</div>`;
            }

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';
            cardBody.innerHTML = `
                <h5 class="card-title text-truncate" title="${effect.title}">${effect.title}</h5>
                ${tagsHtml}
                <p class="card-text text-body-secondary small flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${effect.description}</p>
                <small class="text-muted mt-2">By: ${effect.author}</small>
            `;

            // Footer
            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center';

            const docId = getSafeDocId(effect.filename);
            const countBadge = document.createElement('small');
            countBadge.className = 'text-muted';
            // If statsLoaded is true, use the value, otherwise '...'
            countBadge.innerHTML = `<i class="bi bi-download me-1"></i><span id="count-${docId}">${statsLoaded ? effect.downloads : '...'}</span>`;

            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-sm btn-outline-primary';
            viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
            viewBtn.title = "Preview";
            viewBtn.onclick = (e) => { e.stopPropagation(); handleViewEffect(effect); window.location.hash = effect.filename; };

            const codeBtn = document.createElement('button');
            codeBtn.className = 'btn btn-sm btn-outline-secondary';
            codeBtn.innerHTML = '<i class="bi bi-code-slash"></i>';
            codeBtn.title = "Source Code";
            codeBtn.onclick = (e) => { e.stopPropagation(); handleViewCode(effect); };

            const dlBtn = document.createElement('button');
            dlBtn.className = 'btn btn-sm btn-outline-success';
            dlBtn.innerHTML = '<i class="bi bi-download"></i>';
            dlBtn.title = "Download";
            dlBtn.onclick = (e) => { e.stopPropagation(); handleDownloadZip(effect, dlBtn); };

            btnGroup.append(viewBtn, codeBtn, dlBtn);
            cardFooter.append(countBadge, btnGroup);
            card.append(previewContainer, cardBody, cardFooter);
            col.append(card);
            projectListContainer.append(col);
        });
    }

    // --- INTERACTION HANDLERS (View, Code, Download) ---

    function handleViewEffect(effect) {
        effectViewTitle.textContent = effect.title;
        effectIframe.src = effect.effectUrl;

        // Reset Buttons
        if (effectDownloadBtn) {
            const newBtn = effectDownloadBtn.cloneNode(true);
            effectDownloadBtn.replaceWith(newBtn);
            newBtn.addEventListener('click', () => handleDownloadZip(effect, newBtn));
        }
        if (effectShareBtn) {
            const newBtn = effectShareBtn.cloneNode(true);
            effectShareBtn.replaceWith(newBtn);
            newBtn.addEventListener('click', () => handleShareLink(newBtn, effect.filename));
        }

        // Iframe Scaling
        const scale = 2.0;
        effectIframe.style.width = '320px'; effectIframe.style.height = '200px';
        effectIframe.style.transform = `scale(${scale})`;
        effectIframeContainer.style.width = `${320*scale}px`; effectIframeContainer.style.height = `${200*scale}px`;

        // Inject Details
        const detailsId = 'effect-details-section';
        const oldDetails = document.getElementById(detailsId);
        if (oldDetails) oldDetails.remove();

        const detailsDiv = document.createElement('div');
        detailsDiv.id = detailsId;
        detailsDiv.className = 'p-3 border-top pt-3';

        let tagsHtml = '';
        if(effect.tags.length) {
            tagsHtml = `<div class="mb-3"><h6 class="fw-bold">Tags:</h6>`;
            effect.tags.forEach(tag => {
                let cls = 'bg-secondary';
                if (tag.includes('Sound')) cls = 'bg-info text-dark';
                else if (tag === 'Customizable') cls = 'bg-warning text-dark';
                tagsHtml += `<span class="badge ${cls} me-2">${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        let propsHtml = '';
        if (effect.structuredControls && effect.structuredControls.length > 0) {
            propsHtml = `<h6 class="fw-bold mb-2"><i class="bi bi-sliders me-2"></i>Adjustable Properties</h6>
            <div class="table-responsive">
                <table class="table table-bordered table-sm small">
                    <thead class="table-light"><tr><th>Property</th><th>Type / Range</th><th>Description</th></tr></thead>
                    <tbody>${effect.structuredControls.map(c => `<tr><td><strong>${c.label}</strong><br><code class="text-primary">${c.variable}</code></td><td>${c.values}</td><td>${c.description}</td></tr>`).join('')}</tbody>
                </table></div>`;
        }

        detailsDiv.innerHTML = `<div class="mb-3"><h6 class="fw-bold">Description</h6><p>${effect.description}</p></div>${tagsHtml}${propsHtml}`;
        effectIframeContainer.parentElement.appendChild(detailsDiv);
        if (effectViewModal) effectViewModal.show();
    }

    async function handleViewCode(effect) {
        codePreviewTitle.textContent = `${effect.title} - Source Code`;
        codePreviewContent.textContent = 'Loading...';
        if (codePreviewModal) codePreviewModal.show();
        try {
            const res = await fetch(effect.effectUrl);
            const text = await res.text();
            codePreviewContent.textContent = text;
            if (window.Prism) Prism.highlightElement(codePreviewContent);
        } catch (e) { codePreviewContent.textContent = 'Error loading code.'; }
    }

    async function handleDownloadZip(effect, btn) {
        const oldHtml = btn.innerHTML;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;
        btn.disabled = true;
        
        // Update local model first
        effect.downloads = (effect.downloads || 0) + 1;
        // Update UI
        const badge = document.getElementById(`count-${getSafeDocId(effect.filename)}`);
        if(badge) badge.textContent = effect.downloads;
        
        // Fire and forget increment
        incrementDownloadCount(effect.filename);

        try {
            const [htmlRes, imgRes] = await Promise.all([ fetch(effect.effectUrl), fetch(effect.staticUrl) ]);
            if (!htmlRes.ok) throw new Error('HTML fetch failed');
            
            const zip = new JSZip();
            zip.file(effect.filename, await htmlRes.text());
            if (imgRes.ok) zip.file(effect.staticUrl.split('/').pop(), await imgRes.blob());

            const blob = await zip.generateAsync({type:'blob'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = effect.filename.replace('.html', '.zip');
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) { console.error(err); alert('Download failed.'); } 
        finally { btn.innerHTML = oldHtml; btn.disabled = false; }
    }

    async function handleShareLink(btn, filename) {
        const url = `${window.location.origin}${window.location.pathname}#${filename}`;
        try {
            await navigator.clipboard.writeText(url);
            const old = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => btn.innerHTML = old, 2000);
        } catch (e) { console.error(e); }
    }

    // --- EVENT LISTENERS ---

    if (effectViewModalEl) {
        effectViewModalEl.addEventListener('hidden.bs.modal', () => {
            effectIframe.src = 'about:blank';
            const details = document.getElementById('effect-details-section');
            if (details) details.remove();
            if (window.location.hash) history.pushState("", document.title, window.location.pathname + window.location.search);
        });
    }

    // Debounce Search
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(updateGalleryDisplay, 300);
    });

    tagFilterSelect.addEventListener('change', updateGalleryDisplay);
    sortSelect.addEventListener('change', updateGalleryDisplay);

    // Hash Handler
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if(!hash) return;
        const found = allEffects.find(e => e.filename === hash);
        if(found) handleViewEffect(found);
    });

    // Start
    initializeGallery().then(() => {
        const hash = window.location.hash.substring(1);
        if(hash) {
            const found = allEffects.find(e => e.filename === hash);
            if(found) setTimeout(() => handleViewEffect(found), 500);
        }
    });
});