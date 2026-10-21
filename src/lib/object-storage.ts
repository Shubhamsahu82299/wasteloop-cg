import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

export class ObjectStorageConfigurationError extends Error {
  constructor() {
    super("Object storage is not configured.");
  }
}

let client: S3Client | undefined;

export function isObjectStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

function getStorage() {
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!isObjectStorageConfigured() || !bucket || !accessKeyId || !secretAccessKey) {
    throw new ObjectStorageConfigurationError();
  }

  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || "auto",
      ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
      forcePathStyle: Boolean(process.env.S3_ENDPOINT),
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return { client, bucket };
}

export function createEvidenceObjectKey(
  complaintId: string,
  type: "BEFORE" | "AFTER",
  mimeType: string,
): string {
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return `evidence/${complaintId}/${type.toLowerCase()}/${randomUUID()}.${extension}`;
}

export async function putEvidenceObject(
  key: string,
  body: Uint8Array,
  mimeType: string,
): Promise<void> {
  const { client: storageClient, bucket } = getStorage();
  await storageClient.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: mimeType,
      CacheControl: "private, no-store",
    }),
  );
}

export async function getEvidenceObject(key: string) {
  const { client: storageClient, bucket } = getStorage();
  return storageClient.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}

export async function deleteEvidenceObject(key: string): Promise<void> {
  const { client: storageClient, bucket } = getStorage();
  await storageClient.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
