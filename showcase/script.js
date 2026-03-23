// --- 1. FIREBASE IMPORTS ---
// Add GoogleAuthProvider and signInWithPopup to your imports
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { deleteDoc, getFirestore, doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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

// --- AUTHENTICATION SETUP ---
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Create the Google Login provider
let currentUser = null;

// 1. Dedicated function to update the form UI safely
function updateCommentFormVisibility() {
    const formContainer = document.getElementById('comment-form-container');
    const loginPrompt = document.getElementById('login-prompt-container');
    const nameInput = document.getElementById('comment-name');

    if (currentUser) {
        // Logged IN: Show form, hide prompt
        if (formContainer) formContainer.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';

        if (nameInput) {
            nameInput.value = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Verified User');
            nameInput.readOnly = true;
        }
    } else {
        // Logged OUT: Hide form, show prompt
        if (formContainer) formContainer.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }
}

// 2. Trigger the UI update the moment Firebase confirms the session
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateCommentFormVisibility();
});

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('btn-google-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            try {
                // This triggers the secure Google Sign-in window
                await signInWithPopup(auth, provider);
            } catch (error) {
                console.error("Login failed:", error);
                alert("Failed to sign in: " + error.message);
            }
        });
    }
});

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
    if (countSpan) {
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

async function loadCommunityFeed(filename) {
    const feedContainer = document.getElementById('comments-feed');
    if (!feedContainer) return;

    feedContainer.innerHTML = '<p class="text-muted text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Connecting to feed...</p>';

    const q = query(
        collection(db, "community_presets"),
        where("effectFile", "==", filename),
        orderBy("timestamp", "desc")
    );

    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            feedContainer.innerHTML = '<p class="text-muted text-center py-2">No community presets yet. Be the first!</p>';
            return;
        }

        // --- 1. GENERATE FEED HTML ---
        feedContainer.innerHTML = snapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data();
            const date = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : 'Just now';
            const editedBadge = data.isEdited ? '<span class="text-muted x-small ms-1 font-italic">(edited)</span>' : '';

            // Updated Layout: Shows the raw URL and uses the matching Preview/Open buttons
            let presetLink = '';
            if (data.presetUrl) {
                presetLink = `
                    <div class="mt-2 p-2 bg-dark rounded border border-secondary d-flex justify-content-between align-items-center">
                        <div class="text-info x-small text-truncate me-3" title="${data.presetUrl}" style="user-select: all;">
                            ${data.presetUrl}
                        </div>
                        <div class="d-flex gap-2 flex-shrink-0">
                            <button type="button" class="btn btn-sm btn-outline-info preview-preset-btn" data-url="${data.presetUrl}">Preview</button>
                            <a href="${data.presetUrl}" target="_blank" class="btn btn-sm btn-success" title="Open in SignalRGB"><i class="bi bi-box-arrow-up-right"></i></a>
                        </div>
                    </div>`;
            }

            let actionBtnsHtml = '';
            if (currentUser && currentUser.uid === data.userId) {
                actionBtnsHtml = `
                    <div class="d-flex align-items-center">
                        <button class="btn btn-link text-warning p-0 ms-3 edit-comment-btn" data-doc-id="${docSnapshot.id}" title="Edit Comment">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-link text-danger p-0 ms-3 delete-comment-btn" data-doc-id="${docSnapshot.id}" title="Delete Comment">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </div>`;
            }

            return `
                <div class="mb-3 p-3 border-bottom border-secondary-subtle">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="fw-bold text-info">${data.userName || 'Anonymous'}</span>
                            <span class="text-muted x-small ms-2">${date}</span>${editedBadge}
                        </div>
                        ${actionBtnsHtml}
                    </div>
                    
                    <div id="view-mode-${docSnapshot.id}">
                        <p class="mb-1 text-light comment-text">${data.commentText}</p>
                        ${presetLink}
                    </div>

                    <div id="edit-mode-${docSnapshot.id}" style="display: none;">
                        <textarea class="form-control form-control-sm bg-dark text-white border-secondary mb-2 inline-edit-textarea">${data.commentText}</textarea>
                        <input type="text" class="form-control form-control-sm bg-dark text-white border-secondary mb-2 inline-edit-preset" placeholder="Paste SignalRGB Preset URL (Optional)" value="${data.presetUrl || ''}">
                        <div class="text-end">
                            <button class="btn btn-sm btn-secondary me-2 cancel-edit-btn" data-doc-id="${docSnapshot.id}">Cancel</button>
                            <button class="btn btn-sm btn-success save-edit-btn" data-doc-id="${docSnapshot.id}">Save</button>
                        </div>
                    </div>
                </div>`;
        }).join('');

        // --- 2. DELETE BUTTON LOGIC ---
        feedContainer.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const docId = e.currentTarget.getAttribute('data-doc-id');
                if (confirm("Are you sure you want to delete this post?")) {
                    try {
                        await deleteDoc(doc(db, "community_presets", docId));
                    } catch (err) {
                        console.error("Error deleting:", err);
                        alert("Failed to delete. You may not have permission.");
                    }
                }
            });
        });

        // --- 3. SHOW EDIT UI ---
        feedContainer.querySelectorAll('.edit-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = e.currentTarget.getAttribute('data-doc-id');
                document.getElementById(`view-mode-${docId}`).style.display = 'none';
                document.getElementById(`edit-mode-${docId}`).style.display = 'block';
            });
        });

        // --- 4. CANCEL EDIT UI ---
        feedContainer.querySelectorAll('.cancel-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = e.currentTarget.getAttribute('data-doc-id');
                document.getElementById(`view-mode-${docId}`).style.display = 'block';
                document.getElementById(`edit-mode-${docId}`).style.display = 'none';
            });
        });

        // --- 5. SAVE EDIT LOGIC ---
        feedContainer.querySelectorAll('.save-edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const docId = e.currentTarget.getAttribute('data-doc-id');
                const editModeDiv = document.getElementById(`edit-mode-${docId}`);

                const newText = editModeDiv.querySelector('.inline-edit-textarea').value.trim();
                const rawPresetUrl = editModeDiv.querySelector('.inline-edit-preset').value.trim();
                const saveBtn = e.currentTarget;

                if (!newText) {
                    alert("Comment cannot be empty.");
                    return;
                }

                let validatedUrl = "";
                if (rawPresetUrl) {
                    if (!rawPresetUrl.startsWith("https://go.signalrgb.com/app/effect/apply/")) {
                        alert("Invalid preset link. It must start with 'https://go.signalrgb.com/app/effect/apply/'");
                        return;
                    }
                    if (rawPresetUrl.includes(" ")) {
                        alert("Preset links cannot contain spaces.");
                        return;
                    }
                    validatedUrl = rawPresetUrl;
                }

                saveBtn.disabled = true;
                saveBtn.textContent = "Saving...";

                try {
                    await updateDoc(doc(db, "community_presets", docId), {
                        commentText: newText,
                        presetUrl: validatedUrl,
                        isEdited: true
                    });
                } catch (err) {
                    console.error("Error updating comment:", err);
                    alert("Failed to update comment.");
                    saveBtn.disabled = false;
                    saveBtn.textContent = "Save";
                }
            });
        });

        // --- 6. ATTACH PREVIEW LOGIC TO COMMUNITY MIXES ---
        feedContainer.querySelectorAll('.preview-preset-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const presetUrl = e.currentTarget.getAttribute('data-url');
                const btnElement = e.currentTarget;
                const originalText = btnElement.textContent;
                btnElement.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                btnElement.disabled = true;

                try {
                    const urlObj = new URL(presetUrl);
                    const params = new URLSearchParams(urlObj.search);

                    // Fetch the clean base HTML file from your effects folder
                    const effectUrl = `effects/${filename}`;
                    const res = await fetch(effectUrl);
                    let htmlText = await res.text();
                    const parser = new DOMParser();
                    const docParser = parser.parseFromString(htmlText, 'text/html');

                    // Inject the custom parameters into the DOM
                    for (const [key, value] of params.entries()) {
                        const metaTag = docParser.querySelector(`meta[property="${key}"]`);
                        if (metaTag) {
                            metaTag.setAttribute('default', value);
                            metaTag.setAttribute('content', value);
                        }
                    }

                    // Fix relative paths for local assets
                    const fullEffectUrl = new URL(effectUrl, window.location.href).href;
                    const baseTag = docParser.createElement('base');
                    baseTag.href = new URL('.', fullEffectUrl).href;
                    docParser.head.insertBefore(baseTag, docParser.head.firstChild);

                    // Push the modified HTML into the preview window
                    const effectIframe = document.getElementById('effect-preview-iframe');
                    effectIframe.srcdoc = "<!DOCTYPE html>\n" + docParser.documentElement.outerHTML;

                } catch (err) {
                    console.error("Error generating preview:", err);
                } finally {
                    btnElement.textContent = originalText;
                    btnElement.disabled = false;
                }
            });
        });

    }, (error) => {
        console.error("Firestore Feed Error:", error);
        feedContainer.innerHTML = `<p class="text-danger text-center py-2 small">Error loading feed: ${error.message}</p>`;
    });
}

