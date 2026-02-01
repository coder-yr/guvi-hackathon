const honeypotService = require('../services/honeypotService');
const { v4: uuidv4 } = require('uuid'); // We might need to install uuid or just use rough random

exports.analyzeMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        console.log(`\n--- Incoming Request [${sessionId || 'New Session'}] ---`);
        console.log("Message:", message);

        if (!message) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Generate a session ID if one isn't provided (new conversation)
        // For hackathon simplicity, we can just use Date.now() if uuid isn't available
        const currentSessionId = sessionId || `session_${Date.now()}`;

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
