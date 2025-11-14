document.addEventListener('DOMContentLoaded', function () {
    const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userSessionGroup = document.getElementById('user-session-group');
    const galleryList = document.getElementById('gallery-project-list');
    const editProjectModalEl = document.getElementById('edit-project-modal');
    const editProjectForm = document.getElementById('edit-project-form');
    const editProjectIdInput = document.getElementById('edit-project-id');
    const editProjectNameInput = document.getElementById('edit-project-name');
    const editProjectDescriptionInput = document.getElementById('edit-project-description');
    const editProjectModal = new bootstrap.Modal(editProjectModalEl);

    // --- Lazy Loading State Variables ---
    const PAGE_SIZE = 9;
    let lastVisible = null;
    let isLoading = false;
    let allLoaded = false;

    // --- DOM Elements for Lazy Loading ---
    const initialLoadingSpinner = document.getElementById('initial-loading-spinner');
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    const loadMoreSpinner = document.getElementById('load-more-spinner');
    const loadMoreMessage = document.getElementById('load-more-message');

    // --- Search State & Elements ---
    let currentSearchTerm = null;
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchSubmitBtn = document.getElementById('search-submit-btn');


    // --- Firebase Authentication Handling ---
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const provider = new window.GoogleAuthProvider();
            try {
                await window.signInWithPopup(window.auth, provider);
            } catch (error) {
                console.error("Authentication failed:", error);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await window.signOut(window.auth);
            } catch (error) {
                console.error("Sign out failed:", error);
            }
        });
    }

    function updateUserAuthState(user) {
        if (user) {
            loginBtn.classList.add('d-none');
            userSessionGroup.classList.remove('d-none');
            document.getElementById('user-photo').src = user.photoURL;
            document.getElementById('user-display').textContent = user.displayName;
        } else {
            loginBtn.classList.remove('d-none');
            userSessionGroup.classList.add('d-none');
        }
        loadPublicGallery();
    }

    if (window.auth) {
        window.onAuthStateChanged(window.auth, updateUserAuthState);
    } else {
        console.error("Firebase Auth is not initialized.");
        loadPublicGallery();
    }

    // --- NEW: Search Event Handlers ---
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Get the search, lowercase it, and take the first word.
            const searchTerm = searchInput.value.trim().toLowerCase().split(' ')[0];

            if (searchTerm === currentSearchTerm) {
                return; // No change, don't re-query
            }

            searchSubmitBtn.disabled = true;
            searchSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

            currentSearchTerm = searchTerm;
            searchClearBtn.style.display = searchTerm ? 'block' : 'none';
            loadPublicGallery(); // This resets the gallery
            loadMoreProjects(); // This explicitly loads the *first page* of search results
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            if (currentSearchTerm === null) return; // Already cleared

            currentSearchTerm = null;
            searchClearBtn.style.display = 'none';
            loadPublicGallery(); // Reset to default gallery
            loadMoreProjects(); // Load the first page of the default gallery
        });
    }

    if (searchInput) {
        // Show clear button as user types
        searchInput.addEventListener('input', () => {
            searchClearBtn.style.display = searchInput.value.trim() ? 'block' : 'none';
        });
    }


    // --- LIKE ACTION HANDLER ---
    async function handleLikeAction(docId) {
        const user = window.auth.currentUser;
        if (!user) {
            alert("You must be logged in to like or unlike an effect.");
            return;
        }

        const likeBtn = document.getElementById(`gallery-like-btn-${docId}`);
        const likeCountSpan = document.getElementById(`gallery-like-count-${docId}`);

        const isCurrentlyLiked = likeBtn && likeBtn.classList.contains('btn-danger');

        try {
            const docRef = window.doc(window.db, "projects", docId);
            let action = isCurrentlyLiked ? 'unliked' : 'liked';
            let projectOwnerId = '';

            await window.runTransaction(window.db, async (transaction) => {
                const projectDoc = await transaction.get(docRef);
                if (!projectDoc.exists()) throw new Error("Project not found.");

                const data = projectDoc.data();
                const likedBy = data.likedBy || {};
                let newLikesCount = data.likes || 0;
                projectOwnerId = data.userId;

                if (action === 'liked') {
                    newLikesCount = newLikesCount + 1;
                    likedBy[user.uid] = true;
                } else {
                    newLikesCount = Math.max(0, newLikesCount - 1);
                    delete likedBy[user.uid];
                }

                transaction.update(docRef, {
                    likes: newLikesCount,
                    likedBy: likedBy,
                    updatedAt: new Date()
                });
            });

            if (action === 'liked' && projectOwnerId !== user.uid) {
                await window.addDoc(window.collection(window.db, "notifications"), {
                    recipientId: projectOwnerId,
                    senderId: user.uid,
                    projectId: docId,
                    eventType: 'like',
                    timestamp: window.serverTimestamp(),
                    read: false
                });
            }

            const countChange = action === 'liked' ? 1 : -1;
            const newCount = likeCountSpan ? (parseInt(likeCountSpan.textContent) || 0) + countChange : 0;

            if (likeBtn) {
                if (action === 'liked') {
                    likeBtn.classList.remove('btn-outline-danger');
                    likeBtn.classList.add('btn-danger');
                    likeBtn.innerHTML = '<i class="bi bi-heart-fill"></i> Like';
                    likeBtn.title = "Unlike";
                } else {
                    likeBtn.classList.remove('btn-danger');
                    likeBtn.classList.add('btn-outline-danger');
                    likeBtn.innerHTML = '<i class="bi bi-heart"></i> Like';
                    likeBtn.title = "Like";
                }
            }
            if (likeCountSpan) {
                likeCountSpan.textContent = Math.max(0, newCount);
            }

        } catch (error) {
            console.error("Error processing like action:", error);
            alert("Failed to process like/unlike action. Please check your network or sign-in status.");
            loadPublicGallery();
        }
    }

    // --- Admin & Edit Functions ---
    async function toggleFeaturedStatus(docIdToToggle) {
        // Find the button inside the dropdown
        const featureBtn = document.getElementById(`admin-feature-btn-${docIdToToggle}`);
        if (featureBtn) {
            featureBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Toggling...';
            featureBtn.classList.add('disabled');
        }

        try {
            const projectsRef = window.collection(window.db, "projects");
            const docToToggleRef = window.doc(projectsRef, docIdToToggle);
            const q = window.query(projectsRef, window.where("featured", "==", true));
            const currentlyFeaturedSnapshot = await window.getDocs(q);

            await window.runTransaction(window.db, async (transaction) => {
                const docToToggleSnap = await transaction.get(docToToggleRef);
                if (!docToToggleSnap.exists()) throw new Error("Document does not exist!");
                const isCurrentlyFeatured = docToToggleSnap.data().featured === true;
                const newFeaturedState = !isCurrentlyFeatured;
                if (newFeaturedState === true) {
                    currentlyFeaturedSnapshot.forEach((doc) => {
                        transaction.update(doc.ref, { featured: false });
                    });
                }
                transaction.update(docToToggleRef, { featured: newFeaturedState });
            });

            // Reload the whole gallery to see the change
            loadPublicGallery();

        } catch (error) {
            console.error("Error updating featured status: ", error);
            if (featureBtn) {
                featureBtn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Error';
            }
        }
    }

    function openEditModal(project) {
        editProjectIdInput.value = project.docId;
        editProjectNameInput.value = project.name;
        const descriptionConf = project.configs.find(c => c.name === 'description');
        editProjectDescriptionInput.value = descriptionConf ? descriptionConf.default : '';
        editProjectModal.show();
    }

    editProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-edit-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        const docId = editProjectIdInput.value;
        const newName = editProjectNameInput.value;
        const newDescription = editProjectDescriptionInput.value;
        try {
            const docRef = window.doc(window.db, "projects", docId);
            const docSnap = await window.getDoc(docRef);
            if (!docSnap.exists()) throw new Error("Document not found.");
            const updatedConfigs = docSnap.data().configs.map(conf => {
                if (conf.name === 'description') {
                    return { ...conf, default: newDescription };
                }
                if (conf.name === 'title') {
                    return { ...conf, default: newName };
                }
                return conf;
            });
            // --- NEW: Generate keywords ---
            // 1. Remove punctuation, split by space, filter empty strings
            const keywords = newName.toLowerCase()
                .replace(/[^\w\s]/g, '') // Remove punctuation
                .split(' ')
                .filter(Boolean); // Remove empty strings

            await window.updateDoc(docRef, {
                name: newName,
                configs: updatedConfigs,
                searchKeywords: keywords // <-- Add the new keywords array
            });
            editProjectModal.hide();
            loadPublicGallery(); // Reload all
        } catch (error) {
            console.error("Error updating project:", error);
            alert("Failed to save changes.");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Changes';
        }
    });

    // --- *** NEW: Project Rendering Function (Builds Cards) *** ---
    function renderProjects(projectDocs) {
        const currentUser = window.auth.currentUser;

        projectDocs.forEach((doc) => {
            const project = { docId: doc.id, ...doc.data() };

            if (project.createdAt && project.createdAt.toDate) {
                project.createdAt = project.createdAt.toDate();
            }

            let description = 'No description provided.';
            if (project.configs) {
                const descriptionConf = project.configs.find(c => c.name === 'description');
                if (descriptionConf && descriptionConf.default) {
                    description = descriptionConf.default;
                }
            }

            const viewCount = project.viewCount || 0;
            const downloadCount = project.downloadCount || 0;
            const likeCount = project.likes || 0;
            const userHasLiked = currentUser && project.likedBy && project.likedBy[currentUser.uid];

            // --- Create Admin Actions Dropdown ---
            let adminDropdownHTML = '';
            const isOwner = currentUser && currentUser.uid === project.userId;
            const isAdmin = currentUser && currentUser.uid === ADMIN_UID;

            if (isOwner || isAdmin) {
                const isFeatured = project.featured === true;

                // Owner can edit
                const editHTML = (isOwner || isAdmin) ? `<li><button class="dropdown-item" id="admin-edit-btn-${project.docId}"><i class="bi bi-pencil me-2"></i>Edit</button></li>` : '';

                // Admin-only actions
                const featureHTML = isAdmin ? `<li><button class="dropdown-item" id="admin-feature-btn-${project.docId}">${isFeatured ? '<i class="bi bi-star-fill me-2"></i>Un-feature' : '<i class="bi bi-star me-2"></i>Feature'}</button></li>` : '';
                const regenHTML = isAdmin ? `<li><a class="dropdown-item" href="./?effectId=${project.docId}&action=regenThumbnail" target="_blank"><i class="bi bi-arrow-clockwise me-2"></i>Regen Thumb</a></li>` : '';
                const deleteHTML = isAdmin ? `<li><hr class="dropdown-divider"></li><li><button class="dropdown-item text-danger" id="admin-delete-btn-${project.docId}"><i class="bi bi-trash me-2"></i>Delete</button></li>` : '';

                adminDropdownHTML = `
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary" type="button" id="admin-dropdown-${project.docId}" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="admin-dropdown-${project.docId}">
                            ${editHTML}
                            ${featureHTML}
                            ${regenHTML}
                            ${deleteHTML}
                        </ul>
                    </div>
                `;
            }

            // --- Create Column and Card ---
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 d-flex align-items-stretch';
            col.id = `gallery-item-${project.docId}`; // ID is now on the column

            const card = document.createElement('div');
            card.className = 'card shadow-sm h-100';

            card.innerHTML = `
                <a href="./?effectId=${project.docId}" class="position-relative">
                    ${project.thumbnail ?
                    `<img src="${project.thumbnail}" class="card-img-top" style="aspect-ratio: 16/10; object-fit: cover;" alt="${project.name}">` :
                    `<div class="card-img-top d-flex align-items-center justify-content-center bg-body-secondary" style="aspect-ratio: 16/10;">
                            <i class="bi bi-image text-body-tertiary" style="font-size: 3rem;"></i>
                        </div>`
                }
                    ${project.featured === true ? '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2"><i class="bi bi-star-fill me-1"></i>Featured</span>' : ''}
                </a>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${project.name}</h5>
                    <small class="card-subtitle mb-2 text-body-secondary">By ${project.creatorName || 'Anonymous'}</small>
                    <p class="card-text small text-body-secondary flex-grow-1" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${description}">
                        ${description}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small class="text-body-secondary" title="Views / Downloads / Likes">
                            <i class="bi bi-eye-fill"></i> ${viewCount} &nbsp;
                            <i class="bi bi-download"></i> ${downloadCount} &nbsp;
                            <i class="bi bi-heart-fill"></i> <span id="gallery-like-count-${project.docId}">${likeCount}</span>
                        </small>
                        ${adminDropdownHTML}
                    </div>
                </div>
                <div class="card-footer d-flex gap-2">
                    <a href="./?effectId=${project.docId}" class="btn btn-primary w-100"><i class="bi bi-box-arrow-down me-2"></i>Load</a>
                    <button class="btn ${userHasLiked ? 'btn-danger' : 'btn-outline-danger'} w-100" id="gallery-like-btn-${project.docId}" title="${userHasLiked ? 'Unlike' : 'Like'}">
                        ${userHasLiked ? '<i class="bi bi-heart-fill"></i> Liked' : '<i class="bi bi-heart"></i> Like'}
                    </button>
                </div>
            `;

            col.appendChild(card);
            galleryList.appendChild(col);

            // --- Attach Event Listeners ---
            const likeBtn = col.querySelector(`#gallery-like-btn-${project.docId}`);
            if (likeBtn) {
                likeBtn.disabled = !currentUser;
                likeBtn.addEventListener('click', () => handleLikeAction(project.docId));
            }

            const editBtn = col.querySelector(`#admin-edit-btn-${project.docId}`);
            if (editBtn) {
                editBtn.addEventListener('click', () => openEditModal(project));
            }

            const featureBtn = col.querySelector(`#admin-feature-btn-${project.docId}`);
            if (featureBtn) {
                featureBtn.addEventListener('click', () => toggleFeaturedStatus(project.docId));
            }

            const deleteBtn = col.querySelector(`#admin-delete-btn-${project.docId}`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
                        try {
                            // Optimistically remove from UI
                            col.remove();
                            await window.deleteDoc(window.doc(window.db, "projects", project.docId));
                        } catch (error) {
                            console.error("Error deleting project:", error);
                            alert("Failed to delete project.");
                            // Put it back if delete failed
                            galleryList.appendChild(col);
                        }
                    }
                });
            }
        });
    }


    // --- Lazy Loading Data Functions ---
    async function loadMoreProjects() {
        if (isLoading || allLoaded) return;

        isLoading = true;
        loadMoreSpinner.style.display = 'block';
        loadMoreMessage.classList.add('d-none');

        try {
            const queryConstraints = [
                window.where("isPublic", "==", true)
            ];

            // --- NEW: Handle Search Query vs. Default Query ---
            if (currentSearchTerm) {
                // Use array-contains for a whole-word, case-insensitive search
                queryConstraints.push(window.where("searchKeywords", "array-contains", currentSearchTerm));
                // We can't order by 'name' AND filter on 'searchKeywords' in Firestore.
                // But we can still order by date, which is great.
                queryConstraints.push(window.orderBy("createdAt", "desc"));
            } else {
                // Default sort by creation date
                queryConstraints.push(window.orderBy("createdAt", "desc"));
            }

            // --- Add pagination and limit ---
            if (lastVisible) {
                queryConstraints.push(window.startAfter(lastVisible));
            }
            queryConstraints.push(window.limit(PAGE_SIZE));

            const q = window.query(
                window.collection(window.db, "projects"),
                ...queryConstraints
            );

            const querySnapshot = await window.getDocs(q);

            if (initialLoadingSpinner) {
                initialLoadingSpinner.remove();
            }

            if (querySnapshot.empty) {
                allLoaded = true;
                loadMoreMessage.classList.remove('d-none');
                if (galleryList.children.length === 0) {
                    // Display "no effects" message inside the grid
                    const message = currentSearchTerm
                        ? `No effects found matching "${currentSearchTerm}".`
                        : "No effects found.";
                    galleryList.innerHTML = `<div class="col-12 text-center"><p class="text-body-secondary">${message}</p></div>`;
                }
            } else {
                lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                renderProjects(querySnapshot.docs);

                if (querySnapshot.size < PAGE_SIZE) {
                    allLoaded = true;
                    loadMoreMessage.classList.remove('d-none');
                }
            }

        } catch (error) {
            console.error("Error loading more projects:", error);
            galleryList.innerHTML = '<div class="col-12"><p class="list-group-item text-danger">Could not load effects. Please try again later.</p></div>';
        } finally {
            isLoading = false;
            loadMoreSpinner.style.display = 'none';

            // Re-enable search button
            if (searchSubmitBtn) {
                searchSubmitBtn.disabled = false;
                searchSubmitBtn.innerHTML = '<i class="bi bi-search"></i>';
            }
        }
    }

    function loadPublicGallery() {
        galleryList.innerHTML = '';
        lastVisible = null;
        allLoaded = false;
        isLoading = false;

        if (initialLoadingSpinner) {
            galleryList.appendChild(initialLoadingSpinner);
        }

        loadMoreMessage.classList.add('d-none');
    }

    // --- Intersection Observer Setup ---
    function setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMoreProjects();
            }
        }, options);

        if (loadMoreTrigger) {
            observer.observe(loadMoreTrigger);
        }
    }

    // --- INITIALIZE ---
    setupIntersectionObserver();
});