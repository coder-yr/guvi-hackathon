# How to Fix "404 Not Found" / Model Restrictions

Your current API key seems to be linked to a **restricted** or **experimental** Google Cloud Project (likely with access only to specific audio preview models).

To fix this and get access to the standard models (`gemini-1.5-flash`, `gemini-pro`), follow these steps to generate a **fresh** key.

## Step 1: Get a New Key
1.  Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Click the blue **"Create API Key"** button.
3.  **IMPORTANT:** Select **"Create API key in new project"**.
    *   *Do not select an existing project, as it might carry over the same restrictions.*
4.  Copy the new API Key string (starts with `AIza...`).

## Step 2: Update Your Project
1.  Open the file `server/.env` in your code editor.
2.  Replace the old key with the new one:
    ```env
    GEMINI_API_KEY=AIzaSyNewKeyHere...
    ```
3.  Save the file.

## Step 3: Verify
1.  Restart your server:
    *   Click in the terminal running `node app.js`.
    *   Press `Ctrl + C` to stop it.
    *   Run `npm start` again.
2.  Run the simulation:
    ```bash
    node simulate_scam.js
    ```

You should now see the real AI working without the "Fallback" warning!
