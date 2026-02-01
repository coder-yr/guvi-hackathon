# Vercel Deployment Fix Guide

## Issue
Getting 404 errors on Vercel deployment because Express app needs proper configuration.

## Solution

### 1. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add the following:
   - **Name**: `OPENROUTER_API_KEY`
   - **Value**: `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`
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"

### 2. Redeploy

After adding `vercel.json` (already created), push to GitHub:

```bash
git add vercel.json
git commit -m "Add Vercel configuration"
git push origin main
```

Vercel will automatically redeploy.

### 3. Test Your Deployment

Once deployed, test with:

```bash
curl -X POST https://guvi-hackathon-omega.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "URGENT: Your bank account will be blocked!"}'
```

Or visit:
```
https://guvi-hackathon-omega.vercel.app/health
```

## Alternative: Manual Redeploy

If auto-deploy doesn't work:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Click "..." on the latest deployment
4. Click "Redeploy"

## Troubleshooting

### Still Getting 404?
- Check that `vercel.json` is in the root directory
- Verify environment variables are set
- Check deployment logs in Vercel dashboard

### Function Timeout?
- Vercel has a 10-second timeout on Hobby plan
- If AI responses take longer, consider upgrading or using Render.com

### Environment Variables Not Working?
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding variables
