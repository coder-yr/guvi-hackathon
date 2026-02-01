const serverless = require('serverless-http');
const app = require('../server/app');

// Export the serverless handler
exports.handler = serverless(app);
