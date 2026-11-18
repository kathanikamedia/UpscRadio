import { initialize,execute,closeDatabase } from "../lib/db";
import { DatabaseConfigurationError } from "../lib/database-config.mjs";
try {
  await initialize();
  const result=await execute("SELECT COUNT(*) AS count FROM content");
  console.log(`Database connected and schema ready. Catalogue entries: ${Number(result.rows[0].count)}.`);
} catch(error) {
  console.error(error instanceof DatabaseConfigurationError?error.message:"Database connection check failed. Verify the hosted URL, token and network access. No credentials were displayed.");
  process.exitCode=1;
} finally { closeDatabase(); }
