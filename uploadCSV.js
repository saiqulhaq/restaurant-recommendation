require('dotenv').config();

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Initialize the S3 client
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Function to upload a file to S3
async function uploadFileToS3(bucketName, filePath) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName, // The name of the file to be saved in S3
      Body: fileStream,
    };

    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);
    console.log(`File uploaded successfully. ETag: ${response.ETag}`);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

module.exports = { uploadFileToS3 };
