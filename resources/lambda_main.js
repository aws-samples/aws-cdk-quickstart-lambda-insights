const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');

// Instrument AWS SDK with X-Ray
const awsSDK = AWSXRay.captureAWS(AWS);

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

