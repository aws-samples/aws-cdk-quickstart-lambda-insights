// Import specific AWS SDK v3 clients as needed
const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { SNSClient } = require('@aws-sdk/client-sns');
const { SQSClient } = require('@aws-sdk/client-sqs');
const AWSXRay = require('aws-xray-sdk-core');

// Initialize and instrument AWS SDK v3 clients with X-Ray
const s3Client = AWSXRay.captureAWSv3Client(new S3Client({ region: process.env.AWS_REGION }));
const dynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({ region: process.env.AWS_REGION }));
const snsClient = AWSXRay.captureAWSv3Client(new SNSClient({ region: process.env.AWS_REGION }));
const sqsClient = AWSXRay.captureAWSv3Client(new SQSClient({ region: process.env.AWS_REGION }));

exports.handler = async function(event, context) {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Create a segment for this operation
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment('handler-processing');
  
  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = {
      statusCode: 200,
      headers: {
        "x-custom-header": "My Header Value",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Hello World!",
        timestamp: new Date().toISOString(),
        requestId: context.awsRequestId
      }),
    };
    
    subsegment.close();
    return response;
  } catch (error) {
    subsegment.addError(error);
    subsegment.close();
    throw error;
  }
};

