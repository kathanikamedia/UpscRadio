# Deploy UPSC Radio to Vercel

## Required database configuration

The app uses libSQL/SQLite. Vercel requires a hosted libSQL-compatible database; local `file:` URLs and `/tmp` storage cannot persist this application's data.

Create a hosted **libSQL** database and an access token (Turso offers both libSQL and its newer Turso engine; select libSQL for this app), then add these values in Vercel's **Production** environment:

```text
DATABASE_URL=libsql://YOUR-HOSTED-DATABASE
DATABASE_AUTH_TOKEN=YOUR-PRIVATE-DATABASE-TOKEN
```

Turso integration names `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are also supported. Do not enter PostgreSQL/MySQL connection strings: this application does not use those database protocols.

Put real values only in Vercel's secret settings or your private `.env.vercel.production.local` file. Do not commit them. The `prebuild` check prevents a Vercel build from succeeding with a missing or local database URL.

## Website and authentication

In the Production environment, import the existing private `.env.vercel.production.local` file. It contains the selected Clerk application's production keys and these public settings:

```text
SITE_URL=https://upscradio.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/account/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/account/register
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/student
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/student
```

Use development Clerk keys and a separate database for Preview deployments. Production Clerk credentials are intended for the real configured domain. Google sign-in still needs your production Google OAuth credentials; see `CLERK-PRODUCTION-SETUP.md`. Configure an administrator role in the production Clerk instance for staff access; development users/roles do not automatically become production accounts.

## Initialize and populate the hosted database

After adding the hosted URL and token to the private environment file, run from this project directory:

```sh
node --env-file=.env.vercel.production.local --import tsx scripts/check-database.ts
node --env-file=.env.vercel.production.local --import tsx scripts/copy-catalogue.ts
```

The connection check creates the schema idempotently. The catalogue copy imports published catalogue items and CMS settings from `data/radio.db`, preserves existing remote entries, and never copies users, payments, enquiries or local identity mappings. It allowlists public metadata and excludes local document paths and unknown secret/config fields. Review the local CMS settings before copying them to the live site. To create just the demo catalogue instead, use:

```sh
node --env-file=.env.vercel.production.local --import tsx scripts/seed-catalogue.ts
```

## Build and domain

`vercel.json` fixes the framework, install command and build command:

- Root directory: repository root (`./`).
- Framework: Next.js.
- Install command: `npm ci`.
- Build command: `npm run build`.
- Output directory: Next.js default; no custom override.
- Remove custom `NODE_ENV` variables and let Vercel manage the environment.

Redeploy after adding the environment variables. Connect `upscradio.com` and `www.upscradio.com` under Vercel **Settings → Domains**, then copy the exact website A/CNAME records Vercel displays into GoDaddy. Preserve the five existing Clerk CNAME records and existing email records.

## Remaining service activation

The hosted database makes the catalogue, enquiries and wishlists persistent. It does not configure Moodle or Razorpay. Leave payment/Moodle values unset until those services are ready. Paid checkout and actual mock-test attempts remain gated by their required configuration. Published PDF files must be hosted durably (for example in Moodle); files in the ignored local `private/` directory are not uploaded to Vercel.

Verify public pages, Google/email sign-in on the real domain, protected pages, staff access and saved data after deployment. Exercise real payments and Moodle separately once those services are configured.
