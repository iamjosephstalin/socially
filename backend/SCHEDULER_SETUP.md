# Scheduler Setup Guide

The scheduler system processes scheduled posts via a cronjob endpoint. This is perfect for serverless deployments like Vercel.

## How It Works

1. Posts are created/updated with `status: 'SCHEDULED'` and a `scheduledAt` date
2. A cronjob calls `/api/scheduler/process` periodically (recommended: every 5 minutes)
3. The endpoint finds all posts that are due and publishes them to LinkedIn

## Setup for Vercel

### Option 1: Vercel Cron Jobs (Recommended)

1. Create a file `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/scheduler/process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. Add the scheduler API key to your Vercel environment variables:
   - `SCHEDULER_API_KEY` (optional, but recommended for security)

3. The cronjob will automatically call your endpoint every 5 minutes

### Option 2: External Cron Service

You can use any external cron service (like cron-job.org, EasyCron, etc.) to call:

```
POST https://your-domain.com/api/scheduler/process
```

Headers (if you set SCHEDULER_API_KEY):
```
X-Scheduler-Key: your-secret-scheduler-key
```

Or as a query parameter:
```
GET https://your-domain.com/api/scheduler/process?key=your-secret-scheduler-key
```

## Endpoints

### POST `/api/scheduler/process`
Processes all scheduled posts that are due.

**Optional Authentication:**
- Header: `X-Scheduler-Key: <your-secret-key>`
- Query param: `?key=<your-secret-key>`

Set `SCHEDULER_API_KEY` in environment variables to enable authentication.

### GET `/api/scheduler/health`
Returns statistics about scheduled posts (no auth required):
- Total scheduled posts
- Posts that are due now

## Recommended Schedule

- **Every 5 minutes**: `*/5 * * * *` (most accurate)
- **Every 10 minutes**: `*/10 * * * *` (less frequent)
- **Every minute**: `* * * * *` (only for high-volume apps)

## Testing Locally

You can manually trigger the scheduler:

### Using PowerShell (Windows):
```powershell
# Without auth
Invoke-WebRequest -Uri http://localhost:3002/api/scheduler/process -Method POST

# With auth (if SCHEDULER_API_KEY is set)
Invoke-WebRequest -Uri http://localhost:3002/api/scheduler/process -Method POST -Headers @{"X-Scheduler-Key"="your-secret-key"}

# Check health
Invoke-WebRequest -Uri http://localhost:3002/api/scheduler/health -Method GET
```

### Using curl (Unix/Mac/Git Bash):
```bash
# Without auth
curl -X POST http://localhost:3002/api/scheduler/process

# With auth (if SCHEDULER_API_KEY is set)
curl -X POST http://localhost:3002/api/scheduler/process \
  -H "X-Scheduler-Key: your-secret-key"
```

Or check health:
```bash
curl http://localhost:3002/api/scheduler/health
```
