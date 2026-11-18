# Next.js migration plan

The active runtime is Next.js App Router on port 3000. Public content, enquiries, shared rate limits, saved courses and resources, identity mappings, payment records and audit entries use libSQL. Local storage is file-backed. A managed libSQL database supports deployment across application instances.

Clerk owns registration, email and Google authentication, account management and sessions. Its selected application is UpscRadio. Staff access is checked on the server using privileged Clerk public metadata.

Moodle owns learning content, media permissions, assessment attempts, grading, assignments and progress. A server-only REST integration verifies enrolments and a Catalyst userkey integration provides one-time course login. The current website launches the Moodle learning interface. A custom embedded lesson player and dashboard assessment analytics require the live Moodle configuration and student-scoped APIs.

Razorpay orders are created on the server from stored fees. Callbacks and webhooks are signed and captured payments are matched against order, currency and amount before activating Moodle enrolment. Paid records survive activation failures so fulfilment can be retried.

The original Django project, database and learning history are retained. The initial migration copied 20 original records into private archives and public/draft CMS content without publishing demo courses. No original student accounts were present.

Required rollout checks include Clerk email and Google sign-in, server role permissions, Moodle SSO and logout, enrolment expiry, protected course materials, a real test-mode Razorpay purchase, and workload testing against the deployed Moodle infrastructure.
