# Hoppscotch API Testing Guide

## Quick Start

1. **Start the Server**
   ```bash
   cd server
   npm start
   ```

2. **Open Hoppscotch**
   - Go to [hoppscotch.io](https://hoppscotch.io)
   - Click on "Collections" → "Import" → "Import from JSON"
   - Upload `hoppscotch_collection.json`

## Available Test Requests

### 1. Health Check
- **Method**: GET
- **URL**: `http://localhost:3000/health`
- **Purpose**: Verify server is running

### 2. Analyze Scam Message - Phishing
- **Method**: POST
- **URL**: `http://localhost:3000/api/analyze`
- **Body**:
  ```json
  {
    "message": "URGENT: Your bank account will be suspended. Click here to verify: http://fake-bank.com/verify"
  }
  ```
- **Expected**: Detects phishing, generates honeypot response

### 3. Analyze Scam Message - UPI Scam
- **Method**: POST
- **URL**: `http://localhost:3000/api/analyze`
- **Body**:
  ```json
  {
    "message": "Congratulations! You won 10 lakh rupees. Send Rs 500 to scammer@paytm for processing fee."
  }
  ```
- **Expected**: Detects lottery/advance fee scam

### 4. Continue Conversation
- **Method**: POST
- **URL**: `http://localhost:3000/api/analyze`
- **Body**:
  ```json
  {
    "sessionId": "session_1234567890",
    "message": "Yes madam, just send OTP to my UPI: scammer@okaxis"
  }
  ```
- **Expected**: Continues conversation, extracts UPI ID

### 5. Analyze Legitimate Message
- **Method**: POST
- **URL**: `http://localhost:3000/api/analyze`
- **Body**:
  ```json
  {
    "message": "Hi, this is a reminder about your appointment tomorrow at 3 PM."
  }
  ```
- **Expected**: Detects as legitimate, action: "ignore"

## Manual Testing (cURL)

### Health Check
```bash
curl http://localhost:3000/health
```

### Analyze Scam
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"URGENT: Click here to claim your prize!\"}"
```

## Response Format

```json
{
  "sessionId": "session_1234567890",
  "action": "reply",
  "honeypotReply": "Oh my, that sounds very important...",
  "detectionResult": {
    "isScam": true,
    "confidenceScore": 95,
    "category": "Phishing",
    "reasoning": "..."
  },
  "extractedIntelligence": {
    "extractedData": {
      "upi": ["scammer@okaxis"],
      "urls": ["http://fake-bank.com"],
      "phoneNumbers": [],
      "emails": [],
      "bankAccounts": []
    },
    "summary": "Scammer attempting phishing attack..."
  }
}
```

## Tips for Demo

1. **Show Real-Time Detection**: Use the phishing request to show instant scam detection
2. **Demonstrate Persona**: Show how "Grandma Edna" engages scammers naturally
3. **Extract Intelligence**: Use the UPI scam to show data extraction capabilities
4. **Show Legitimate Handling**: Prove the system doesn't flag normal messages
5. **Session Continuity**: Use the same `sessionId` to show conversation flow
