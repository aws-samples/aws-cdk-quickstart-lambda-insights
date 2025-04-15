// Import specific AWS SDK v3 clients as needed
const { S3Client } = require('@aws-sdk/client-s3');
const AWSXRay = require('aws-xray-sdk-core');

// Initialize and instrument AWS SDK v3 clients with X-Ray
const s3Client = AWSXRay.captureAWSv3Client(new S3Client({ region: process.env.AWS_REGION }));

exports.handler = async function(event, context) {
    
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment("ExpensiveCode");
  
  try {
    fibo(40);
    subsegment.close();

    console.log(event);
    return {
      statusCode: 200,
      headers: {
        "x-custom-header": "My Header Value",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Hello World - CPU!",
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    subsegment.addError(error);
    subsegment.close();
    throw error;
  }
};

function fibo(n) { 
  if (n < 2)
    return 1;
  else   
    return fibo(n - 2) + fibo(n - 1);
}

