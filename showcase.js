// --- 1. FIREBASE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// --- 2. FIREBASE CONFIGURATION (From your firebase.js) ---
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

// --- 3. HELPER FUNCTIONS FOR COUNTS ---

/**
 * Generates a safe Firestore Document ID from a filename.
 * e.g., "RetroWave.html" -> "RetroWave_html"
 */
function getSafeDocId(filename) {
    return filename.replace(/\./g, '_');
}

/**
 * Fetches the current download count for a specific effect.
 */
async function getDownloadCount(filename) {
    const docId = getSafeDocId(filename);
    const docRef = doc(db, "showcase_stats", docId);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().downloads || 0;
        }
        return 0;
    } catch (error) {
        console.warn("Could not fetch count for", filename);
        return 0;
    }
}

/**
 * Increments the download count in Firestore.
 */
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
        // Try to update existing document
        await updateDoc(docRef, {
            downloads: increment(1)
        });
    } catch (error) {
        // If document doesn't exist (first download ever), create it
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
    const effectFilenames = [
        "SwirlCirclesAudio.html",
        "RotatingBeam.html",
        "NoiseMap.html",
        "Policing.html",
        "MovingPanes.html",
        "SpectrumCycling.html",
        "Sunrise.html",
        "Stack.html",
        "Mosaic.html",
        "Marquee.html",
        "Swap.html",
        "Mask.html",
        "ZigZag.html",
        "AudioBubbles.html",
        "Wavy.html",
        "Visor.html",
        "StarryNight.html",
        "Spiral.html",
        "Sequence.html",
        "SmoothBlink.html",
        "SparkleFade.html",
        "RandomMarquee.html",
        "RotatingRainbow.html",
        "RandomSpin.html",
        "RadialRainbow.html",
        "Rain.html",
        "RainbowWave.html",
        "Lightning.html",
        "MotionPoints.html",
        "GradientWave.html",
        "FractalMotion.html",
        "Hypnotoad.html",
        "Fill.html",
        "DoubleRotatingRainbow.html",
        "BreathingCircle.html",
        "BubbleCollision.html",
        "ColorWheel.html",
        "CustomMarque.html",
        "CrossingBeams.html",
        "Comet.html",
        "CustomGradientWave.html",
        "CustomBlink.html",
        "Clock.html",
        "Bubbles.html",
        "Breathing.html",
        "BouncingBall.html",
        "Bloom.html",
        "AudioVUMeter.html",
        "AudioVisualizer.html",
        "AudioSync.html",
        "AudioStar.html",
        "AudioSine.html",
        "AudioParty.html",
        "Ambient.html",
        "ParticleSwarm.html",
        "NeonHex.html",
        "fractal_explorer.html",
        "audio_eclipse.html",
        "RetroWave.html",
        "infinity_spiral.html",
        "PRFlag.html",
        "SolarSystem.html",
        "tunnel.html",
        "particle_eq_bars.html",
        "laserShapes.html",
        "concertLasers.html",
        "ink_drops.html",
        "starfield.html",
        "digital_noiseform.html",
        "bouncingCubes.html",
        "clouds.html",
        "polyPlanet.html",
        "serenityWaves.html",
        "systemBouncer.html"
    ];

    // --- Path Configuration ---
    const effectsFolder = "effects";
    const projectListContainer = document.getElementById('showcase-project-list');

    // Variable to store all effects for filtering
    let allEffects = [];

    // Search Input Element
    const searchInput = document.getElementById('effect-search-input');


    // --- MODAL VARIABLES (CODE PREVIEW) ---
    const codePreviewModalEl = document.getElementById('code-preview-modal');
    // FIX: Check if element exists before initialization
    const codePreviewModal = codePreviewModalEl ? new bootstrap.Modal(codePreviewModalEl) : null;
    const codePreviewTitle = document.getElementById('code-preview-title');
    const codePreviewContent = document.getElementById('code-preview-content');
    const copyCodeBtn = document.getElementById('copy-code-btn');

    // --- MODAL VARIABLES (EFFECT VIEW) ---
    const effectViewModalEl = document.getElementById('effect-view-modal');
    // FIX: Check if element exists before initialization
    const effectViewModal = effectViewModalEl ? new bootstrap.Modal(effectViewModalEl) : null;
    const effectViewTitle = document.getElementById('effect-view-title');
    const effectIframe = document.getElementById('effect-iframe');
    const effectIframeContainer = document.getElementById('effect-iframe-container');

    // Download and Share Buttons in View Modal
    const effectDownloadBtn = document.getElementById('effect-download-btn');
    const effectShareBtn = document.getElementById('effect-share-btn');

    async function fetchEffectMetadata(filename) {
        const effectUrl = `${effectsFolder}/${filename}`;
        const staticUrl = effectUrl.replace(/\.html$/, '.png');

        try {
            const response = await fetch(effectUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${effectUrl}: ${response.statusText}`);
            }
            const htmlText = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const getCustomMeta = (attrName) => {
                const el = doc.querySelector(`meta[${attrName}]`);
                return el ? el.getAttribute(attrName) : null;
            };

            const getStandardMeta = (name) => {
                const el = doc.querySelector(`meta[name="${name}"]`);
                return el ? el.getAttribute('content') : null;
            };

            const title = getCustomMeta('title')
                || doc.querySelector('title')?.textContent
                || 'Untitled Effect';

            const description = getCustomMeta('description')
                || getStandardMeta('description')
                || getStandardMeta('og:description')
                || 'No description available.';

            const author = getCustomMeta('publisher')
                || getStandardMeta('publisher')
                || getStandardMeta('author')
                || 'Unknown Author';

            return {
                title,
                description,
                author,
                effectUrl,
                staticUrl,
                filename: filename
            };

        } catch (error) {
            console.error(`Error processing ${filename}:`, error);
            return null;
        }
    }

    async function buildEffectsList(filenames) {
        const effectPromises = filenames.map(fetchEffectMetadata);
        const effects = await Promise.all(effectPromises);
        return effects.filter(effect => effect !== null);
    }

    function getEffectByFilename(filename) {
        return allEffects.find(effect => effect.filename === filename);
    }

    function populateShowcase(effects) {
        projectListContainer.innerHTML = '';

        if (!effects || effects.length === 0) {
            projectListContainer.innerHTML = `
                <div class="col-12">
                    <div class="card h-100">
                        <div class="card-body text-center text-body-secondary">
                           <p class="mb-1">No effects match your search criteria.</p>
                           <p class="small">Try a different keyword.</p>
                        </div>
                    </div>
                </div>`;
            return;
        }

        effects.forEach(effect => {
            const col = document.createElement('div');
            col.className = 'col';

            const card = document.createElement('div');
            card.className = 'card h-100 shadow-sm';

            const previewContainer = document.createElement('div');
            previewContainer.className = 'card-img-top';
            previewContainer.style.height = '180px';
            previewContainer.style.backgroundImage = `url('${effect.staticUrl}')`;
            previewContainer.style.backgroundSize = 'cover';
            previewContainer.style.backgroundPosition = 'center';
            previewContainer.style.overflow = 'hidden';
            previewContainer.style.display = 'flex';
            previewContainer.style.justifyContent = 'center';
            previewContainer.style.alignItems = 'center';

            let previewIframe = null;

            card.addEventListener('mouseover', () => {
                previewContainer.style.backgroundImage = 'none';
                previewContainer.style.backgroundColor = 'black';

                if (!previewIframe) {
                    const scale = 180 / 200;
                    previewIframe = document.createElement('iframe');
                    previewIframe.src = effect.effectUrl;
                    previewIframe.style.width = '320px';
                    previewIframe.style.height = '200px';
                    previewIframe.style.border = 'none';
                    previewIframe.style.transformOrigin = 'center center';
                    previewIframe.style.transform = `scale(${scale})`;
                    previewIframe.scrolling = 'no';
                    previewIframe.style.pointerEvents = 'none';
                    previewContainer.appendChild(previewIframe);
                }
            });

            card.addEventListener('mouseout', () => {
                previewContainer.style.backgroundImage = `url('${effect.staticUrl}')`;
                previewContainer.style.backgroundColor = 'transparent';

                if (previewIframe) {
                    previewContainer.removeChild(previewIframe);
                    previewIframe = null;
                }
            });

            previewContainer.addEventListener('error', () => {
                previewContainer.style.backgroundImage = `url('https://placehold.co/400x225/343a40/dee2e6?text=No+Preview')`;
            });

            previewContainer.addEventListener('click', () => {
                handleViewEffect(effect);
                window.location.hash = effect.filename;
            });

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';
            cardBody.innerHTML = `
                <h5 class="card-title">${effect.title}</h5>
                <p class="card-text text-body-secondary small flex-grow-1">${effect.description}</p>
                <small class="text-muted">By: ${effect.author}</small>
            `;

            // --- 4. MODIFIED FOOTER FOR COUNTS ---
            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center';

            // Create Count Element
            const docId = getSafeDocId(effect.filename);
            const countBadge = document.createElement('div');
            countBadge.className = 'text-body-secondary small';
            countBadge.innerHTML = `<i class="bi bi-download me-1"></i><span id="count-${docId}">...</span>`;
            
            // Load Count
            getDownloadCount(effect.filename).then(count => {
                const el = document.getElementById(`count-${docId}`);
                if(el) el.textContent = count;
            });

            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
            btnGroup.role = 'group';

            const viewButton = document.createElement('a');
            viewButton.className = 'btn btn-sm btn-primary'; // made btn-sm for better fit
            viewButton.innerHTML = '<i class="bi bi-eye-fill me-1"></i> View';
            viewButton.href = '#' + effect.filename;
            viewButton.role = 'button';

            viewButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleViewEffect(effect);
                window.location.hash = effect.filename;
            });

            const codeButton = document.createElement('button');
            codeButton.type = 'button';
            codeButton.className = 'btn btn-sm btn-secondary'; // made btn-sm
            codeButton.innerHTML = '<i class="bi bi-code-slash me-1"></i> Code';
            codeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleViewCode(effect);
            });

            const downloadButton = document.createElement('button');
            downloadButton.type = 'button';
            downloadButton.className = 'btn btn-sm btn-success'; // made btn-sm
            downloadButton.innerHTML = '<i class="bi bi-download me-1"></i> Zip';
            downloadButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDownloadZip(effect, e.currentTarget);
            });

            btnGroup.appendChild(viewButton);
            btnGroup.appendChild(codeButton);
            btnGroup.appendChild(downloadButton);

            cardFooter.appendChild(countBadge);
            cardFooter.appendChild(btnGroup);
            
            card.appendChild(previewContainer);
            card.appendChild(cardBody);
            card.appendChild(cardFooter);
            col.appendChild(card);
            projectListContainer.appendChild(col);
        });
    }

    function handleViewEffect(effect) {
        effectViewTitle.textContent = effect.title;
        effectIframe.src = effect.effectUrl;

        if (effectDownloadBtn) {
            effectDownloadBtn.replaceWith(effectDownloadBtn.cloneNode(true));
            const newDownloadBtn = document.getElementById('effect-download-btn');
            newDownloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDownloadZip(effect, newDownloadBtn);
            });
        }

        if (effectShareBtn) {
            effectShareBtn.replaceWith(effectShareBtn.cloneNode(true));
            const newShareBtn = document.getElementById('effect-share-btn');
            newShareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleShareLink(newShareBtn, effect.filename);
            });
        }

        const SCALE_FACTOR = 2.0;
        const BASE_WIDTH = 320;
        const BASE_HEIGHT = 200;

        effectIframe.style.width = `${BASE_WIDTH}px`;
        effectIframe.style.height = `${BASE_HEIGHT}px`;
        effectIframe.style.transform = `scale(${SCALE_FACTOR})`;
        effectIframe.style.transformOrigin = 'center center';
        effectIframeContainer.style.height = `${BASE_HEIGHT * SCALE_FACTOR}px`;
        effectIframeContainer.style.width = `${BASE_WIDTH * SCALE_FACTOR}px`;

        if (effectViewModal) {
            effectViewModal.show();
        }
    }

    async function handleViewCode(effect) {
        codePreviewTitle.textContent = `${effect.title} - Source Code`;
        codePreviewContent.textContent = 'Loading...';
        if (window.Prism) {
            Prism.highlightElement(codePreviewContent);
        }

        if (codePreviewModal) {
            codePreviewModal.show();
        }

        try {
            const response = await fetch(effect.effectUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const code = await response.text();
            codePreviewContent.textContent = code;

            if (window.Prism) {
                Prism.highlightElement(codePreviewContent);
            }

        } catch (error) {
            console.error('Error fetching code:', error);
            codePreviewContent.textContent = 'Error: Could not load effect source code.';
            if (window.Prism) {
                Prism.highlightElement(codePreviewContent);
            }
        }
    }

    async function handleDownloadZip(effect, button) {
        const originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        // --- 5. CALL INCREMENT FUNCTION ---
        incrementDownloadCount(effect.filename);

        try {
            const htmlResponse = await fetch(effect.effectUrl);
            const staticResponse = await fetch(effect.staticUrl);

            if (!htmlResponse.ok) throw new Error('Failed to fetch HTML file.');

            const htmlContent = await htmlResponse.text();
            const zip = new JSZip();

            const htmlFilename = effect.effectUrl.split('/').pop();
            const zipFilename = htmlFilename.replace(/\.html$/, '.zip');
            zip.file(htmlFilename, htmlContent);

            if (staticResponse.ok) {
                const staticContent = await staticResponse.blob();
                const staticFilename = effect.staticUrl.split('/').pop();
                zip.file(staticFilename, staticContent);
            } else {
                console.warn(`Could not fetch static PNG: ${effect.staticUrl}`);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = zipFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error('Error creating ZIP:', error);
            alert('Failed to create download. See console for details.');
        } finally {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }
    }

    async function handleShareLink(button, filename) {
        const shareLink = window.location.origin + window.location.pathname + '#' + filename;
        const originalText = button.innerHTML;

        try {
            await navigator.clipboard.writeText(shareLink);
            button.innerHTML = '<i class="bi bi-check-lg me-1"></i> Link Copied!';
            button.classList.remove('btn-outline-info');
            button.classList.add('btn-info');
        } catch (err) {
            console.error('Failed to copy link: ', err);
            button.innerHTML = '<i class="bi bi-x-lg me-1"></i> Copy Error';
            button.classList.remove('btn-outline-info');
            button.classList.add('btn-danger');
        }

        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-info', 'btn-danger');
            button.classList.add('btn-outline-info');
        }, 2500);
    }

    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', async () => {
            const code = codePreviewContent.textContent;
            const originalText = copyCodeBtn.innerHTML;
            try {
                await navigator.clipboard.writeText(code);
                copyCodeBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i> Copied!';
            } catch (err) {
                console.error('Failed to copy code: ', err);
                copyCodeBtn.innerHTML = 'Error Copying';
            }

            setTimeout(() => {
                copyCodeBtn.innerHTML = originalText;
            }, 2000);
        });
    }

    if (effectViewModalEl) {
        effectViewModalEl.addEventListener('hidden.bs.modal', () => {
            effectIframe.src = 'about:blank';
            effectIframe.style.transform = 'none';
            effectIframe.style.width = '320px';
            effectIframe.style.height = '200px';
            effectIframeContainer.style.height = '200px';
            effectIframeContainer.style.width = '100%';

            if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        });
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm.length === 0) {
            populateShowcase(allEffects);
            return;
        }

        const filteredEffects = allEffects.filter(effect => {
            return effect.title.toLowerCase().includes(searchTerm) ||
                effect.description.toLowerCase().includes(searchTerm) ||
                effect.author.toLowerCase().includes(searchTerm);
        });

        populateShowcase(filteredEffects);
    }

    function handleDeepLink() {
        const filename = window.location.hash.substring(1);

        if (filename) {
            const effect = getEffectByFilename(filename);
            if (effect) {
                setTimeout(() => {
                    handleViewEffect(effect);
                }, 100);
            }
        }
    }

    // --- INITIALIZATION ---
    buildEffectsList(effectFilenames)
        .then(manualEffects => {
            manualEffects.sort((a, b) => a.title.localeCompare(b.title));
            allEffects = manualEffects;
            populateShowcase(allEffects);
            handleDeepLink();
        })
        .catch(error => {
            console.error("Failed to build effects list:", error);
            populateShowcase([]);
        });

    window.addEventListener('hashchange', handleDeepLink);

    if (searchInput) {
        searchInput.addEventListener('keyup', handleSearch);
    }
});