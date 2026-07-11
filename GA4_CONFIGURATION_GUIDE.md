# GA4 Configuration Guide

Confirm web stream `G-C6BWSDXRCT`. Keep Enhanced Measurement for page views and scrolls; review outbound clicks/video to avoid duplicate custom events. Set data retention to 14 months. Configure internal traffic in Testing state first. Add unwanted referrals only if payment/form providers are introduced.

Create custom dimensions: `product_name`, `product_id`, `button_location`, `contact_method`, `enquiry_type`, `form_status`, `page_type`, `cta_name`, `cta_location`. Mark `generate_lead` as the primary key event. Optionally mark `whatsapp_click` or `phone_click` only if business-qualified. Do not mark `page_view`, `scroll`, `session_start`, `first_visit`, or Instagram clicks.

Audiences: product viewers without enquiry; users viewing two or more products; form starters without completion; returning engaged visitors; wholesale/distribution enquiry visitors. Explorations: landing page to product view to lead; traffic source to WhatsApp click; product lead conversion; blog to product to lead; device, region, and organic search lead performance.
