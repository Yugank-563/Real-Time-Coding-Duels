import { S3Client } from '@aws-sdk/client-s3';

const {
  B2_ACCOUNT_ID,
  B2_APPLICATION_KEY,
  B2_BUCKET_NAME,
  B2_ENDPOINT,
  B2_REGION,
} = process.env;

if (!B2_ACCOUNT_ID || !B2_APPLICATION_KEY || !B2_ENDPOINT || !B2_REGION) {
  console.warn('[B2Client] B2 environment variables are not fully configured. Test case fetching from B2 will be unavailable.');
}

const b2Client = new S3Client({
  endpoint: `https://${B2_ENDPOINT}`,
  region: B2_REGION || 'us-west-004',
  credentials: {
    accessKeyId: B2_ACCOUNT_ID || '',
    secretAccessKey: B2_APPLICATION_KEY || '',
  },
  forcePathStyle: true, // Required for Backblaze B2 S3-compatible API
});

export { b2Client, B2_BUCKET_NAME };
export default b2Client;
