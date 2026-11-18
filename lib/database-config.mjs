export class DatabaseConfigurationError extends Error {
  constructor(message) { super(message); this.name = "DatabaseConfigurationError"; }
}

/** @param {Record<string, string | undefined>} [env] */
export function databaseConfig(env = process.env) {
  const hosted = env.VERCEL === "1" || Boolean(env.VERCEL_ENV);
  const configuredUrl = env.DATABASE_URL?.trim() || env.TURSO_DATABASE_URL?.trim();
  const authToken = env.DATABASE_AUTH_TOKEN?.trim() || env.TURSO_AUTH_TOKEN?.trim();
  if (hosted && (!configuredUrl || configuredUrl.startsWith("file:"))) {
    throw new DatabaseConfigurationError("Vercel requires a hosted database. Set DATABASE_URL to your libSQL/Turso database URL and DATABASE_AUTH_TOKEN to its token. Local file: databases cannot be used on Vercel.");
  }
  const url = configuredUrl || "file:data/radio.db";
  if (!url.startsWith("file:")) {
    let parsed;
    try { parsed = new URL(url); } catch { throw new DatabaseConfigurationError("DATABASE_URL is not a valid database URL."); }
    if (!["libsql:", "https:", "http:", "wss:", "ws:"].includes(parsed.protocol)) {
      throw new DatabaseConfigurationError("DATABASE_URL must point to a libSQL-compatible database; PostgreSQL/MySQL URLs are not compatible with this application.");
    }
    if (hosted && (["http:", "ws:"].includes(parsed.protocol) || ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname))) {
      throw new DatabaseConfigurationError("Use a secure, remotely accessible libSQL database URL on Vercel.");
    }
    if (hosted && !authToken) throw new DatabaseConfigurationError("DATABASE_AUTH_TOKEN is missing. Add the hosted database token in Vercel Environment Variables.");
  }
  return { url, authToken };
}
