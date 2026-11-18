# UPSC Radio feature status

Updated 18 November 2026. This is an implementation status, not a claim that the site is ready for live sales.

## Available locally

- Shop dropdown with expandable exam/subject submenus.
- Redesigned Watch page with official channel, playlist and topic-search links; no invented video or playlist IDs.
- About us page and study library with search, exam filtering, pagination and useful empty states.
- Homepage server streaming, smaller transparent hero asset, indexed preview queries, in-memory feed caching and visibility-aware refresh.

- Home page with mock tests, study materials, official previous papers and latest UPSC news.
- Official news and the first two papers refresh every ten minutes, retaining the last successful result on source failure.
- Featured subject links and organisation section.
- Responsive branded footer, official YouTube, Instagram and Facebook links. External links open a new tab.
- Course catalogue, filters, detail pages and two clearly labelled demo courses.
- Add to cart on home course previews, course listings/details and paid mock listings; login required, cart isolated per account in the same browser, removal and server-sourced product details/prices. Checkout is per course, not a combined multi-item payment. The cart does not sync between devices.
- Clerk sign-in screens, protected student dashboard, saved resources and account management.
- Contact/enquiry form stored for staff review.
- Staff content and enquiry management; media/recognition page supports published entries.
- Payment-order verification, webhook validation and Moodle enrolment integration code.

## Requires configuration or supplied content

- Paid prices: owner will supply later. Unpriced items and demo courses cannot be purchased.
- Razorpay credentials and webhook configuration: live payment flow has not been exercised.
- Moodle installation, service configuration, course IDs and SSO plugin: not yet set up.
- One free mock: ten-question GIFT file is prepared, but must be imported into Moodle and mapped before students can attempt it.
- Production Clerk domain/instance and Google configuration: local development instance remains in use.
- Published teaching content, actual course information, recognition evidence and final organisation/privacy copy.

## Not implemented yet

- Combined multi-item checkout and cross-device cart synchronisation.
- Standalone blogging/editorial workflow.
- Email subscriber form/list and newsletter delivery.
- WhatsApp contact link (official number not supplied).
- Dedicated current-affairs Zoom subscription, session registration and recurring billing. The whiteboard mentions ₹2,000/month and 9–10pm; these have not been published as confirmed programme terms.

## Verification

- TypeScript check and all fifteen automated tests pass after these updates.
- Browser checked: signed-out cart prompt and protected cart redirect, desktop/mobile Shop menu and submenus, improved study-library empty state, Watch links/layout and Facebook footer link. Previous cart add/remove checks were before login became required.
- The new authenticated cart layout and wishlist mutations still need a signed-in account check.
- Authenticated Moodle learning, production authentication and live payment fulfilment still require end-to-end verification with configured services.
