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

// --- HELPER: SEND PUSHOVER NOTIFICATION ---
async function sendPushoverNotification(title, message, url, urlTitle) {
    try {
        const response = await fetch("https://api.pushover.net/1/messages.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: pushoverApiToken.value(),
                user: pushoverUserKey.value(),
                message: message,
                title: title,
                url: url,
                url_title: urlTitle,
                priority: 1 
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Pushover Error:", errorText);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

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

    await sendPushoverNotification(
        "🚀 Effect Builder Alert",
        `New effect "${name}" created by ${author}`,
        url,
        "Open in Builder"
    );
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

    await sendPushoverNotification(
        "🛠️ Component Creator Alert",
        `New component "${name}" created by ${author}`,
        url,
        "View Component"
    );
});

// --- 5. SHOWCASE COMMUNITY FEED COMMENTS ---
exports.notifyOnShowcaseComment = onDocumentCreated({
    document: "community_presets/{presetId}",
    secrets: [pushoverUserKey, pushoverApiToken]
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const data = snapshot.data();
    
    // Don't notify if you are the one replying
    if (data.userId === ADMIN_UID) return null;

    const author = data.userName || 'Anonymous';
    const effectFile = data.effectFile || 'Unknown Effect';
    const text = data.commentText || '';
    
    // Assuming this points to your showcase page hash
    const url = `https://rgbjunkie.com/showcase#${effectFile}`;

    await sendPushoverNotification(
        "💬 New Showcase Comment",
        `${author} commented on ${effectFile}:\n"${text}"`,
        url,
        "View Comment"
    );
});


// --- 6. EFFECT BUILDER COMMENTS ---
exports.notifyOnEffectComment = onDocumentCreated({
    document: "srgb-effect-comments/{commentId}",
    secrets: [pushoverUserKey, pushoverApiToken]
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const data = snapshot.data();
    
    // Check against your ownerId to prevent self-notifications
    if (data.ownerId === ADMIN_UID) return null;

    const targetId = data.projectId; 
    if (!targetId) {
        console.error("Missing projectId in comment document.");
        return null; 
    }

    const author = data.ownerName || 'Anonymous';
    const text = data.text || '';
    const url = `https://effectbuilder.github.io/?effectId=${targetId}`;

    await sendPushoverNotification(
        "📝 New Effect Builder Comment",
        `${author} says:\n"${text}"`,
        url,
        "View Project"
    );
});


// --- 7. COMPONENT CREATOR COMMENTS ---
exports.notifyOnComponentComment = onDocumentCreated({
    document: "srgb-component-comments/{commentId}",
    secrets: [pushoverUserKey, pushoverApiToken]
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const data = snapshot.data();
    
    if (data.ownerId === ADMIN_UID) return null;

    const targetId = data.componentId; 
    if (!targetId) {
        console.error("Missing componentId in comment document.");
        return null; 
    }

    const author = data.ownerName || 'Anonymous';
    const text = data.text || '';
    const url = `https://effectbuilder.github.io/builder/?id=${targetId}`;

    await sendPushoverNotification(
        "🧩 New Component Comment",
        `${author} says:\n"${text}"`,
        url,
        "View Component"
    );
});