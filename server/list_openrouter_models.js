const axios = require('axios');
require('dotenv').config();

const key = process.env.OPENROUTER_API_KEY;

if (!key || key.startsWith('YOUR')) {
    console.error("Please set a valid OPENROUTER_API_KEY in .env");
    process.exit(1);
}

async function listModels() {
    try {
        console.log("Fetching models from OpenRouter...");
        const response = await axios.get("https://openrouter.ai/api/v1/models");
        const models = response.data.data;

        // Filter for free models (pricing.prompt === '0')
        const freeModels = models.filter(m =>
            m.pricing.prompt === '0' && m.pricing.completion === '0'
        );

        console.log(`\nFound ${freeModels.length} FREE models:`);
        freeModels.forEach(m => {
            if (m.id.includes('google')) {
                console.log(` - ${m.id} (${m.name})`);
            }
        });

        console.log("\n(Showing only Google models for brevity, but others exist)");
    } catch (error) {
        console.error("Error fetching models:", error.message);
    }
}

listModels();
