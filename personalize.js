require('dotenv').config();

// Import required AWS SDK clients and commands for Node.js
const {
  PersonalizeClient, CreateSchemaCommand, CreateDatasetGroupCommand,
  ListSchemasCommand, ListDatasetGroupsCommand, CreateDatasetCommand,
  CreateDatasetImportJobCommand, ListDatasetImportJobsCommand, ListDatasetsCommand,
  ListRecipesCommand, CreateRecommenderCommand, ListRecommendersCommand
} = require("@aws-sdk/client-personalize");

const { IAMClient, CreateRoleCommand, AttachRolePolicyCommand,
  ListRolesCommand
} = require("@aws-sdk/client-iam");
// const { fromIni } = require("@aws-sdk/credential-provider-ini");

// Set the AWS region
const REGION = "us-east-1"; // Replace with your AWS region

// Create an Amazon Personalize client
const personalizeClient = new PersonalizeClient({
  region: REGION,
  // credentials: fromIni({ profile: 'default' }) // Ensure your AWS credentials are configured properly
});

// Define the schema
const purchaseSchema = {
  type: "record",
  name: "Interactions",
  namespace: "com.amazonaws.personalize.schema",
  fields: [
    {
      name: "USER_ID",
      type: "string"
    },
    {
      name: "ITEM_ID",
      type: "string"
    },
    {
      name: "ADULT",
      type: "int"
    },
    {
      name: "KIDS",
      type: "int"
    },
    {
      name: "DATE",
      type: "string"
    },
    {
      name: "START_TIME",
      type: "string"
    },
    {
      name: "TIMESTAMP",
      type: "long"
    }
  ],
  version: "1.0"
};

const schemaName = "schema-test-v1";
// Create the schema
const createSchema = async () => {
  try {
    const createSchemaResponse = await personalizeClient.send(new CreateSchemaCommand({
      name: schemaName,
      schema: JSON.stringify(purchaseSchema)
    }));
    console.log("Create Schema Response", createSchemaResponse);
    return createSchemaResponse;
  } catch (err) {
    console.error("Error creating schema", err);
  }
};

const findSchema = async (schemaName) => {
  try {
    const schemas = await personalizeClient.send(new ListSchemasCommand({}));
    const schema = schemas.schemas.find(s => s.name === schemaName);
    if (schema) {
      return schema;
    }
  } catch (err) {
    console.error("Error finding schema", err);
  }
}

const datasetGroupName = "dateset-group-test-v1";
// Create the dataset group
const createDatasetGroup = async () => {
  try {
    const createDatasetGroupResponse = await personalizeClient.send(new CreateDatasetGroupCommand({
      name: datasetGroupName
    }));
    console.log("Create Dataset Group Response", createDatasetGroupResponse);
    return createDatasetGroupResponse;
  } catch (err) {
    console.error("Error creating dataset group", err);
  }
};

const findDatasetGroup = async (datasetGroupName) => {
  try {
    const datasetGroups = await personalizeClient.send(new ListDatasetGroupsCommand({}));
    const datasetGroup = datasetGroups.datasetGroups.find(dg => dg.name === datasetGroupName);
    if (datasetGroup) {
      return datasetGroup;
    }
  } catch (err) {
    console.error("Error finding dataset group", err);
  }
}


// Create an Amazon IAM client
const iamClient = new IAMClient({ region: REGION });

// Define the role name and the assume role policy document
const roleName = "PersonalizeRoleEcommerceDemoRecommender";
const assume_role_policy_document = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: {
        Service: "personalize.amazonaws.com"
      },
      Action: "sts:AssumeRole"
    }
  ]
};

// Function to create the IAM role
const createPersonalizeRole = async () => {
  try {
    const createRoleResponse = await iamClient.send(new CreateRoleCommand({
      RoleName: roleName,
      AssumeRolePolicyDocument: JSON.stringify(assume_role_policy_document)
    }));
    console.log("Role created:", createRoleResponse.Role.Arn);

    // Attach the AmazonPersonalizeFullAccess policy to the role
    await iamClient.send(new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: "arn:aws:iam::aws:policy/service-role/AmazonPersonalizeFullAccess"
    }));
    console.log("AmazonPersonalizeFullAccess policy attached");

    // Attach the AmazonS3FullAccess policy to the role
    await iamClient.send(new AttachRolePolicyCommand({
      RoleName: roleName,
      PolicyArn: "arn:aws:iam::aws:policy/AmazonS3FullAccess"
    }));
    console.log("AmazonS3FullAccess policy attached");

    // Return the role ARN
    return createRoleResponse.Role.Arn;
  } catch (error) {
    console.error("Error creating role:", error);
  }
};

const findPersonalizeRole = async (roleName) => {
  try {
    const roles = await iamClient.send(new ListRolesCommand({}));
    const role = roles.Roles.find(r => r.RoleName === roleName);
    if (role) {
      return role;
    }
  } catch (err) {
    console.error("Error finding role", err);
  }
}

const datasetName = "dataset-test-v1";
const createDataset = async (datasetGroupName, schemaArn) => {
  try {
    const createDatasetResponse = await personalizeClient.send(new CreateDatasetCommand({
      datasetGroupArn: datasetGroupName,
      datasetType: "Interactions",
      name: datasetName,
      schemaArn: schemaArn
    }));
    console.log("Create Dataset Response", createDatasetResponse);
    return createDatasetResponse;
  } catch (err) {
    console.error("Error creating dataset", err);
  }
}

