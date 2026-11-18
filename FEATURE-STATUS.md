# UPSC Radio feature status

Updated 18 November 2026. This is an implementation status, not a claim that the site is ready for live sales.

Latest update: reference-led light homepage and responsive FAQ verified locally. All 22 existing catalogue/settings entries, including drafts, have been copied and verified on Turso. No schema change was made. R2 setup has been deferred at the user's request. See SCHEMA-STABILITY.md for the database compatibility policy.

## Available locally

- Shop dropdown with expandable exam/subject submenus.
- Redesigned Watch page with six live latest uploads, six public playlists, official channel/topic links, ten-minute refresh and last-good cache fallback.
- About us page and study library with search, exam filtering, pagination and useful empty states.
- Homepage server streaming, smaller transparent hero asset, indexed preview queries, in-memory feed caching and visibility-aware refresh.
- Combined hero/audience introduction, tighter page spacing and lighter card borders. The audience footnote and visible Pause button have been removed as requested.
- Compact homepage preview rows for six channel uploads and six playlists, using the existing ten-minute channel cache. Previews pause on hover/focus; touch and reduced-motion users get scrollable static rows. External videos open in new tabs.

- Home page with mock tests, study materials, official previous papers and latest UPSC news.
- Official news and the first two papers refresh every ten minutes, retaining the last successful result on source failure.
- The requested learning-rhythm and subject-discovery sections have been removed. The organisation section remains.
- UPSC-focused hero with aspirant-supportive copy and mock-test/course entry points. The extra hero preparation-link strip has been removed.
- Community statistic cards show owner-supplied snapshots (78.7K YouTube subscribers and 36.9K Instagram followers), explicitly labelled as reported figures with profile links. They are not live API counts or enrolled-student totals. The ten-minute refresh statistic card has been removed; the official feeds still refresh on their configured schedule.
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

- TypeScript validation and the 29-test regression suite are used for current verification; see TESTING.md for the latest checks.
- Browser checked: signed-out cart prompt and protected cart redirect, desktop/mobile Shop menu and submenus, improved study-library empty state, Watch links/layout and Facebook footer link. Previous cart add/remove checks were before login became required.
- The new authenticated cart layout and wishlist mutations still need a signed-in account check.
- Authenticated Moodle learning, production authentication and live payment fulfilment still require end-to-end verification with configured services.

## Vercel deployment preparation

- Serverless database fallback and import-time directory creation fixed. Build configuration/preflight and hosted database check/catalogue copy commands added.
- Turso connection and the 22-entry catalogue transfer are verified. Vercel must retain the same hosted URL and token in its Production environment; the code does not substitute temporary storage or an in-memory database for real persistence.
# R2 storage preparation

Private R2 study-PDF downloads, admin object-key verification and a connection-check script are implemented. Uploads are managed in Cloudflare's dashboard. R2 activation, bucket creation and a real upload/download verification are deferred; the R2 variables may remain unset. Turso database setup and catalogue transfer are complete.
