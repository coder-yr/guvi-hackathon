const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, 'server/.env') });

async function verifyEndpoint() {
    // Determine API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log("Loaded Env Keys:", Object.keys(process.env).filter(k => k.includes('API_KEY')));

    if (!apiKey) {
        console.error("Error: OPENROUTER_API_KEY not found in server/.env");
        console.log("Please ensure you have a valid key to test the header auth.");
        // Fallback for testing if env fails
        // return; 
    }

    const serverUrl = 'http://localhost:3000/api/analyze';
    // Use a safe/"Not a scam" message first to test connectivity without triggering honeypot (or trigger it if we want)
    // The user's screenshot showed a 500 error.
    // Let's try a simple message.
    const message = "Hello, is this the bank?";

    console.log(`--- Verifying Endpoint: ${serverUrl} ---`);
    console.log(`Using API Key from env: ${apiKey.substring(0, 10)}...`);

    try {
        const response = await axios.post(serverUrl, {
            message: message
        }, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log("\n[SUCCESS] Server responded with 200 OK");
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error(`\n[FAILED] Server returned status ${error.response.status}`);
            console.error("Error Data:", error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.error("\n[FAILED] Connection refused. Is the server running? (node server/app.js)");
        } else {
            console.error("\n[FAILED] Error:", error.message);
        }
    }
}

verifyEndpoint();
