import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl }     from "@aws-sdk/s3-request-presigner";
import { createS3Client }   from "../config/s3.js";

export async function getPresignedUrl(fileUrl, expiresInSeconds = 300) {
  try {
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.slice(1));

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key:    key,
    });

    const signedUrl = await getSignedUrl(createS3Client(), command, {
      expiresIn: expiresInSeconds,  // 5 minutes
    });

    return signedUrl;
  } catch (err) {
    console.error("Presigned URL error:", err);
    throw err;
  }
}