const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function createS3Bucket(bucketName) {
  try {
    // Check if the bucket already exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket ${bucketName} already exists.`);
  } catch (error) {
    if (error.name === 'NotFound') {
      // Bucket does not exist, so create it
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`Bucket ${bucketName} created successfully.`);
      } catch (createError) {
        console.error(`Error creating bucket: ${createError}`);
      }
    } else {
      console.error(`Error checking bucket: ${error}`);
    }
  }
}

module.exports = { createS3Bucket };
