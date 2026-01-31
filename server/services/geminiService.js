const axios = require('axios');
const { SCAM_DETECTION_PROMPT, HONEYPOT_PERSONA_PROMPT, INTELLIGENCE_EXTRACTION_PROMPT } = require('../utils/prompts');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = "google/gemma-3-27b-it:free"; // Confirmed Free Model

// Mock mode fallback if key is missing
const isMockMode = !OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_OPENROUTER_KEY_HERE';

if (isMockMode) {
    console.warn("WARNING: Running in MOCK MODE (OpenRouter Key missing).");
}

async function callOpenRouter(promptText) {
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: MODEL_NAME,
            messages: [
                { role: "user", content: promptText }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
                "X-Title": "Agentic Honeypot"
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("OpenRouter API Error:", error.response?.data || error.message);
        throw new Error("OpenRouter Request Failed");
    }
}

exports.detectScam = async (message) => {
    if (isMockMode) {
        return {
            isScam: true, confidenceScore: 95, category: "Phishing",
            reasoning: "Mock analysis: Message contains typical phishing keywords."
        };
    }
    try {
        const prompt = SCAM_DETECTION_PROMPT.replace('{message}', message);
        const text = await callOpenRouter(prompt);
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.warn("⚠️ Fallback: Returning Mock Data due to API failure.");
        return {
            isScam: true, confidenceScore: 95, category: "Phishing (Fallback)",
            reasoning: "Mock analysis: Message contains typical phishing keywords."
        };
    }
};

exports.generateHoneypotResponse = async (lastMessage, conversationHistory) => {
    if (isMockMode) {
        return "Oh my, that sounds very important. How do I do that exactly? I am not very good with computers.";
    }
    try {
        const prompt = HONEYPOT_PERSONA_PROMPT.replace('{message}', lastMessage);
        return await callOpenRouter(prompt);
    } catch (error) {
        console.warn("⚠️ Fallback: Returning Mock Persona due to API failure.");
        return "Oh my, that sounds very important. How do I do that exactly? (Fallback Persona)";
    }
};

exports.extractIntelligence = async (conversationLog) => {
    if (isMockMode) {
        return {
            extractedData: {
                upi: ["scammer@okicici"], bankAccounts: [], phoneNumbers: ["9876543210"],
                urls: ["http://phishing-site.com"], emails: []
            },
            summary: "Mock Extraction: Scammer is asking for UPI transfer."
        };
    }
    try {
        const prompt = INTELLIGENCE_EXTRACTION_PROMPT.replace('{conversation}', conversationLog);
        const text = await callOpenRouter(prompt);
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.warn("⚠️ Fallback: Returning Mock Intelligence due to API failure.");
        return {
            extractedData: {
                upi: ["scammer@okicici"], bankAccounts: [], phoneNumbers: ["9876543210"],
                urls: ["http://phishing-site.com"], emails: []
            },
            summary: "Mock Extraction (Fallback): Scammer is asking for UPI transfer."
        };
    }
};
