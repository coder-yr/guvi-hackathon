module.exports = (req, res, next) => {
    // For Hackathon Demo: Allow all requests
    // You can add simple API key validation here later
    console.log(`Auth Check: Access Granted to ${req.method} ${req.path}`);
    next();
};
