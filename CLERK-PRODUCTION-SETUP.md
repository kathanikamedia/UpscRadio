# Clerk production setup for upscradio.com

The production instance has been created in the existing UPSC Radio Clerk application. Local development keys have not been replaced.

## GoDaddy DNS

Open the domain's DNS page in GoDaddy and add these **CNAME** records. The Name field uses only the subdomain shown below; GoDaddy appends `upscradio.com`. Use the default TTL. If a record with the same Name already exists, review it before changing it rather than adding a conflicting record.

1. Name: `clerk` — Value: `frontend-api.clerk.services`
2. Name: `accounts` — Value: `accounts.clerk.services`
3. Name: `clkmail` — Value: `mail.souj6ozj6v1o.clerk.services`
4. Name: `clk._domainkey` — Value: `dkim1.souj6ozj6v1o.clerk.services`
5. Name: `clk2._domainkey` — Value: `dkim2.souj6ozj6v1o.clerk.services`

Verify in [Clerk's domain settings](https://dashboard.clerk.com/apps/app_3MGfsAHAbObwJvw0WZqqnDuXQTj/instances/ins_3MHC1Jhh0VxCnWEaZKVaHZOzuHR/domains), or run `npx -y clerk@latest deploy status --mode agent` from this project.

## Google sign-in

Create/configure a Google OAuth web client for this production application:

- JavaScript origins: `https://upscradio.com` and `https://www.upscradio.com`
- Redirect URI: `https://clerk.upscradio.com/v1/oauth_callback`
- Publish the OAuth consent screen to production.
- Enter the client ID and client secret in the production instance's Google connection settings in Clerk. Keep the secret out of chat and Git.

## Website deployment

After DNS, certificates, email DNS and Google OAuth are verified, configure the production Clerk keys in the live host's private environment settings and rebuild/redeploy the website. Do not write production keys over the local `.env.local` file. Test Google sign-in, email sign-in, redirects and protected pages on the real domain.

The Clerk development label disappears on the live site when it uses the production instance. Localhost continues using the development instance; Next.js production server mode does not change Clerk instances.
