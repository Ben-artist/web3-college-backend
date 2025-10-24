import { S3Client } from '@aws-sdk/client-s3';

export const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  uploadPrefix: process.env.AWS_S3_UPLOAD_PREFIX,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
  maxFileSize: 10 * 1024 * 1024,
};
export function createS3Client(): S3Client {
  if (
    !(
      s3Config.accessKeyId &&
      s3Config.secretAccessKey &&
      s3Config.bucketName &&
      s3Config.uploadPrefix
    )
  ) {
    throw new Error(
      'AWS_ACCESS_KEY_ID Âí?AWS_SECRET_ACCESS_KEY Âí?AWS_S3_BUCKET_NAME Âí?AWS_S3_UPLOAD_PREFIX ÂøÖÈ°ªÈÖçÁΩÆ'
    );
  }

  return new S3Client({
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  });
}
