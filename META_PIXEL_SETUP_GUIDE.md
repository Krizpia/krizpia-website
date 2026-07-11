# Meta Pixel Readiness

Meta Pixel is not loaded in production. Placeholder: `META_PIXEL_ID = "REPLACE_WITH_REAL_META_PIXEL_ID"`.

Implement later through GTM only after marketing consent exists. Map GA4 events: `view_item`→ViewContent, `add_to_cart`→AddToCart, `form_start`→InitiateCheckout only if meaningful, `generate_lead`→Lead, `whatsapp_click`→Contact, purchase only for real purchases. Do not send email, phone, names, or messages; keep advanced matching disabled unless separately approved. Complete domain verification, Test Events, Aggregated Event Measurement, and future CAPI `event_id` deduplication.