async function handlePostComment(filename) {
    if (!currentUser) {
        alert("You must be logged in to post.");
        return;
    }

    const textInput = document.getElementById('comment-text');
    const presetInput = document.getElementById('comment-preset');
    const btn = document.getElementById('btn-post-comment');

    const commentText = textInput.value.trim();
    const rawPresetUrl = presetInput.value.trim();

    // 1. Text is still required
    if (!commentText) return;

    // --- 2. THE VALIDATION CHECK ---
    let validatedUrl = "";
    if (rawPresetUrl) {
        // Enforce the strict SignalRGB URL structure
        if (!rawPresetUrl.startsWith("https://go.signalrgb.com/app/effect/apply/")) {
            alert("Invalid preset link. It must start with 'https://go.signalrgb.com/app/effect/apply/'");
            // Highlight the box red so the user knows where they messed up
            presetInput.classList.add('is-invalid', 'border-danger');

            // Remove the red border once they start typing again
            presetInput.addEventListener('input', () => {
                presetInput.classList.remove('is-invalid', 'border-danger');
            }, { once: true });

            return; // Abort the post
        }

        // Ensure there are no spaces in the URL to prevent broken links
        if (rawPresetUrl.includes(" ")) {
            alert("Preset links cannot contain spaces.");
            return;
        }

        validatedUrl = rawPresetUrl;
    }

    // 3. Proceed with posting
    btn.disabled = true;
    btn.textContent = 'Posting...';

    try {
        await addDoc(collection(db, "community_presets"), {
            effectFile: filename,
            userName: currentUser.displayName || "Anonymous User",
            userId: currentUser.uid,
            commentText: commentText,
            presetUrl: validatedUrl, // Use the clean, validated URL
            timestamp: serverTimestamp()
        });

        // Clear the form on success
        textInput.value = '';
        presetInput.value = '';
        presetInput.classList.remove('is-invalid', 'border-danger');
    } catch (err) {
        console.error("Error posting:", err);
        alert("Failed to post comment. Please try again.");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Post to Feed';
    }
}

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
        "void_and_silk.html", "SouthPark.html", "spirograph.html", "Borealis.html",
        "DigitalDecay.html", "KineticSand.html", "arcraiders.html", "windowrain.html",
        "prismLaser.html", "AudioLines.html", "audioLinesCanvas.html", "qmkKeyboardVisualizer.html",
        "skyMap.html", "stellarSynapse.html", "Fireflies.html", "BioluminiscentDeep.html", "DragonSkin.html", "DragonSkin2.html",
        "police.html", "neuralAutomata.html", "fanTracer.html", "grandLineVoyage.html",
        "chuck.html", "fanTracerTwoColor.html", "flowfield.html"
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

    // FIX: Change 'effect-iframe' to 'effect-preview-iframe'
    const effectIframe = document.getElementById('effect-preview-iframe');

    const effectIframeContainer = document.getElementById('effect-iframe-container');
    const effectDownloadBtn = document.getElementById('effect-download-btn');
    const effectShareBtn = document.getElementById('effect-share-btn');
    const effectRecordBtn = document.getElementById('effect-record-btn');

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
                            `Select: ${valList.slice(0, 3).join(', ')}...` :
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

            // Check for the meta tag explicitly
            const audioMeta = doc.querySelector('meta[property="audio_reactive"]');
            const hasAudioKeywords = textToAnalyze.match(/audio|sound|music|beat|freq|mic|visualizer|spect|vu meter|rhythm/);

            // Apply the tag if EITHER condition is met
            if (audioMeta || hasAudioKeywords) {
                if (!tags.includes('Sound Responsive')) tags.unshift('Sound Responsive');
            }
            if (textToAnalyze.match(/mouse|click|drag|interactive|cursor|touch/)) addTag('Interactive');
            if (textToAnalyze.match(/rainbow|color cycle|gradient|hues|spectrum/)) addTag('Rainbow');
            if (textToAnalyze.match(/fractal|mandelbrot|julia|math|geometry/)) addTag('Fractal');
            if (textToAnalyze.match(/particle|swarm|dots|dust|starfield/)) addTag('Particles');

            if (structuredControls.length > 0 && !tags.includes('Customizable')) {
                tags.push('Customizable');
            }

            // --- PRESET DETECTION ---
            const presets = [];
            const presetNodes = doc.querySelectorAll('script.effect-preset');

            presetNodes.forEach(node => {
                try {
                    // Standard SignalRGB presets are often valid JS objects but invalid JSON.
                    // Using a safer evaluation to capture the preset object.
                    const presetData = node.textContent.trim();
                    if (presetData.startsWith('{')) {
                        // Use a Function constructor for safer execution than eval
                        const parsed = new Function(`return ${presetData}`)();
                        presets.push(parsed);
                    }
                } catch (e) {
                    console.warn(`Invalid preset format in ${filename}:`, e);
                }
            });

            return {
                title, description, author, effectUrl, staticUrl, filename,
                tags,
                structuredControls,
                presets,
                originalIndex: index,
                downloads: 0
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
            if (badge) badge.textContent = count;
        });

        await Promise.allSettled(promises);
        statsLoaded = true;

        // If the user has selected "Most Popular" while we were loading, re-sort now
        if (sortSelect.value === 'downloads') {
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

            // --- BADGES HTML (Tags & Presets) ---
            let badgesHtml = '';
            const hasPresets = effect.presets && effect.presets.length > 0;
            const hasTags = effect.tags && effect.tags.length > 0;

            if (hasPresets || hasTags) {
                badgesHtml = `<div class="mb-2">`;

                // 1. Add Presets Badge First (so it stands out)
                if (hasPresets) {
                    badgesHtml += `<span class="badge bg-primary me-1 small" title="${effect.presets.length} Presets Available"><i class="bi bi-palette me-1"></i>${effect.presets.length} Preset${effect.presets.length > 1 ? 's' : ''}</span>`;
                }

                // 2. Add Standard Tags
                if (hasTags) {
                    effect.tags.slice(0, 3).forEach(tag => {
                        let cls = 'bg-secondary';
                        if (tag.toLowerCase().includes('sound')) cls = 'bg-info text-dark';
                        else if (tag === 'Customizable') cls = 'bg-warning text-dark';
                        else if (tag === 'Interactive') cls = 'bg-success';
                        badgesHtml += `<span class="badge ${cls} me-1 small">${tag}</span>`;
                    });
                    if (effect.tags.length > 3) {
                        badgesHtml += `<span class="badge bg-light text-dark border me-1 small">+${effect.tags.length - 3}</span>`;
                    }
                }

                badgesHtml += `</div>`;
            }

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';
            cardBody.innerHTML = `
                <h5 class="card-title text-truncate" title="${effect.title}">${effect.title}</h5>
                ${badgesHtml}
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

    async function handleViewEffect(effect) {
        // --- 1. LOCAL VARIABLE DECLARATION (Fixes ReferenceErrors) ---
        const effectIframe = document.getElementById('effect-preview-iframe');
        const effectIframeContainer = document.getElementById('effect-iframe-container');
        const shareBtn = document.getElementById('effect-share-btn');
        const downloadBtn = document.getElementById('effect-download-btn');
        const recordBtn = document.getElementById('effect-record-btn');

        if (!effectIframe || !effectIframeContainer) {
            console.error("Critical Error: Modal containers not found. Check for nested modals in index.html.");
            return;
        }

        // --- 2. RESET STATE ---
        effectViewTitle.textContent = effect.title;
        // Clear both to ensure no "ghosting" from the previous effect
        effectIframe.removeAttribute('srcdoc');
        effectIframe.src = effect.effectUrl;

        // --- 3. CLONE BUTTONS (Prevents stacking event listeners) ---
        if (shareBtn) {
            const newShareBtn = shareBtn.cloneNode(true);
            shareBtn.replaceWith(newShareBtn);
            newShareBtn.addEventListener('click', () => handleShareLink(newShareBtn, effect.filename));
        }

        if (downloadBtn) {
            const newDownloadBtn = downloadBtn.cloneNode(true);
            downloadBtn.replaceWith(newDownloadBtn);
            newDownloadBtn.addEventListener('click', () => handleDownloadZip(effect, newDownloadBtn));
        }

        if (recordBtn) {
            const newRecordBtn = recordBtn.cloneNode(true);
            recordBtn.replaceWith(newRecordBtn);
            newRecordBtn.addEventListener('click', () => recordEffectPreview(effect.title, newRecordBtn));
        }

        // --- 4. ASPECT RATIO & SCALING ---
        const scale = 1.5;

        effectIframe.style.width = '320px';
        effectIframe.style.height = '200px';
        effectIframe.style.transform = `scale(${scale})`;
        effectIframe.style.transformOrigin = 'center center';

        // FIX: Tell the container the exact scaled dimensions so flexbox centers it perfectly without bleeding left
        effectIframeContainer.style.width = `${320 * scale}px`;
        effectIframeContainer.style.height = `${200 * scale}px`;

        // --- 5. BOX 1: DESCRIPTION & TAGS ---
        let tagsHtml = '';
        if (effect.tags.length) {
            tagsHtml = `<div class="mt-3"><h6 class="fw-bold small text-uppercase tracking-wider">Tags</h6>`;
            effect.tags.forEach(tag => {
                let cls = 'bg-secondary';
                if (tag.includes('Sound')) cls = 'bg-info text-dark';
                else if (tag === 'Customizable') cls = 'bg-warning text-dark';
                tagsHtml += `<span class="badge ${cls} me-2">${tag}</span>`;
            });
            tagsHtml += `</div>`;
        }

        document.getElementById('effect-main-info').innerHTML = `
        <div class="mb-3">
            <h6 class="fw-bold small text-uppercase tracking-wider">Description</h6>
            <p class="text-light small mb-0">${effect.description}</p>
        </div>
        ${tagsHtml}
    `;

        // --- 6. BOX 2: ADJUSTABLE PROPERTIES (Accordion Box) ---
        const propCard = document.getElementById('properties-section-card');
        if (effect.structuredControls && effect.structuredControls.length > 0) {
            propCard.style.display = 'block';
            document.getElementById('properties-table-container').innerHTML = `
            <div class="table-responsive">
                <table class="table table-bordered table-sm small mb-0">
                    <thead class="table-light">
                        <tr><th>Property</th><th>Type / Range</th><th>Description</th></tr>
                    </thead>
                    <tbody>
                        ${effect.structuredControls.map(c => `
                            <tr>
                                <td><strong>${c.label}</strong><br><code class="text-primary">${c.variable}</code></td>
                                <td>${c.values}</td>
                                <td>${c.description}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
        } else {
            propCard.style.display = 'none';
        }

        // --- 7. BOX 3: PRESETS (Restored Logic) ---
        const presetsCard = document.getElementById('presets-section-card');
        const presetsZone = document.getElementById('presets-injection-zone');

        if (effect.presets && effect.presets.length > 0) {
            presetsCard.style.display = 'block';
            presetsZone.innerHTML = `
        <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="fw-bold mb-0 text-uppercase tracking-wider" style="font-size: 0.8rem; letter-spacing: 1px;">
                    <i class="bi bi-palette2 me-2 text-info"></i>Available Presets
                </h6>
                <button type="button" class="btn btn-sm btn-link text-muted p-0 text-decoration-none small" id="reset-preview-btn">Reset Defaults</button>
            </div>
            <p class="text-muted mb-0" style="font-size: 0.7rem; opacity: 0.8;">
                <i class="bi bi-dice-5-fill text-white"></i> = randomly generated
            </p>
        </div>
        <div class="preset-container">
            ${effect.presets.map(preset => {
                const parts = preset.name.split(':');
                return `
                <div class="preset-card p-3 d-flex justify-content-between align-items-center border border-secondary rounded mb-2 bg-dark">
                    <div class="flex-grow-1 me-3 text-truncate">
                        <div class="preset-name small fw-bold">${parts[0]} <i class="bi bi-dice-5-fill ms-1 text-white x-small"></i></div>
                        <div class="preset-details x-small text-muted text-truncate">${parts[1] || ''}</div>
                    </div>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-info preview-preset-btn" data-url="${preset.url}">Preview</button>
                        <a href="${preset.url}" target="_blank" class="btn btn-sm btn-success"><i class="bi bi-box-arrow-up-right"></i></a>
                    </div>
                </div>`;
            }).join('')}
        </div>`;

            // Attach listeners for Preset Previews
            presetsZone.querySelectorAll('.preview-preset-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const presetUrl = e.currentTarget.getAttribute('data-url');
                    const btnElement = e.currentTarget;
                    const originalText = btnElement.textContent;
                    btnElement.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                    btnElement.disabled = true;

                    try {
                        const urlObj = new URL(presetUrl);
                        const params = new URLSearchParams(urlObj.search);
                        const res = await fetch(effect.effectUrl);
                        let htmlText = await res.text();
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(htmlText, 'text/html');

                        for (const [key, value] of params.entries()) {
                            const metaTag = doc.querySelector(`meta[property="${key}"]`);
                            if (metaTag) {
                                metaTag.setAttribute('default', value);
                                metaTag.setAttribute('content', value);
                            }
                        }

                        const fullEffectUrl = new URL(effect.effectUrl, window.location.href).href;
                        const baseTag = doc.createElement('base');
                        baseTag.href = new URL('.', fullEffectUrl).href;
                        doc.head.insertBefore(baseTag, doc.head.firstChild);

                        effectIframe.srcdoc = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
                    } catch (err) { console.error(err); }
                    finally { btnElement.textContent = originalText; btnElement.disabled = false; }
                });
            });

            const resetBtn = presetsZone.querySelector('#reset-preview-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    effectIframe.removeAttribute('srcdoc');
                    effectIframe.src = effect.effectUrl;
                });
            }
        } else {
            presetsCard.style.display = 'none';
        }

        // --- Updated Community Visibility Logic ---
        const formContainer = document.getElementById('comment-form-container');
        const nameInput = document.getElementById('comment-name');

        updateCommentFormVisibility();

        loadCommunityFeed(effect.filename);

        // Ensure the post button cloning check is safe
        const postBtn = document.getElementById('btn-post-comment');
        if (postBtn) {
            const newPostBtn = postBtn.cloneNode(true);
            postBtn.replaceWith(newPostBtn);
            newPostBtn.addEventListener('click', () => handlePostComment(effect.filename));
        }

        // Final Step: Show the modal
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
        if (badge) badge.textContent = effect.downloads;

        // Fire and forget increment
        incrementDownloadCount(effect.filename);

        try {
            const [htmlRes, imgRes] = await Promise.all([fetch(effect.effectUrl), fetch(effect.staticUrl)]);
            if (!htmlRes.ok) throw new Error('HTML fetch failed');

            const zip = new JSZip();
            zip.file(effect.filename, await htmlRes.text());
            if (imgRes.ok) zip.file(effect.staticUrl.split('/').pop(), await imgRes.blob());

            const blob = await zip.generateAsync({ type: 'blob' });
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
        // Ensure we are using the filename passed during the specific modal open event
        const url = `${window.location.origin}${window.location.pathname}#${filename}`;

        try {
            await navigator.clipboard.writeText(url);
            const oldHtml = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            btn.classList.replace('btn-outline-info', 'btn-info');

            setTimeout(() => {
                btn.innerHTML = oldHtml;
                btn.classList.replace('btn-info', 'btn-outline-info');
            }, 2000);
        } catch (e) {
            console.error("Clipboard copy failed:", e);
        }
    }

    // --- EVENT LISTENERS ---

    if (effectViewModalEl) {
        effectViewModalEl.addEventListener('hidden.bs.modal', () => {
            // 1. Clear both src AND srcdoc to ensure the iframe is truly empty
            effectIframe.src = 'about:blank';
            effectIframe.removeAttribute('srcdoc');

            const details = document.getElementById('effect-details-section');
            if (details) details.remove();

            if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
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
        if (!hash) return;
        const found = allEffects.find(e => e.filename === hash);
        if (found) handleViewEffect(found);
    });

    /**
     * Records a 5-second video from the effect preview canvas immediately.
     */
    async function recordEffectPreview(effectName, btnElement) {
        const effectIframe = document.getElementById('effect-preview-iframe');

        if (!effectIframe) {
            console.error("Effect preview iframe not found.");
            return;
        }

        try {
            const canvas = effectIframe.contentDocument.querySelector('canvas');
            if (!canvas) {
                alert("Please wait a moment for the effect to fully load before recording.");
                return;
            }

            // Update button UI to show recording state
            const originalBtnHtml = btnElement.innerHTML;
            btnElement.innerHTML = `<span class="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>`;
            btnElement.classList.replace('btn-outline-danger', 'btn-danger');
            btnElement.disabled = true;

            const stream = canvas.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${effectName.replace(/\s+/g, '_')}_preview.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 100);

                // Restore button UI
                btnElement.innerHTML = originalBtnHtml;
                btnElement.classList.replace('btn-danger', 'btn-outline-danger');
                btnElement.disabled = false;
            };

            mediaRecorder.start();

            // Stop exactly after 5 seconds
            setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();
                }
            }, 5000);

        } catch (err) {
            console.error("Recording failed.", err);
            alert("Recording failed. This may be due to browser security restrictions on cross-origin iframes.");

            // Restore button UI on error
            if (btnElement) {
                btnElement.innerHTML = `<i class="bi bi-camera-video me-1"></i> Record 5s Video`;
                btnElement.classList.replace('btn-danger', 'btn-outline-danger');
                btnElement.disabled = false;
            }
        }
    }

    // Start
    initializeGallery().then(() => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const found = allEffects.find(e => e.filename === hash);
            if (found) setTimeout(() => handleViewEffect(found), 500);
        }
    });
});