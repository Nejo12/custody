# Upstash Redis Setup Guide

This project uses Upstash Redis for distributed rate limiting across server instances.

## Prerequisites

1. Create an Upstash account at https://upstash.com
2. Create a new Redis database in your Upstash dashboard

## Setup Steps

### 1. Create a Redis Database

1. Go to your Upstash dashboard at https://console.upstash.com
2. Click **Create Database**
3. Choose a name for your database (e.g., "custody-rate-limit")
4. Select a region close to your deployment
5. Click **Create**

### 2. Get Your Upstash Credentials

1. In your Upstash dashboard, click on your newly created database
2. Go to the **REST API** tab
3. Copy the following values:
   - **UPSTASH_REDIS_REST_URL** - The REST API endpoint URL
   - **UPSTASH_REDIS_REST_TOKEN** - The REST API token

### 3. Set Environment Variables

1. Copy the example environment file (if you haven't already):

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Upstash Redis credentials:

   ```env
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-rest-token
   ```

**Important Notes:**

- Use `.env.local` for local development (this file is gitignored)
- The `.env.example` file is a template and is committed to git
- Never commit `.env.local` or any file with actual secrets
- For production deployments (e.g., Netlify, Vercel), set these environment variables in your hosting platform's dashboard

### 4. Verify the Setup

1. Start your development server: `npm run dev`
2. Make requests to any rate-limited API endpoint (e.g., `/api/ai/transcribe`)
3. Check the rate limit headers in the response:
   - `X-RateLimit-Remaining` - Number of requests remaining
   - `X-RateLimit-Reset` - Unix timestamp when the rate limit resets

## How It Works

The rate limiting system:

- Uses Redis to store request counts per client (identified by IP address)
- Automatically expires rate limit counters after the time window
- Falls back to in-memory rate limiting if Redis is not configured (for development)
- Works across multiple server instances when Redis is configured

## Rate Limits

Current rate limits per endpoint:

- `/api/ai/transcribe` - 15 requests per minute
- `/api/ai/summarize` - 20 requests per minute
- `/api/ai/schedule` - 20 requests per minute
- `/api/ai/neutralize` - 20 requests per minute
- `/api/ai/clarify` - 20 requests per minute
- `/api/ai/translate` - 30 requests per minute

## Fallback Behavior

If Upstash Redis credentials are not configured, the system automatically falls back to in-memory rate limiting. This is useful for:

- Local development without Redis setup
- Testing environments
- Graceful degradation if Redis is unavailable

**Note:** In-memory rate limiting only works within a single server instance and does not persist across restarts.

## Troubleshooting

- **Error: Redis rate limit error**: Check your Upstash credentials and network connectivity. The system will fall back to in-memory rate limiting.
- **Rate limits not working across instances**: Make sure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in all your server instances.
- **Connection errors**: Verify your Upstash URL and token are correct, and that your database is active in the Upstash dashboard.

## Free Tier

Upstash offers a generous free tier that includes:
- 10,000 commands per day
- 256 MB storage
- Global replication

This should be sufficient for most development and small production deployments.

