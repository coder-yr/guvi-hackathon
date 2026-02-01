const geminiService = require('./geminiService');

// In-memory store for active sessions (for Hackathon demo purposes)
// Real world: Use Redis or DB
const activeSessions = {};

exports.processMessage = async (sessionId, incomingMessage) => {
    if (!activeSessions[sessionId]) {
        activeSessions[sessionId] = {
            id: sessionId,
            history: [],
            status: 'analyzing', // analyzing, active_scam, benign
            extractedIntelligence: {}
        };
    }

    const session = activeSessions[sessionId];
    session.history.push({ role: 'scammer', content: incomingMessage, timestamp: new Date() });

    // Step 1: Detect Scam (on every message or just the first? Let's say first for efficient demo)
    // For demo: Always re-evaluate or just trust the ongoing flow
    // If it's a new session, we MUST detect.
    let detectionResult = null;

    // We check if we already confirmed it's a scam
    if (session.status === 'analyzing' || session.status === 'benign') {
        detectionResult = await geminiService.detectScam(incomingMessage);

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
        const response = await geminiService.generateHoneypotResponse(incomingMessage, session.history);
        session.history.push({ role: 'honeypot', content: response, timestamp: new Date() });

        // Step 3: Extract Intelligence asynchronously
        // For hackathon sync response, we can do it now
        // FIX: Pass the raw history ARRAY, not a string
        const intelligence = await geminiService.extractIntelligence(session.history);
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
