import test from "node:test";
import assert from "node:assert/strict";
import { storageConfig, StorageConfigurationError, validStudyMaterialKey, studyMaterialDownload } from "../lib/r2";

test("storage requires server credentials and a fixed Cloudflare endpoint", () => {
  assert.throws(() => storageConfig({}), StorageConfigurationError);
  assert.throws(() => storageConfig({ R2_ACCOUNT_ID: "https://attacker.invalid" }), StorageConfigurationError);
  const config = storageConfig({ R2_ACCOUNT_ID: "a".repeat(32), R2_BUCKET_NAME: "upsc-materials", R2_ACCESS_KEY_ID: "example", R2_SECRET_ACCESS_KEY: "example" });
  assert.equal(config.endpoint, `https://${"a".repeat(32)}.r2.cloudflarestorage.com`);
});

test("study downloads reject path traversal, URLs, scripts and non-PDF keys", () => {
  for (const key of ["../secret.pdf", "study-materials/../secret.pdf", "study-materials/%2e%2e/secret.pdf", "https://example.com/file.pdf", "study-materials/file.html", "private/paid.pdf", "study-materials/a\r\n.pdf", "study-materials//a.pdf"]) assert.equal(validStudyMaterialKey(key), false, key);
  assert.equal(validStudyMaterialKey("study-materials/polity/chapter-1.pdf"), true);
});

test("download links expire quickly, use attachment headers and never disclose the secret", async () => {
  const names = ["R2_ACCOUNT_ID", "R2_BUCKET_NAME", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"];
  const prior = names.map(name => process.env[name]);
  try {
    Object.assign(process.env, { R2_ACCOUNT_ID: "a".repeat(32), R2_BUCKET_NAME: "upsc-materials", R2_ACCESS_KEY_ID: "test-access", R2_SECRET_ACCESS_KEY: "test-secret-never-expose" });
    const signed = await studyMaterialDownload("study-materials/polity.pdf");
    const url = new URL(signed);
    assert.equal(url.hostname, `${"a".repeat(32)}.r2.cloudflarestorage.com`);
    assert.equal(url.searchParams.get("X-Amz-Expires"), "60");
    assert.equal(url.searchParams.get("response-content-disposition"), 'attachment; filename="polity.pdf"');
    assert.equal(signed.includes("test-secret-never-expose"), false);
    await assert.rejects(studyMaterialDownload("../private.pdf"), /Invalid/);
  } finally { names.forEach((name, i) => { if (prior[i] === undefined) delete process.env[name]; else process.env[name] = prior[i]; }); }
});
