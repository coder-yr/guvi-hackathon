const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY not found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log("Checking available models for your API key...");
    try {
        // There isn't a direct 'listModels' method exposed easily in the high-level SDK helper sometimes,
        // but we can try a basic generation to see if it works, or use the model endpoint if available.
        // Actually, the SDK doesn't expose listModels directly in the main class in all versions.
        // Let's try the most standard 1.5 flash model first.

        const models = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of models) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log("✅ AVAILABLE");
            } catch (error) {
                if (error.message.includes("404")) {
                    console.log("❌ NOT FOUND");
                } else {
                    console.log(`❌ ERROR: ${error.message.split('\n')[0]}`);
                }
            }
        }
    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
