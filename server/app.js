const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const morgan = require('morgan');

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

// Routes
// Routes
const scamRoutes = require('./routes/scamRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Apply Auth Middleware to all API routes
app.use('/api', authMiddleware, scamRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('<h1>Agentic Honey-Pot System is Running</h1><p>Use POST /api/analyze to interact.</p>');
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Agentic Honey-Pot System Active' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
