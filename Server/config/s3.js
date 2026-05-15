import { S3Client } from "@aws-sdk/client-s3";

export function createS3Client() {
  const key    = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!key || !secret || !region) {
    throw new Error(`Missing AWS credentials: KEY=${key} REGION=${region}`);
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId:     key,
      secretAccessKey: secret,
    },
  });
}