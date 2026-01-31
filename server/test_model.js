const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testModel() {
    const modelName = "gemini-2.5-flash-native-audio-preview-12-2025";
    console.log(`Testing generation with: ${modelName}`);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Failed:", error.message);
    }
}

testModel();
