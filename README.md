# ColorByNumbers Backend

Production-ready backend for generating color-by-numbers coloring pages using Google Imagen 3.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env .env.local  # Edit with your Google Cloud credentials

# Run development server
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/generate` | Generate coloring page (sync) |
| POST | `/api/v1/generate/async` | Start async generation |
| GET | `/api/v1/status/:jobId` | Check job status |
| GET | `/api/v1/options` | Get styles & difficulty info |
| GET | `/health` | Health check |

## Request Example

```json
POST /api/v1/generate
{
  "description": "a cute cat playing with yarn",
  "difficulty": 50,
  "style": "cartoon"
}
```

**Difficulty**: Slider from 0 (easiest, ~5 sections) to 100 (hardest, ~100 sections)

**Styles**: cartoon, realistic, mandala, anime, geometric, nature, fantasy, minimalist

---

## Production Deployment

### Google Cloud Run (Recommended)

1. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com aiplatform.googleapis.com
   ```

2. **Build & Deploy**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/coloring-backend
   
   gcloud run deploy coloring-backend \
     --image gcr.io/PROJECT_ID/coloring-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT_ID=PROJECT_ID
   ```

### VPS/VM Deployment

```bash
# Install PM2
npm install -g pm2

# Start with cluster mode
pm2 start src/index.js --name coloring-backend -i max

# Save and enable startup
pm2 save
pm2 startup
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `GOOGLE_CLOUD_PROJECT_ID` | Yes | Your GCP project ID |
| `GOOGLE_CLOUD_LOCATION` | No | Region (default: us-central1) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Requests per minute (default: 10) |

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure Google Cloud credentials
- [ ] Set appropriate rate limits
- [ ] Enable HTTPS (via load balancer or reverse proxy)
- [ ] Set `ALLOWED_ORIGINS` for CORS
- [ ] Monitor with Cloud Logging or similar
