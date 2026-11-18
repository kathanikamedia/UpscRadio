import { validateDeploymentEnvironment } from "../lib/deployment-config.mjs";
try {
  validateDeploymentEnvironment();
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) console.log("Deployment environment settings are present.");
} catch (error) {
  console.error("\nDeployment configuration error:");
  console.error(error instanceof Error ? error.message : "Check the database environment variables.");
  console.error("Save the variables for this deployment's environment, then redeploy. Do not use file:data/radio.db or temporary storage.\n");
  process.exitCode = 1;
}
