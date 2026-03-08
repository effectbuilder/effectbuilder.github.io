const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// --- 1. DEFINE ALL SECRETS AT THE TOP ---
const giphyApiKey = defineSecret("GIPHY_API_KEY");
const pushoverUserKey = defineSecret("PUSHOVER_USER_KEY");
const pushoverApiToken = defineSecret("PUSHOVER_API_TOKEN");

const ADMIN_UID = "zMj8mtfMjXeFMt072027JT7Jc7i1"; 

// --- 2. EFFECT BUILDER TRIGGER ---
exports.notifyOnNewEffect = onDocumentCreated({
    document: "projects/{projectId}",
    secrets: [pushoverUserKey, pushoverApiToken]
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const project = snapshot.data();
    
    if (project.authorId === ADMIN_UID) {
        console.log("Admin created effect. Skipping notification.");
        return null;
    }

    const projectId = event.params.projectId;
    const author = project.authorName || 'Anonymous';
    const name = project.projectName || 'Untitled Effect';
    const url = `https://effectbuilder.github.io/?effectId=${projectId}`;

    try {
        const response = await fetch("https://api.pushover.net/1/messages.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: pushoverApiToken.value(),
                user: pushoverUserKey.value(),
                message: `New effect "${name}" created by ${author}`,
                title: "🚀 Effect Builder Alert",
                url: url,
                url_title: "Open in Builder",
                priority: 1 
            })
        });

        if (response.ok) {
            console.log(`Push notification sent for: ${name}`);
        } else {
            const errorText = await response.text();
            console.error("Pushover Error:", errorText);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
});

// --- 3. GIPHY SECURE PROXY ---
exports.searchGifs = onRequest({ secrets: [giphyApiKey] }, (req, res) => {
    cors(req, res, async () => {
        const searchTerm = req.query.q || "";
        const offset = req.query.offset || 0;
        const apiKey = giphyApiKey.value();

        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&limit=20&offset=${offset}`);
            const data = await response.json();
            res.status(200).send(data);
        } catch (error) {
            console.error("Giphy Fetch Error:", error);
            res.status(500).send({ error: "Failed to fetch GIFs" });
        }
    });
});

// --- 4. COMPONENT CREATOR TRIGGER ---
exports.notifyOnNewComponent = onDocumentCreated({
    document: "srgb-components/{componentId}",
    secrets: [pushoverUserKey, pushoverApiToken]
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const component = snapshot.data();
    
    if (component.ownerId === ADMIN_UID) {
        console.log("Admin created component. Skipping notification.");
        return null;
    }

    const componentId = event.params.componentId;
    const author = component.ownerName || 'Anonymous';
    const name = component.name || 'Untitled Component';
    const url = `https://effectbuilder.github.io/builder/?id=${componentId}`;

    try {
        await fetch("https://api.pushover.net/1/messages.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: pushoverApiToken.value(),
                user: pushoverUserKey.value(),
                message: `New component "${name}" created by ${author}`,
                title: "🛠️ Component Creator Alert",
                url: url,
                url_title: "View Component",
                priority: 1
            })
        });
        console.log(`Component notification sent: ${name}`);
    } catch (error) {
        console.error("Pushover Error:", error);
    }
});