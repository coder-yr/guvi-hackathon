const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function checkModels() {
    try {
        console.log("Fetching available models from OpenRouter...");
        const response = await axios.get("https://openrouter.ai/api/v1/models", {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`
            }
        });

        const models = response.data.data;
        console.log(`Found ${models.length} models.`);

        // Filter for free models
        const freeModels = models.filter(m => m.id.includes('free') || m.pricing.prompt === '0');

        console.log("\n=== AVAILABLE FREE MODELS ===");
        freeModels.forEach(m => {
            console.log(`- ${m.id}`);
        });

    } catch (error) {
        console.error("Error fetching models:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

checkModels();
