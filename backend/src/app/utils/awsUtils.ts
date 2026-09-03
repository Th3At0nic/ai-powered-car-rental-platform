/* eslint-disable @typescript-eslint/no-explicit-any */
import AWS from 'aws-sdk';
import fs from 'fs';
import axios from 'axios';
import throwAppError from './throwAppError';
import { StatusCodes } from 'http-status-codes';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'your-region', // e.g., 'us-west-1'
});

const s3 = new AWS.S3();

// Download file from AI and store it temporarily
export const downloadFileFromAI = async (
  url: string,
  filePath: string,
): Promise<void> => {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Upload file to AWS S3
export const uploadFileToS3 = async (
  filePath: string,
  bucketName: string,
  fileName: string,
) => {
  const fileStream = fs.createReadStream(filePath);

  const params = {
    Bucket: bucketName,
    Key: `videos/${fileName}`,
    Body: fileStream,
    ContentType: 'video/mp4',
  };

  //   try {
  //     const uploadResult = await s3.upload(params).promise();
  //     return uploadResult.Location; // Return the URL of the uploaded video
  //   } catch (error) {
  //     throwAppError(
  //       'upload',
  //       'Error Uploading video to S3',
  //       StatusCodes.GATEWAY_TIMEOUT,
  //     );
  //     throw new Error('Error uploading video to S3: ' + error.message);
  //   }

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // Return the URL of the uploaded video
  } catch (error) {
    // Handling timeout or network-related issue
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'TimeoutError'
    ) {
      throwAppError(
        'upload',
        'Gateway Timeout while uploading video to S3',
        StatusCodes.GATEWAY_TIMEOUT,
      );
    }
    // Handling general internal server issue
    else {
      throwAppError(
        'upload',
        'Internal server error while uploading video to S3',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
};

// Generate a signed URL for accessing the video temporarily: if in future needed, can be used then.
export const generateSignedUrl = (
  fileName: string,
  bucketName: string,
): string => {
  const params = {
    Bucket: bucketName,
    Key: `videos/${fileName}`,
    Expires: 60 * 60, // 1 hour expiry
  };

  return s3.getSignedUrl('getObject', params);
};
