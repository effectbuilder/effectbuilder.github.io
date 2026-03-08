const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const cors = require("cors")({ origin: true });

// Define the secret so the function knows to ask Google for it
const giphyApiKey = defineSecret("GIPHY_API_KEY");

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

// Your Provided Credentials
const PUSHOVER_USER_KEY = defineSecret("PUSHOVER_USER_KEY");
const PUSHOVER_API_TOKEN = defineSecret("PUSHOVER_API_TOKEN");
const ADMIN_UID = "zMj8mtfMjXeFMt072027JT7Jc7i1"; 

exports.notifyOnNewEffect = onDocumentCreated("projects/{projectId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return null;

    const project = snapshot.data();
    
    // Skip notification if YOU are the one who created it
    if (project.authorId === ADMIN_UID) {
        console.log("Admin created effect. Skipping notification.");
        return null;
    }

    const projectId = event.params.projectId;
    const author = project.authorName || 'Anonymous';
    const name = project.projectName || 'Untitled Effect';

    // Link to your GitHub Pages site with the project ID
    const url = `https://effectbuilder.github.io/?effectId=${projectId}`;

    try {
        const response = await fetch("https://api.pushover.net/1/messages.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: PUSHOVER_API_TOKEN,
                user: PUSHOVER_USER_KEY,
                message: `New effect "${name}" created by ${author}`,
                title: "🚀 Effect Builder Alert",
                url: url,
                url_title: "Open in Builder",
                priority: 1 // High priority
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

exports.searchGifs = onRequest({ secrets: [giphyApiKey] }, (req, res) => {
    // This allows your GitHub Pages site to talk to this function
    cors(req, res, async () => {
        // Grab the search term and offset from the website's request
        const searchTerm = req.query.q || "";
        const offset = req.query.offset || 0;
        
        // Securely pull the API key from the secret manager
        const apiKey = giphyApiKey.value();

        try {
            // The Cloud Function makes the request to Giphy
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&limit=20&offset=${offset}`);
            const data = await response.json();
            
            // Send the Giphy data back to your website
            res.status(200).send(data);
        } catch (error) {
            console.error("Giphy Fetch Error:", error);
            res.status(500).send({ error: "Failed to fetch GIFs" });
        }
    });
});