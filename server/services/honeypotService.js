const geminiService = require('./geminiService');

// In-memory store for active sessions (for Hackathon demo purposes)
// Real world: Use Redis or DB
const activeSessions = {};
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 Hour

// Cleanup Job: Runs every 10 minutes to remove stale sessions
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of Object.entries(activeSessions)) {
        if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
            delete activeSessions[id];
        }
    }
}, 10 * 60 * 1000);

exports.processMessage = async (sessionId, incomingMessage, apiKey) => {
    if (!activeSessions[sessionId]) {
        activeSessions[sessionId] = {
            id: sessionId,
            history: [],
            status: 'analyzing', // analyzing, active_scam, benign
            extractedIntelligence: {},
            lastActivity: Date.now()
        };
    }

    const session = activeSessions[sessionId];
    session.lastActivity = Date.now();
    session.history.push({ role: 'scammer', content: incomingMessage, timestamp: new Date() });

    // Step 1: Detect Scam (on every message or just the first? Let's say first for efficient demo)
    // For demo: Always re-evaluate or just trust the ongoing flow
    // If it's a new session, we MUST detect.
    let detectionResult = null;

    // We check if we already confirmed it's a scam
    if (session.status === 'analyzing' || session.status === 'benign') {
        detectionResult = await geminiService.detectScam(incomingMessage, apiKey);

        if (detectionResult.error) {
            return {
                action: 'error',
                reason: 'AI Analysis Failed: ' + (detectionResult.errorDetails || detectionResult.error)
            };
        }

        if (detectionResult.isScam) {
            session.status = 'active_scam';
            session.scamDetails = detectionResult;
        } else {
            session.status = 'benign';
            return {
                action: 'ignore',
                reason: 'Message determined to be safe.',
                detectionResult
            };
        }
    }

    // Step 2: If Scam, Engage Honeypot
    if (session.status === 'active_scam') {
        // Optimization: Run generation and extraction in parallel
        const [response, intelligence] = await Promise.all([
            geminiService.generateHoneypotResponse(session.history, session.scamDetails.category, apiKey),
            geminiService.extractIntelligence(session.history, apiKey)
        ]);

        session.history.push({ role: 'honeypot', content: response, timestamp: new Date() });
        session.extractedIntelligence = intelligence;

        return {
            action: 'reply',
            reply: response,
            detectionResult: session.scamDetails,
            intelligence: intelligence,
            sessionHistory: session.history
        };
    }
};

exports.getSession = (sessionId) => {
    return activeSessions[sessionId];
};
