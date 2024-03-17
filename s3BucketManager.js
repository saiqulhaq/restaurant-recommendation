require('dotenv').config();

const { S3Client, CreateBucketCommand, HeadBucketCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

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

async function doesFileExist(bucketName, fileName) {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });
    await s3Client.send(command);
    return true; // The file exists
  } catch (error) {
    if (error.name === 'NotFound') {
      return false; // The file does not exist
    }
    throw error; // An error occurred
  }
}

module.exports = { createS3Bucket, doesFileExist };
