# Performance Audit

Largest assets include `About Krizpia Image.png`, product PNGs, `mix image.png`, scheduled-blog PNGs, and `krizpia-logo.png`. Completed in code: retained eager/fetchpriority hero image, deferred shared analytics JS, removed active Meta script, preserved video lazy-friendly behavior, kept image width/height and lazy-loading attributes already present on noncritical images, and documented GitHub Pages caching limits.

Attempted image conversion/compression, but the container does not include `cwebp`, ImageMagick, or Pillow, and `npm install sharp` was blocked by registry policy (403). Recommended next step in CI or a local workstation: generate WebP/AVIF variants for the large PNG/JPG files, resize to rendered dimensions, and update `srcset`/`sizes`. External hosting/CDN configuration is required for custom long-lived cache headers on GitHub Pages.

Core Web Vitals targets: mobile LCP <= 2.5s, INP <= 200ms, CLS <= 0.1. Re-test with Lighthouse/PageSpeed after deploy.
