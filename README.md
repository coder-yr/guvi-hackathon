# Agentic Honey-Pot for Scam Detection & Intelligence Extraction (Stage 2 Hackathon Project)

## Project Overview
This project is an autonomous ethical AI system designed to detect scam messages and engage scammers using a "honeypot" persona. The goals are:
1.  **Detect** fraud attempts with high accuracy using Google Gemini.
2.  **Engage** the scammer with a persona ("Grandma Edna") to waste their time.
3.  **Extract** actionable intelligence (UPI IDs, Bank Accounts, URLs) for reporting.

## Tech Stack
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **AI Engine**: Google Gemini API (gemini-1.5-flash)
-   **Architecture**: Modular (Routes, Controllers, Services)

## Installation & Setup

1.  **Clone the repository** (or navigate to the project folder).
2.  **Install dependencies**:
    ```bash
    cd server
    npm install
    ```
3.  **Configure Environment**:
    -   Open `server/.env`
    -   Add your Google Gemini API Key: `GEMINI_API_KEY=your_key_here`
    -   *Note: If no key is provided, the system runs in MOCK MODE for demonstration.*

4.  **Run the Server**:
    ```bash
    node app.js
    ```
    The server runs on `http://localhost:3000`.

## API Usage

### Endpoint: `POST /api/analyze`

**Request Body**:
```json
{
  "message": "Dear customer you won lottery 5Cr. Click link to claim: bit.ly/scam",
  "sessionId": "optional-session-id"
}
```

**Response**:
```json
{
  "sessionId": "session_...",
  "action": "reply",
  "reply": "Oh my goodness! A lottery? But I didn't buy a ticket context...",
  "detectionResult": {
    "isScam": true,
    "confidenceScore": 98,
    "category": "Lottery Scam"
  },
  "intelligence": {
    "extractedData": { ... },
    "summary": "..."
  }
}
```

## System Architecture
-   **ScannerController**: Entry point for API requests.
-   **HoneypotService**: Manages the conversation state and decides the next action.
-   **GeminiService**: Handles all AI reasoning (Detection, Persona generation, Extraction).

## Ethical Considerations
-   The system engages scammers in a simulated environment.
-   No real money or personal data is ever shared.
-   The primary goal is intelligence gathering and defense.
