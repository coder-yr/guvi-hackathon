const axios = require('axios');

async function simulateScam() {
    const serverUrl = 'http://localhost:3000/api/analyze';
    const initialMessage = "ALERT: Your bank account will be blocked today. Click here to verify KYC immediately: http://fake-bank-kyc.net/verify";

    console.log("--- Starting Simulation ---");
    console.log(`Sending Initial Scam Message: "${initialMessage}"`);

    try {
        // Step 1: Initial Attack
        let response = await axios.post(serverUrl, {
            message: initialMessage
        });

        let data = response.data;
        const sessionId = data.sessionId;

        console.log(`\n[Server Response 1]`);
        console.log(`Action: ${data.action}`);

        if (data.action === 'error') {
            console.error(`Error from Server: ${data.reason}`);
            return;
        }

        console.log(`Honeypot Reply: "${data.reply}"`);
        console.log(`Detection: ${JSON.stringify(data.detectionResult?.category)}`);

        if (data.action === 'reply') {
            // Step 2: Scammer replies (Simulated)
            const scammerReply = "Yes madam just click the link and enter OTP 1234 to save account.";
            console.log(`\n[Simulating Scammer Reply]: "${scammerReply}"`);

            response = await axios.post(serverUrl, {
                message: scammerReply,
                sessionId: sessionId
            });

            data = response.data;
            console.log("\n[Server Response 2]");
            console.log(`Honeypot Reply: "${data.reply}"`);
            console.log("Intelligence Extracted:", JSON.stringify(data.intelligence, null, 2));
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error("Error: Server not running. Please run 'node app.js' in the server directory.");
        } else {
            console.error("Error:", error.message);
        }
    }
}

simulateScam();
