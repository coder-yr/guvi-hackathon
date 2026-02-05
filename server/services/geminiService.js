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

async function callOpenRouter(promptText, apiKeyOverride) {
    const apiKey = apiKeyOverride || OPENROUTER_API_KEY;

    // Check if we have a valid key (either environment or override)
    // We only fail if BOTH are missing or invalid placeholders
    const effectiveIsMockMode = !apiKey || apiKey === 'YOUR_OPENROUTER_KEY_HERE';

    if (effectiveIsMockMode) {
        console.warn("WARNING: Mock Mode triggered in callOpenRouter (No valid key provided).");
        throw new Error("MOCK_MODE_TRIGGER"); // internal signal to use fallback
    }

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: MODEL_NAME,
            messages: [
                { role: "user", content: promptText }
            ],
            max_tokens: 500  // Explicit limit for free tier
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
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

// --- FALLBACK HELPERS ---

function detectScam_Fallback(message) {
    const msg = message.toLowerCase();

    // RULE 2: OTP SAFETY OVERRIDE
    // If it contains "OTP" or "do not share" AND NO payment/link keywords -> SAFE
    const isOtp = msg.includes('otp') || msg.includes('do not share');
    const hasRisk = msg.includes('pay') || msg.includes('link') || msg.includes('http') || msg.includes('money') || msg.includes('blocked') || msg.includes('verif') || msg.includes('kyc');

    if (isOtp && !hasRisk) {
        return {
            isScam: false, confidenceScore: 0.1, category: "Legitimate OTP Notification",
            reasoning: "Message contains OTP keywords without payment requests or links."
        };
    }

    // RULE 1: SCAM DETECTION
    const scamKeywords = ['pay', 'transfer', 'blocked', 'account', 'verify', 'kyc', 'reward', 'winner', 'http', 'bit.ly', 'upi', 'credit card'];
    const isScam = scamKeywords.some(word => msg.includes(word));

    if (isScam) {
        return {
            isScam: true, confidenceScore: 0.95, category: "Phishing",
            reasoning: "Message identified as high-risk (contains payment instructions, links, or urgency)."
        };
    }

    // Default Safe (e.g. "Doctor's appointment")
    return {
        isScam: false, confidenceScore: 0.05, category: "Safe",
        reasoning: "No suspicious patterns detected."
    };
}

function generateHoneypotResponse_Fallback() {
    // RULE 6: NO "MOCK" or "FALLBACK" WORDS
    const responses = [
        "Oh dear, I'm not very good with this technology. My grandson usually helps me. What exactly do I need to click?",
        "Is this about the Google account? I tried to find the button you mentioned but my glasses are in the other room.",
        "Hello? Who is this? You sound like a nice young man. My bank is very far away, can't I just mail a check?",
        "Oh my, that sounds serious! I certainly don't want my account blocked. Please tell me slowly what to do, I'm writing it down."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

function extractEntities_Fallback(text) {
    // RULE 4 & 5: EXTRACT ONLY EXPLICIT DATA
    const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}/g;
    const phoneRegex = /\b[6-9]\d{9}\b/g; // Indian mobile pattern
    const urlRegex = /https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/g;
    const accountRegex = /(?:paybill|account|a\/c|ac)\s*[:.-]?\s*(\d{6,20})/gi;

    return {
        upi: text.match(upiRegex) || [],
        bankAccounts: [...(text.matchAll(accountRegex))].map(m => m[1]),
        phoneNumbers: text.match(phoneRegex) || [],
        urls: text.match(urlRegex) || [],
        emails: []
    };
}

// --- EXPORTED FUNCTIONS ---

exports.detectScam = async (message, apiKey) => {
    // If no key provided at all, use fallback immediately
    if (isMockMode && !apiKey) return detectScam_Fallback(message);

    const prompt = SCAM_DETECTION_PROMPT.replace('{message}', message);

    try {
        const response = await callOpenRouter(prompt, apiKey);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("No valid JSON found");
    } catch (error) {
        if (error.message === "MOCK_MODE_TRIGGER") return detectScam_Fallback(message);
        console.warn("⚠️ Fallback: API Failure -> Using Rule-based Detection");
        return detectScam_Fallback(message);
    }
};

exports.generateHoneypotResponse = async (conversationHistory, scamCategory, apiKey) => {
    if (isMockMode && !apiKey) return generateHoneypotResponse_Fallback();

    const lastMessage = conversationHistory[conversationHistory.length - 1]?.content || '';
    const prompt = HONEYPOT_PERSONA_PROMPT.replace('{message}', lastMessage);

    try {
        const response = await callOpenRouter(prompt, apiKey);
        return response.trim();
    } catch (error) {
        if (error.message === "MOCK_MODE_TRIGGER") return generateHoneypotResponse_Fallback();
        console.warn("⚠️ Fallback: API Failure -> Using Mock Persona");
        return generateHoneypotResponse_Fallback();
    }
};

exports.extractIntelligence = async (conversationHistory, apiKey) => {
    // Always use fallback extraction if Mock Mode to allow demo flow
    if (isMockMode && !apiKey) {
        const fullText = conversationHistory.map(m => m.content).join('\n');
        return {
            extractedData: extractEntities_Fallback(fullText),
            summary: "Analysis complete based on explicit text data."
        };
    }

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const conversationText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const prompt = INTELLIGENCE_EXTRACTION_PROMPT.replace('{conversation}', conversationText);

    try {
        const response = await callOpenRouter(prompt, apiKey);
        let aiResult = {};

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            aiResult = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("No valid JSON found in response");
        }

        // MANDATORY: Force Regex Extraction on top of AI result
        const regexResult = extractEntities_Fallback(conversationText);

        // Merge AI and Regex results (Set for uniqueness)
        aiResult.extractedData = aiResult.extractedData || {};
        aiResult.extractedData.upi = [...new Set([...(aiResult.extractedData.upi || []), ...regexResult.upi])];
        aiResult.extractedData.bankAccounts = [...new Set([...(aiResult.extractedData.bankAccounts || []), ...regexResult.bankAccounts])];
        aiResult.extractedData.phoneNumbers = [...new Set([...(aiResult.extractedData.phoneNumbers || []), ...regexResult.phoneNumbers])];
        aiResult.extractedData.urls = [...new Set([...(aiResult.extractedData.urls || []), ...regexResult.urls])];

        return aiResult;
    } catch (error) {
        console.warn("⚠️ Fallback: API Failure -> Using Regex Extraction");
        return {
            extractedData: extractEntities_Fallback(conversationText),
            summary: "Analysis complete based on explicit text data."
        };
    }
};
