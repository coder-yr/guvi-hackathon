const honeypotService = require('../services/honeypotService');
const crypto = require('crypto');

exports.analyzeMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        console.log(`\n--- Incoming Request [${sessionId || 'New Session'}] ---`);
        console.log("Message:", message);

        if (!message) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Generate a session ID using native crypto (Node.js 18+)
        const currentSessionId = sessionId || `session_${Date.now()}_${crypto.randomUUID()}`;

        const result = await honeypotService.processMessage(currentSessionId, message);

        res.json({
            sessionId: currentSessionId,
            ...result
        });

    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
