# GTM Setup Guide

Container: `GTM-NDGDVK2N`. Create `GA4 – Configuration – Google Tag` with Tag ID `G-C6BWSDXRCT`, Initialization – All Pages trigger, consent respected, and no duplicate page_view event tags.

For each Custom Event trigger below, create a GA4 Event tag using the matching event name and Data Layer Variables for listed parameters: `whatsapp_click`, `phone_click`, `email_click`, `instagram_click`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `form_start`, `form_error`, `generate_lead`, `video_start`, `video_progress`, `video_complete`, `article_view`, `cta_click`.

Variables inventory: `page_type`, `page_title`, `page_path`, `link_url`, `link_domain`, `link_text`, `button_location`, `contact_method`, `product_id`, `product_name`, `product_category`, `product_variant`, `quantity`, `enquiry_type`, `form_id`, `form_name`, `form_status`, `error_count`, `error_type`, `quantity_bucket`, `video_title`, `video_percent`, `article_title`, `article_category`, `cta_name`, `cta_location`, `items`, `currency`, `value`, `item_list_id`, `item_list_name`.

Testing for every tag: use GTM Preview, click/submit/play the relevant UI, confirm Custom Event appears once, consent shows analytics granted only after opt-in, and GA4 DebugView receives the event without PII.
