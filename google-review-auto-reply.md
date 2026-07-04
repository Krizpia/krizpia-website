# Google Reviews Setup Options

Krizpia should keep customer feedback manual first because the current website is published on GitHub Pages. GitHub Pages can host static HTML, CSS and JavaScript, but it does not provide the private backend needed to safely call Google review APIs.

## Recommended path for Krizpia

Start with the existing manual review sections on `index.html` and `reviews.html`.

This is the best first step because it is:

- Free.
- Safe for GitHub Pages.
- Easy to edit without Google Cloud billing, API keys or OAuth setup.
- Stable because the page does not depend on a third-party script or serverless backend.

Keep the **Write a Google Review** button so customers can still add public feedback on Google.

## Best free or low-cost options

### Option 1: Manual reviews

Copy selected customer feedback into the website manually. This is the safest option for the current GitHub Pages setup and is already implemented on the site.

Use this option when Krizpia only needs a small, curated reviews section.

### Option 2: Google review link button

Keep a button that opens the Krizpia Google listing or review page. This is free and works on GitHub Pages because it is only a normal external link.

Use this option when customers should be encouraged to leave public Google feedback without embedding reviews automatically.

### Option 3: Tagembed or SociableKIT free plan

A third-party widget may be useful for testing, but free plans are usually limited and may include provider branding. Review the provider's terms, limits and script requirements before adding an embed.

If a widget is added later, update the site security policy and test the page on mobile before publishing.

### Option 4: Move backend features to Netlify

Automatic Google reviews require a backend or serverless function because API keys and OAuth tokens must not be exposed in browser JavaScript. Netlify's free tier may work for a small site, but that would mean deploying backend-powered features outside the current GitHub Pages-only setup.

Use this option only when Krizpia is ready to manage environment variables, Google Cloud setup and deployment monitoring.

## Why automatic Google reviews are not enabled now

There is no fully free, easy and safe automatic Google reviews method for a static GitHub Pages site. Google review APIs require credentials and backend handling. Exposing those credentials directly in frontend code would be insecure.

## Notes for future upgrades

- Google Places API usually returns only a limited subset of reviews, not every review from the business profile.
- Google Business Profile review management and auto-replies require OAuth access and are more complex than showing reviews on the website.
- Keep manual reviews as the fallback even if a widget or backend integration is added later.
