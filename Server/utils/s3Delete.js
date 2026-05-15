import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createS3Client } from "../config/s3.js";

export async function deleteFromS3(fileUrl) {
  if (!fileUrl) return;
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1);
    await createS3Client().send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );
    console.log("S3 deleted:", key);
  } catch (err) {
    console.warn("S3 delete failed:", err.message);
  }
}