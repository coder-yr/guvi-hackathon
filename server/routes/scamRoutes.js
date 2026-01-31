const express = require('express');
const router = express.Router();
const scamController = require('../controllers/scamController');

// POST /api/analyze
// Body: { "message": "...", "sessionId": "..." }
router.post('/analyze', scamController.analyzeMessage);

module.exports = router;
