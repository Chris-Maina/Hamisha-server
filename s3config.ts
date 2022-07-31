import S3Client from 'aws-sdk/clients/s3';
import { createReadStream, PathLike } from 'fs';
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
export function uploadFile(pathLike: PathLike, filename: string): Promise<S3UploadedObject> {
  const fileStream = createReadStream(pathLike);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME || '',
    Body: fileStream,
    Key: filename
  }

  return S3.upload(uploadParams).promise();
}

/**
 * Downloads a file from S3
 * @param fileKey - string
 * @returns Readable
 */
export function getFileStream(fileKey: string): Readable {
  const downloadParams = {
    Key: fileKey,
    Bucket: process.env.S3_BUCKET_NAME || '',
  };

  return S3.getObject(downloadParams).createReadStream();
}

/**
 * Downloads a file from S3
 * @param fileKey - string
 * @returns Promise
 */
export function getFileData(fileKey: string): Promise<S3Client.GetObjectOutput> {
  const downloadParams = {
    Key: fileKey,
    Bucket: process.env.S3_BUCKET_NAME || '',
  };
  return new Promise((resolve, reject) => {
    S3.getObject(downloadParams, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}
