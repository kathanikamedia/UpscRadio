import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class StorageConfigurationError extends Error {
  constructor() { super("R2 is not configured. Add R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY."); }
}

export function storageConfig(env: Record<string, string | undefined> = process.env) {
  const account = env.R2_ACCOUNT_ID?.trim();
  const bucket = env.R2_BUCKET_NAME?.trim();
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim();
  if (!account || !/^[a-f0-9]{32}$/.test(account) || !bucket || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) || !accessKeyId || !secretAccessKey) throw new StorageConfigurationError();
  return { bucket, endpoint: `https://${account}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } };
}

// Only public, published study PDFs are served by this integration.
// Paid course assets belong behind Moodle's enrolment checks.
export function validStudyMaterialKey(key: string) {
  return key.length <= 512 && /^study-materials\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_() -]+\.pdf$/.test(key);
}

function connection() {
  const { bucket, ...config } = storageConfig();
  return { bucket, client: new S3Client({ ...config, region: "auto", forcePathStyle: true, maxAttempts: 2 }) };
}

export async function checkStudyMaterial(key: string) {
  if (!validStudyMaterialKey(key)) throw Error("Invalid study-material object key.");
  const { bucket, client } = connection();
  try {
    const object = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }), { abortSignal: AbortSignal.timeout(10000) });
    if (object.ContentType?.split(";")[0].toLowerCase() !== "application/pdf" || !object.ContentLength) throw Error("Upload a non-empty PDF with application/pdf content type.");
  } finally { client.destroy(); }
}

export async function studyMaterialDownload(key: string) {
  if (!validStudyMaterialKey(key)) throw Error("Invalid study-material object key.");
  const { bucket, client } = connection();
  try {
    return await getSignedUrl(client, new GetObjectCommand({
      Bucket: bucket, Key: key,
      ResponseContentType: "application/pdf",
      ResponseContentDisposition: `attachment; filename="${key.split("/").at(-1)}"`,
    }), { expiresIn: 60 });
  } finally { client.destroy(); }
}
