# Netlify Deployment Guide

## Prerequisites
- GitHub account
- Netlify account (free tier works)
- OpenRouter API key

## Step 1: Push to GitHub

1. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Agentic Honeypot"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name it: `agentic-honeypot`
   - Don't initialize with README
   - Click "Create repository"

3. **Push Code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/agentic-honeypot.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Netlify

1. **Go to Netlify**:
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"

2. **Connect GitHub**:
   - Select "GitHub"
   - Authorize Netlify
   - Choose your `agentic-honeypot` repository

3. **Configure Build Settings**:
   - **Base directory**: Leave empty
   - **Build command**: `cd server && npm install`
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`

4. **Add Environment Variables**:
   - Click "Site settings" → "Environment variables"
   - Add:
     - `OPENROUTER_API_KEY` = `your-api-key-here`
     - `PORT` = `3000` (optional)

5. **Deploy**:
   - Click "Deploy site"
   - Wait for deployment to complete (~2-3 minutes)

## Step 3: Test Your Deployment

Your API will be available at:
```
https://your-site-name.netlify.app/api/analyze
```

**Test with cURL**:
```bash
curl -X POST https://your-site-name.netlify.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "URGENT: Your bank account will be blocked!"}'
```

## Troubleshooting

### Function Timeout
- Netlify Functions have a 10-second timeout on free tier
- If requests timeout, consider upgrading or using a different platform

### Environment Variables Not Working
- Go to Site Settings → Environment variables
- Make sure `OPENROUTER_API_KEY` is set
- Redeploy the site

### 404 Errors
- Check `netlify.toml` redirects are correct
- Ensure `netlify/functions/api.js` exists
- Check build logs for errors

## Alternative: Deploy to Render (Recommended for Express)

If you face issues with Netlify, Render is better for Express apps:

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Settings:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Add `OPENROUTER_API_KEY`
5. Deploy!

Render provides a persistent server (better for Express) vs Netlify's serverless approach.
