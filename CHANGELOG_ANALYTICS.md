# Krizpia Analytics, SEO, Tracking, Performance and Security Changelog

Date: 2026-07-11

## Repository audit summary

| File / group | Existing GTM | Existing GA4 / gtag.js | Consent | CSP | Schema | Canonical / social tags | Forms / dataLayer | Problems detected | Changes made |
|---|---|---|---|---|---|---|---|---|---|
| `index.html` | GTM present | Direct GA4 gtag present | legacy localStorage banner | broad meta CSP | Organization, LocalBusiness, WebSite, ItemList, FAQ | present | enquiry form and legacy pushes | duplicate GTM+gtag path, active Meta Pixel, PII-risk parameters, broad CSP | removed direct GA4 and Meta Pixel, installed Consent Mode before GTM, kept one GTM, added shared analytics utility and preferences control |
| Product pages (`traditional-kuzhalappam*`, `spicy-kuzhalappam*`, `sweet-kuzhalappam*`, `thatta*`) | GTM present | Direct GA4 gtag present | none/implicit | mixed | Product/Breadcrumb | present on most | contact links | duplicate direct GA4, active Meta Pixel | standardized GTM/Consent Mode, removed Meta Pixel, added shared `view_item` tracking |
| Blog/guide pages | GTM present | Direct GA4 gtag present | none/implicit | mixed | Breadcrumb/article where present | present on many | links only | duplicate direct GA4, active Meta Pixel | standardized GTM/Consent Mode, removed Meta Pixel, added `article_view` tracking |
| Legal pages (`privacy.html`, `terms.html`, `shipping.html`, `refund.html`) | GTM present | Direct GA4 gtag present | none/implicit | mixed | minimal | present | links only | duplicate direct GA4, policy did not fully describe consent withdrawal | standardized tracking and documented privacy/security requirements |
| `assets/js/analytics.js` | none | none | new | n/a | n/a | n/a | new central dataLayer utility | no central standard existed | added event validation, PII filtering, consent updates, click/form/video/product/blog events |
| `robots.txt` / `sitemap.xml` | n/a | n/a | n/a | n/a | n/a | sitemap existed | n/a | needed current canonical inventory | regenerated robots baseline and canonical sitemap |
| `_headers` / `netlify.toml` | n/a | n/a | n/a | broad headers included Meta | n/a | n/a | n/a | CSP was overly broad and included inactive Meta domains | narrowed CSP and documented GitHub Pages limitations |
| `blog-posts.json`, `manifest.json`, `assets/breadcrumbs.js` | none | none | none | n/a | supports content/schema | n/a | n/a | no duplicate IDs found | left content intact |
| `netlify/functions/*.js` | none | none | none | n/a | n/a | n/a | serverless form/review helpers | static GitHub Pages may not execute Netlify functions | documented provider limitations |

## Required search results

Searched repository for `GTM-NDGDVK2N`, `G-C6BWSDXRCT`, `G-7KBNLLS1TB`, `googletagmanager.com`, `google-analytics.com`, `gtag(`, `dataLayer`, `fbq(`, `connect.facebook.net`, `Content-Security-Policy`, `canonical`, and `application/ld+json`.

- `GTM-NDGDVK2N` remains only in Consent/GTM snippets and documentation.
- `G-C6BWSDXRCT` is documented for GTM/GA4 setup only and is no longer loaded directly with `gtag.js` in production HTML.
- `G-7KBNLLS1TB` was not found and was not introduced.
- Active `fbq(` and `connect.facebook.net` production loads were removed; Meta remains documentation-only until a real Pixel ID and marketing consent are available.

## Summary table

| Area | Before | After | Manual action required |
|---|---|---|---|
| GTM | Mixed with direct gtag | One GTM container per HTML page | Publish matching GTM workspace |
| GA4 | Hard-coded gtag plus GTM | GTM-only implementation | Configure Google Tag in GTM |
| Consent Mode | Legacy banner | Consent Mode v2 default denied | Verify in Tag Assistant |
| WhatsApp tracking | Partial/generic | `whatsapp_click` dataLayer event | Add GA4 event tag |
| Phone tracking | Partial/generic | `phone_click` without number | Add GA4 event tag |
| Email tracking | Partial/generic | `email_click` without address | Add GA4 event tag |
| Instagram tracking | Not specific | `instagram_click` | Add GA4 event tag |
| Product tracking | Limited | `select_item`, `view_item` | Add GA4 event tags |
| Form tracking | Fired lead before mailto open | central validation-aware lead event | Consider static form provider for confirmed server success |
| Video tracking | Not standardized | start/progress/complete listeners | Test with real playback |
| Blog tracking | Not standardized | `article_view` | Add GA4 event tag |
| Key events | Unclear | `generate_lead` recommended only | Mark in GA4 |
| Search Console | Not documented | setup guide added | Verify DNS Domain property |
| Sitemap | Existing | regenerated canonical sitemap | Submit in Search Console |
| Robots.txt | Existing | allows all and references sitemap | None |
| Canonicals | Present on many pages | audited and sitemap uses canonical URLs | Review legacy duplicate URL strategy |
| Structured data | Present but mixed | preserved and documented validation | Validate rich results |
| Open Graph | Present on important pages | preserved | Review image previews |
| Performance | Large images present | documented and lazy/defer behavior preserved | Consider image pipeline/CDN |
| CSP | Broad, Meta-enabled | narrowed for active resources | HTTP headers need hosting support |
| Security headers | Netlify headers present | narrowed/documented | GitHub Pages may need Cloudflare/Netlify for headers |
| Meta Pixel readiness | Active Pixel with real ID | disabled; guide-only placeholder | Supply Pixel ID and marketing consent design |
