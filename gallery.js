// gallery.js - COMPLETE FILE (with Cards & Lazy Loading)

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
    let currentFilter = 'all'; // 'all' or 'liked'
    let currentSort = 'createdAt'; // 'createdAt', 'likes', 'downloadCount', 'name'
    let currentSortLabel = 'Newest';
    let isGalleryReady = false;
    
    // --- DOM Elements for Lazy Loading ---
    const initialLoadingSpinner = document.getElementById('initial-loading-spinner');
    const loadMoreTrigger = document.getElementById('load-more-trigger');
    const loadMoreSpinner = document.getElementById('load-more-spinner');
    const loadMoreMessage = document.getElementById('load-more-message');


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
        // === MODIFICATION START ===
        const likedTab = document.getElementById('filter-liked-tab');
        // === MODIFICATION END ===

        if (user) {
            loginBtn.classList.add('d-none');
            userSessionGroup.classList.remove('d-none');
            document.getElementById('user-photo').src = user.photoURL;
            document.getElementById('user-display').textContent = user.displayName;
            if (likedTab) likedTab.style.display = 'block'; // Show "My Liked" tab
        } else {
            loginBtn.classList.remove('d-none');
            userSessionGroup.classList.add('d-none');
            if (likedTab) likedTab.style.display = 'none'; // Hide "My Liked" tab
            
            // If user logged out while on "liked" tab, switch back to "all"
            if (currentFilter === 'liked') {
                currentFilter = 'all';
                // Manually update tab UI
                document.querySelector('#gallery-filter-tabs a[data-filter="liked"]').classList.remove('active');
                document.querySelector('#gallery-filter-tabs a[data-filter="all"]').classList.add('active');
            }
            // === MODIFICATION END ===
        }
        // Reload the gallery to apply auth-specific views (like buttons)
        loadPublicGallery(); 
    }

    if (window.auth) {
        window.onAuthStateChanged(window.auth, updateUserAuthState);
    } else {
        console.error("Firebase Auth is not initialized.");
        loadPublicGallery();
    }

    // === NEW FILTER & SORT LISTENERS START ===
    const filterTabs = document.getElementById('gallery-filter-tabs');
    if (filterTabs) {
        filterTabs.addEventListener('click', (e) => {
            e.preventDefault();
            const link = e.target.closest('a[data-filter]');
            // Check if the link exists and is not already active
            if (link && !link.classList.contains('active')) {
                // Update active state for tabs
                const activeLink = filterTabs.querySelector('a.active');
                if (activeLink) activeLink.classList.remove('active');
                link.classList.add('active');
                
                currentFilter = link.dataset.filter;
                loadPublicGallery(); // Reload the gallery with the new filter
            }
        });
    }

    const sortDropdown = document.querySelector('.dropdown-menu');
    const sortLabel = document.getElementById('sort-by-label');
    if (sortDropdown) {
        sortDropdown.addEventListener('click', (e) => {
            e.preventDefault();
            const link = e.target.closest('a.gallery-sort-option');
            if (link) {
                currentSort = link.dataset.sort;
                currentSortLabel = link.textContent;
                if(sortLabel) sortLabel.textContent = currentSortLabel;
                
                loadPublicGallery(); // Reload the gallery with the new sort
            }
        });
    }
    // === NEW FILTER & SORT LISTENERS END ===


    // --- LIKE ACTION HANDLER ---
    async function handleLikeAction(docId) {
        const user = window.auth.currentUser;
        if (!user) {
            alert("You must be logged in to like or unlike an effect.");
            return;
        }

        const likeBtn = document.getElementById(`gallery-like-btn-${docId}`);
        const likeCountSpan = document.getElementById(`gallery-like-count-${docId}`);

        // Check the button's current state to decide the action
        const isCurrentlyLiked = likeBtn && likeBtn.classList.contains('btn-danger');

        try {
            const docRef = window.doc(window.db, "projects", docId);
            let action = isCurrentlyLiked ? 'unliked' : 'liked';
            let projectOwnerId = '';

            await window.runTransaction(window.db, async (transaction) => {
                const projectDoc = await transaction.get(docRef);
                if (!projectDoc.exists()) throw new Error("Project not found.");

                const data = projectDoc.data();
                // Ensure likedBy is an array
                let likedBy = [];
                if (Array.isArray(data.likedBy)) {
                    likedBy = data.likedBy;
                } else if (typeof data.likedBy === 'object' && data.likedBy !== null) {
                    // Convert legacy map to array
                    likedBy = Object.keys(data.likedBy);
                }

                let newLikesCount = data.likes || 0;
                projectOwnerId = data.userId; // Get owner for notification

                if (action === 'liked') {
                    newLikesCount = newLikesCount + 1;
                    if (!likedBy.includes(user.uid)) {
                        likedBy.push(user.uid);
                    }
                } else {
                    newLikesCount = Math.max(0, newLikesCount - 1);
                    likedBy = likedBy.filter(uid => uid !== user.uid);
                }

                // Commit the changes
                transaction.update(docRef, {
                    likes: newLikesCount,
                    likedBy: likedBy
                    // No need to update 'updatedAt' for a simple like
                });
            });

            // Send notification only on a "like" action and if not liking your own post
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

            // --- UI Update ---
            const countChange = action === 'liked' ? 1 : -1;
            const newCount = likeCountSpan ? (parseInt(likeCountSpan.textContent) || 0) + countChange : 0;

            if (likeBtn) {
                if (action === 'liked') {
                    likeBtn.classList.remove('btn-outline-danger');
                    likeBtn.classList.add('btn-danger');
                    likeBtn.innerHTML = '<i class="bi bi-heart-fill"></i> Liked'; // Show "Liked"
                    likeBtn.title = "Unlike";
                } else {
                    likeBtn.classList.remove('btn-danger');
                    likeBtn.classList.add('btn-outline-danger');
                    likeBtn.innerHTML = '<i class="bi bi-heart"></i> Like'; // Show "Like"
                    likeBtn.title = "Like";

                    // If we are in the "My Liked Effects" filter, remove the card
                    if (currentFilter === 'liked') {
                        const cardColumn = likeBtn.closest('.col-12');
                        if (cardColumn) {
                            cardColumn.style.transition = 'opacity 0.3s ease';
                            cardColumn.style.opacity = '0';
                            setTimeout(() => cardColumn.remove(), 300);
                        }
                    }
                }
            }
            if (likeCountSpan) {
                likeCountSpan.textContent = Math.max(0, newCount); // Update count
            }

        } catch (error) {
            console.error("Error processing like action:", error);
            alert("Failed to process like/unlike action. Please check your network or sign-in status.");
            // Force a reload to correct any UI inconsistencies
            loadPublicGallery();
        }
    }

    // --- Admin & Edit Functions ---
    async function toggleFeaturedStatus(docIdToToggle) {
        // Find the button inside the dropdown
        const featureBtn = document.getElementById(`admin-feature-btn-${docIdToToggle}`);
        if(featureBtn) {
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
            if(featureBtn) {
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
            // Update the name in both the root and the configs array
            const updatedConfigs = docSnap.data().configs.map(conf => {
                if (conf.name === 'description') {
                    return { ...conf, default: newDescription };
                }
                if (conf.name === 'title') {
                    return { ...conf, default: newName };
                }
                // Update object labels as well
                if (conf.label && conf.label.startsWith(docSnap.data().name)) {
                    return { ...conf, label: conf.label.replace(docSnap.data().name, newName) };
                }
                return conf;
            });
            await window.updateDoc(docRef, {
                name: newName,
                configs: updatedConfigs
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

            // Check if likedBy is array or map (handle legacy data)
            let userHasLiked = false;
            if (currentUser && project.likedBy) {
                if (Array.isArray(project.likedBy)) {
                    userHasLiked = project.likedBy.includes(currentUser.uid);
                } else {
                    userHasLiked = !!project.likedBy[currentUser.uid];
                }
            }

            // --- Create Admin Actions Dropdown ---
            // --- 1. Create Admin Actions Dropdown (Top Right Kebab) ---
            let adminDropdownHTML = '';
            const isOwner = currentUser && currentUser.uid === project.userId;
            const isAdmin = currentUser && currentUser.uid === ADMIN_UID;
            
            if (isOwner || isAdmin) {
                const isFeatured = project.featured === true;
                
                const editHTML = (isOwner || isAdmin) ? `<li><button class="dropdown-item" id="admin-edit-btn-${project.docId}"><i class="bi bi-pencil me-2"></i>Edit</button></li>` : '';
                const featureHTML = isAdmin ? `<li><button class="dropdown-item" id="admin-feature-btn-${project.docId}">${isFeatured ? '<i class="bi bi-star-fill me-2"></i>Un-feature' : '<i class="bi bi-star me-2"></i>Feature'}</button></li>` : '';
                const regenHTML = isAdmin ? `<li><a class="dropdown-item" href="./?effectId=${project.docId}&action=regenThumbnail" target="_blank"><i class="bi bi-arrow-clockwise me-2"></i>Regen Thumb</a></li>` : '';
                const deleteHTML = isAdmin ? `<li><hr class="dropdown-divider"></li><li><button class="dropdown-item text-danger" id="admin-delete-btn-${project.docId}"><i class="bi bi-trash me-2"></i>Delete</button></li>` : '';

                // MODIFIED: Matches the provided image (Light Grey Circle, Dark Dots)
                // Uses 'btn-light' for the color and flexbox for perfect centering
                adminDropdownHTML = `
                    <div class="dropdown position-absolute top-0 end-0 m-2 z-2">
                        <button class="btn btn-light rounded-circle shadow-sm p-0 d-flex align-items-center justify-content-center" 
                                style="width: 32px; height: 32px;" 
                                type="button" 
                                id="admin-dropdown-${project.docId}" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="admin-dropdown-${project.docId}">
                            ${editHTML}
                            ${featureHTML}
                            ${regenHTML}
                            ${deleteHTML}
                        </ul>
                    </div>
                `;
            }

            // --- 2. Build the Card HTML ---
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 d-flex align-items-stretch';
            col.id = `gallery-item-${project.docId}`;

            const card = document.createElement('div');
            card.className = 'card shadow-sm h-100';
            
            // Note: We create a parent 'position-relative' div to hold the Link AND the Menu separate
            card.innerHTML = `
                <div class="position-relative">
                    <a href="./?effectId=${project.docId}" class="d-block">
                        ${project.thumbnail ? 
                            `<img src="${project.thumbnail}" class="card-img-top" style="aspect-ratio: 16/10; object-fit: cover;" alt="${project.name}">` : 
                            `<div class="card-img-top d-flex align-items-center justify-content-center bg-body-secondary" style="aspect-ratio: 16/10;">
                                <i class="bi bi-image text-body-tertiary" style="font-size: 3rem;"></i>
                            </div>`
                        }
                    </a>
                    ${project.featured === true ? '<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2 z-1"><i class="bi bi-star-fill me-1"></i>Featured</span>' : ''}
                    ${adminDropdownHTML} 
                </div>

                <div class="card-body d-flex flex-column">
                    <h5 class="card-title text-truncate">${project.name}</h5>
                    <small class="card-subtitle mb-2 text-body-secondary">By ${project.creatorName || 'Anonymous'}</small>
                    <p class="card-text small text-body-secondary flex-grow-1" style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="${description}">
                        ${description}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-2 border-top pt-2">
                        <small class="text-body-secondary" title="Views / Downloads / Likes">
                            <i class="bi bi-eye-fill"></i> ${viewCount} &nbsp;
                            <i class="bi bi-download"></i> ${downloadCount} &nbsp;
                            <i class="bi bi-heart-fill"></i> <span id="gallery-like-count-${project.docId}">${likeCount}</span>
                        </small>
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
                // Like button is disabled if user is not logged in
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
            // === MODIFICATION START ===
            const user = window.auth.currentUser;
            
            const queryConstraints = [
                window.where("isPublic", "==", true)
            ];

            // 1. Add filter
            if (currentFilter === 'liked' && user) {
                // Use array-contains for array based storage
                queryConstraints.push(window.where("likedBy", "array-contains", user.uid));
            }

            // 2. Add sorting
            // Note: Firestore requires the first orderBy to match the inequality filter if one exists.
            // If we filter by 'likedBy', we can't effectively sort by 'createdAt' etc.
            // So, for 'liked' filter, we will implicitly sort by 'likedBy' (which is fine)
            // or we must fetch all and sort client-side.
            // For now, let's keep the query simple. The 'liked' filter will just show results.
            // Let's refine this:
            
            if (currentFilter === 'liked' && user) {
                // When filtering by "liked", sorting by other fields (like 'likes' or 'createdAt') 
                // requires a composite index in Firestore (e.g., `likedBy.USER_ID` and `likes`).
                // This is complex to do for *every* user.
                // A simpler approach for "My Liked Effects" is to just show them, sorted by the default (name or date).
                // Let's stick to sorting by the selected field. This WILL require composite indexes.
                // If indexes don't exist, the console will show an error with a link to create them.
                const sortDirection = (currentSort === 'name') ? 'asc' : 'desc';
                queryConstraints.push(window.orderBy(currentSort, sortDirection));

            } else {
                // Standard sorting for "All Effects"
                const sortDirection = (currentSort === 'name') ? 'asc' : 'desc';
                queryConstraints.push(window.orderBy(currentSort, sortDirection));
            }


            // 3. Add pagination
            queryConstraints.push(window.limit(PAGE_SIZE));
            if (lastVisible) {
                queryConstraints.push(window.startAfter(lastVisible));
            }
            // === MODIFICATION END ===

            const q = window.query(
                window.collection(window.db, "projects"),
                ...queryConstraints
            );
            
            const querySnapshot = await window.getDocs(q);
            
            if (initialLoadingSpinner) {
                // Use .remove() for modern browsers
                initialLoadingSpinner.remove(); 
            }

            if (querySnapshot.empty) {
                allLoaded = true;
                loadMoreMessage.classList.remove('d-none');
                if (galleryList.children.length === 0) {
                     // Display "no effects" message inside the grid
                     galleryList.innerHTML = '<div class="col-12"><p class="text-body-secondary text-center mt-4">No effects found.</p></div>';
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
            galleryList.innerHTML = `<div class="col-12"><p class="list-group-item text-danger">Could not load effects. ${error.message.includes('indexes') ? '<b>This filter/sort combination requires a database index.</b> Check the console (F12) for a link to create it.' : 'Please try again later.'}</p></div>`;
        } finally {
            isLoading = false;
            loadMoreSpinner.style.display = 'none';
        }
    }

    function loadPublicGallery() {
        galleryList.innerHTML = ''; 
        lastVisible = null;
        allLoaded = false;
        isLoading = false;

        // === FIX START: Enable Observer ===
        isGalleryReady = true; 
        // === FIX END ===
        
        if (initialLoadingSpinner) {
            galleryList.appendChild(initialLoadingSpinner);
        }

        loadMoreMessage.classList.add('d-none'); 
        
        loadMoreProjects();
    }
    
    // --- Intersection Observer Setup ---
    function setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 
        };

        const observer = new IntersectionObserver((entries) => {
            // === FIX START: Check Flag ===
            // Only load if intersecting AND the gallery has been initialized
            if (entries[0].isIntersecting && isGalleryReady) {
                loadMoreProjects();
            }
            // === FIX END ===
        }, options);

        if (loadMoreTrigger) {
            observer.observe(loadMoreTrigger);
        }
    }

    // --- INITIALIZE ---
    setupIntersectionObserver();
    // Note: The initial call to loadPublicGallery() is now handled 
    // by the onAuthStateChanged callback, so we don't need one here.
});