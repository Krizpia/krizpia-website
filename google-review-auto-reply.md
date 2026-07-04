# Google Reviews Setup Options

Krizpia can show Google reviews on the website in three ways. Start with the easiest option that matches the current business need, then upgrade later if needed.

## Recommended path for Krizpia

Use a review widget first so reviews can appear on krizpia.com quickly without custom Google Cloud setup. Later, move to the Google Places API or Google Business Profile API when the website grows and the team is ready to manage billing, API keys, and OAuth access.

## Option 1: Google Places API

This site already includes a Netlify function that can load Google reviews from the Google Places API and display them on `index.html` and `reviews.html`.

Use this option when you want the reviews section to update automatically from Google without embedding a third-party widget.

Requirements:

- Google Cloud billing enabled.
- Places API enabled in Google Cloud.
- `GOOGLE_PLACES_API_KEY` set in Netlify.
- `GOOGLE_PLACE_ID` set in Netlify.
- Optional `GOOGLE_MAPS_URL` or `GOOGLE_MAPS_REVIEW_URL` for the Google listing/review link.

Important limitation: Google usually returns only a limited set of reviews through the Places API, not every review from the business profile.

## Option 2: Elfsight, Tagembed, or SociableKIT widget

This is the easiest option for non-technical setup. Connect the Krizpia Google Business Profile in the widget provider dashboard, copy the embed code, and paste it into the website.

Use this option when you want the fastest setup and are comfortable with a free or paid widget service.

Before adding a widget embed, update the site Content Security Policy in `netlify.toml` so the selected provider's script, frame, image, and connection URLs are allowed.

## Option 3: Manual customer feedback

Copy selected customer reviews manually into the website. This needs no Google Cloud billing, API key, widget account, or OAuth setup.

Use this option when you only need a small, curated reviews section and do not need automatic updates.

## Google Business Profile auto-reply setup

Automatic replies to Google reviews require Google Business Profile API access, OAuth credentials, and a manager/owner account refresh token. This is more advanced than showing reviews on the website.

This site includes a Netlify scheduled function that checks Google Business Profile reviews every 30 minutes and replies to any latest review that does not already have an owner reply.

### Required Netlify environment variables

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
- `GOOGLE_BUSINESS_LOCATION_NAME` — display name used by the Google reviews function when Business Profile reviews are loaded.
- `GOOGLE_MAPS_REVIEW_URL` or `GOOGLE_MAPS_URL` — Google listing/review URL returned to the frontend.

### Manual dry-run test

After deploy, test without posting replies:

```bash
curl -H "x-auto-reply-secret: $GOOGLE_REVIEW_AUTO_REPLY_SECRET" \
  "https://YOUR_SITE.netlify.app/.netlify/functions/auto-reply-google-reviews?dryRun=true"
```

If the dry run looks correct, remove `?dryRun=true` to post replies immediately, or wait for the scheduled run.

## Notes

- The website first tries Google Business Profile review credentials, then falls back to Google Places API credentials.
- The function only replies to reviews where Google does not return an existing `reviewReply`.
- Each auto-reply run replies to at most 10 pending reviews to avoid accidental bulk posting.
- The scheduled auto-reply function runs in UTC on Netlify's cron schedule.
