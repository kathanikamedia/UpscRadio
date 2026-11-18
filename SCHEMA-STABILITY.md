# Database stability

The existing libSQL schema in `lib/db.ts` is the baseline. Homepage styling, navigation and content edits must not change tables, column names, primary keys or existing records.

- Catalogue entries use `(kind, slug)` as their stable import key. Preserve destination IDs and records. Payment and wishlist references use destination content IDs; never replace them with unrelated local IDs.
- Existing payment, identity, enquiry, wishlist and audit records must not be reset during deployment or catalogue imports. Development Clerk identities are not production identities.
- Use the existing content fields for editorial changes. Validate new metadata fields before saving; do not store credentials in content metadata.
- When a feature truly needs a schema change, write an explicit numbered migration with a record of applied versions. Test it against a copy containing existing records and take a restorable production backup before applying it. Do not put destructive changes in automatic startup initialization.
- Prefer additive, backward-compatible changes. Preserve old fields until the deployed application and any background jobs no longer depend on them. Verify record counts, payment references and application behaviour after migration.
- A catalogue import is not a full database backup. It deliberately excludes operational/student tables and cannot replace a production backup/restore procedure.

The November 2026 Turso catalogue transfer copied and verified 22 catalogue/settings entries, including drafts. It did not alter the schema or copy local student/payment records. No production schema migrations have been introduced by the homepage redesign.
