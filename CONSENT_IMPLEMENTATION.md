# Consent Implementation

Consent defaults are placed before GTM in every HTML page: analytics and advertising storage are denied; functionality and security storage are granted. Choices are stored as JSON in `localStorage` key `krizpia_consent_v1` with `choice`, `version`, and `timestamp`. The footer Cookie preferences button reopens the banner; selecting “Keep analytics off” withdraws analytics consent without enabling ad storage.

Checklist: first visit, accept analytics, reject analytics, returning visitor, withdraw consent, incognito, localStorage disabled, mobile browser, keyboard navigation.
