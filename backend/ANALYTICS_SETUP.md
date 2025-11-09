# LinkedIn Analytics Setup Guide

## Overview
This guide explains how to enable analytics fetching for your LinkedIn posts, including impressions, likes, comments, and shares.

## Required LinkedIn API Permissions

To fetch analytics for posts, your LinkedIn app needs the following permissions:

1. **w_member_social** - Post content on behalf of members ✅ (Already included)
2. **r_member_social** - Read member's social posts ✅ (Already included)
3. **r_analytics_basic** - Basic analytics access ⚠️ (Requires approval)

## Setting Up Analytics Permissions

### Step 1: Request Analytics Permission in LinkedIn Developer Portal

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your application
3. Navigate to the **Auth** tab
4. In the **Products** section, find **Marketing Developer Platform**
5. Click **Request Access** for:
   - **Marketing Developer Platform** (includes analytics)
   - Or specifically request **Analytics API** access

### Step 2: Request Additional Scopes

Once you have Marketing Developer Platform access:

1. In your app settings, go to **Auth** tab
2. Under **Redirect URLs**, ensure your redirect URI is added
3. The app will automatically request these scopes:
   - `openid` - For OpenID Connect
   - `profile` - For profile information
   - `email` - For email access
   - `w_member_social` - To post content
   - `r_member_social` - To read posts
   - `r_analytics_basic` - To fetch analytics

### Step 3: Reconnect LinkedIn Account

After permissions are approved:

1. Users need to disconnect and reconnect their LinkedIn account
2. This will include the new analytics scopes in the OAuth token
3. Navigate to Profile → LinkedIn Connection → Click "Reconnect LinkedIn"

## How Analytics Work

### When Posts are Published

When a post is published to LinkedIn:
1. LinkedIn returns a post ID (URN format: `urn:li:ugcPost:xxxxx`)
2. This ID is stored in the database
3. Analytics are fetched immediately after posting

### Fetching Analytics

The system tries multiple LinkedIn API endpoints in order:

1. **Network Sizes API** - `/networkSizes/{postUrn}`
2. **Social Actions API** - `/socialActions/{postUrn}` 
3. **UGC Post Statistics** - `/ugcPosts/{postUrn}/statistics`
4. **UGC Post Details** - `/ugcPosts/{postUrn}` with analytics projection
5. **Analytics Aggregation** - `/analytics` endpoint

### Manual Refresh

Users can manually refresh analytics by:
1. Clicking the "↻ Refresh" button on any posted post
2. Analytics will be fetched from LinkedIn in real-time

## Troubleshooting

### Analytics Show Zero

If analytics always show zero:

1. **Check Backend Logs** - Look for analytics fetch attempts in console
   ```
   📊 Fetching analytics for LinkedIn post: urn:li:ugcPost:xxxxx
   ```

2. **Verify Permissions** - Check if `r_analytics_basic` scope is approved
   - Go to LinkedIn Developer Portal → Your App → Auth tab
   - Check if Marketing Developer Platform is approved

3. **Reconnect Account** - User needs to reconnect after permissions are approved

4. **Check Post ID** - Ensure posts have `linkedinPostId` stored
   - Posts published before analytics feature may be missing this
   - Solution: Republish the post to get a new ID

### Common Errors

- **401 Unauthorized**: Missing or expired OAuth token
  - Solution: Reconnect LinkedIn account

- **403 Forbidden**: Missing analytics permissions
  - Solution: Request `r_analytics_basic` permission in LinkedIn Developer Portal

- **404 Not Found**: Post doesn't exist or access denied
  - Solution: Verify post was successfully published to LinkedIn

## Testing Analytics

### Check Backend Logs

When you refresh analytics, check your backend console for:

```
📊 Fetching analytics for LinkedIn post: urn:li:ugcPost:xxxxx
✅ Got analytics from [endpoint]: { impressions: 100, likes: 5, ... }
```

Or if failing:
```
❌ [Endpoint] failed: { status: 403, message: 'Forbidden' }
⚠️ All analytics methods failed...
```

### Manual API Test

You can test the analytics endpoint directly:

```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3002/api/posts/{postId}/refresh-analytics" -Method POST -Headers @{"Authorization"="Bearer YOUR_TOKEN"}

# Or check health
Invoke-WebRequest -Uri "http://localhost:3002/api/scheduler/health" -Method GET
```

## LinkedIn API Documentation

For more details, refer to:
- [LinkedIn Marketing Developer Platform](https://learn.microsoft.com/en-us/linkedin/marketing/)
- [UGC Posts API](https://learn.microsoft.com/en-us/linkedin/shared/authentication/permissions)
- [Analytics API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting)

## Notes

- Analytics may take a few minutes to appear after posting
- LinkedIn may rate limit analytics requests
- Some analytics require posts to be at least 24 hours old
- Impressions count may be limited based on LinkedIn API tier
