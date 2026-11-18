# Verification report

The active app uses Next.js, React, Clerk and a server-only Moodle integration.

- Production compilation passed after using Webpack and a Tailwind version compatible with the local Node runtime.
- TypeScript checks passed.
- Eight Node tests passed, covering payment signatures, capture validation, duplicate checkout prevention, activation retry safety, shared rate limits and the dynamic UPSC paper parser.
- The homepage and mobile navigation were checked in the browser. Text branding and the hidden Next.js development indicator were verified.
- The live PYQ endpoint returned the first two papers from the official Civil Services Mains listing. The homepage displays those links and refreshes its feed every 10 minutes.
- Clerk is linked to the selected UpscRadio application. Development keys are local and excluded from Git.
- Moodle has yet to be installed. Live course delivery, quizzes, progress, SSO and load testing remain dependent on that setup.
- Production Clerk domain configuration, production Google OAuth credentials and a real Razorpay sandbox purchase remain launch checks.
- The original Django source is retained for migration reference. The original database, private files and local application data are excluded from Git.

## Latest audit

- Corrected hero CTA contrast and tightened mobile hero spacing.
- Prevented conflicting payment callbacks from both reporting a successful capture. Added a concurrent callback regression test.
- Added retry recovery for database initialization, direct indexed content lookup, live sitemap generation and whole-number pagination.
- Corrected learning-access error handling so service failures produce a controlled response and missing course access retains its expected handling.
- Browser-tested enquiry submission and confirmed database persistence, then removed the temporary QA record.
- Verified responsive homepage and Clerk sign-in rendering. The production build, TypeScript checks and all nine automated tests passed.
- Updated the hero CTA to Mock Test at /test-series/.
- Moodle installation, live learning/SSO verification and production Clerk/payment configuration remain external setup requirements.

## Catalogue and dashboard update

- Added two explicitly labelled demo course previews with working detail links.
- Added the free mock listing, protected enrolment flow, Moodle import questions and paid-test publishing validation.
- Refined the separate student dashboard with real enrolment, saved-item and payment data.
- Added two source parser tests for official news. All eleven automated tests and TypeScript checks passed.
- Browser-verified the homepage's three latest official news items and both demo courses.
- The free mock still requires Moodle installation/import before students can attempt it. Paid-test prices remain pending.


## 18 November 2026 update

- 15 automated tests pass, including ten-minute feed-cache expiry, concurrent-request deduplication and limited homepage queries.
- Hero source: 1,881,987-byte PNG replaced by 226,652-byte transparent WebP (about 88% smaller). Responsive Next.js image delivery remains enabled.
- Homepage shell streams without waiting for official feeds or database previews. Feed and course boundaries reserve space without entrance animations.
- Official feeds retain the database fallback, use a warm process cache, skip hidden-tab polls and refresh at ten-minute intervals.
- Study materials filter/search/pagination run in SQL, with a nine-item page limit.
- Browser verified desktop/mobile Shop menus, signed-out cart prompt, protected cart redirect, study-library empty state, Watch page and social navigation.
- Authenticated cart, wishlist and live payment/Moodle flows still require signed-in end-to-end verification. No production speed score is claimed.

- Security pass: bounded payment request bodies (including forged Content-Length checks), same-order gateway verification, verification rate limit, safe post-login destinations and private-page no-store headers. Baseline CSP and permission restrictions preserve external sign-in popups. This is a targeted code review, not a penetration-test certification.
