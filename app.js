require('dotenv').config();

const express = require('express');
const { createS3Bucket, doesFileExist } = require('./s3BucketManager');
const { uploadFileToS3 } = require('./uploadCSV')

const app = express();
const port = 3000;

const bucketName = 'hungryhub-test-bucket';
const filePath = "./booking copy.csv"; // Path to the CSV file

app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  await createS3Bucket(bucketName);

  const fileExists = await doesFileExist(bucketName, filePath);
  if (fileExists) {
    console.log(`File ${filePath} already exists in bucket ${bucketName}.`);
  } else {
    await uploadFileToS3(bucketName, filePath);
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// generate CSV
// upload CSV
// run personalize
