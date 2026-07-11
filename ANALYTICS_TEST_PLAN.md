# Analytics Test Plan

For every event test browser console, dataLayer, GTM Preview, Tag Assistant, GA4 Realtime/DebugView, network requests, accepted/rejected/withdrawn consent, desktop/mobile, keyboard navigation, repeat clicks, refresh, back/forward, form validation failure/success/network failure, and ad blocker behavior.

| Event | User action | Expected parameters | Consent | Duplicate rule | Pass/fail |
|---|---|---|---|---|---|
| whatsapp_click | Click WhatsApp link | contact_method, link_url, link_text, page_type | analytics granted for GA4 | one per click | |
| phone_click | Click tel link | contact_method, link_text | analytics granted | no phone number | |
| email_click | Click mailto | contact_method, link_text | analytics granted | no email address | |
| instagram_click | Click Instagram | social_platform, link_text | analytics granted | one per click | |
| select_item | Click product card/View Product | ecommerce items | analytics granted | no duplicate CTA | |
| view_item | Load product page | ecommerce items | analytics granted | once per load | |
| add_to_cart/remove_from_cart/view_cart | Use real cart UI if enabled | item/product fields | analytics granted | only real cart actions | |
| form_start | First form interaction | form_id, form_name | analytics granted | once per page | |
| form_error | Invalid/failed submission | form_status, error_type/count | analytics granted | no values | |
| generate_lead | Valid successful enquiry | product, enquiry_type, quantity_bucket | analytics granted | success only | |
| video_start/progress/complete | Play process video | title, percent | analytics granted | each milestone once | |
| article_view | Load blog article | article_title/category | analytics granted | once per load | |
| cta_click | Click general CTA | cta_name/location | analytics granted | not when specific event exists | |
