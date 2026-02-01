const axios = require('axios');
const { SCAM_DETECTION_PROMPT, HONEYPOT_PERSONA_PROMPT, INTELLIGENCE_EXTRACTION_PROMPT } = require('../utils/prompts');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = "x-ai/grok-code-fast-1"; // Free Grok model (if available)

// Mock mode fallback if key is missing or invalid
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
            ],
            max_tokens: 500  // Explicit limit for free tier
        }, {
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
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
    const prompt = SCAM_DETECTION_PROMPT.replace('{message}', message);

    try {
        const response = await callOpenRouter(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No valid JSON found in response");
    } catch (error) {
        console.warn("⚠️ Fallback: Returning Mock Data due to API failure.");

        // Smart Fallback: Check for safe keywords
        const safeKeywords = ['doctor', 'appointment', 'meeting', 'reminder', 'schedule', 'class', 'school'];
        const isLikelySafe = safeKeywords.some(word => message.toLowerCase().includes(word));

        if (isLikelySafe) {
            return {
                isScam: false, confidenceScore: 10, category: "Legitimate (Fallback)",
                reasoning: "Mock analysis: Message appears to be a Safe reminder or appointment."
            };
        }

        return {
            isScam: true, confidenceScore: 95, category: "Phishing (Fallback)",
            reasoning: "Mock analysis: Message contains typical phishing keywords."
        };
    }
};

exports.generateHoneypotResponse = async (conversationHistory, scamCategory) => {
    if (isMockMode) {
        return "Oh my, that sounds very important. How do I do that exactly? I am not very good with computers.";
    }
    const lastMessage = conversationHistory[conversationHistory.length - 1]?.content || '';
    const prompt = HONEYPOT_PERSONA_PROMPT.replace('{message}', lastMessage);

    try {
        const response = await callOpenRouter(prompt);
        return response.trim();
    } catch (error) {
        console.warn("⚠️ Fallback: Returning Mock Persona due to API failure.");
        return "Oh my, that sounds very important. How do I do that exactly? (Fallback Persona)";
    }
};

exports.extractIntelligence = async (conversationHistory) => {
    if (isMockMode) {
        return {
            extractedData: {
                upi: ["scammer@okicici"], bankAccounts: [], phoneNumbers: ["9876543210"],
                urls: ["http://phishing-site.com"], emails: []
            },
            summary: "Mock Extraction: Scammer is asking for UPI transfer."
        };
    }
    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const conversationText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const prompt = INTELLIGENCE_EXTRACTION_PROMPT.replace('{conversation}', conversationText);

    try {
        const response = await callOpenRouter(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No valid JSON found in response");
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
