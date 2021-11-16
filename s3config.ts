import S3Client from 'aws-sdk/clients/s3';
import { createReadStream } from 'fs';
import type { Readable } from 'stream';
import { S3UploadedObject } from './common/interfaces';

export const S3 = new S3Client({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Uploads a file to S3
 * @param file { path: string, filename: string }
 */
export function uploadFile(file: Express.Multer.File): Promise<S3UploadedObject> {
  const fileStream = createReadStream(file.path);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME || '',
    Body: fileStream,
    Key: file.filename
  }

  return S3.upload(uploadParams).promise();
}

/**
 * Downloads a file from S3
 * @param fileKey - string
 */
export function getFileStream(fileKey:string): Readable {
  const downloadParams = {
    Key: fileKey,
    Bucket: process.env.S3_BUCKET_NAME || '',
  };

  return S3.getObject(downloadParams).createReadStream();
}
