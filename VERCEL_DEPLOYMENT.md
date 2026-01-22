# Vercel Deployment Guide - ColorByNumbers Backend

Complete step-by-step guide to deploy your coloring app backend on Vercel (free tier) with Google Cloud Imagen.

---

## Part 1: Google Cloud Setup (10-15 minutes)

### Step 1: Create Google Cloud Account
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. You get **$300 free credits** for 90 days

### Step 2: Create a Project
1. Click the project dropdown (top-left, next to "Google Cloud")
2. Click **"New Project"**
3. Name it: `coloring-app` (or any name)
4. Click **"Create"**
5. Wait 30 seconds, then select the project

### Step 3: Enable Vertex AI API
1. Go to [Vertex AI API page](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com)
2. Click **"Enable"**
3. Wait for it to enable (takes ~1 minute)

### Step 4: Create Service Account
1. Go to **IAM & Admin** → **Service Accounts**
   - Or use this link: [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **"+ Create Service Account"**
3. Fill in:
   - Name: `coloring-backend`
   - ID: `coloring-backend` (auto-filled)
4. Click **"Create and Continue"**
5. Add role: **"Vertex AI User"**
6. Click **"Continue"** then **"Done"**

### Step 5: Create JSON Key
1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **"JSON"**
5. Click **"Create"**
6. **Save the downloaded file** - you'll need it for Vercel!

### Step 6: Get Your Project ID
1. Go to [Cloud Console Home](https://console.cloud.google.com)
2. Copy the **Project ID** (looks like: `coloring-app-123456`)

---

## Part 2: Vercel Deployment (5 minutes)

### Step 1: Push Code to GitHub
```bash
cd d:\colortoons\backend

# Initialize git if not already
git init
git add .
git commit -m "Initial commit - ColorByNumbers backend"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/coloring-backend.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select your **coloring-backend** repository
4. Click **"Import"**

### Step 3: Add Environment Variables
Before clicking Deploy, add these environment variables:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `GOOGLE_CLOUD_PROJECT_ID` | Your project ID (e.g., `coloring-app-123456`) |
| `GOOGLE_CLOUD_LOCATION` | `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Paste the ENTIRE contents of your JSON key file |

> **IMPORTANT**: For the JSON key, open the downloaded file in Notepad, copy ALL the text, and paste it.

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes for deployment
3. You'll get a URL like: `https://coloring-backend-xxx.vercel.app`

---

## Part 3: Test Your Deployment

### Test Health Endpoint
Open in browser:
```
https://YOUR-APP.vercel.app/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","environment":"production"}
```

### Test Options Endpoint
```
https://YOUR-APP.vercel.app/api/v1/options
```

### Test Image Generation
Use Postman or curl:
```bash
curl -X POST https://YOUR-APP.vercel.app/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"a cute cat","difficulty":50,"style":"cartoon"}'
```

---

## Troubleshooting

### "Vertex AI not initialized" Error
- Check that `GOOGLE_CLOUD_PROJECT_ID` is set correctly in Vercel
- Make sure `GOOGLE_APPLICATION_CREDENTIALS_JSON` contains the full JSON key

### "PERMISSION_DENIED" Error
- Go to Google Cloud Console → IAM
- Ensure your service account has **"Vertex AI User"** role

### Timeout Errors
- Vercel free tier has 10-second timeout
- Image generation may exceed this
- Consider upgrading to Vercel Pro for 60s timeout

---

## Cost Estimates

| Service | Free Tier |
|---------|-----------|
| **Vercel** | 100GB bandwidth, unlimited requests |
| **Google Cloud** | $300 credits for 90 days |
| **Vertex AI (Imagen)** | ~$0.02 per image after free credits |

---

## Your API Endpoints

Base URL: `https://YOUR-APP.vercel.app`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/options` | Get styles & difficulty info |
| POST | `/api/v1/generate` | Generate coloring page |
| POST | `/api/v1/generate/async` | Async generation |
| GET | `/api/v1/status/:jobId` | Check job status |
