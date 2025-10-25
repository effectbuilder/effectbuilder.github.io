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
        "MotionMosaic.html",
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
        "concertLasers.html"
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

    /**
     * Fetches an individual effect's HTML file and parses it to extract metadata.
     * It looks for custom meta tags (<meta title="...">, <meta description="...">, <meta publisher="...">)
     * first, then falls back to standard tags (<title>, <meta name="description">, <meta name="author">).
     *
     * @param {string} filename - The HTML filename of the effect (e.g., "RetroWave.html").
     * @returns {Promise<object | null>} A Promise that resolves to an effect object
     * (with title, description, author, effectUrl, staticUrl)
     * or null if fetching/parsing fails.
     */
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

            // Helper for your non-standard tags like <meta publisher="...">
            const getCustomMeta = (attrName) => {
                const el = doc.querySelector(`meta[${attrName}]`);
                return el ? el.getAttribute(attrName) : null;
            };

            // Helper for standard tags like <meta name="description" content="...">
            const getStandardMeta = (name) => {
                const el = doc.querySelector(`meta[name="${name}"]`);
                return el ? el.getAttribute('content') : null;
            };

            // 1. Get Title:
            //    Looks for <meta title="..."> first, then <title>...</title>
            const title = getCustomMeta('title')
                || doc.querySelector('title')?.textContent
                || 'Untitled Effect';

            // 2. Get Description:
            //    Looks for <meta description="..."> first, then <meta name="description" ...>
            const description = getCustomMeta('description')
                || getStandardMeta('description')
                || getStandardMeta('og:description')
                || 'No description available.';

            // 3. Get Author:
            //    Looks for <meta publisher="..."> first, then <meta name="publisher" ...> or <meta name="author" ...>
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
                // NEW: Store the raw filename for lookup/deep linking
                filename: filename
            };

        } catch (error) {
            console.error(`Error processing ${filename}:`, error);
            return null;
        }
    }

    /**
     * Asynchronously builds a complete list of effect objects by processing
     * an array of filenames. It calls fetchEffectMetadata for each one.
     *
     * @param {Array<string>} filenames - An array of effect HTML filenames.
     * @returns {Promise<Array<object>>} A Promise that resolves to an array of effect objects.
     * Failed fetches will be filtered out.
     */
    async function buildEffectsList(filenames) {
        const effectPromises = filenames.map(fetchEffectMetadata);
        const effects = await Promise.all(effectPromises);
        return effects.filter(effect => effect !== null);
    }
    
    /**
     * Finds a single effect object in the global list by its filename.
     * @param {string} filename - The filename to search for (e.g., "RetroWave.html").
     * @returns {object | undefined} The effect object or undefined.
     */
    function getEffectByFilename(filename) {
        return allEffects.find(effect => effect.filename === filename);
    }

    /**
     * Renders the complete list of effects onto the page as Bootstrap cards.
     * This function creates all the DOM elements, including the hover-to-preview
     * logic and the buttons for View, Code, and Download.
     *
     * @param {Array<object>} effects - An array of effect objects, typically from buildEffectsList.
     */
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
                    // Scale to fit the 180px height (180 / 200 = 0.9)
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
                // Fallback for if the static image fails
                previewContainer.style.backgroundImage = `url('https://placehold.co/400x225/343a40/dee2e6?text=No+Preview')`;
            });

            // ADD CLICK HANDLER TO OPEN MODAL HERE
            previewContainer.addEventListener('click', () => {
                handleViewEffect(effect);
                // Update URL hash for sharing
                window.location.hash = effect.filename;
            });

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';
            cardBody.innerHTML = `
                <h5 class="card-title">${effect.title}</h5>
                <p class="card-text text-body-secondary small flex-grow-1">${effect.description}</p>
                <small class="text-muted">By: ${effect.author}</small>
            `;

            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer bg-transparent border-top-0';

            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group w-100';
            btnGroup.role = 'group';

            const viewButton = document.createElement('button');
            viewButton.type = 'button';
            viewButton.className = 'btn btn-primary';
            viewButton.innerHTML = '<i class="bi bi-eye-fill me-1"></i> View';
            
            // Add click handler and use window.location.hash for shareable link
            viewButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                handleViewEffect(effect);
                window.location.hash = effect.filename; // Set the hash on button click
            });

            const codeButton = document.createElement('button');
            codeButton.type = 'button';
            codeButton.className = 'btn btn-secondary';
            codeButton.innerHTML = '<i class="bi bi-code-slash me-1"></i> Code';
            codeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleViewCode(effect);
            });

            const downloadButton = document.createElement('button');
            downloadButton.type = 'button';
            downloadButton.className = 'btn btn-success';
            downloadButton.innerHTML = '<i class="bi bi-download me-1"></i> Zip';
            downloadButton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDownloadZip(effect, e.currentTarget);
            });

            btnGroup.appendChild(viewButton);
            btnGroup.appendChild(codeButton);
            btnGroup.appendChild(downloadButton);

            cardFooter.appendChild(btnGroup);
            card.appendChild(previewContainer);
            card.appendChild(cardBody);
            card.appendChild(cardFooter);
            col.appendChild(card);
            projectListContainer.appendChild(col);
        });
    }

    /**
     * Opens the Effect View modal and loads the selected effect into its iframe.
     *
     * @param {object} effect - The effect object to display.
     */
    function handleViewEffect(effect) {
        effectViewTitle.textContent = effect.title;
        effectIframe.src = effect.effectUrl;
        
        // --- Dynamic Download Button Handler ---
        // 1. Clone the node to remove all previous click listeners
        if (effectDownloadBtn) {
            effectDownloadBtn.replaceWith(effectDownloadBtn.cloneNode(true));
            const newDownloadBtn = document.getElementById('effect-download-btn');
            // 2. Add the listener for the current effect
            newDownloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDownloadZip(effect, newDownloadBtn);
            });
        }
        
        // --- Share Button Handler ---
        if (effectShareBtn) {
            effectShareBtn.replaceWith(effectShareBtn.cloneNode(true));
            const newShareBtn = document.getElementById('effect-share-btn');
            newShareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleShareLink(newShareBtn, effect.filename);
            });
        }
        // ------------------------------------------

        // --- CODE FOR SCALING ---
        const SCALE_FACTOR = 2.0;
        const BASE_WIDTH = 320;
        const BASE_HEIGHT = 200;

        // 1. Set the iframe to its original dimensions (320x200)
        effectIframe.style.width = `${BASE_WIDTH}px`;
        effectIframe.style.height = `${BASE_HEIGHT}px`;
        
        // 2. Apply the scale transformation (2x)
        effectIframe.style.transform = `scale(${SCALE_FACTOR})`;
        effectIframe.style.transformOrigin = 'center center';
        
        // 3. Resize the iframe's container to match the scaled size (320*2 x 200*2 = 640x400)
        effectIframeContainer.style.height = `${BASE_HEIGHT * SCALE_FACTOR}px`;
        effectIframeContainer.style.width = `${BASE_WIDTH * SCALE_FACTOR}px`;

        // FIX: Check instance before calling show()
        if (effectViewModal) {
            effectViewModal.show();
        }
    }

    /**
     * Opens the Code Preview modal, fetches the effect's source code,
     * and displays it with syntax highlighting.
     *
     * @param {object} effect - The effect object whose code to show.
     */
    async function handleViewCode(effect) {
        codePreviewTitle.textContent = `${effect.title} - Source Code`;
        codePreviewContent.textContent = 'Loading...';
        if (window.Prism) {
            Prism.highlightElement(codePreviewContent);
        }

        // FIX: Check instance before calling show()
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

            // Tell Prism to highlight the new content
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

    /**
     * Fetches the effect's HTML and PNG files, compresses them into a ZIP archive,
     * and triggers a download for the user.
     *
     * @param {object} effect - The effect object to download.
     * @param {HTMLElement} button - The download button that was clicked (to show a loading state).
     */
    async function handleDownloadZip(effect, button) {
        const originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

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

    /**
     * Copies the full deep link URL to the clipboard.
     *
     * @param {HTMLElement} button - The share button that was clicked.
     * @param {string} filename - The filename of the effect to include in the hash.
     */
    async function handleShareLink(button, filename) {
        const shareLink = window.location.origin + window.location.pathname + '#' + filename;
        const originalText = button.innerHTML;
        
        try {
            // Write the link to clipboard
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

    /**
     * Attaches a click listener to the "Copy Code" button inside the code modal.
     * Copies the modal's text content to the clipboard.
     */
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

    /**
     * Attaches a listener to the Effect View modal. When the modal is fully hidden,
     * it resets the iframe's source to 'about:blank'. This is crucial to stop
     * any running animations or audio from the effect.
     */
    if (effectViewModalEl) {
        effectViewModalEl.addEventListener('hidden.bs.modal', () => {
            // Clear the iframe to stop the effect from running in the background
            effectIframe.src = 'about:blank';
            
            // Reset the iframe and its container styles
            effectIframe.style.transform = 'none';
            effectIframe.style.width = '320px';
            effectIframe.style.height = '200px';
            effectIframeContainer.style.height = '200px';
            effectIframeContainer.style.width = '100%'; // Reset to fill parent for centering

            // Clear the URL hash when closing the modal
            if (window.location.hash) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        });
    }


    /**
     * Filters the global list of effects based on the search input value
     * and re-renders the showcase with the filtered list.
     */
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm.length === 0) {
            // If the search is cleared, show all effects
            populateShowcase(allEffects);
            return;
        }

        const filteredEffects = allEffects.filter(effect => {
            // Check title, description, and author for the search term
            return effect.title.toLowerCase().includes(searchTerm) ||
                   effect.description.toLowerCase().includes(searchTerm) ||
                   effect.author.toLowerCase().includes(searchTerm);
        });

        populateShowcase(filteredEffects);
    }

    /**
     * Checks the URL hash on page load and opens the Effect View modal
     * for the corresponding effect if a valid filename is found.
     */
    function handleDeepLink() {
        // Get the hash (e.g., "#RetroWave.html") and remove the leading '#'
        const filename = window.location.hash.substring(1); 
        
        if (filename) {
            const effect = getEffectByFilename(filename);
            if (effect) {
                // Wait briefly to ensure the modal object is ready, then show it
                setTimeout(() => {
                    handleViewEffect(effect);
                }, 100); 
            } 
        }
    }


    // --- INITIALIZATION ---
    buildEffectsList(effectFilenames)
        .then(manualEffects => {
            // Sort the effects alphabetically by title before displaying
            manualEffects.sort((a, b) => a.title.localeCompare(b.title));
            // Store the full list
            allEffects = manualEffects;
            // Populate with all effects initially
            populateShowcase(allEffects);
            
            // 1. Handle deep link on page load
            handleDeepLink();
        })
        .catch(error => {
            console.error("Failed to build effects list:", error);
            populateShowcase([]);
        });

    // 2. Handle deep link when the hash changes (e.g., when clicking 'View' on a loaded page)
    window.addEventListener('hashchange', handleDeepLink);

    // Attach keyup listener for filtering
    if (searchInput) {
        searchInput.addEventListener('keyup', handleSearch);
    }
});