# UPSC RADIO — Next.js application

The active application uses Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Clerk and a server-only Moodle adapter. The original Django source and db.sqlite3 are retained for archival and migration reference.

## Local start

Use Node 20.9+ and npm. Run npm install, then npm run dev. Open http://127.0.0.1:3000.

Copy .env.example to .env.local and set the required service values. Clerk account management and protected routes activate when its keys are configured. Local content and enquiries are stored in data/radio.db through libSQL. For multiple application instances or ephemeral hosting, set DATABASE_URL to a managed libSQL database and set DATABASE_AUTH_TOKEN. Use a backed-up database with appropriate write concurrency and regional placement.

## Existing data

Run python scripts/export_legacy.py and npm run migrate once to copy published and draft content, enquiries and archival records from the original database. Re-running the import preserves edits and prevents duplicate records. Keep data/legacy.json private. The original database retains legacy passwords and private learning history. Clerk identities must be linked through a reviewed user migration before carrying legacy student enrolments into Moodle. There were no student accounts in the original database at migration time.

## Clerk

The selected application is app_3MGfsAHAbObwJvw0WZqqnDuXQTj. Authenticate the CLI from your terminal with npx -y clerk@latest auth login, then link with npx -y clerk@latest link --app app_3MGfsAHAbObwJvw0WZqqnDuXQTj and pull development keys with npx -y clerk@latest env pull. Keep keys in .env.local.

Enable email authentication and Google in the Clerk Dashboard. Set website URLs and allowed origins to the deployed host. Password recovery and account edits use Clerk components. Set publicMetadata.role through Clerk's privileged Dashboard or Backend API to admin, counsellor or faculty. An unset role gives student access. Users cannot assign these public metadata values themselves.

## Moodle

Set MOODLE_URL to the Moodle root HTTPS origin and MOODLE_TOKEN to a dedicated service token. Enable REST. Permit only the functions needed by this integration:

- core_user_get_users_by_field
- core_user_create_users
- core_enrol_get_users_courses
- enrol_manual_enrol_users
- auth_userkey_request_login_url

Install the compatible Catalyst User key authentication plugin from https://github.com/catalyst/moodle-auth_userkey on Moodle. Enable it, use database ID as its mapping field, disable its account creation/update, and choose a short one-time key lifetime such as 60 seconds. Authorise the service account and grant auth/userkey:generatekey. Add the SSO function to the same restricted external service token, or use the plugin's service with equivalent permissions. Configure Moodle login/logout redirect settings for the website and enforce HTTPS.

Each verified Clerk subject maps to one Moodle account. Payment enrolment provisions an account only after a verified primary email is available. Existing Moodle users require administrator-reviewed identity mapping. Course IDs are configured in the website staff CMS. Course lessons, video playback, resources, assignment uploads, timers, answer saving, grading and progress operate in the Moodle course interface after the one-time login. Moodle retains responsibility for student-specific access restrictions.

A service account token is never sent to the browser. The launch endpoint checks Clerk identity and current enrolment, requests a single-use login URL, verifies its origin, then redirects to the enrolled course. Validate SSO, logout behaviour and access expiry on the actual Moodle installation.

## Website administration

Open /staff with an admin Clerk account to edit courses, resources, profiles and content publishing status. Counsellors can manage enquiries and follow-ups. Faculty operations take place in Moodle. The website's enquiry forms store validated requests with shared database rate limits. Configure the production reverse proxy to replace forwarding headers and apply abuse controls to public form endpoints.

## Razorpay

Configure the three Razorpay variables and enable automatic capture. Course checkout also requires its published fee in paise and Moodle course ID. Create a webhook for /api/payments/webhook with payment.captured events. Captured payments are verified server-side against the stored order, currency and amount. Duplicate capture callbacks preserve one transaction and fulfilment can be retried. If a provider request times out while creating an order, reconcile the receipt before changing the Creating state. Re-open an enrolled course checkout to retry activation after a temporary Moodle failure.

## Production

Use npm run build then npm start on a supported Node host. Configure HTTPS and SITE_URL. Set Clerk, database, Moodle and Razorpay secrets through the hosting secret manager. Persist uploaded media in Moodle and use backups for both databases. Use Moodle caching, scheduled tasks and workers appropriate to quiz load, then load-test 500 concurrent examination users before committing to capacity targets.

## Verification

Run npm run typecheck, npm test and npm run build. Local service-independent checks cover payment signatures, capture reconciliation, duplicate checkout prevention, fulfilment retry safety and rate limiting. Live Clerk sign-in, Google sign-in, Moodle SSO and a real Razorpay test transaction require configured service accounts.

## Automatic previous papers

The homepage fetches the first two PDF links from the latest Civil Services Mains table in UPSC's official archive. A shared database cache refreshes every 10 minutes. Open homepages also poll every 10 minutes and when returning to the tab. Source outages retain the last successful listing with an update notice.

## Catalogue and free mock

Run npm run seed:catalogue to create the two labelled preview courses and the single free introductory mock listing. Existing entries are preserved on subsequent runs. Paid test prices are awaiting institute input. Staff publishing validates that additional mock tests have a positive price.

The student dashboard has dedicated links to the free mock, all tests, saved items and account settings. The free test has 10 original introductory polity questions prepared in moodle/free-polity-starter.gift. Follow moodle/README.md to import and connect it. Actual attempts remain unavailable until Moodle is configured.

The homepage now shows the latest three official UPSC notices with red Read more links opening their official destinations in a new tab. News and PYQ feeds share a persistent ten-minute source cache.
