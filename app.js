require('dotenv').config();

const express = require('express');
const { createS3Bucket } = require('./s3BucketManager');

const app = express();
const port = 3000;

const bucketName = 'hungryhub-test-bucket';
const filename = 'demo-sims.csv'

app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  await createS3Bucket(bucketName);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});
