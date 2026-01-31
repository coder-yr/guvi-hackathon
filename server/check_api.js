const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    console.error("❌ Error: Valid GEMINI_API_KEY not found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking API Access for key: ${apiKey.substring(0, 5)}...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("❌ API Error:", JSON.stringify(json.error, null, 2));
            } else if (json.models) {
                console.log("✅ Success! Available Models:");
                json.models.forEach(m => console.log(` - ${m.name}`));
            } else {
                console.log("⚠️ Unknown Response:", json);
            }
        } catch (e) {
            console.error("❌ Failed to parse response:", data);
        }
    });

}).on("error", (err) => {
    console.error("❌ Network Error:", err.message);
});
