document.addEventListener('DOMContentLoaded', () => {

    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userSessionGroup = document.getElementById('user-session-group');
    const userDisplay = document.getElementById('user-display');
    const userPhoto = document.getElementById('user-photo');

    window.onAuthStateChanged(window.auth, user => {
        if (user) {
            loginBtn.classList.add('d-none');
            userSessionGroup.classList.remove('d-none');
            userDisplay.textContent = user.displayName || 'Anonymous';
            userPhoto.src = user.photoURL || 'https://placehold.co/24x24/6c757d/white?text=A';
        } else {
            loginBtn.classList.remove('d-none');
            userSessionGroup.classList.add('d-none');
        }
    });

    loginBtn.addEventListener('click', async () => {
        try {
            await window.handleSignIn();
        } catch (error) {
            console.error("Sign in failed", error);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await window.handleSignOut();
        } catch (error) {
            console.error("Sign out failed", error);
        }
    });

    const container = document.getElementById('pixel-art-container');

    function showToast(message, type = 'info') {
        const toastEl = document.getElementById('app-toast');
        if (!toastEl) return;
        const toastHeader = document.getElementById('app-toast-header');
        const toastTitle = document.getElementById('app-toast-title');
        const toastBody = document.getElementById('app-toast-body');
        const toastIcon = document.getElementById('app-toast-icon');

        toastBody.innerHTML = message;

        toastHeader.classList.remove('bg-success', 'bg-danger', 'bg-primary');
        toastIcon.className = 'bi me-2';

        switch (type) {
            case 'success':
                toastHeader.classList.add('bg-success');
                toastTitle.textContent = 'Success';
                toastIcon.classList.add('bi-check-circle-fill');
                break;
            case 'danger':
                toastHeader.classList.add('bg-danger');
                toastTitle.textContent = 'Error';
                toastIcon.classList.add('bi-exclamation-triangle-fill');
                break;
            default:
                toastHeader.classList.add('bg-primary');
                toastTitle.textContent = 'Notification';
                toastIcon.classList.add('bi-info-circle-fill');
                break;
        }
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast.show();
    }


    async function fetchPixelArt() {
        container.innerHTML = `<div class="col text-center p-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        try {
            const projectsRef = collection(db, "projects");
            // Query for public projects that contain at least one pixel-art shape.
            const q = query(projectsRef,
                where("isPublic", "==", true),
                where("configs", "array-contains", { property: "obj1_shape", label: "Object 1: Shape", type: "combobox", default: "pixel-art" }),
                orderBy("createdAt", "desc")
            );

             const querySnapshot = await getDocs(query(projectsRef, where("isPublic", "==", true), orderBy("createdAt", "desc")));
            
            let allPixelArtObjects = [];

            querySnapshot.forEach(doc => {
                const project = doc.data();
                if (project.configs && Array.isArray(project.configs)) {
                    // Find all pixel art objects within this project
                    const pixelArtConfigs = project.configs.filter(conf =>
                        conf.property && conf.property.endsWith("_shape") && conf.default === 'pixel-art'
                    );

                    pixelArtConfigs.forEach(shapeConf => {
                        const objectIdMatch = shapeConf.property.match(/^obj(\d+)_/);
                        if (objectIdMatch) {
                            const objectId = objectIdMatch[1];
                            const framesConf = project.configs.find(c => c.property === `obj${objectId}_pixelArtFrames`);
                            if (framesConf && framesConf.default) {
                                allPixelArtObjects.push({
                                    framesData: framesConf.default,
                                    projectName: project.name,
                                    creatorName: project.creatorName || 'Anonymous',
                                    docId: doc.id
                                });
                            }
                        }
                    });
                }
            });

            if (allPixelArtObjects.length === 0) {
                 container.innerHTML = `<div class="col"><p class="text-body-secondary">No public pixel art found.</p></div>`;
                 return;
            }

            container.innerHTML = '';
            allPixelArtObjects.forEach((art, index) => {
                const col = document.createElement('div');
                col.className = 'col';
                
                const card = document.createElement('div');
                card.className = 'card h-100';
                
                const cardBody = document.createElement('div');
                cardBody.className = 'pixel-art-card-body p-3';
                
                const canvas = document.createElement('canvas');
                canvas.className = 'pixel-art-canvas';
                canvas.width = 120;
                canvas.height = 120;
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'flex-grow-1';

                const title = document.createElement('h6');
                title.className = 'card-title';
                title.textContent = `From: ${art.projectName}`;

                const creator = document.createElement('p');
                creator.className = 'card-text text-body-secondary mb-2';
                creator.textContent = `By: ${art.creatorName}`;

                const copyBtn = document.createElement('button');
                copyBtn.className = 'btn btn-sm btn-outline-primary';
                copyBtn.innerHTML = `<i class="bi bi-clipboard-plus me-1"></i> Copy Data`;
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(art.framesData).then(() => {
                        showToast('Pixel art data copied to clipboard!', 'success');
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                        showToast('Could not copy data.', 'danger');
                    });
                });

                infoDiv.appendChild(title);
                infoDiv.appendChild(creator);
                infoDiv.appendChild(copyBtn);

                cardBody.appendChild(canvas);
                cardBody.appendChild(infoDiv);
                card.appendChild(cardBody);
                col.appendChild(card);
                container.appendChild(col);

                // Animation logic for each canvas
                try {
                    const frames = JSON.parse(art.framesData);
                    let currentFrameIndex = 0;
                    let frameTimer = frames[currentFrameIndex]?.duration || 1;
                    let lastTime = 0;

                    const animate = (time) => {
                        const deltaTime = (time - lastTime) / 1000;
                        lastTime = time;

                        frameTimer -= deltaTime;
                        if (frameTimer <= 0) {
                            currentFrameIndex = (currentFrameIndex + 1) % frames.length;
                            frameTimer += frames[currentFrameIndex]?.duration || 1;
                        }

                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        
                        const frame = frames[currentFrameIndex];
                        if (frame && frame.data) {
                             const data = (typeof frame.data === 'string') ? JSON.parse(frame.data) : frame.data;
                             const rows = data.length;
                             if(rows === 0) return;
                             const cols = data[0].length;
                             if(cols === 0) return;

                             const cellWidth = canvas.width / cols;
                             const cellHeight = canvas.height / rows;

                             for(let r=0; r < rows; r++){
                                 for(let c=0; c < cols; c++){
                                     const val = data[r][c] || 0;
                                     if(val > 0) {
                                        if (val === 1.0) {
                                            ctx.fillStyle = '#FFFFFF';
                                        } else if (val === 0.3) {
                                            ctx.fillStyle = '#FF00FF'; // Placeholder for Color 1
                                        } else if (val === 0.4) {
                                            ctx.fillStyle = '#00FFFF'; // Placeholder for Color 2
                                        } else {
                                             ctx.fillStyle = `rgba(255, 0, 255, ${val})`; // Default animated color
                                        }
                                        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
                                     }
                                 }
                             }
                        }
                        requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);

                } catch (e) {
                    console.error("Could not parse or animate pixel art:", art, e);
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'red';
                    ctx.font = '12px sans-serif'
                    ctx.textAlign = 'center'
                    ctx.fillText('Error', canvas.width/2, canvas.height/2);
                }
            });

        } catch (error) {
            console.error("Error fetching pixel art:", error);
            container.innerHTML = `<div class="col"><p class="text-danger">Could not load pixel art gallery.</p></div>`;
        }
    }

    fetchPixelArt();
});