const findDataset = async (datasetGroupName, datasetName) => {
  try {
    const datasets = await personalizeClient.send(new ListDatasetsCommand({
      datasetGroupArn: datasetGroupName
    }));
    const dataset = datasets.datasets.find(d => d.name === datasetName);
    if (dataset) {
      return dataset;
    }
  } catch (err) {
    console.error("Error finding dataset", err);
  }
}

const jobName = "personalize_ecommerce_demo_interactions_import"
const createDatasetImportJob = async (datasetArn, dataLocation, roleArn) => {
  try {
    const createDatasetImportJobResponse = await personalizeClient.send(new CreateDatasetImportJobCommand({
      jobName,
      datasetArn,
      dataSource: {
        dataLocation
      },
      roleArn
    }))
    console.log("createDatasetImportJobResponse", createDatasetImportJobResponse)
    return createDatasetImportJobResponse
  } catch (err) {
    console.error("Error creating DatasetImportJob")
  }
}

const findDatasetImportJob = async (jobName) => {
  try {
    const datasetImportJobs = await personalizeClient.send(new ListDatasetImportJobsCommand({}))
    const datasetImportJob = datasetImportJobs.datasetImportJobs.find(d => d.jobName === jobName)
    if (datasetImportJob) {
      return datasetImportJob
    }
  } catch (err) {
    console.error("Error finding dataset import job", err)
  }
}

const createRecommender = async (name, recipeArn, datasetGroupArn) => {
  try {
    const createRecommenderResponse = await personalizeClient.send(new CreateRecommenderCommand({
      name,
      recipeArn,
      datasetGroupArn
    }))
    console.log("createRecommenderResponse", createRecommenderResponse)
    return createRecommenderResponse
  } catch (err) {
    console.error("Error creating Recommender")
  }
}

const findRecommender = async (name) => {
  try {
    const recommenders = await personalizeClient.send(new ListRecommendersCommand({}))
    const recommender = recommenders.recommenders.find(r => r.name === name)
    if (recommender) {
      return recommender
    }
  } catch (err) {
    console.error("Error finding recommender", err)
  }
}

// Call the functions to create schema and dataset group
const run = async () => {
  let schema
  try {
    schema = await findSchema(schemaName);
    console.log(`Found a schema ARN: ${JSON.stringify(schema)}`);
  } catch (err) {
    console.error("Error finding schema", err);
    schema = await createSchema();
    console.log(`create new a schema ARN: ${JSON.stringify(schema)}`);
  }

  let datasetGroup
  try {
    datasetGroup = await findDatasetGroup(datasetGroupName);
    console.log(`Found a dataset group ARN: ${JSON.stringify(datasetGroup)}`);
  } catch (err) {
    console.error("Error finding dataset group", err);
    datasetGroup = await createDatasetGroup();
    console.log(`create new a dataset group ARN: ${JSON.stringify(datasetGroup)}`);
  }

  let role
  role = await findPersonalizeRole(roleName);
  if (role) {
    console.log(`Found a role ARN: ${JSON.stringify(role)}`);
  } else {
    role = await createPersonalizeRole();
    console.log(`create new a role ARN: ${JSON.stringify(role)}`);
  }

  let dataset
  try {
    dataset = await findDataset(datasetGroup.datasetGroupArn, datasetName);
    if (dataset) {
      console.log(`Found a dataset ARN: ${JSON.stringify(dataset)}`);
    } else {
      dataset = await createDataset(datasetGroup.datasetGroupArn, schema.schemaArn);
      console.log(`create new a dataset ARN: ${JSON.stringify(dataset)}`);
    }
  } catch (err) {
    console.error("Error finding dataset", err);
    dataset = await createDataset(datasetGroup.datasetGroupArn, schema.schemaArn);
    console.log(`create new a dataset ARN: ${JSON.stringify(dataset)}`);
  }

  let datasetImportJob
  const bucketName = 'hungryhub-test-bucket';
  const filePath = "booking.csv"; // Path to the CSV file
  const sourceFile = `s3://${bucketName}/${filePath}`
  try {
    datasetImportJob = await findDatasetImportJob(jobName);
    if (datasetImportJob) {
      console.log(`Found a dataset import job ARN: ${JSON.stringify(datasetImportJob)}`);
    } else {
      datasetImportJob = await createDatasetImportJob(dataset.datasetArn, sourceFile, role.Arn);
      console.log(`create new a dataset import job ARN: ${JSON.stringify(datasetImportJob)}`);
    }
  } catch (err) {
    console.error("Error finding dataset import job", err);
    datasetImportJob = await createDatasetImportJob(dataset.datasetArn, sourceFile, role.Arn);
    console.log(`create new a dataset import job ARN: ${JSON.stringify(datasetImportJob)}`);
  }

  let recommender
  let recommenderName = 'viewed_x_also_viewed_demo'
  let recipeArn = 'arn:aws:personalize:::recipe/aws-ecomm-customers-who-viewed-x-also-viewed'

  try {
    recommender = await findRecommender(recommenderName);
    if (recommender) {
      console.log(`Found a recommender ARN: ${JSON.stringify(recommender)}`);
    } else {
      recommender = await createRecommender(recommenderName, recipeArn, datasetGroup.datasetGroupArn);
      console.log(`create new a recommender ARN: ${JSON.stringify(recommender)}`);
    }
  } catch (err) {
    console.error("Error finding recommender", err);
    recommender = await createRecommender(recommenderName, recipeArn, datasetGroup.datasetGroupArn);
    console.log(`create new a recommender ARN: ${JSON.stringify(recommender)}`);
  }
};

run();
