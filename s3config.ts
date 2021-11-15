import S3Client from 'aws-sdk/clients/s3';

export const S3 = new S3Client({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION
});