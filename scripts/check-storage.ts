import { checkStudyMaterial, storageConfig, StorageConfigurationError } from "../lib/r2";
try {
  storageConfig();
  const key = process.argv[2];
  if (!key) throw Error("Provide an uploaded PDF key: npm run check:storage -- study-materials/example.pdf");
  await checkStudyMaterial(key);
  console.log("R2 connection verified. Study PDF exists and has the correct content type.");
} catch (error) {
  console.error(error instanceof StorageConfigurationError ? error.message : "R2 check failed. Provide an uploaded study-materials/*.pdf key and verify the bucket, read credentials and PDF content type. No credentials were displayed.");
  process.exitCode = 1;
}
