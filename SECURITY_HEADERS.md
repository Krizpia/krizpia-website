# Security Headers

CSP is provided as HTML meta tags and in `_headers`/`netlify.toml`; standard GitHub Pages may not honor arbitrary HTTP headers. Meta CSP cannot enforce directives such as `frame-ancestors` as fully as HTTP headers.

Current CSP allows self, GTM scripts/frames, GA4 collection endpoints, images over HTTPS/data, inline styles/scripts where required by the static pages, and mailto/wa.me form actions. It does not include `connect.facebook.net` because Meta Pixel is disabled.

Recommended headers: HSTS `max-age=31536000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, CSP, and COOP only after compatibility testing. Use `rel="noopener noreferrer"` on new-window links. Never expose API secrets in frontend code.
