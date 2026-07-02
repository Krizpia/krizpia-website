# Google Review Auto-Reply Setup

This site includes a Netlify scheduled function that checks Google Business Profile reviews every 30 minutes and replies to any latest review that does not already have an owner reply.

## Required Netlify environment variables

Set these variables in Netlify before enabling the feature:

- `GOOGLE_REVIEW_AUTO_REPLY_ENABLED` — set to `true` only after OAuth credentials are ready.
- `GOOGLE_BUSINESS_ACCOUNT_ID` — Google Business Profile account ID. You can use either `123456789` or `accounts/123456789`.
- `GOOGLE_BUSINESS_LOCATION_ID` — Google Business Profile location ID. You can use either `987654321` or `locations/987654321`.
- `GOOGLE_BUSINESS_CLIENT_ID` — OAuth client ID with Google Business Profile API access.
- `GOOGLE_BUSINESS_CLIENT_SECRET` — OAuth client secret.
- `GOOGLE_BUSINESS_REFRESH_TOKEN` — refresh token for an authorized Business Profile manager/owner account.
- `GOOGLE_REVIEW_AUTO_REPLY_SECRET` — secret used when manually testing the function URL.

Optional:

- `GOOGLE_REVIEW_REPLY_TEXT` — custom reply text. If not set, the function uses a polite Krizpia thank-you message.

## Manual dry-run test

After deploy, test without posting replies:

```bash
curl -H "x-auto-reply-secret: $GOOGLE_REVIEW_AUTO_REPLY_SECRET" \
  "https://YOUR_SITE.netlify.app/.netlify/functions/auto-reply-google-reviews?dryRun=true"
```

If the dry run looks correct, remove `?dryRun=true` to post replies immediately, or wait for the scheduled run.

## Notes

- The function only replies to reviews where Google does not return an existing `reviewReply`.
- Each run replies to at most 10 pending reviews to avoid accidental bulk posting.
- The scheduled function runs in UTC on Netlify's cron schedule.
